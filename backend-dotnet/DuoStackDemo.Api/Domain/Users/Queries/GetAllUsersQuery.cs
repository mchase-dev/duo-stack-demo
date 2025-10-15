using MediatR;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Domain.Users.Queries;

/// <summary>
/// Query to get all users with pagination (Admin+ only)
/// </summary>
public class GetAllUsersQuery : IRequest<UsersListResponse>
{
    /// <summary>
    /// Page number (default: 1)
    /// </summary>
    public int Page { get; set; } = 1;

    /// <summary>
    /// Items per page (default: 20)
    /// </summary>
    public int PageSize { get; set; } = 20;

    /// <summary>
    /// Search query for username or email
    /// </summary>
    public string? Search { get; set; }
}
