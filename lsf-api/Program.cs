using System.Net;
using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;
using LsfApi.Data;
using LsfApi.Features.Auth;
using LsfApi.Features.Badges;
using LsfApi.Features.Categories;
using LsfApi.Features.Daily;
using LsfApi.Features.Email;
using LsfApi.Features.Phrases;
using LsfApi.Features.Lessons;
using LsfApi.Features.Modules;
using LsfApi.Features.Quests;
using LsfApi.Features.Revision;
using LsfApi.Features.Scores;
using LsfApi.Features.Signs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
    });
    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            []
        }
    });
});

builder.Services.AddControllers();

// CORS — origines lues depuis la config (AllowedOrigins dans appsettings)
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:3000"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());   // requis pour les cookies cross-origin
});

// Base de données
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

// Auth services
builder.Services.AddScoped<PasswordService>();
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<PasswordResetService>();
builder.Services.AddScoped<AccountDeletionService>();

// Email service
builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection("EmailSettings"));
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<IEmailService>(sp => sp.GetRequiredService<EmailService>());

// Feature services
builder.Services.AddScoped<CategoryService>();
builder.Services.AddScoped<ModuleService>();
builder.Services.AddScoped<LessonService>();
builder.Services.AddScoped<SignService>();
builder.Services.AddScoped<LsfApi.Features.Progress.ProgressService>();
builder.Services.AddScoped<LsfApi.Features.Favorites.FavoritesService>();
builder.Services.AddScoped<BadgeService>();
builder.Services.AddScoped<ScoreService>();
builder.Services.AddScoped<RevisionService>();
builder.Services.AddScoped<DailyQuestService>();
builder.Services.AddScoped<DailyService>();
builder.Services.AddScoped<PhraseService>();

// Elix LSF API
builder.Services.AddHttpClient<ElixService>(client =>
{
    client.BaseAddress = new Uri("https://api.elix-lsf.fr/");
    client.DefaultRequestHeaders.Add("Accept", "application/json");
});

// JWT — lit aussi depuis le cookie httpOnly si pas d'Authorization header
// Pas de secret de repli : l'API refuse de démarrer si Jwt:Secret est absent ou trop court
var jwtSecret = builder.Configuration["Jwt:Secret"];
if (string.IsNullOrWhiteSpace(jwtSecret) || Encoding.UTF8.GetByteCount(jwtSecret) < 32)
    throw new InvalidOperationException("Jwt:Secret manquant ou trop court (32 caractères minimum). Définir la variable Jwt__Secret.");
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = ctx =>
            {
                // Fallback : lire le token depuis le cookie httpOnly si pas de header
                if (!ctx.Request.Headers.ContainsKey("Authorization")
                    && ctx.Request.Cookies.TryGetValue("lsf_token", out var cookieToken))
                {
                    ctx.Token = cookieToken;
                }
                return Task.CompletedTask;
            },
            // Révocation : le token est refusé si le compte n'existe plus
            // ou si sa version de session a changé (mot de passe modifié, déconnexion partout)
            OnTokenValidated = async ctx =>
            {
                var sub = ctx.Principal?.FindFirstValue(ClaimTypes.NameIdentifier);
                var version = ctx.Principal?.FindFirstValue(JwtService.TokenVersionClaim);
                if (!Guid.TryParse(sub, out var userId) || !int.TryParse(version, out var tokenVersion))
                {
                    ctx.Fail("invalid_token");
                    return;
                }

                var db = ctx.HttpContext.RequestServices.GetRequiredService<AppDbContext>();
                var current = await db.Users
                    .Where(u => u.Id == userId)
                    .Select(u => (int?)u.TokenVersion)
                    .FirstOrDefaultAsync();

                if (current is null || current != tokenVersion)
                    ctx.Fail("revoked_token");
            }
        };
    });

builder.Services.AddAuthorization();

// Derrière le reverse proxy (Caddy), l'IP du visiteur arrive dans X-Forwarded-For.
// On ne fait confiance à cet en-tête que s'il vient du réseau privé Docker.
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Add(new Microsoft.AspNetCore.HttpOverrides.IPNetwork(IPAddress.Parse("10.0.0.0"), 8));
    options.KnownNetworks.Add(new Microsoft.AspNetCore.HttpOverrides.IPNetwork(IPAddress.Parse("172.16.0.0"), 12));
    options.KnownNetworks.Add(new Microsoft.AspNetCore.HttpOverrides.IPNetwork(IPAddress.Parse("192.168.0.0"), 16));
});

// Rate limiting — 10 requêtes/minute par IP sur les endpoints sensibles
builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy("auth", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                Window = TimeSpan.FromMinutes(1),
                PermitLimit = 10,
                QueueLimit = 0,
            }));
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

var app = builder.Build();

app.UseForwardedHeaders();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    // Intercepte les exceptions non gérées sans exposer de stack trace
    app.UseExceptionHandler(err =>
        err.Run(async ctx =>
        {
            ctx.Response.StatusCode = 500;
            ctx.Response.ContentType = "application/json";
            await ctx.Response.WriteAsync("""{"error":"internal_error","message":"Une erreur interne est survenue"}""");
        }));

    app.UseHttpsRedirection();
}

// Security headers
app.Use(async (ctx, next) =>
{
    ctx.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    ctx.Response.Headers.Append("X-Frame-Options", "DENY");
    ctx.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    if (!app.Environment.IsDevelopment())
        ctx.Response.Headers.Append("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    await next();
});

app.UseCors("Frontend");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Migration automatique + seed en développement
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
    await DatabaseSeeder.SeedAsync(db);
}

await app.RunAsync();
