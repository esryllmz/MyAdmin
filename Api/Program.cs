using Api.Core.Middlewares;
using Api.Core.Security;
using Api.Data;
using Api.Features.Activities;
using Api.Features.Authentication;
using Api.Features.Notifications;
using Api.Features.Permissions;
using Api.Features.RolePermissions;
using Api.Features.Roles;
using Api.Features.Teams;
using Api.Features.UserRoles;
using Api.Features.Users;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using Serilog.Events;
using System.Reflection;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

var loggerConfiguration = new LoggerConfiguration()
  .MinimumLevel.Information()
  .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
  .MinimumLevel.Override("System", LogEventLevel.Warning)
  .MinimumLevel.Override("Microsoft.Hosting.Lifetime", LogEventLevel.Information)
  .WriteTo.Console();

if (builder.Environment.IsDevelopment())
{
  loggerConfiguration.WriteTo.File("Logs/log-.txt",
    rollingInterval: RollingInterval.Day,
    outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}");
}

Log.Logger = loggerConfiguration.CreateLogger();

var frontendUrl = builder.Configuration["FrontendUrl"];
if (!Uri.TryCreate(frontendUrl, UriKind.Absolute, out var frontendUri) ||
    (frontendUri.Scheme != Uri.UriSchemeHttp && frontendUri.Scheme != Uri.UriSchemeHttps) ||
    !string.IsNullOrEmpty(frontendUri.Query) ||
    !string.IsNullOrEmpty(frontendUri.Fragment) ||
    frontendUri.AbsolutePath != "/")
{
  throw new InvalidOperationException(
    "FrontendUrl must be an absolute HTTP(S) origin without a path, query string, or fragment (for example, http://localhost:3000)."
  );
}

var frontendOrigin = frontendUri.GetLeftPart(UriPartial.Authority);

builder.Services.AddCors(options =>
{
  options.AddPolicy("FrontendPolicy", policy =>
  {
    policy.WithOrigins(frontendOrigin)
          .AllowAnyHeader()
          .AllowAnyMethod()
          .AllowCredentials();
  });
});

builder.Host.UseSerilog();

builder.Services.AddControllers().AddJsonOptions(options =>
{
  options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});

builder.Services.AddHttpContextAccessor();
builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();
builder.Services.AddHealthChecks();

if (!builder.Environment.IsDevelopment())
{
  builder.Services.Configure<ForwardedHeadersOptions>(options =>
  {
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.ForwardLimit = 1;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
  });
}

builder.Services.Configure<ApiBehaviorOptions>(options =>
{
  options.SuppressModelStateInvalidFilter = true;
});

builder.Services.AddDataDependencies(builder.Configuration);
builder.Services.AddUserDependencies();
builder.Services.AddRoleDependencies();
builder.Services.AddPermissionDependencies();
builder.Services.AddUserRoleDependencies();
builder.Services.AddRolePermissionDependencies();
builder.Services.AddAuthenticationDependencies();
builder.Services.AddActivityDependencies();
builder.Services.AddNotificationDependencies();
builder.Services.AddTeamDependencies();

builder.Services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

builder.Services.Configure<TokenOptions>(builder.Configuration.GetSection("TokenOptions"));

var tokenOptions = builder.Configuration.GetSection("TokenOptions").Get<TokenOptions>()
  ?? throw new InvalidOperationException("TokenOptions configuration is missing.");

if (string.IsNullOrWhiteSpace(tokenOptions.Issuer) ||
    string.IsNullOrWhiteSpace(tokenOptions.Audience) ||
    string.IsNullOrWhiteSpace(tokenOptions.SecurityKey) ||
    tokenOptions.AccessTokenExpiration <= 0 ||
    tokenOptions.RefreshTokenExpiration <= 0 ||
    Encoding.UTF8.GetByteCount(tokenOptions.SecurityKey) < 64)
{
  throw new InvalidOperationException(
    "TokenOptions is incomplete. Expirations must be positive and SecurityKey must contain at least 64 UTF-8 bytes for HMAC-SHA512."
  );
}

if (!builder.Environment.IsDevelopment() && IsUnsafeProductionSecurityKey(tokenOptions.SecurityKey))
{
  throw new InvalidOperationException(
    "TokenOptions:SecurityKey contains a development/default/placeholder value. Configure a unique production key through external configuration."
  );
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
  .AddJwtBearer(options =>
  {
    options.TokenValidationParameters = new TokenValidationParameters
    {
      ValidateIssuer = true,
      ValidateAudience = true,
      ValidateLifetime = true,
      ValidIssuer = tokenOptions.Issuer,
      ValidAudience = tokenOptions.Audience,
      ValidateIssuerSigningKey = true,
      IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenOptions.SecurityKey)),
      ClockSkew = TimeSpan.Zero
    };
  });

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
  await DevelopmentDataSeeder.SeedAsync(app.Services);
}

app.UseExceptionHandler();

if (!app.Environment.IsDevelopment())
{
  app.UseForwardedHeaders();
  app.UseHttpsRedirection();
}

if (app.Environment.IsDevelopment())
{
  app.MapOpenApi();
}

app.UseCors("FrontendPolicy");
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

app.Run();

static bool IsUnsafeProductionSecurityKey(string securityKey)
{
  string[] unsafeMarkers =
  [
    "development",
    "default",
    "placeholder",
    "your_secret",
    "your-secret",
    "changeforme",
    "change-for-production"
  ];

  return unsafeMarkers.Any(marker => securityKey.Contains(marker, StringComparison.OrdinalIgnoreCase));
}
