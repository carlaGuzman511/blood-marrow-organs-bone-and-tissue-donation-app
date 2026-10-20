using FluentValidation;
using Umss.BloodOrgansDonationApp.Models.Requests.Queries;

namespace Umss.BloodOrgansDonationApp.Services.Validators
{
    /// <summary>Paging (and search, for <see cref="SearchPageQuery"/>) of every list endpoint.</summary>
    internal class PageQueryValidator : AbstractValidator<PageQuery>
    {
        public PageQueryValidator()
        {
            RuleFor(x => x.Page)
                .GreaterThanOrEqualTo(1)
                .WithMessage("La pagina debe ser mayor o igual a 1");

            RuleFor(x => x.PageSize)
                .InclusiveBetween(1, PageQuery.MaxPageSize)
                .WithMessage($"El tamano de pagina debe estar entre 1 y {PageQuery.MaxPageSize}");

            When(x => x is SearchPageQuery, () =>
            {
                RuleFor(x => ((SearchPageQuery)x).Search)
                    .MaximumLength(SearchPageQuery.MaxSearchLength)
                    .OverridePropertyName(nameof(SearchPageQuery.Search))
                    .WithMessage($"La busqueda no puede superar {SearchPageQuery.MaxSearchLength} caracteres");
            });
        }

        public static void Check(PageQuery query)
        {
            new PageQueryValidator().ValidateAndThrow(query);
        }
    }
}
