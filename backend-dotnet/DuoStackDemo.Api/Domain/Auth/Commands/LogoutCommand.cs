using MediatR;

namespace DuoStackDemo.Domain.Auth.Commands;

/// <summary>
/// Command to log out a user by revoking their refresh token
/// </summary>
public class LogoutCommand : IRequest
{
    /// <summary>
    /// The refresh token to revoke
    /// </summary>
    public string RefreshToken { get; set; } = string.Empty;
}
