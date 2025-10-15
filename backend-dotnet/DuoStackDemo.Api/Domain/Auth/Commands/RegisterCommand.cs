using MediatR;
using DuoStackDemo.DTOs.Requests;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Domain.Auth.Commands;

/// <summary>
/// Command to register a new user account
/// </summary>
public class RegisterCommand : IRequest<RegisterCommandResult>
{
    /// <summary>
    /// Registration request data
    /// </summary>
    public RegisterRequest Request { get; set; } = null!;
}

/// <summary>
/// Result of the register command including tokens
/// </summary>
public class RegisterCommandResult
{
    /// <summary>
    /// User data and access token
    /// </summary>
    public AuthResponse AuthResponse { get; set; } = null!;

    /// <summary>
    /// Refresh token to be set as HttpOnly cookie
    /// </summary>
    public string RefreshToken { get; set; } = string.Empty;
}
