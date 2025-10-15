using BCrypt.Net;

namespace DuoStackDemo.Services;

/// <summary>
/// Service for password hashing and validation
/// </summary>
public class PasswordService
{
    private const int WorkFactor = 10;

    /// <summary>
    /// Hash a password using BCrypt
    /// </summary>
    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password, WorkFactor);
    }

    /// <summary>
    /// Verify a password against a hash
    /// </summary>
    public bool VerifyPassword(string password, string hashedPassword)
    {
        return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
    }

    /// <summary>
    /// Validate password strength
    /// </summary>
    public (bool IsValid, List<string> Errors) ValidatePasswordStrength(string password)
    {
        var errors = new List<string>();

        if (password.Length < 8)
        {
            errors.Add("Password must be at least 8 characters long");
        }

        if (!password.Any(char.IsUpper))
        {
            errors.Add("Password must contain at least one uppercase letter");
        }

        if (!password.Any(char.IsLower))
        {
            errors.Add("Password must contain at least one lowercase letter");
        }

        if (!password.Any(char.IsDigit))
        {
            errors.Add("Password must contain at least one number");
        }

        return (errors.Count == 0, errors);
    }
}
