using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Umss.BloodOrgansDonationApp.Models.Exceptions;

namespace Umss.BloodOrgansDonationApp.API.Middlewares
{
    /// <summary>
    /// Single place that translates exceptions into HTTP responses (RFC 7807 ProblemDetails).
    /// Controllers must not catch these themselves:
    /// <list type="bullet">
    /// <item><see cref="ValidationException"/> -> 400 with errors grouped by property.</item>
    /// <item><see cref="EntityNotFoundException"/> -> 404.</item>
    /// <item><see cref="BusinessException"/> -> 400.</item>
    /// <item>anything else -> 500 with a generic message; details are logged, never returned.</item>
    /// </list>
    /// </summary>
    public class ExceptionMiddleware
    {
        private const string ProblemJsonContentType = "application/problem+json";

        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception exception)
            {
                if (context.Response.HasStarted)
                {
                    // Too late to change status/body; let the server abort the response.
                    _logger.LogError(exception, "Unhandled exception after the response started.");
                    throw;
                }

                ProblemDetails problem = ToProblemDetails(exception);
                problem.Instance = context.Request.Path;
                problem.Extensions["traceId"] = context.TraceIdentifier;

                if (problem.Status >= StatusCodes.Status500InternalServerError)
                {
                    _logger.LogError(exception, "Unhandled exception processing {Method} {Path}.", context.Request.Method, context.Request.Path);
                }

                context.Response.StatusCode = problem.Status!.Value;
                // Pass the runtime type so ValidationProblemDetails.errors is serialized.
                await context.Response.WriteAsJsonAsync(problem, problem.GetType(), options: null, contentType: ProblemJsonContentType);
            }
        }

        private static ProblemDetails ToProblemDetails(Exception exception) => exception switch
        {
            ValidationException validation => new ValidationProblemDetails(
                validation.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray()))
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "One or more validation errors occurred.",
            },
            EntityNotFoundException => new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Resource not found.",
                Detail = exception.Message,
            },
            BusinessException => new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "The request could not be processed.",
                Detail = exception.Message,
            },
            _ => new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error.",
            },
        };
    }
}
