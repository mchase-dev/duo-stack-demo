using MediatR;
using MapsterMapper;
using DuoStackDemo.Data;
using DuoStackDemo.Data.Entities;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Domain.Users.Queries;

/// <summary>
/// Handler for GetUserByIdQuery - retrieves user by ID with permission check
/// </summary>
public class GetUserByIdQueryHandler : IRequestHandler<GetUserByIdQuery, UserDto>
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public GetUserByIdQueryHandler(
        AppDbContext context,
        IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<UserDto> Handle(GetUserByIdQuery query, CancellationToken cancellationToken)
    {
        // Find user by ID
        var user = await _context.Users.FindAsync(query.UserId, cancellationToken);

        if (user == null)
        {
            throw new KeyNotFoundException("User not found");
        }

        // Check permissions: user can view self, or user is Admin/Superuser
        var isSelf = query.CurrentUserId == query.UserId;
        var isAdmin = query.CurrentUserRole == UserRole.Admin || query.CurrentUserRole == UserRole.Superuser;

        if (!isSelf && !isAdmin)
        {
            throw new UnauthorizedAccessException("Insufficient permissions to view this user");
        }

        return _mapper.Map<UserDto>(user);
    }
}
