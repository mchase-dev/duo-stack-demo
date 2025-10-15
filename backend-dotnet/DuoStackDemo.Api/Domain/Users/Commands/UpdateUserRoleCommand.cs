using MediatR;
using DuoStackDemo.DTOs.Requests;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Domain.Users.Commands;

/// <summary>
/// Command to update user role (Superuser only)
/// </summary>
public class UpdateUserRoleCommand : IRequest<UserDto>
{
    /// <summary>
    /// User ID to update
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Role update request
    /// </summary>
    public UpdateUserRoleRequest Request { get; set; } = null!;
}
