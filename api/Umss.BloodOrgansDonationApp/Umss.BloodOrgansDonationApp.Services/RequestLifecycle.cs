using Umss.BloodOrgansDonationApp.Models.Entities;

namespace Umss.BloodOrgansDonationApp.Services
{
    /// <summary>
    /// Phases of a clinical request and the moves between them (US-API-02). Completed and Cancelled
    /// are final. A request can go back to SearchingDonors when a donor drops out or the lab rejects
    /// the units. Reaching the required units completes it from any open phase (see the service).
    /// </summary>
    public static class RequestLifecycle
    {
        private static readonly IReadOnlyDictionary<RequestStatus, RequestStatus[]> Moves = new Dictionary<RequestStatus, RequestStatus[]>
        {
            [RequestStatus.SearchingDonors] = new[] { RequestStatus.DonorsOnTheWay, RequestStatus.Cancelled },
            [RequestStatus.DonorsOnTheWay] = new[] { RequestStatus.SearchingDonors, RequestStatus.LabValidation, RequestStatus.Cancelled },
            [RequestStatus.LabValidation] = new[] { RequestStatus.SearchingDonors, RequestStatus.Completed, RequestStatus.Cancelled },
            [RequestStatus.Completed] = Array.Empty<RequestStatus>(),
            [RequestStatus.Cancelled] = Array.Empty<RequestStatus>(),
        };

        public static bool IsOpen(RequestStatus status) => status is not (RequestStatus.Completed or RequestStatus.Cancelled);

        public static bool CanMove(RequestStatus from, RequestStatus to) => Moves[from].Contains(to);

        public static IReadOnlyList<RequestStatus> NextStatuses(RequestStatus from) => Moves[from];

        /// <summary>Spanish name of the phase, as the board shows it.</summary>
        public static string Label(RequestStatus status) => status switch
        {
            RequestStatus.SearchingDonors => "Buscando donantes",
            RequestStatus.DonorsOnTheWay => "Donantes en camino",
            RequestStatus.LabValidation => "En validacion de laboratorio",
            RequestStatus.Completed => "Completado",
            RequestStatus.Cancelled => "Cancelada",
            _ => status.ToString(),
        };
    }
}
