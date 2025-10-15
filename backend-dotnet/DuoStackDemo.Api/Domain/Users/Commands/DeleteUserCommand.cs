using MediatR;

namespace DuoStackDemo.Domain.Users.Commands;

/// <summary>
/// Command to soft delete a user (Admin+ only)
/// </summary>
public class DeleteUserCommand : IRequest
{
    /// <summary>
    /// User ID to delete
    /// </summary>
    public Guid UserId { get; set; }
}
