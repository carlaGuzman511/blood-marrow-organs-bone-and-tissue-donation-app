using FluentValidation;
using Umss.BloodOrgansDonationApp.Models.Requests;

namespace Umss.BloodOrgansDonationApp.Services.Validators
{
    internal class ProfileRequestValidator : AbstractValidator<ProfileRequest>
    {
        public ProfileRequestValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty()
                .WithMessage("El nombre completo del usuario es requerido")
                .MaximumLength(150)
                .WithMessage("El nombre completo no puede superar los 150 caracteres");

            RuleFor(x => x.BloodTypeId)
                .NotEmpty()
                .WithMessage("El id del tipo de sangre del usuario es requerido");

            RuleFor(x => x.Address)
                .NotEmpty()
                .WithMessage("La direccion del usuario es requerida");

            RuleFor(x => x.City)
                .MaximumLength(100)
                .WithMessage("La ciudad no puede superar los 100 caracteres");

            RuleFor(x => x.DateOfBirth)
                .NotEmpty()
                .WithMessage("La fecha de nacimiento del usuario es requerida")
                .LessThan(_ => DateTime.UtcNow)
                .WithMessage("La fecha de nacimiento debe estar en el pasado");

            RuleFor(x => x.PhoneNumber)
                .NotEmpty()
                .WithMessage("El numero de telefono del usuario es requerido");

            RuleFor(x => x.Image)
                .NotEmpty()
                .WithMessage("La imagen del usuario es requerida");

            RuleFor(x => x.Latitude)
                .InclusiveBetween(-90, 90)
                .WithMessage("La latitud debe estar entre -90 y 90");

            RuleFor(x => x.Longitude)
                .InclusiveBetween(-180, 180)
                .WithMessage("La longitud debe estar entre -180 y 180");
        }
    }
}
