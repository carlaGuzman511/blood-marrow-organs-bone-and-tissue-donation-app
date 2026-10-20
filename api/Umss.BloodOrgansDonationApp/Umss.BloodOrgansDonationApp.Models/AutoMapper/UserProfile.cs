using AutoMapper;
using Umss.BloodOrgansDonationApp.Models.Requests;
using Umss.BloodOrgansDonationApp.Models.Responses;

namespace Umss.BloodOrgansDonationApp.Models.AutoMapper
{
    public class UserProfile : Profile
    {
        public UserProfile()
        {
            CreateMap<UserRequest, User>()
                .ForMember(c => c.Id, x => x.Ignore())
                .ForMember(c => c.DonationPosts, x => x.Ignore());

            // Identity fields (Id, Email, KeycloakSubject) are set by ProfileService from the token, never from the body.
            CreateMap<ProfileRequest, User>()
                .ForMember(c => c.Id, x => x.Ignore())
                .ForMember(c => c.Email, x => x.Ignore())
                .ForMember(c => c.KeycloakSubject, x => x.Ignore())
                .ForMember(c => c.DonationPosts, x => x.Ignore());

            CreateMap<User, UserResponse>();

            CreateMap<User, DonorResponse>();
        }
    }
}
