using MediatR;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Domain.Auth.Commands;

/// <summary>
/// Command to refresh an access token using a valid refresh token
/// </summary>
public class RefreshTokenCommand : IRequest<TokenResponse>
{
    /// <summary>
    /// The refresh token to validate and use
    /// </summary>
    public string RefreshToken { get; set; } = string.Empty;
}
