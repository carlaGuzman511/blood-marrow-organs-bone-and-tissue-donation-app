using AutoMapper;
using Umss.BloodOrgansDonationApp.Models.Entities;
using Umss.BloodOrgansDonationApp.Models.Responses;

namespace Umss.BloodOrgansDonationApp.Models.AutoMapper
{
    /// <summary>
    /// Entity to response only. The request body is copied by hand in DonationRequestService, so a
    /// new entity field can never be set from the body by accident (status, covered units, author).
    /// RemainingSeconds, IsOverdue and the patient's visibility depend on the clock and the caller:
    /// the service sets them.
    /// </summary>
    public class DonationRequestProfile : Profile
    {
        public DonationRequestProfile()
        {
            CreateMap<DonationPost, DonationRequestResponse>()
                .ForMember(r => r.Code, x => x.MapFrom(src => "REQ-" + src.Folio))
                .ForMember(r => r.Component, x => x.MapFrom(src => src.Component ?? BloodComponent.WholeBlood))
                .ForMember(r => r.Status, x => x.MapFrom(src => src.Status ?? RequestStatus.SearchingDonors))
                .ForMember(r => r.UnitsRequired, x => x.MapFrom(src => src.UnitsRequired ?? 0))
                .ForMember(r => r.ProgressPercent, x => x.MapFrom(src => ProgressPercent(src.UnitsCovered, src.UnitsRequired)))
                .ForMember(r => r.Author, x => x.MapFrom(src => src.User))
                .ForMember(r => r.Patient, x => x.MapFrom(src => src))
                .ForMember(r => r.RemainingSeconds, x => x.Ignore())
                .ForMember(r => r.IsOverdue, x => x.Ignore())
                .ForMember(r => r.AllowedNextStatuses, x => x.Ignore());

            CreateMap<DonationPost, PatientDetailsResponse>()
                .ForMember(r => r.PatientCode, x => x.MapFrom(src => src.PatientCode ?? string.Empty));
        }

        public static int ProgressPercent(int covered, int? required)
        {
            if (required is not > 0)
            {
                return 0;
            }

            return Math.Clamp(covered * 100 / required.Value, 0, 100);
        }
    }
}
