using MediatR;
using DuoStackDemo.DTOs.Requests;

namespace DuoStackDemo.Domain.Profile.Commands;

/// <summary>
/// Command to change current user's password
/// </summary>
public class ChangePasswordCommand : IRequest<Unit>
{
    /// <summary>
    /// Current user ID
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Password change request data
    /// </summary>
    public ChangePasswordRequest Request { get; set; } = null!;
}
