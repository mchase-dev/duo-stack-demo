using MediatR;
using MapsterMapper;
using DuoStackDemo.Data;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Domain.Profile.Queries;

/// <summary>
/// Handler for GetMyProfileQuery - retrieves current user's profile
/// </summary>
public class GetMyProfileQueryHandler : IRequestHandler<GetMyProfileQuery, UserDto>
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public GetMyProfileQueryHandler(
        AppDbContext context,
        IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<UserDto> Handle(GetMyProfileQuery query, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FindAsync(query.UserId, cancellationToken);

        if (user == null)
        {
            throw new KeyNotFoundException("User not found");
        }

        return _mapper.Map<UserDto>(user);
    }
}
