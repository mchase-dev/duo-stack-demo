using MediatR;
using Microsoft.EntityFrameworkCore;
using MapsterMapper;
using DuoStackDemo.Data;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Domain.Profile.Commands;

/// <summary>
/// Handler for UpdateMyProfileCommand - updates current user's profile
/// </summary>
public class UpdateMyProfileCommandHandler : IRequestHandler<UpdateMyProfileCommand, UserDto>
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public UpdateMyProfileCommandHandler(
        AppDbContext context,
        IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<UserDto> Handle(UpdateMyProfileCommand command, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FindAsync(command.UserId, cancellationToken);

        if (user == null)
        {
            throw new KeyNotFoundException("User not found");
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

        var updatedUser = await _context.Users.FindAsync(command.UserId, cancellationToken);
        return _mapper.Map<UserDto>(updatedUser!);
    }
}
