namespace Umss.BloodOrgansDonationApp.Models.Entities
{
    /// <summary>
    /// How fast a request must be covered. Stored and sent as text ("CodeRed"), never as a number.
    /// Plain feed posts are <see cref="Standard"/>.
    /// </summary>
    public enum Urgency
    {
        /// <summary>Estandar: scheduled surgery or routine need.</summary>
        Standard,

        /// <summary>Prioritario: needed within 24 to 48 hours.</summary>
        Priority,

        /// <summary>Codigo Rojo: immediate (shock, trauma). The board shows a countdown to the deadline.</summary>
        CodeRed,
    }

    /// <summary>The biological component a clinical request asks for.</summary>
    public enum BloodComponent
    {
        /// <summary>Sangre total / concentrado eritrocitario.</summary>
        WholeBlood,

        /// <summary>Plaquetas por aferesis.</summary>
        PlateletsApheresis,

        /// <summary>Medula osea / celulas progenitoras.</summary>
        BoneMarrow,

        /// <summary>Organo o tejido (cornea, rinon...).</summary>
        OrganTissue,
    }

    /// <summary>
    /// Triage phase of a clinical request (US-API-02), one column of the portal board.
    /// Allowed moves live in <c>Services/RequestLifecycle</c>.
    /// </summary>
    public enum RequestStatus
    {
        /// <summary>Buscando donantes.</summary>
        SearchingDonors,

        /// <summary>Donantes en camino.</summary>
        DonorsOnTheWay,

        /// <summary>En validacion de laboratorio.</summary>
        LabValidation,

        /// <summary>Completado / despachado. Final.</summary>
        Completed,

        /// <summary>Cancelada. Final.</summary>
        Cancelled,
    }
}
