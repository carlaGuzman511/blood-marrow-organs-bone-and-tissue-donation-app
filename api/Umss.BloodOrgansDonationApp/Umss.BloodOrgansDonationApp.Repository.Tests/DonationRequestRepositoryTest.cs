using Microsoft.EntityFrameworkCore;
using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Entities;
using Umss.BloodOrgansDonationApp.Models.Exceptions;
using Umss.BloodOrgansDonationApp.Models.Requests.Queries;
using Umss.BloodOrgansDonationApp.Repository.Data;
using Umss.BloodOrgansDonationApp.Repository.Interfaces;
using Umss.BloodOrgansDonationApp.Repository.Tests.Utilities;

namespace Umss.BloodOrgansDonationApp.Repository.Tests
{
    /// <summary>
    /// US-API-01/02: the board's filters run in the query, only clinical requests come back, the
    /// most urgent come first, and a stale phase or unit count can't overwrite a newer one.
    /// </summary>
    public class DonationRequestRepositoryTest
    {
        private static readonly DateTime Start = new DateTime(2026, 10, 1, 8, 0, 0, DateTimeKind.Utc);

        private readonly InMemoryDatabase _db = new InMemoryDatabase();

        private DonationPost NewRequest(
            string title,
            Urgency urgency = Urgency.Standard,
            BloodComponent component = BloodComponent.WholeBlood,
            RequestStatus status = RequestStatus.SearchingDonors,
            Guid? bloodTypeId = null,
            DateTime? deadline = null,
            int folio = 0,
            string patientCode = "PX-0001",
            DateTime? statusChangedAt = null,
            Guid? centerId = null) => new DonationPost
            {
                Id = Guid.NewGuid(),
                Folio = folio,
                Title = title,
                Description = "Solicitud clinica",
                Image = string.Empty,
                BloodTypeId = bloodTypeId ?? _db.BloodTypeA.Id,
                DonationTypeId = _db.DonationType.Id,
                DonationCenterId = centerId ?? _db.DonationCenter.Id,
                UserId = _db.User.Id,
                Urgency = urgency,
                Component = component,
                Status = status,
                StatusChangedAt = statusChangedAt ?? Start,
                UnitsRequired = 4,
                UnitsCovered = 0,
                Deadline = deadline,
                PatientCode = patientCode,
                CoordinationPhone = "+59170000000",
                CreatedAt = Start,
            };

        private async Task AddAsync(params DonationPost[] requests)
        {
            await using DonationAppContext context = _db.NewContext();
            context.DonationPosts.AddRange(requests);
            await context.SaveChangesAsync();
        }

        private async Task<List<string>> Titles(DonationRequestQuery query, bool searchPatientCode = false)
        {
            await using DonationAppContext context = _db.NewContext();
            var page = await new DonationRequestRepository(context).Get(query, searchPatientCode);
            return page.Items.Select(r => r.Title).ToList();
        }

        [Fact]
        public async Task Get_ReturnsOnlyClinicalRequests_NotPlainFeedPosts()
        {
            await _db.SeedAsync(); // seeds one plain post (no phase)
            await AddAsync(NewRequest("Solicitud"));

            Assert.Equal(new[] { "Solicitud" }, await Titles(new DonationRequestQuery()));

            await using DonationAppContext context = _db.NewContext();
            Assert.Null(await new DonationRequestRepository(context).Get(_db.DonationPost.Id));
        }

        [Fact]
        public async Task Get_OrdersCodeRedFirst_ThenPriority_ThenNearestDeadline()
        {
            await _db.SeedAsync();
            await AddAsync(
                NewRequest("estandar", Urgency.Standard, deadline: Start.AddHours(1)),
                NewRequest("prioritario-tarde", Urgency.Priority, deadline: Start.AddHours(30)),
                NewRequest("rojo-sin-fecha", Urgency.CodeRed, deadline: null),
                NewRequest("rojo-pronto", Urgency.CodeRed, deadline: Start.AddMinutes(35)),
                NewRequest("prioritario-pronto", Urgency.Priority, deadline: Start.AddHours(18)));

            Assert.Equal(
                new[] { "rojo-pronto", "rojo-sin-fecha", "prioritario-pronto", "prioritario-tarde", "estandar" },
                await Titles(new DonationRequestQuery()));
        }

        [Fact]
        public async Task Get_CombinesUrgencyComponentAndSeveralBloodTypes()
        {
            await _db.SeedAsync();
            await AddAsync(
                NewRequest("match-a", Urgency.CodeRed, BloodComponent.PlateletsApheresis, bloodTypeId: _db.BloodTypeA.Id),
                NewRequest("match-o", Urgency.CodeRed, BloodComponent.PlateletsApheresis, bloodTypeId: _db.BloodTypeB.Id),
                NewRequest("otro-componente", Urgency.CodeRed, BloodComponent.WholeBlood),
                NewRequest("otra-urgencia", Urgency.Priority, BloodComponent.PlateletsApheresis));

            List<string> titles = await Titles(new DonationRequestQuery
            {
                Urgency = Urgency.CodeRed,
                Component = BloodComponent.PlateletsApheresis,
                BloodTypeId = new List<Guid> { _db.BloodTypeA.Id, _db.BloodTypeB.Id },
            });

            Assert.Equal(new[] { "match-a", "match-o" }, titles.OrderBy(t => t));
            Assert.Equal(new[] { "match-o" }, await Titles(new DonationRequestQuery { BloodTypeId = new List<Guid> { _db.BloodTypeB.Id }, Component = BloodComponent.PlateletsApheresis }));
        }

        [Fact]
        public async Task Get_FiltersByPhase_OpenOrClosed_CenterAndChangeDate()
        {
            await _db.SeedAsync();
            Guid otherCenter = Guid.NewGuid();
            await using (DonationAppContext context = _db.NewContext())
            {
                context.DonationCenters.Add(new DonationCenter
                {
                    Id = otherCenter,
                    Name = "Otro",
                    Address = "-",
                    City = "La Paz",
                    Email = "o@test.com",
                    OpeningHours = "-",
                    Phone = "1",
                    Image = "-",
                    Latitude = 0,
                    Longitude = 0,
                    DonationCenterDonationTypes = new List<DonationCenterDonationType>(),
                });
                await context.SaveChangesAsync();
            }

            await AddAsync(
                NewRequest("buscando", status: RequestStatus.SearchingDonors),
                NewRequest("laboratorio", status: RequestStatus.LabValidation, centerId: otherCenter),
                NewRequest("completada-ayer", status: RequestStatus.Completed, statusChangedAt: Start.AddDays(-1)),
                NewRequest("completada-hoy", status: RequestStatus.Completed, statusChangedAt: Start.AddHours(2)),
                NewRequest("cancelada", status: RequestStatus.Cancelled));

            Assert.Equal(new[] { "laboratorio" }, await Titles(new DonationRequestQuery { Status = RequestStatus.LabValidation }));
            Assert.Equal(new[] { "buscando", "laboratorio" }, (await Titles(new DonationRequestQuery { Open = true })).OrderBy(t => t));
            Assert.Equal(3, (await Titles(new DonationRequestQuery { Open = false })).Count);
            Assert.Equal(new[] { "laboratorio" }, await Titles(new DonationRequestQuery { DonationCenterId = otherCenter }));
            Assert.Equal(
                new[] { "completada-hoy" },
                await Titles(new DonationRequestQuery { Status = RequestStatus.Completed, StatusChangedSince = Start }));
        }

        [Fact]
        public async Task Get_SearchMatchesFolio_AndPatientCodeOnlyForClinicalCallers()
        {
            await _db.SeedAsync();
            await AddAsync(
                NewRequest("Trauma shock", folio: 8902, patientCode: "PX-4912"),
                NewRequest("Cirugia", folio: 8905, patientCode: "PX-1028"));

            Assert.Equal(new[] { "Trauma shock" }, await Titles(new DonationRequestQuery { Search = "REQ-8902" }));
            Assert.Equal(new[] { "Cirugia" }, await Titles(new DonationRequestQuery { Search = "8905" }));

            Assert.Empty(await Titles(new DonationRequestQuery { Search = "px-4912" }, searchPatientCode: false));
            Assert.Equal(new[] { "Trauma shock" }, await Titles(new DonationRequestQuery { Search = "px-4912" }, searchPatientCode: true));
        }

        [Fact]
        public async Task Create_SavesTheRequestAndTheFirstHistoryEntry()
        {
            await _db.SeedAsync();
            DonationPost request = NewRequest("Nueva");
            DonationRequestStatusChange created = new DonationRequestStatusChange
            {
                Id = Guid.NewGuid(),
                DonationPostId = request.Id,
                ToStatus = RequestStatus.SearchingDonors,
                ChangedBySubject = "kc-1",
                ChangedAt = Start,
            };

            await using (DonationAppContext context = _db.NewContext())
            {
                DonationPost saved = await new DonationRequestRepository(context).Create(request, created);
                Assert.Equal(_db.BloodTypeA.Name, saved.BloodType.Name);
                Assert.Equal(_db.DonationCenter.Name, saved.DonationCenter!.Name);
            }

            await using DonationAppContext check = _db.NewContext();
            DonationRequestStatusChange history = Assert.Single(await check.DonationRequestStatusChanges.Where(c => c.DonationPostId == request.Id).ToListAsync());
            Assert.Null(history.FromStatus);
            Assert.Equal(RequestStatus.SearchingDonors, history.ToStatus);
        }

        [Fact]
        public async Task Save_PersistsThePhaseAndItsHistoryTogether()
        {
            await _db.SeedAsync();
            DonationPost request = NewRequest("Mover");
            await AddAsync(request);

            await using (DonationAppContext context = _db.NewContext())
            {
                DonationRequestRepository repository = new DonationRequestRepository(context);
                DonationPost current = (await repository.Get(request.Id))!;
                RequestState seen = new RequestState(current.Status, current.UnitsCovered);
                current.Status = RequestStatus.DonorsOnTheWay;

                await repository.Save(current, seen, new DonationRequestStatusChange
                {
                    Id = Guid.NewGuid(),
                    DonationPostId = request.Id,
                    FromStatus = RequestStatus.SearchingDonors,
                    ToStatus = RequestStatus.DonorsOnTheWay,
                    ChangedBySubject = "kc-1",
                    ChangedAt = Start,
                });
            }

            await using DonationAppContext check = _db.NewContext();
            Assert.Equal(RequestStatus.DonorsOnTheWay, (await check.DonationPosts.FindAsync(request.Id))!.Status);
            Assert.Single(await check.DonationRequestStatusChanges.Where(c => c.DonationPostId == request.Id).ToListAsync());
        }

        [Fact]
        public async Task Save_WhenSomeoneElseMovedItFirst_ThrowsConflictAndKeepsTheirChange()
        {
            await _db.SeedAsync();
            DonationPost request = NewRequest("Disputada");
            await AddAsync(request);

            // Coordinator A reads the card while it is still in SearchingDonors...
            DonationPost seenByA;
            await using (DonationAppContext context = _db.NewContext())
            {
                seenByA = (await new DonationRequestRepository(context).Get(request.Id))!;
            }

            // ...coordinator B moves it first...
            await using (DonationAppContext context = _db.NewContext())
            {
                DonationRequestRepository repository = new DonationRequestRepository(context);
                DonationPost seenByB = (await repository.Get(request.Id))!;
                RequestState stateB = new RequestState(seenByB.Status, seenByB.UnitsCovered);
                seenByB.Status = RequestStatus.Cancelled;
                await repository.Save(seenByB, stateB, null);
            }

            // ...then A saves based on the old phase.
            await using (DonationAppContext context = _db.NewContext())
            {
                RequestState stateA = new RequestState(RequestStatus.SearchingDonors, 0);
                seenByA.Status = RequestStatus.DonorsOnTheWay;
                await Assert.ThrowsAsync<ConflictException>(() => new DonationRequestRepository(context).Save(seenByA, stateA, null));
            }

            await using DonationAppContext check = _db.NewContext();
            Assert.Equal(RequestStatus.Cancelled, (await check.DonationPosts.FindAsync(request.Id))!.Status);
        }

        [Fact]
        public async Task FindMissingReferences_NamesEachMissingRow()
        {
            await _db.SeedAsync();
            await using DonationAppContext context = _db.NewContext();
            DonationRequestRepository repository = new DonationRequestRepository(context);

            Assert.Empty(await repository.FindMissingReferences(_db.BloodTypeA.Id, _db.DonationType.Id, _db.DonationCenter.Id));
            Assert.Equal(
                new[] { "BloodTypeId", "DonationCenterId" },
                await repository.FindMissingReferences(Guid.NewGuid(), _db.DonationType.Id, Guid.NewGuid()));
        }
    }
}
