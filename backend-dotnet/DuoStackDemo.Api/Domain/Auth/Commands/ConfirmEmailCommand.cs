using MediatR;

namespace DuoStackDemo.Domain.Auth.Commands;

/// <summary>
/// Command to confirm a user's email address
/// </summary>
public class ConfirmEmailCommand : IRequest<ConfirmEmailResult>
{
    /// <summary>
    /// Email confirmation token (userId as GUID string)
    /// </summary>
    public string Token { get; set; } = string.Empty;
}

/// <summary>
/// Result of the confirm email command
/// </summary>
public class ConfirmEmailResult
{
    /// <summary>
    /// Message indicating the result
    /// </summary>
    public string Message { get; set; } = string.Empty;
}
