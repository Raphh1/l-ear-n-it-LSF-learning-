using System.Text;
using LsfApi.Data;
using LsfApi.Features.Auth;
using LsfApi.Features.Badges;
using LsfApi.Features.Categories;
using LsfApi.Features.Daily;
using LsfApi.Features.Phrases;
using LsfApi.Features.Lessons;
using LsfApi.Features.Modules;
using LsfApi.Features.Revision;
using LsfApi.Features.Scores;
using LsfApi.Features.Signs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
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

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy
            .WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

// Base de données
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

// Auth services
builder.Services.AddScoped<PasswordService>();
builder.Services.AddScoped<JwtService>();

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
builder.Services.AddScoped<DailyService>();
builder.Services.AddScoped<PhraseService>();

// Elix LSF API
builder.Services.AddHttpClient<ElixService>(client =>
{
    client.BaseAddress = new Uri("https://api.elix-lsf.fr/");
    client.DefaultRequestHeaders.Add("Accept", "application/json");
});

// JWT
var jwtSecret = builder.Configuration["Jwt:Secret"]!;
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
    });

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (!app.Environment.IsDevelopment())
    app.UseHttpsRedirection();

app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Seed en développement
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await DatabaseSeeder.SeedAsync(db);
}

await app.RunAsync();
