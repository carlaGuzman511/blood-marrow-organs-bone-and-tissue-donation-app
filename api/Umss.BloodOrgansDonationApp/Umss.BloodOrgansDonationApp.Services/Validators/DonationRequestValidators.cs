using FluentValidation;
using Umss.BloodOrgansDonationApp.Models.Requests;
using Umss.BloodOrgansDonationApp.Models.Requests.Queries;

namespace Umss.BloodOrgansDonationApp.Services.Validators
{
    /// <summary>
    /// Body of POST/PUT /api/donation-requests. <paramref name="now"/> is the service clock;
    /// <paramref name="currentDeadline"/> is set on an edit, so an overdue request can still be
    /// edited as long as its deadline isn't changed to another past moment.
    /// </summary>
    internal class DonationRequestRequestValidator : AbstractValidator<DonationRequestRequest>
    {
        public const int MaxUnits = 100;
        public static readonly TimeSpan MaxDeadlineAhead = TimeSpan.FromDays(365);

        public DonationRequestRequestValidator(DateTime now, DateTime? currentDeadline = null)
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("El titulo de la solicitud es requerido")
                .MaximumLength(150).WithMessage("El titulo no puede superar 150 caracteres");

            RuleFor(x => x.Description)
                .NotEmpty().WithMessage("La descripcion de la solicitud es requerida")
                .MaximumLength(2000).WithMessage("La descripcion no puede superar 2000 caracteres");

            RuleFor(x => x.BloodTypeId).NotEmpty().WithMessage("El grupo sanguineo es requerido");
            RuleFor(x => x.DonationTypeId).NotEmpty().WithMessage("El tipo de donacion es requerido");
            RuleFor(x => x.DonationCenterId).NotEmpty().WithMessage("El centro medico es requerido");

            RuleFor(x => x.Component)
                .NotNull().WithMessage("El componente biologico es requerido")
                .IsInEnum().WithMessage("El componente biologico no es valido");

            RuleFor(x => x.Urgency)
                .NotNull().WithMessage("El nivel de urgencia es requerido")
                .IsInEnum().WithMessage("El nivel de urgencia no es valido");

            RuleFor(x => x.UnitsRequired)
                .NotNull().WithMessage("Las unidades requeridas son requeridas")
                .GreaterThan(0).WithMessage("Las unidades requeridas deben ser mayores a 0")
                .LessThanOrEqualTo(MaxUnits).WithMessage($"Las unidades requeridas no pueden superar {MaxUnits}");

            RuleFor(x => x.Deadline)
                .NotNull().WithMessage("La fecha limite es requerida")
                .Must(d => d > now || (currentDeadline.HasValue && d == currentDeadline.Value))
                    .WithMessage("La fecha limite no puede estar en el pasado")
                .Must(d => d <= now + MaxDeadlineAhead)
                    .WithMessage("La fecha limite no puede superar un ano");

            RuleFor(x => x.PatientCode)
                .NotEmpty().WithMessage("El identificador clinico del paciente es requerido")
                .MaximumLength(40).WithMessage("El identificador del paciente no puede superar 40 caracteres");

            RuleFor(x => x.PatientAge)
                .InclusiveBetween(0, 120).When(x => x.PatientAge.HasValue)
                .WithMessage("La edad del paciente debe estar entre 0 y 120");

            RuleFor(x => x.Diagnosis).MaximumLength(200).WithMessage("El diagnostico no puede superar 200 caracteres");
            RuleFor(x => x.Service).MaximumLength(100).WithMessage("El servicio no puede superar 100 caracteres");
            RuleFor(x => x.Bed).MaximumLength(50).WithMessage("La cama no puede superar 50 caracteres");
            RuleFor(x => x.MedicalRecord).MaximumLength(50).WithMessage("El expediente no puede superar 50 caracteres");

            RuleFor(x => x.CoordinationPhone)
                .NotEmpty().WithMessage("El telefono de coordinacion es requerido")
                .Matches(@"^\+?[0-9 ()-]{6,20}$").WithMessage("El telefono de coordinacion no es valido");
        }
    }

    internal class RequestStatusChangeRequestValidator : AbstractValidator<RequestStatusChangeRequest>
    {
        public RequestStatusChangeRequestValidator()
        {
            RuleFor(x => x.Status)
                .NotNull().WithMessage("La fase es requerida")
                .IsInEnum().WithMessage("La fase no es valida");

            RuleFor(x => x.Reason).MaximumLength(300).WithMessage("El motivo no puede superar 300 caracteres");
        }
    }

    internal class RequestUnitsRequestValidator : AbstractValidator<RequestUnitsRequest>
    {
        public RequestUnitsRequestValidator()
        {
            RuleFor(x => x.Units)
                .InclusiveBetween(1, DonationRequestRequestValidator.MaxUnits)
                .WithMessage($"Las unidades deben estar entre 1 y {DonationRequestRequestValidator.MaxUnits}");
        }
    }

    internal class DonationRequestQueryValidator : AbstractValidator<DonationRequestQuery>
    {
        public DonationRequestQueryValidator()
        {
            RuleFor(x => x.BloodTypeId)
                .Must(ids => ids == null || ids.Count <= DonationRequestQuery.MaxBloodTypes)
                .WithMessage($"Se pueden filtrar hasta {DonationRequestQuery.MaxBloodTypes} grupos sanguineos");
        }
    }
}
