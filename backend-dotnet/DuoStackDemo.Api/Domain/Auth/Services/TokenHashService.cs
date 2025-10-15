using System.Security.Cryptography;
using System.Text;

namespace DuoStackDemo.Domain.Auth.Services;

/// <summary>
/// Service for hashing tokens using SHA256
/// </summary>
public class TokenHashService
{
    /// <summary>
    /// Hashes a token using SHA256
    /// </summary>
    /// <param name="token">The token to hash</param>
    /// <returns>Hashed token as base64 string</returns>
    public string HashToken(string token)
    {
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(token);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }
}
