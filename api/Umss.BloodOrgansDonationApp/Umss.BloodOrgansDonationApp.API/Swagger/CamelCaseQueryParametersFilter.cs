using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Umss.BloodOrgansDonationApp.API.Swagger
{
    /// <summary>
    /// Query objects bind by property name (<c>PageSize</c>), case-insensitively. Document them the
    /// way clients send them (<c>pageSize</c>), like the camelCase JSON bodies.
    /// </summary>
    public class CamelCaseQueryParametersFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            foreach (OpenApiParameter parameter in operation.Parameters.Where(p => p.In == ParameterLocation.Query))
            {
                if (parameter.Name.Length > 0 && char.IsUpper(parameter.Name[0]))
                {
                    parameter.Name = char.ToLowerInvariant(parameter.Name[0]) + parameter.Name[1..];
                }
            }
        }
    }
}
