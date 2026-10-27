using FluentValidation;
using Moq;
using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Entities;
using Umss.BloodOrgansDonationApp.Models.Exceptions;
using Umss.BloodOrgansDonationApp.Models.Requests;
using Umss.BloodOrgansDonationApp.Models.Requests.Queries;
using Umss.BloodOrgansDonationApp.Models.Responses;
using Umss.BloodOrgansDonationApp.Repository.Interfaces;
using Umss.BloodOrgansDonationApp.Service.Tests.Utilities;
using Umss.BloodOrgansDonationApp.Services;
using Umss.BloodOrgansDonationApp.Services.Security;

namespace Umss.BloodOrgansDonationApp.Service.Tests.Services
{
    /// <summary>
    /// US-API-01 (create, validate, progress, patient privacy) and US-API-02 (phase moves, history,
    /// countdown, automatic completion). A fresh fixture per test, so mock setups never leak.
    /// </summary>
    public class DonationRequestServiceTest
    {
        private readonly RepositoryFixture _f = new RepositoryFixture();
        private readonly DonationRequestService _service;
        private readonly User _author = NewUser("Autora");
        private readonly User _otherDonor = NewUser("Otro donante");
        private readonly User _staff = NewUser("Dra. Ramos");

        public DonationRequestServiceTest()
        {
            _service = new DonationRequestService(_f.DonationRequestRepository, _f.RealMapper, _f.CurrentUserService, _f.Clock);

            _f.DonationRequestRepositoryMock
                .Setup(r => r.FindMissingReferences(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<Guid>()))
                .ReturnsAsync(Array.Empty<string>());
            _f.DonationRequestRepositoryMock
                .Setup(r => r.Create(It.IsAny<DonationPost>(), It.IsAny<DonationRequestStatusChange>()))
                .ReturnsAsync((DonationPost p, DonationRequestStatusChange _) => p);
            _f.DonationRequestRepositoryMock
                .Setup(r => r.Save(It.IsAny<DonationPost>(), It.IsAny<RequestState>(), It.IsAny<DonationRequestStatusChange?>()))
                .ReturnsAsync((DonationPost p, RequestState _, DonationRequestStatusChange? _) => p);
        }

        private static User NewUser(string name) => new User
        {
            Id = Guid.NewGuid(),
            FullName = name,
            BloodTypeId = Guid.NewGuid(),
            Latitude = 0,
            Longitude = 0,
            Image = "u.png",
        };

        private DateTime Now => _f.Clock.UtcNow;

        /// <summary>Who is calling: roles plus an optional local profile.</summary>
        private void As(User? profile, bool clinical = false, bool admin = false)
        {
            _f.CurrentUserServiceMock.SetupGet(c => c.IsClinicalStaff).Returns(clinical);
            _f.CurrentUserServiceMock.SetupGet(c => c.IsNetworkAdmin).Returns(admin);
            _f.CurrentUserServiceMock.SetupGet(c => c.Caller).Returns(new CallerIdentity("kc-" + (profile?.FullName ?? "staff"), null, true, new HashSet<string>()));
            _f.CurrentUserServiceMock.Setup(c => c.GetProfileAsync()).ReturnsAsync(profile);
        }

        private DonationRequestRequest ValidBody() => new DonationRequestRequest
        {
            Title = "Paciente #PX-4912 necesita plaquetas",
            Description = "Trauma shock, quirofano central 3",
            BloodTypeId = Guid.NewGuid(),
            DonationTypeId = Guid.NewGuid(),
            DonationCenterId = Guid.NewGuid(),
            Component = BloodComponent.PlateletsApheresis,
            Urgency = Urgency.CodeRed,
            UnitsRequired = 4,
            Deadline = Now.AddMinutes(35),
            PatientCode = "PX-4912",
            PatientAge = 34,
            Diagnosis = "Trauma shock",
            Service = "Quirofano Central 3",
            Bed = "UCI-04",
            MedicalRecord = "EXP-1",
            CoordinationPhone = "+591 70000000",
        };

        private DonationPost Existing(RequestStatus status = RequestStatus.SearchingDonors, int covered = 0, int required = 4, Guid? authorId = null, DateTime? deadline = null)
        {
            DonationPost request = new DonationPost
            {
                Id = Guid.NewGuid(),
                Folio = 8902,
                Title = "Solicitud",
                Description = "-",
                Image = string.Empty,
                UserId = authorId ?? _author.Id,
                Urgency = Urgency.CodeRed,
                Component = BloodComponent.PlateletsApheresis,
                Status = status,
                UnitsRequired = required,
                UnitsCovered = covered,
                Deadline = deadline ?? Now.AddMinutes(35),
                PatientCode = "PX-4912",
                Bed = "UCI-04",
                CoordinationPhone = "70000000",
                CreatedAt = Now.AddHours(-1),
            };
            _f.DonationRequestRepositoryMock.Setup(r => r.Get(request.Id)).ReturnsAsync(request);
            return request;
        }

        // ---- US-API-01: create ----

        [Fact]
        public async Task Create_StartsSearchingDonors_WithZeroUnits_AndTheCallerAsAuthor()
        {
            As(_author);
            DonationPost? saved = null;
            DonationRequestStatusChange? history = null;
            _f.DonationRequestRepositoryMock
                .Setup(r => r.Create(It.IsAny<DonationPost>(), It.IsAny<DonationRequestStatusChange>()))
                .Callback((DonationPost p, DonationRequestStatusChange c) => { saved = p; history = c; })
                .ReturnsAsync((DonationPost p, DonationRequestStatusChange _) => p);

            DonationRequestResponse response = await _service.Create(ValidBody());

            Assert.Equal(RequestStatus.SearchingDonors, response.Status);
            Assert.Equal(0, response.UnitsCovered);
            Assert.Equal(4, response.UnitsRequired);
            Assert.Equal(0, response.ProgressPercent);
            Assert.Equal(_author.Id, saved!.UserId);
            Assert.Equal("PX-4912", response.Patient!.PatientCode); // the author sees their own patient data
            Assert.Null(history!.FromStatus);
            Assert.Equal(RequestStatus.SearchingDonors, history.ToStatus);
            Assert.Equal(Now, history.ChangedAt);
        }

        public static TheoryData<string, Action<DonationRequestRequest>> InvalidBodies => new TheoryData<string, Action<DonationRequestRequest>>
        {
            { "UnitsRequired", b => b.UnitsRequired = 0 },
            { "UnitsRequired", b => b.UnitsRequired = -2 },
            { "UnitsRequired", b => b.UnitsRequired = null },
            { "Deadline", b => b.Deadline = new DateTime(2026, 10, 21, 11, 59, 0, DateTimeKind.Utc) },
            { "Deadline", b => b.Deadline = null },
            { "Component", b => b.Component = null },
            { "Component", b => b.Component = (BloodComponent)99 },
            { "Urgency", b => b.Urgency = null },
            { "PatientCode", b => b.PatientCode = " " },
            { "CoordinationPhone", b => b.CoordinationPhone = "llamar al hospital" },
            { "PatientAge", b => b.PatientAge = 130 },
        };

        [Theory]
        [MemberData(nameof(InvalidBodies))]
        public async Task Create_InvalidBody_Is400_NamingTheField(string field, Action<DonationRequestRequest> breakIt)
        {
            As(_author);
            DonationRequestRequest body = ValidBody();
            breakIt(body);

            ValidationException error = await Assert.ThrowsAsync<ValidationException>(() => _service.Create(body));

            Assert.Contains(error.Errors, e => e.PropertyName == field);
            _f.DonationRequestRepositoryMock.Verify(r => r.Create(It.IsAny<DonationPost>(), It.IsAny<DonationRequestStatusChange>()), Times.Never);
        }

        [Fact]
        public async Task Create_DeadlineWithoutOffset_IsReadAsUtc()
        {
            As(_author);
            DonationRequestRequest body = ValidBody();
            body.Deadline = DateTime.SpecifyKind(Now.AddHours(2), DateTimeKind.Unspecified);

            DonationRequestResponse response = await _service.Create(body);

            Assert.Equal(DateTimeKind.Utc, response.Deadline!.Value.Kind);
            Assert.Equal(7200, response.RemainingSeconds);
        }

        [Fact]
        public async Task Create_UnknownCenter_Is400()
        {
            As(_author);
            _f.DonationRequestRepositoryMock
                .Setup(r => r.FindMissingReferences(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<Guid>()))
                .ReturnsAsync(new[] { "DonationCenterId" });

            ValidationException error = await Assert.ThrowsAsync<ValidationException>(() => _service.Create(ValidBody()));
            Assert.Equal("DonationCenterId", Assert.Single(error.Errors).PropertyName);
        }

        [Fact]
        public async Task Create_DonorWithoutProfile_Is403()
        {
            As(null);
            await Assert.ThrowsAsync<ForbiddenException>(() => _service.Create(ValidBody()));
        }

        [Fact]
        public async Task Create_ClinicalStaffWithoutProfile_IsAllowed_WithNoAuthor()
        {
            As(null, clinical: true);
            DonationRequestResponse response = await _service.Create(ValidBody());
            Assert.Null(response.Author);
            Assert.NotNull(response.Patient);
        }

        // ---- US-API-01: read, progress, privacy ----

        [Fact]
        public async Task Get_ShowsProgress_AndHidesPatientDataFromOtherDonors()
        {
            DonationPost request = Existing(covered: 1, required: 4);

            As(_otherDonor);
            DonationRequestResponse forDonor = (await _service.Get(request.Id))!;
            Assert.Equal(25, forDonor.ProgressPercent);
            Assert.Equal("REQ-8902", forDonor.Code);
            Assert.Null(forDonor.Patient);
            Assert.Empty(forDonor.AllowedNextStatuses);

            As(_author);
            Assert.Equal("UCI-04", (await _service.Get(request.Id))!.Patient!.Bed);

            As(_staff, clinical: true);
            DonationRequestResponse forStaff = (await _service.Get(request.Id))!;
            Assert.Equal("PX-4912", forStaff.Patient!.PatientCode);
            Assert.Equal(new[] { RequestStatus.DonorsOnTheWay, RequestStatus.Cancelled }, forStaff.AllowedNextStatuses);
        }

        [Fact]
        public async Task Get_CountsDownToTheDeadline_AndFlagsOverdue()
        {
            As(_staff, clinical: true);
            DonationPost soon = Existing(deadline: Now.AddMinutes(35));
            DonationPost late = Existing(deadline: Now.AddMinutes(-5));
            DonationPost closed = Existing(RequestStatus.Completed, covered: 4, deadline: Now.AddMinutes(-5));

            DonationRequestResponse a = (await _service.Get(soon.Id))!;
            Assert.Equal(35 * 60, a.RemainingSeconds);
            Assert.False(a.IsOverdue);

            DonationRequestResponse b = (await _service.Get(late.Id))!;
            Assert.Equal(-5 * 60, b.RemainingSeconds);
            Assert.True(b.IsOverdue);

            DonationRequestResponse c = (await _service.Get(closed.Id))!;
            Assert.Null(c.RemainingSeconds);
            Assert.False(c.IsOverdue);
        }

        [Fact]
        public async Task GetList_LetsOnlyClinicalCallersSearchPatientCodes()
        {
            _f.DonationRequestRepositoryMock
                .Setup(r => r.Get(It.IsAny<DonationRequestQuery>(), It.IsAny<bool>()))
                .ReturnsAsync(Paged.Of(Array.Empty<DonationPost>()));

            As(_otherDonor);
            await _service.Get(new DonationRequestQuery { Search = "PX-4912" });
            _f.DonationRequestRepositoryMock.Verify(r => r.Get(It.IsAny<DonationRequestQuery>(), false), Times.Once);

            As(_staff, clinical: true);
            await _service.Get(new DonationRequestQuery { Search = "PX-4912" });
            _f.DonationRequestRepositoryMock.Verify(r => r.Get(It.IsAny<DonationRequestQuery>(), true), Times.Once);
        }

        [Fact]
        public async Task GetList_TooManyBloodTypes_Is400()
        {
            As(_staff, clinical: true);
            DonationRequestQuery query = new DonationRequestQuery { BloodTypeId = Enumerable.Range(0, 9).Select(_ => Guid.NewGuid()).ToList() };
            await Assert.ThrowsAsync<ValidationException>(() => _service.Get(query));
        }

        // ---- US-API-01: edit ----

        [Fact]
        public async Task Update_ByAnotherDonor_Is403()
        {
            DonationPost request = Existing();
            As(_otherDonor);
            await Assert.ThrowsAsync<ForbiddenException>(() => _service.Update(request.Id, ValidBody()));
        }

        [Fact]
        public async Task Update_OfAClosedRequest_Is409()
        {
            DonationPost request = Existing(RequestStatus.Cancelled);
            As(_author);
            await Assert.ThrowsAsync<ConflictException>(() => _service.Update(request.Id, ValidBody()));
        }

        [Fact]
        public async Task Update_OverdueRequest_CanKeepItsDeadline_ButNotMoveItToThePast()
        {
            DateTime overdue = Now.AddMinutes(-10);
            DonationPost request = Existing(deadline: overdue);
            As(_author);

            DonationRequestRequest keep = ValidBody();
            keep.Deadline = overdue;
            Assert.Equal(-600, (await _service.Update(request.Id, keep)).RemainingSeconds);

            DonationPost again = Existing(deadline: overdue);
            DonationRequestRequest earlier = ValidBody();
            earlier.Deadline = overdue.AddMinutes(-1);
            await Assert.ThrowsAsync<ValidationException>(() => _service.Update(again.Id, earlier));
        }

        [Fact]
        public async Task Update_UnitsBelowTheCoveredOnes_Is400()
        {
            DonationPost request = Existing(covered: 3);
            As(_staff, clinical: true);
            DonationRequestRequest body = ValidBody();
            body.UnitsRequired = 2;

            ValidationException error = await Assert.ThrowsAsync<ValidationException>(() => _service.Update(request.Id, body));
            Assert.Equal("UnitsRequired", Assert.Single(error.Errors).PropertyName);
        }

        // ---- US-API-02: phases ----

        [Fact]
        public async Task ChangeStatus_AllowedMove_RecordsWhoAndWhen()
        {
            DonationPost request = Existing();
            As(_staff, clinical: true);
            RequestState? seen = null;
            DonationRequestStatusChange? change = null;
            _f.DonationRequestRepositoryMock
                .Setup(r => r.Save(It.IsAny<DonationPost>(), It.IsAny<RequestState>(), It.IsAny<DonationRequestStatusChange?>()))
                .Callback((DonationPost _, RequestState s, DonationRequestStatusChange? c) => { seen = s; change = c; })
                .ReturnsAsync((DonationPost p, RequestState _, DonationRequestStatusChange? _) => p);

            DonationRequestResponse response = await _service.ChangeStatus(request.Id, new RequestStatusChangeRequest { Status = RequestStatus.DonorsOnTheWay, Reason = "2 voluntarios" });

            Assert.Equal(RequestStatus.DonorsOnTheWay, response.Status);
            Assert.Equal(Now, response.StatusChangedAt);
            Assert.Equal(RequestStatus.SearchingDonors, seen!.Status); // the concurrency check compares against what we read
            Assert.Equal(RequestStatus.SearchingDonors, change!.FromStatus);
            Assert.Equal(RequestStatus.DonorsOnTheWay, change.ToStatus);
            Assert.Equal(_staff.Id, change.ChangedById);
            Assert.Equal("kc-Dra. Ramos", change.ChangedBySubject);
            Assert.Equal("2 voluntarios", change.Reason);
        }

        [Theory]
        [InlineData(RequestStatus.Completed, RequestStatus.SearchingDonors)]
        [InlineData(RequestStatus.Cancelled, RequestStatus.DonorsOnTheWay)]
        [InlineData(RequestStatus.SearchingDonors, RequestStatus.Completed)]
        [InlineData(RequestStatus.SearchingDonors, RequestStatus.LabValidation)]
        public async Task ChangeStatus_MoveNotAllowed_Is409(RequestStatus from, RequestStatus to)
        {
            DonationPost request = Existing(from, covered: from == RequestStatus.Completed ? 4 : 0);
            As(_staff, clinical: true);

            ConflictException error = await Assert.ThrowsAsync<ConflictException>(() =>
                _service.ChangeStatus(request.Id, new RequestStatusChangeRequest { Status = to }));

            Assert.Contains("No se puede pasar", error.Message);
            _f.DonationRequestRepositoryMock.Verify(r => r.Save(It.IsAny<DonationPost>(), It.IsAny<RequestState>(), It.IsAny<DonationRequestStatusChange?>()), Times.Never);
        }

        [Fact]
        public async Task ChangeStatus_ToTheSamePhase_IsANoOp()
        {
            DonationPost request = Existing(RequestStatus.LabValidation);
            As(_staff, clinical: true);

            DonationRequestResponse response = await _service.ChangeStatus(request.Id, new RequestStatusChangeRequest { Status = RequestStatus.LabValidation });

            Assert.Equal(RequestStatus.LabValidation, response.Status);
            _f.DonationRequestRepositoryMock.Verify(r => r.Save(It.IsAny<DonationPost>(), It.IsAny<RequestState>(), It.IsAny<DonationRequestStatusChange?>()), Times.Never);
        }

        [Fact]
        public async Task ChangeStatus_ByADonor_Is403_EvenTheAuthor()
        {
            DonationPost request = Existing();
            As(_author);
            await Assert.ThrowsAsync<ForbiddenException>(() =>
                _service.ChangeStatus(request.Id, new RequestStatusChangeRequest { Status = RequestStatus.Cancelled }));
        }

        [Fact]
        public async Task ChangeStatus_UnknownRequest_Is404()
        {
            As(_staff, clinical: true);
            await Assert.ThrowsAsync<EntityNotFoundException>(() =>
                _service.ChangeStatus(Guid.NewGuid(), new RequestStatusChangeRequest { Status = RequestStatus.Cancelled }));
        }

        // ---- US-API-02: units and automatic completion ----

        [Fact]
        public async Task RegisterUnits_ReachingTheRequiredUnits_CompletesTheRequest()
        {
            DonationPost request = Existing(RequestStatus.LabValidation, covered: 3, required: 4);
            As(_staff, clinical: true);
            DonationRequestStatusChange? change = null;
            _f.DonationRequestRepositoryMock
                .Setup(r => r.Save(It.IsAny<DonationPost>(), It.IsAny<RequestState>(), It.IsAny<DonationRequestStatusChange?>()))
                .Callback((DonationPost _, RequestState _, DonationRequestStatusChange? c) => change = c)
                .ReturnsAsync((DonationPost p, RequestState _, DonationRequestStatusChange? _) => p);

            DonationRequestResponse response = await _service.RegisterUnits(request.Id, new RequestUnitsRequest { Units = 1 });

            Assert.Equal(RequestStatus.Completed, response.Status);
            Assert.Equal(100, response.ProgressPercent);
            Assert.Null(response.RemainingSeconds);
            Assert.Equal(RequestStatus.Completed, change!.ToStatus);
            Assert.Equal(DonationRequestService.UnitsCompleteReason, change.Reason);
        }

        [Fact]
        public async Task RegisterUnits_BelowTheRequiredUnits_KeepsThePhase()
        {
            DonationPost request = Existing(RequestStatus.DonorsOnTheWay, covered: 1, required: 4);
            As(_staff, clinical: true);

            DonationRequestResponse response = await _service.RegisterUnits(request.Id, new RequestUnitsRequest { Units = 2 });

            Assert.Equal(RequestStatus.DonorsOnTheWay, response.Status);
            Assert.Equal(3, response.UnitsCovered);
            Assert.Equal(75, response.ProgressPercent);
        }

        [Fact]
        public async Task RegisterUnits_MoreThanMissing_Is409()
        {
            DonationPost request = Existing(covered: 3, required: 4);
            As(_staff, clinical: true);
            ConflictException error = await Assert.ThrowsAsync<ConflictException>(() => _service.RegisterUnits(request.Id, new RequestUnitsRequest { Units = 2 }));
            Assert.Contains("Solo faltan 1", error.Message);
        }

        [Fact]
        public async Task RegisterUnits_OnAClosedRequest_Is409_AndZeroUnitsIs400()
        {
            As(_staff, clinical: true);
            DonationPost closed = Existing(RequestStatus.Cancelled);
            await Assert.ThrowsAsync<ConflictException>(() => _service.RegisterUnits(closed.Id, new RequestUnitsRequest { Units = 1 }));

            DonationPost open = Existing();
            await Assert.ThrowsAsync<ValidationException>(() => _service.RegisterUnits(open.Id, new RequestUnitsRequest { Units = 0 }));
        }

        [Fact]
        public void Lifecycle_FinalPhasesHaveNoWayOut()
        {
            Assert.Empty(RequestLifecycle.NextStatuses(RequestStatus.Completed));
            Assert.Empty(RequestLifecycle.NextStatuses(RequestStatus.Cancelled));
            foreach (RequestStatus open in new[] { RequestStatus.SearchingDonors, RequestStatus.DonorsOnTheWay, RequestStatus.LabValidation })
            {
                Assert.True(RequestLifecycle.CanMove(open, RequestStatus.Cancelled));
            }
        }
    }
}
