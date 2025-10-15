using MediatR;
using DuoStackDemo.DTOs.Requests;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Domain.Auth.Commands;

/// <summary>
/// Command to authenticate a user and generate tokens
/// </summary>
public class LoginCommand : IRequest<LoginCommandResult>
{
    /// <summary>
    /// Login request data
    /// </summary>
    public LoginRequest Request { get; set; } = null!;
}

/// <summary>
/// Result of the login command including tokens
/// </summary>
public class LoginCommandResult
{
    /// <summary>
    /// User data and access token
    /// </summary>
    public TokenResponse TokenResponse { get; set; } = null!;

    /// <summary>
    /// Refresh token to be set as HttpOnly cookie
    /// </summary>
    public string RefreshToken { get; set; } = string.Empty;
}
