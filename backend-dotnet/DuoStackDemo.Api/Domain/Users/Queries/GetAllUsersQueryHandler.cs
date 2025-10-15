using MediatR;
using Microsoft.EntityFrameworkCore;
using MapsterMapper;
using DuoStackDemo.Data;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Domain.Users.Queries;

/// <summary>
/// Handler for GetAllUsersQuery - retrieves paginated list of users with search
/// </summary>
public class GetAllUsersQueryHandler : IRequestHandler<GetAllUsersQuery, UsersListResponse>
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public GetAllUsersQueryHandler(
        AppDbContext context,
        IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<UsersListResponse> Handle(GetAllUsersQuery query, CancellationToken cancellationToken)
    {
        var skip = (query.Page - 1) * query.PageSize;

        // Build query (exclude deleted users)
        var dbQuery = _context.Users.Where(u => u.DeletedAt == null);

        // Apply search filter
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var searchLower = query.Search.ToLower();
            dbQuery = dbQuery.Where(u =>
                u.Username.ToLower().Contains(searchLower) ||
                u.Email.ToLower().Contains(searchLower) ||
                (u.FirstName != null && u.FirstName.ToLower().Contains(searchLower)) ||
                (u.LastName != null && u.LastName.ToLower().Contains(searchLower))
            );
        }

        // Get total count
        var total = await dbQuery.CountAsync(cancellationToken);

        // Get users with pagination
        var users = await dbQuery
            .OrderByDescending(u => u.CreatedAt)
            .Skip(skip)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        var userDtos = users.Select(u => _mapper.Map<UserDto>(u)).ToList();

        var response = new UsersListResponse
        {
            Items = userDtos,
            Total = total,
            Page = query.Page,
            PageSize = query.PageSize
        };

        return response;
    }
}
