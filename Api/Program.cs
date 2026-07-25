
using Api.Core.Middlewares;
using Api.Core.Security;
using Api.Data;
using Api.Features.Activities;
using Api.Features.Authentication;
using Api.Features.Notifications;
using Api.Features.Permissions;
using Api.Features.RolePermissions;
using Api.Features.Roles;
using Api.Features.UserRoles;
using Api.Features.Users;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using Serilog.Events;
using System.Reflection;
using System.Text;
using System.Text.Json.Serialization;

Log.Logger = new LoggerConfiguration()
  .MinimumLevel.Information()
  .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
  .MinimumLevel.Override("System", LogEventLevel.Warning)
  .MinimumLevel.Override("Microsoft.Hosting.Lifetime", LogEventLevel.Information)
  .WriteTo.Console()
  .WriteTo.File("Logs/log-.txt",
    rollingInterval: RollingInterval.Day,
    outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}")
  .CreateLogger();

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
  options.AddPolicy("FrontendPolicy", policy =>
  {
    policy.WithOrigins("http://localhost:3000") 
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

builder.Services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

builder.Services.Configure<TokenOptions>(builder.Configuration.GetSection("TokenOptions"));

var tokenOptions = builder.Configuration.GetSection("TokenOptions").Get<TokenOptions>() ?? throw new InvalidOperationException("TokenOptions bölümü yapılandırma dosyasında appsettings bulunamadı.");

if (string.IsNullOrWhiteSpace(tokenOptions.Issuer) ||
    string.IsNullOrWhiteSpace(tokenOptions.Audience) ||
    string.IsNullOrWhiteSpace(tokenOptions.SecurityKey) ||
    tokenOptions.SecurityKey.Contains("YOUR_SECRET", StringComparison.OrdinalIgnoreCase) ||
    Encoding.UTF8.GetByteCount(tokenOptions.SecurityKey) <= 64)
{
  throw new InvalidOperationException("TokenOptions yapılandırması eksik veya HMAC-SHA512 için yeterli uzunlukta JWT imzalama anahtarı içermiyor.");
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

if (app.Environment.IsDevelopment())
{
  app.MapOpenApi();
}
app.UseCors("FrontendPolicy");
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
