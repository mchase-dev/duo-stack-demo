using MediatR;
using MapsterMapper;
using DuoStackDemo.Data;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Domain.Users.Commands;

/// <summary>
/// Handler for UpdateUserRoleCommand - updates user's role
/// </summary>
public class UpdateUserRoleCommandHandler : IRequestHandler<UpdateUserRoleCommand, UserDto>
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public UpdateUserRoleCommandHandler(
        AppDbContext context,
        IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<UserDto> Handle(UpdateUserRoleCommand command, CancellationToken cancellationToken)
    {
        // Find user by ID
        var user = await _context.Users.FindAsync(command.UserId, cancellationToken);

        if (user == null)
        {
            throw new KeyNotFoundException("User not found");
        }

        // Update user role
        user.Role = command.Request.Role;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        // Return updated user
        var updatedUser = await _context.Users.FindAsync(command.UserId, cancellationToken);
        return _mapper.Map<UserDto>(updatedUser!);
    }
}
