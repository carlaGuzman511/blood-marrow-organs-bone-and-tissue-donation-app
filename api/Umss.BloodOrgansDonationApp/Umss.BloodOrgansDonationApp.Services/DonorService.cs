using AutoMapper;
using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Requests.Queries;
using Umss.BloodOrgansDonationApp.Models.Responses;
using Umss.BloodOrgansDonationApp.Repository.Interfaces;
using Umss.BloodOrgansDonationApp.Services.Interfaces;
using Umss.BloodOrgansDonationApp.Services.Validators;

namespace Umss.BloodOrgansDonationApp.Services
{
    public class DonorService : IDonorService
    {
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;

        public DonorService(IUserRepository userRepository, IMapper mapper)
        {
            _userRepository = userRepository;
            _mapper = mapper;
        }

        public async Task<PagedResult<DonorResponse>> GetAll(DonorQuery query)
        {
            PageQueryValidator.Check(query);

            PagedResult<User> users = await _userRepository.GetDirectoryAsync(query);
            return users.Map(u => _mapper.Map<DonorResponse>(u));
        }

        public async Task<DonorResponse?> Get(Guid id)
        {
            User? user = await _userRepository.GetDirectoryEntryAsync(id);
            return user == null ? null : _mapper.Map<DonorResponse>(user);
        }
    }
}
