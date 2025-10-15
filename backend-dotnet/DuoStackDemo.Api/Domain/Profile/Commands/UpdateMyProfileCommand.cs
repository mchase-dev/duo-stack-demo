using MediatR;
using DuoStackDemo.DTOs.Requests;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Domain.Profile.Commands;

/// <summary>
/// Command to update current user's profile
/// </summary>
public class UpdateMyProfileCommand : IRequest<UserDto>
{
    /// <summary>
    /// Current user ID
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Update request data
    /// </summary>
    public UpdateProfileRequest Request { get; set; } = null!;
}
