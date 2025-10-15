using MediatR;
using Microsoft.EntityFrameworkCore;
using MapsterMapper;
using DuoStackDemo.Data;
using DuoStackDemo.Data.Entities;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Domain.Users.Commands;

/// <summary>
/// Handler for UpdateUserCommand - updates user profile with permission check
/// </summary>
public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, UserDto>
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public UpdateUserCommandHandler(
        AppDbContext context,
        IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<UserDto> Handle(UpdateUserCommand command, CancellationToken cancellationToken)
    {
        // Find user by ID
        var user = await _context.Users.FindAsync(command.UserId, cancellationToken);

        if (user == null)
        {
            throw new KeyNotFoundException("User not found");
        }

        // Check permissions: user can update self, or user is Admin/Superuser
        var isSelf = command.CurrentUserId == command.UserId;
        var isAdmin = command.CurrentUserRole == UserRole.Admin || command.CurrentUserRole == UserRole.Superuser;

        if (!isSelf && !isAdmin)
        {
            throw new UnauthorizedAccessException("Insufficient permissions to update this user");
        }

        var request = command.Request;

        // Update user with allowed fields
        if (request.Username != null) user.Username = request.Username;
        if (request.FirstName != null) user.FirstName = request.FirstName;
        if (request.LastName != null) user.LastName = request.LastName;
        if (request.PhoneNumber != null) user.PhoneNumber = request.PhoneNumber;
        if (request.Bio != null) user.Bio = request.Bio;

        user.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex)
        {
            if (ex.InnerException?.Message.Contains("Username") == true)
            {
                throw new InvalidOperationException("Username already taken");
            }
            throw;
        }

        // Return updated user
        var updatedUser = await _context.Users.FindAsync(command.UserId, cancellationToken);
        return _mapper.Map<UserDto>(updatedUser!);
    }
}
