using MediatR;
using DuoStackDemo.Data.Entities;
using DuoStackDemo.DTOs.Requests;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Domain.Users.Commands;

/// <summary>
/// Command to update user profile (self or Admin+)
/// </summary>
public class UpdateUserCommand : IRequest<UserDto>
{
    /// <summary>
    /// User ID to update
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Update request data
    /// </summary>
    public UpdateProfileRequest Request { get; set; } = null!;

    /// <summary>
    /// Current user ID for permission check
    /// </summary>
    public Guid CurrentUserId { get; set; }

    /// <summary>
    /// Current user role for permission check
    /// </summary>
    public UserRole CurrentUserRole { get; set; }
}
