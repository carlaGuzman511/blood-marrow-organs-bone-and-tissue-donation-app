using System.Text.Json;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;
using Umss.BloodOrgansDonationApp.API.Middlewares;
using Umss.BloodOrgansDonationApp.Models.Exceptions;

namespace Umss.BloodOrgansDonationApp.API.Tests.Middlewares
{
    public class ExceptionMiddlewareTest
    {
        [Fact(DisplayName = "ValidationException -> 400 with errors grouped by property")]
        public async Task ValidationException_GroupsErrorsByProperty()
        {
            var exception = new ValidationException(new[]
            {
                new ValidationFailure("Title", "El titulo es requerido"),
                new ValidationFailure("Title", "El titulo es muy corto"),
                new ValidationFailure("Image", "La imagen es requerida"),
            });

            (HttpContext context, JsonElement body) = await InvokeThrowing(exception);

            Assert.Equal(StatusCodes.Status400BadRequest, context.Response.StatusCode);
            Assert.Equal("application/problem+json", context.Response.ContentType);
            JsonElement errors = body.GetProperty("errors");
            Assert.Equal(2, errors.GetProperty("Title").GetArrayLength());
            Assert.Equal("La imagen es requerida", errors.GetProperty("Image")[0].GetString());
        }

        [Fact(DisplayName = "EntityNotFoundException -> 404 with the message as detail")]
        public async Task EntityNotFoundException_Returns404()
        {
            (HttpContext context, JsonElement body) = await InvokeThrowing(new EntityNotFoundException("Comment with ID 1 not found."));

            Assert.Equal(StatusCodes.Status404NotFound, context.Response.StatusCode);
            Assert.Equal("Comment with ID 1 not found.", body.GetProperty("detail").GetString());
        }

        [Fact(DisplayName = "BusinessException -> 400 with the message as detail")]
        public async Task BusinessException_Returns400()
        {
            (HttpContext context, JsonElement body) = await InvokeThrowing(new BusinessException("Regla de negocio"));

            Assert.Equal(StatusCodes.Status400BadRequest, context.Response.StatusCode);
            Assert.Equal("Regla de negocio", body.GetProperty("detail").GetString());
        }

        [Fact(DisplayName = "Unexpected exception -> 500 without leaking internal details")]
        public async Task UnexpectedException_Returns500WithoutDetails()
        {
            var exception = new InvalidOperationException("Npgsql: password authentication failed for user x",
                new Exception("inner secret"));

            (HttpContext context, JsonElement body) = await InvokeThrowing(exception);

            Assert.Equal(StatusCodes.Status500InternalServerError, context.Response.StatusCode);
            string raw = body.GetRawText();
            Assert.DoesNotContain("password", raw);
            Assert.DoesNotContain("inner secret", raw);
            Assert.False(string.IsNullOrEmpty(body.GetProperty("traceId").GetString()));
        }

        [Fact(DisplayName = "Exceptions after the response started are rethrown")]
        public async Task ResponseAlreadyStarted_Rethrows()
        {
            var context = new DefaultHttpContext();
            context.Features.Set<Microsoft.AspNetCore.Http.Features.IHttpResponseFeature>(new StartedResponseFeature());
            var middleware = new ExceptionMiddleware(_ => throw new InvalidOperationException("boom"), NullLogger<ExceptionMiddleware>.Instance);

            await Assert.ThrowsAsync<InvalidOperationException>(() => middleware.InvokeAsync(context));
        }

        private static async Task<(HttpContext, JsonElement)> InvokeThrowing(Exception exception)
        {
            var context = new DefaultHttpContext();
            context.Request.Path = "/api/test";
            context.Response.Body = new MemoryStream();
            var middleware = new ExceptionMiddleware(_ => throw exception, NullLogger<ExceptionMiddleware>.Instance);

            await middleware.InvokeAsync(context);

            context.Response.Body.Position = 0;
            JsonElement body = await JsonSerializer.DeserializeAsync<JsonElement>(context.Response.Body);
            return (context, body);
        }

        private sealed class StartedResponseFeature : Microsoft.AspNetCore.Http.Features.HttpResponseFeature
        {
            public override bool HasStarted => true;
        }
    }
}
