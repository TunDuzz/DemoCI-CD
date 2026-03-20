using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Cinestream.Infrastructure.Data;
using Cinestream.Domain.Entities;
using FluentValidation;

using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddHttpClient(); // For IHttpClientFactory (TMDB proxy)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure Output Caching and Rate Limiting
builder.Services.AddOutputCache();
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 100,
                QueueLimit = 0,
                Window = TimeSpan.FromSeconds(10)
            }));

    options.AddPolicy("StrictPolicy", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 5,
                QueueLimit = 0,
                Window = TimeSpan.FromMinutes(1)
            }));

    options.AddPolicy("AuthPolicy", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 2,
                QueueLimit = 0,
                Window = TimeSpan.FromMinutes(1)
            }));
});

// Configure FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<Cinestream.Application.Validators.Comment.CreateCommentRequestValidator>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:5175")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Configure Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(connectionString);
});



// Configure JWT
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = System.Text.Encoding.UTF8.GetBytes(jwtSettings["Secret"]!);
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(secretKey)
    };
});

// Configure Custom Services
builder.Services.Configure<Cinestream.Application.DTOs.MovieApi.MovieApiSettings>(builder.Configuration.GetSection("MovieApi"));
builder.Services.AddHttpClient();
builder.Services.AddMemoryCache();

// Repositories
builder.Services.AddScoped<Cinestream.Application.Interfaces.Repositories.IUserRepository, Cinestream.Infrastructure.Repositories.UserRepository>();
builder.Services.AddScoped<Cinestream.Application.Interfaces.Repositories.IFavoriteRepository, Cinestream.Infrastructure.Repositories.FavoriteRepository>();
builder.Services.AddScoped<Cinestream.Application.Interfaces.Repositories.IWatchHistoryRepository, Cinestream.Infrastructure.Repositories.WatchHistoryRepository>();
builder.Services.AddScoped<Cinestream.Application.Interfaces.Repositories.IAppSettingRepository, Cinestream.Infrastructure.Repositories.AppSettingRepository>();
builder.Services.AddScoped<Cinestream.Application.Interfaces.Repositories.ICommentRepository, Cinestream.Infrastructure.Repositories.CommentRepository>();
builder.Services.AddScoped<Cinestream.Application.Interfaces.Repositories.IRatingRepository, Cinestream.Infrastructure.Repositories.RatingRepository>();

// Common / Utilities
builder.Services.AddScoped<Cinestream.Application.Interfaces.Common.IJwtTokenGenerator, Cinestream.Infrastructure.Common.JwtTokenGenerator>();
builder.Services.AddScoped<Cinestream.Application.Interfaces.Common.IPasswordHasher, Cinestream.Infrastructure.Common.PasswordHasher>();

// Application Services
builder.Services.AddScoped<Cinestream.Application.Interfaces.Services.IMovieService, Cinestream.Infrastructure.ExternalServices.MovieService>();
builder.Services.AddScoped<Cinestream.Application.Interfaces.Services.ICloudinaryService, Cinestream.Infrastructure.ExternalServices.CloudinaryService>();
builder.Services.AddScoped<Cinestream.Application.Interfaces.Services.IAuthService, Cinestream.Infrastructure.Services.AuthService>();
builder.Services.AddScoped<Cinestream.Application.Interfaces.Services.IWatchHistoryService, Cinestream.Infrastructure.Services.WatchHistoryService>();
builder.Services.AddScoped<Cinestream.Application.Interfaces.Services.ICommentService, Cinestream.Application.Services.CommentService>();
builder.Services.AddScoped<Cinestream.Application.Interfaces.Services.IRatingService, Cinestream.Application.Services.RatingService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseRateLimiter();
app.UseOutputCache();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
