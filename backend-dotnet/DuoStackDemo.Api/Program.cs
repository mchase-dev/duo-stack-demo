using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using DuoStackDemo.Data;
using DuoStackDemo.Services;
using Mapster;
using MapsterMapper;
using DuoStackDemo.Domain.Mappings;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Serialize enums as strings (PascalCase - matches Node.js and frontend)
        options.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter());

        // Use camelCase for property names (JavaScript convention)
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });
builder.Services.AddEndpointsApiExplorer();

// Configure Swagger with JWT authentication
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "DuoStackDemo API",
        Version = "v1",
        Description = "API for DuoStackDemo (.NET Backend)"
    });

    // Add JWT authentication to Swagger
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Configure database
var dbProvider = builder.Configuration.GetValue<string>("Database:Provider") ?? "PostgreSQL";
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
{
    switch (dbProvider.ToLower())
    {
        case "sqlserver":
        case "mssql":
            options.UseSqlServer(connectionString);
            break;
        case "mysql":
        case "mariadb":
            options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
            break;
        case "postgresql":
        case "postgres":
            options.UseNpgsql(connectionString);
            break;
        case "sqlite":
            options.UseSqlite(connectionString ?? "Data Source=app.db");
            break;
        default:
            throw new InvalidOperationException($"Unsupported database provider: {dbProvider}");
    }

    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging();
        options.EnableDetailedErrors();
    }
});

// Configure Mapster
MappingConfig.RegisterMappings();
builder.Services.AddSingleton(TypeAdapterConfig.GlobalSettings);
builder.Services.AddScoped<IMapper, ServiceMapper>();

// Configure MediatR
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));

// Register application services
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<PasswordService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<RealtimeService>();

// Register domain services
builder.Services.AddScoped<DuoStackDemo.Domain.Auth.Services.TokenHashService>();
builder.Services.AddScoped<DuoStackDemo.Domain.Events.Services.EventVisibilityService>();

// Configure JWT Authentication
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? throw new InvalidOperationException("JWT Secret not configured");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "DuoStackDemo";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "DuoStackDemo";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };

    // Add support for SignalR authentication
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;

            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }

            return Task.CompletedTask;
        }
    };
});

// Configure authorization
builder.Services.AddAuthorization();

// Configure CORS
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:3001" };

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Add SignalR for real-time communication
builder.Services.AddSignalR();

var app = builder.Build();

// Apply migrations and seed database
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();

        // Skip migrations for in-memory databases (used in tests)
        var connection = context.Database.GetDbConnection();
        var dbConnectionString = connection.ConnectionString;
        var isInMemory = dbConnectionString?.Contains(":memory:", StringComparison.OrdinalIgnoreCase) == true ||
                        dbConnectionString?.Contains("Mode=Memory", StringComparison.OrdinalIgnoreCase) == true;

        if (!isInMemory)
        {
            // Apply pending migrations
            if (context.Database.GetPendingMigrations().Any())
            {
                Console.WriteLine("Applying pending migrations...");
                await context.Database.MigrateAsync();
                Console.WriteLine("✅ Migrations applied successfully.");
            }

            // Seed database
            await DbSeeder.SeedAsync(context);
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating or seeding the database.");
        throw;
    }
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "DuoStackDemo API v1");
    });
}

// Serve uploaded files
var uploadDir = builder.Configuration.GetValue<string>("FileUpload:UploadDir") ?? "./uploads";
if (!Directory.Exists(uploadDir))
{
    Directory.CreateDirectory(uploadDir);
}
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), uploadDir.TrimStart('.', '/'))),
    RequestPath = "/uploads"
});

app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

// Health check endpoint
app.MapGet("/health", () => Results.Json(new
{
    success = true,
    data = new
    {
        status = "healthy",
        timestamp = DateTime.UtcNow,
        environment = app.Environment.EnvironmentName
    }
}));

app.MapControllers();

// Map SignalR hubs
app.MapHub<DuoStackDemo.Hubs.RoomsHub>("/hubs/rooms");

Console.WriteLine("");
Console.WriteLine("🚀 ========================================");
Console.WriteLine($"   Server running on {builder.Configuration["ASPNETCORE_URLS"] ?? "http://localhost:5000"}");
Console.WriteLine($"   Environment: {app.Environment.EnvironmentName}");
Console.WriteLine($"   Database Provider: {dbProvider}");
Console.WriteLine($"   API Docs: {(app.Environment.IsDevelopment() ? "http://localhost:5000/swagger" : "Disabled in production")}");
Console.WriteLine($"   Health: http://localhost:5000/health");
Console.WriteLine($"   SignalR: ws://localhost:5000/hubs/rooms");
Console.WriteLine($"   CORS Origins: {string.Join(", ", allowedOrigins)}");
Console.WriteLine("========================================== 🚀");
Console.WriteLine("");

app.Run();

// Make Program class accessible to tests
public partial class Program { }
