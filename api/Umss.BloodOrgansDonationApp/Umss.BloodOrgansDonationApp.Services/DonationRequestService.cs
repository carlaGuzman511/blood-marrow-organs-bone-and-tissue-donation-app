using AutoMapper;
using FluentValidation;
using FluentValidation.Results;
using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Entities;
using Umss.BloodOrgansDonationApp.Models.Exceptions;
using Umss.BloodOrgansDonationApp.Models.Requests;
using Umss.BloodOrgansDonationApp.Models.Requests.Queries;
using Umss.BloodOrgansDonationApp.Models.Responses;
using Umss.BloodOrgansDonationApp.Repository.Interfaces;
using Umss.BloodOrgansDonationApp.Services.Interfaces;
using Umss.BloodOrgansDonationApp.Services.Validators;

namespace Umss.BloodOrgansDonationApp.Services
{
    /// <summary>
    /// Clinical donation requests (US-API-01) and their triage phases (US-API-02).
    /// <list type="bullet">
    /// <item>Anyone signed in with a profile can publish a request (a patient's relative, US-MOB-04); clinical staff and admins can without a profile.</item>
    /// <item>The author, clinical staff and admins edit it; only clinical staff and admins change its phase or add units.</item>
    /// <item>Patient data is returned only to clinical staff, admins and the author.</item>
    /// </list>
    /// Clinical staff aren't tied to a center yet: once tokens carry the center (US-API-12), the
    /// phase and unit checks must also require it to be the request's center.
    /// </summary>
    public class DonationRequestService : IDonationRequestService
    {
        public const string UnitsCompleteReason = "Unidades completas";

        private readonly IDonationRequestRepository _repository;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUser;
        private readonly TimeProvider _clock;

        public DonationRequestService(IDonationRequestRepository repository, IMapper mapper, ICurrentUserService currentUser, TimeProvider clock)
        {
            _repository = repository;
            _mapper = mapper;
            _currentUser = currentUser;
            _clock = clock;
        }

        private bool CanManage => _currentUser.IsClinicalStaff || _currentUser.IsNetworkAdmin;

        private DateTime Now => _clock.GetUtcNow().UtcDateTime;

        public async Task<PagedResult<DonationRequestResponse>> Get(DonationRequestQuery query)
        {
            PageQueryValidator.Check(query);
            new DonationRequestQueryValidator().ValidateAndThrow(query);

            PagedResult<DonationPost> page = await _repository.Get(query, searchPatientCode: CanManage);
            Guid? profileId = (await _currentUser.GetProfileAsync())?.Id;
            DateTime now = Now;

            return page.Map(r => ToResponse(r, now, profileId));
        }

        public async Task<DonationRequestResponse?> Get(Guid id)
        {
            DonationPost? request = await _repository.Get(id);
            if (request == null)
            {
                return null;
            }

            Guid? profileId = (await _currentUser.GetProfileAsync())?.Id;
            return ToResponse(request, Now, profileId);
        }

        public async Task<DonationRequestResponse> Create(DonationRequestRequest body)
        {
            User? profile = await _currentUser.GetProfileAsync();
            if (profile == null && !CanManage)
            {
                throw new ForbiddenException("Completa tu perfil antes de publicar una solicitud.");
            }

            DateTime now = Now;
            body.Deadline = AsUtc(body.Deadline);
            new DonationRequestRequestValidator(now).ValidateAndThrow(body);
            await EnsureReferencesExist(body);

            DonationPost request = new DonationPost
            {
                Id = Guid.NewGuid(),
                Description = body.Description,
                Image = body.Image ?? string.Empty,
                UserId = profile?.Id,
                CreatedAt = now,
                UpdatedAt = now,
                UnitsCovered = 0,
                Status = RequestStatus.SearchingDonors,
                StatusChangedAt = now,
                StatusChangedById = profile?.Id,
            };
            Apply(body, request);

            DonationRequestStatusChange created = NewChange(request.Id, null, RequestStatus.SearchingDonors, profile, now, null);
            DonationPost saved = await _repository.Create(request, created);

            return ToResponse(saved, now, profile?.Id);
        }

        public async Task<DonationRequestResponse> Update(Guid id, DonationRequestRequest body)
        {
            DonationPost request = await Find(id);
            User? profile = await _currentUser.GetProfileAsync();
            bool isAuthor = profile != null && request.UserId == profile.Id;
            if (!isAuthor && !CanManage)
            {
                throw new ForbiddenException("Solo el autor o el personal clinico pueden editar esta solicitud.");
            }

            EnsureOpen(request);

            DateTime now = Now;
            body.Deadline = AsUtc(body.Deadline);
            new DonationRequestRequestValidator(now, request.Deadline).ValidateAndThrow(body);
            if (body.UnitsRequired < request.UnitsCovered)
            {
                throw new ValidationException(new[]
                {
                    new ValidationFailure(nameof(body.UnitsRequired), $"Las unidades requeridas no pueden ser menores a las ya cubiertas ({request.UnitsCovered})"),
                });
            }

            await EnsureReferencesExist(body);

            RequestState seen = new RequestState(request.Status, request.UnitsCovered);
            Apply(body, request);
            request.UpdatedAt = now;
            DonationRequestStatusChange? completed = CompleteIfCovered(request, profile, now);

            DonationPost saved = await _repository.Save(request, seen, completed);
            return ToResponse(saved, now, profile?.Id);
        }

        public async Task<DonationRequestResponse> ChangeStatus(Guid id, RequestStatusChangeRequest body)
        {
            EnsureCanManage("Solo el personal clinico puede cambiar la fase de una solicitud.");
            new RequestStatusChangeRequestValidator().ValidateAndThrow(body);

            DonationPost request = await Find(id);
            User? profile = await _currentUser.GetProfileAsync();
            DateTime now = Now;

            RequestStatus from = request.Status!.Value;
            RequestStatus to = body.Status!.Value;
            if (from == to)
            {
                // Already there (a retried request, or two coordinators doing the same move): nothing to do.
                return ToResponse(request, now, profile?.Id);
            }

            if (!RequestLifecycle.CanMove(from, to))
            {
                throw new ConflictException($"No se puede pasar de \"{RequestLifecycle.Label(from)}\" a \"{RequestLifecycle.Label(to)}\".");
            }

            RequestState seen = new RequestState(request.Status, request.UnitsCovered);
            DonationRequestStatusChange change = MoveTo(request, to, profile, now, body.Reason);

            DonationPost saved = await _repository.Save(request, seen, change);
            return ToResponse(saved, now, profile?.Id);
        }

        public async Task<DonationRequestResponse> RegisterUnits(Guid id, RequestUnitsRequest body)
        {
            EnsureCanManage("Solo el personal clinico puede registrar unidades.");
            new RequestUnitsRequestValidator().ValidateAndThrow(body);

            DonationPost request = await Find(id);
            EnsureOpen(request);

            int remaining = (request.UnitsRequired ?? 0) - request.UnitsCovered;
            if (body.Units > remaining)
            {
                throw new ConflictException($"Solo faltan {remaining} unidades para esta solicitud.");
            }

            User? profile = await _currentUser.GetProfileAsync();
            DateTime now = Now;

            RequestState seen = new RequestState(request.Status, request.UnitsCovered);
            request.UnitsCovered += body.Units;
            request.UpdatedAt = now;
            DonationRequestStatusChange? completed = CompleteIfCovered(request, profile, now);

            DonationPost saved = await _repository.Save(request, seen, completed);
            return ToResponse(saved, now, profile?.Id);
        }

        private async Task<DonationPost> Find(Guid id)
        {
            return await _repository.Get(id)
                ?? throw new EntityNotFoundException($"Donation request with ID {id} not found.");
        }

        private void EnsureCanManage(string message)
        {
            if (!CanManage)
            {
                throw new ForbiddenException(message);
            }
        }

        private static void EnsureOpen(DonationPost request)
        {
            RequestStatus status = request.Status!.Value;
            if (!RequestLifecycle.IsOpen(status))
            {
                throw new ConflictException($"La solicitud esta cerrada ({RequestLifecycle.Label(status)}) y ya no se puede modificar.");
            }
        }

        private async Task EnsureReferencesExist(DonationRequestRequest body)
        {
            IReadOnlyList<string> missing = await _repository.FindMissingReferences(body.BloodTypeId, body.DonationTypeId, body.DonationCenterId);
            if (missing.Count > 0)
            {
                throw new ValidationException(missing.Select(field => new ValidationFailure(field, "No existe el registro indicado")));
            }
        }

        /// <summary>Copies the editable fields. Phase, covered units, author and dates are never taken from the body.</summary>
        private static void Apply(DonationRequestRequest body, DonationPost request)
        {
            request.Title = body.Title.Trim();
            request.Description = body.Description.Trim();
            request.Image = body.Image ?? request.Image;
            request.BloodTypeId = body.BloodTypeId;
            request.DonationTypeId = body.DonationTypeId;
            request.DonationCenterId = body.DonationCenterId;
            request.Component = body.Component;
            request.Urgency = body.Urgency!.Value;
            request.UnitsRequired = body.UnitsRequired;
            request.Deadline = body.Deadline;
            request.PatientCode = body.PatientCode.Trim();
            request.PatientAge = body.PatientAge;
            request.Diagnosis = body.Diagnosis;
            request.Service = body.Service;
            request.Bed = body.Bed;
            request.MedicalRecord = body.MedicalRecord;
            request.CoordinationPhone = body.CoordinationPhone.Trim();
        }

        /// <summary>When the covered units reach the required ones, an open request is completed automatically.</summary>
        private DonationRequestStatusChange? CompleteIfCovered(DonationPost request, User? profile, DateTime now)
        {
            bool covered = request.UnitsRequired.HasValue && request.UnitsCovered >= request.UnitsRequired.Value;
            if (!covered || !RequestLifecycle.IsOpen(request.Status!.Value))
            {
                return null;
            }

            return MoveTo(request, RequestStatus.Completed, profile, now, UnitsCompleteReason);
        }

        private DonationRequestStatusChange MoveTo(DonationPost request, RequestStatus to, User? profile, DateTime now, string? reason)
        {
            RequestStatus? from = request.Status;
            request.Status = to;
            request.StatusChangedAt = now;
            request.StatusChangedById = profile?.Id;
            request.UpdatedAt = now;

            return NewChange(request.Id, from, to, profile, now, reason);
        }

        private DonationRequestStatusChange NewChange(Guid requestId, RequestStatus? from, RequestStatus to, User? profile, DateTime now, string? reason)
        {
            return new DonationRequestStatusChange
            {
                Id = Guid.NewGuid(),
                DonationPostId = requestId,
                FromStatus = from,
                ToStatus = to,
                ChangedById = profile?.Id,
                ChangedBySubject = _currentUser.Caller?.Subject ?? string.Empty,
                ChangedAt = now,
                Reason = string.IsNullOrWhiteSpace(reason) ? null : reason.Trim(),
            };
        }

        private DonationRequestResponse ToResponse(DonationPost request, DateTime now, Guid? profileId)
        {
            DonationRequestResponse response = _mapper.Map<DonationRequestResponse>(request);
            RequestStatus status = request.Status ?? RequestStatus.SearchingDonors;

            bool canSeePatient = CanManage || (profileId.HasValue && request.UserId == profileId);
            if (!canSeePatient)
            {
                response.Patient = null;
            }

            if (RequestLifecycle.IsOpen(status) && request.Deadline.HasValue)
            {
                long remaining = (long)Math.Floor((request.Deadline.Value - now).TotalSeconds);
                response.RemainingSeconds = remaining;
                response.IsOverdue = remaining < 0;
            }

            response.AllowedNextStatuses = CanManage ? RequestLifecycle.NextStatuses(status) : Array.Empty<RequestStatus>();
            return response;
        }

        /// <summary>Npgsql only accepts UTC; a time without an offset is read as UTC.</summary>
        private static DateTime? AsUtc(DateTime? value) => value switch
        {
            null => null,
            { Kind: DateTimeKind.Utc } utc => utc,
            { Kind: DateTimeKind.Local } local => local.ToUniversalTime(),
            DateTime unspecified => DateTime.SpecifyKind(unspecified, DateTimeKind.Utc),
        };
    }
}
