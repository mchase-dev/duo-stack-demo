using MediatR;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Domain.Profile.Queries;

/// <summary>
/// Query to get current user's profile
/// </summary>
public class GetMyProfileQuery : IRequest<UserDto>
{
    /// <summary>
    /// Current user ID
    /// </summary>
    public Guid UserId { get; set; }
}
