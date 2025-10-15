namespace DuoStackDemo.Services;

/// <summary>
/// NoopEmailSender - Placeholder email service for development
/// In production, replace with actual email service (SendGrid, AWS SES, etc.)
/// </summary>
public class EmailService
{
    private readonly JwtService _jwtService;
    private readonly ILogger<EmailService> _logger;

    public EmailService(JwtService jwtService, ILogger<EmailService> logger)
    {
        _jwtService = jwtService;
        _logger = logger;
    }

    /// <summary>
    /// Generate email confirmation token (24h expiry)
    /// </summary>
    public string GenerateConfirmationToken(Guid userId, string email, string username, string role)
    {
        // Generate a token with 24h expiry for email confirmation
        var claims = new[]
        {
            new System.Security.Claims.Claim("userId", userId.ToString()),
            new System.Security.Claims.Claim("purpose", "email-confirmation"),
            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Email, email),
            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Name, username),
            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Role, role)
        };

        return _jwtService.GenerateAccessToken(userId, email, username, role);
    }

    /// <summary>
    /// Verify email confirmation token
    /// </summary>
    public Guid? VerifyConfirmationToken(string token)
    {
        var principal = _jwtService.ValidateToken(token);
        return principal != null ? _jwtService.GetUserIdFromClaims(principal) : null;
    }

    /// <summary>
    /// Send confirmation email (placeholder - logs to console)
    /// </summary>
    public Task SendConfirmationEmailAsync(string email, string token)
    {
        _logger.LogInformation("============================================");
        _logger.LogInformation("📧 EMAIL CONFIRMATION (Development Mode)");
        _logger.LogInformation("============================================");
        _logger.LogInformation("To: {Email}", email);
        _logger.LogInformation("Confirmation Link: http://localhost:3001/confirm-email?token={Token}", token);
        _logger.LogInformation("============================================");
        _logger.LogInformation("⚠️  In production, integrate with SendGrid, AWS SES, or similar service");
        _logger.LogInformation("");

        return Task.CompletedTask;
    }

    /// <summary>
    /// Send password reset email (placeholder - logs to console)
    /// </summary>
    public Task SendPasswordResetEmailAsync(string email, string token)
    {
        _logger.LogInformation("============================================");
        _logger.LogInformation("🔐 PASSWORD RESET (Development Mode)");
        _logger.LogInformation("============================================");
        _logger.LogInformation("To: {Email}", email);
        _logger.LogInformation("Reset Link: http://localhost:3001/reset-password?token={Token}", token);
        _logger.LogInformation("============================================");
        _logger.LogInformation("");

        return Task.CompletedTask;
    }

    /// <summary>
    /// Send welcome email (placeholder - logs to console)
    /// </summary>
    public Task SendWelcomeEmailAsync(string email, string username)
    {
        _logger.LogInformation("============================================");
        _logger.LogInformation("👋 WELCOME EMAIL (Development Mode)");
        _logger.LogInformation("============================================");
        _logger.LogInformation("To: {Email}", email);
        _logger.LogInformation("Username: {Username}", username);
        _logger.LogInformation("Welcome to DuoStackDemo!");
        _logger.LogInformation("============================================");
        _logger.LogInformation("");

        return Task.CompletedTask;
    }
}
