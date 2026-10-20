using AutoMapper;
using FluentValidation;
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
    public class DonationCenterService : IDonationCenterService
    {
        private readonly IDonationCenterRepository _donationCenterRepository;
        private readonly IDonationTypeRepository _donationTypeRepository;
        private readonly IMapper _mapper;
        public DonationCenterService(IDonationCenterRepository donationCenterRepository, IDonationTypeRepository donationTypeRepository, IMapper mapper)
        {
            _donationCenterRepository = donationCenterRepository;
            _donationTypeRepository = donationTypeRepository;
            _mapper = mapper;
        }
        public async Task<DonationCenterResponse> Create(DonationCenterRequest donationCenterRequest)
        {
            DonationCenterRequestValidator donationCenterRequestValidator = new DonationCenterRequestValidator();
            donationCenterRequestValidator.ValidateAndThrow(donationCenterRequest);

            IEnumerable<DonationType> donationTypes = await _donationTypeRepository.GetByIds(donationCenterRequest.DonationTypeIds);

            DonationCenter donationCenter = _mapper.Map<DonationCenter>(donationCenterRequest);
            donationCenter.Id = Guid.NewGuid();
            donationCenter.DonationCenterDonationTypes = donationTypes.Select(x => new DonationCenterDonationType
            {
                DonationTypeId = x.Id
            }).ToList();

            donationCenter = await _donationCenterRepository.Create(donationCenter);

            return _mapper.Map<DonationCenterResponse>(donationCenter);
        }

        public async Task Delete(Guid id)
        {
            await _donationCenterRepository.Delete(id);
        }

        public async Task<DonationCenterResponse?> Get(Guid id)
        {
            DonationCenter? donationCenter = await _donationCenterRepository.Get(id);
            if (donationCenter != null)
            {
                return _mapper.Map<DonationCenterResponse>(donationCenter);
            }
            else
            {
                return null;
            }
        }

        public async Task<PagedResult<DonationCenterResponse>> GetAll(DonationCenterQuery query)
        {
            PageQueryValidator.Check(query);

            PagedResult<DonationCenter> donationCenters = await _donationCenterRepository.GetAll(query);
            return donationCenters.Map(x => _mapper.Map<DonationCenterResponse>(x));
        }

        public async Task<DonationCenterResponse> Update(Guid id, DonationCenterRequest donationCenterRequest)
        {
            DonationCenter? donationCenter = await _donationCenterRepository.Get(id);
            if (donationCenter == null)
            {
                throw new EntityNotFoundException($"Donation Center with ID {id} not found.");
            }

            DonationCenterRequestValidator donationCenterRequestValidator = new DonationCenterRequestValidator();
            donationCenterRequestValidator.ValidateAndThrow(donationCenterRequest);

            _mapper.Map(donationCenterRequest, donationCenter);
            donationCenter.Id = id;

            donationCenter = await _donationCenterRepository.Update(donationCenter);

            return _mapper.Map<DonationCenterResponse>(donationCenter);
        }
    }
}
