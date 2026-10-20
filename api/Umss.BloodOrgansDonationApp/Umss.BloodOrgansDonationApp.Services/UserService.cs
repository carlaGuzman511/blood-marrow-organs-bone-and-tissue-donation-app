using AutoMapper;
using FluentValidation;
using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Exceptions;
using Umss.BloodOrgansDonationApp.Models.Requests;
using Umss.BloodOrgansDonationApp.Models.Requests.Queries;
using Umss.BloodOrgansDonationApp.Models.Responses;
using Umss.BloodOrgansDonationApp.Repository.Interfaces;
using Umss.BloodOrgansDonationApp.Services.Interfaces;
using Umss.BloodOrgansDonationApp.Services.Validators;

namespace Umss.BloodOrgansDonationApp.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        private readonly ITokenService _tokenService;
        private readonly ICurrentUserService _currentUser;
        public UserService(IUserRepository userRepository, IMapper mapper, ITokenService tokenService, ICurrentUserService currentUser)
        {
            this._userRepository = userRepository;
            _mapper = mapper;
            _tokenService = tokenService;
            _currentUser = currentUser;
        }
        public async Task<UserResponse> Create(UserRequest userRequest)
        {
            UserRequestValidator userRequestValidator = new UserRequestValidator();
            userRequestValidator.ValidateAndThrow(userRequest);

            User user = _mapper.Map<User>(userRequest);
            user.Id = Guid.NewGuid();

            user = await _userRepository.Create(user);

            return _mapper.Map<UserResponse>(user);
        }

        public async Task Delete(Guid id)
        {
            EnsureNetworkAdmin();
            await _userRepository.Delete(id);
        }

        public async Task<UserResponse?> Get(Guid id)
        {
            await _currentUser.EnsureSelfOrAdminAsync(id);

            User? user = await _userRepository.Get(id);
            if (user != null)
            {
                return _mapper.Map<UserResponse>(user);
            }
            else
            {
                return null;
            }
        }

        public async Task<PagedResult<UserResponse>> GetAll(UserQuery query)
        {
            EnsureNetworkAdmin();
            PageQueryValidator.Check(query);

            PagedResult<User> users = await _userRepository.GetAll(query);
            return users.Map(x => _mapper.Map<UserResponse>(x));
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest loginRequest)
        {
            User? user = await _userRepository.GetByEmailAsync(loginRequest.Email);
            if (user == null)
            {
                throw new EntityNotFoundException($"User with Email {loginRequest.Email} not found.");
            }

            bool result = await _userRepository.CheckPasswordAsync(user, loginRequest.Password);
            if (!result)
            {
                throw new EntityNotFoundException($"User password is incorrect.");
            }

            var roles = await _userRepository.GetRolesAsync(user);
            var token = _tokenService.CreateToken(user, roles);

            return new AuthResponse
            {
                Token = token,
                Expiration = DateTime.UtcNow.AddMinutes(30)
            };
        }

        public async Task<UserResponse> Update(Guid id, UserRequest userRequest)
        {
            await _currentUser.EnsureSelfOrAdminAsync(id);

            User? user = await _userRepository.Get(id);
            if (user == null)
            {
                throw new EntityNotFoundException($"User with ID {id} not found.");
            }

            UserRequestValidator userRequestValidator = new UserRequestValidator();
            userRequestValidator.ValidateAndThrow(userRequest);

            _mapper.Map(userRequest, user);
            user.Id = id;

            user = await _userRepository.Update(user);

            return _mapper.Map<UserResponse>(user);
        }

        // Every profile holds personal data (address, location, date of birth): listing or deleting them is admin-only.
        private void EnsureNetworkAdmin()
        {
            if (!_currentUser.IsNetworkAdmin)
            {
                throw new ForbiddenException("Only network administrators can do this.");
            }
        }
    }
}
