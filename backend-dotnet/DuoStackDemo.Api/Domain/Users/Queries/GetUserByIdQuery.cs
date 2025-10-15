using MediatR;
using DuoStackDemo.Data.Entities;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Domain.Users.Queries;

/// <summary>
/// Query to get user by ID (self or Admin+)
/// </summary>
public class GetUserByIdQuery : IRequest<UserDto>
{
    /// <summary>
    /// User ID to retrieve
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Current user ID for permission check
    /// </summary>
    public Guid CurrentUserId { get; set; }

    /// <summary>
    /// Current user role for permission check
    /// </summary>
    public UserRole CurrentUserRole { get; set; }
}
