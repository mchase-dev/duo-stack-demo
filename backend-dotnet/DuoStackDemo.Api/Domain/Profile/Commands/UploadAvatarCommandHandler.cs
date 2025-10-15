using MediatR;
using DuoStackDemo.Data;

namespace DuoStackDemo.Domain.Profile.Commands;

/// <summary>
/// Handler for UploadAvatarCommand - handles avatar file upload and storage
/// </summary>
public class UploadAvatarCommandHandler : IRequestHandler<UploadAvatarCommand, UploadAvatarResult>
{
    private readonly AppDbContext _context;

    public UploadAvatarCommandHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<UploadAvatarResult> Handle(UploadAvatarCommand command, CancellationToken cancellationToken)
    {
        var avatar = command.Avatar;

        if (avatar == null || avatar.Length == 0)
        {
            throw new ArgumentException("No file uploaded");
        }

        // Validate file size (max 5MB)
        const long maxFileSize = 5 * 1024 * 1024;
        if (avatar.Length > maxFileSize)
        {
            throw new ArgumentException("File size exceeds 5MB limit");
        }

        // Validate file type (images only)
        var allowedContentTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp" };
        if (!allowedContentTypes.Contains(avatar.ContentType.ToLower()))
        {
            throw new ArgumentException("Only image files (JPEG, PNG, GIF, WebP) are allowed");
        }

        // Find user by ID
        var user = await _context.Users.FindAsync(command.UserId, cancellationToken);

        if (user == null)
        {
            throw new KeyNotFoundException("User not found");
        }

        // Get uploads path
        var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), command.UploadDirectory);

        // Create directory if it doesn't exist
        if (!Directory.Exists(uploadsPath))
        {
            Directory.CreateDirectory(uploadsPath);
        }

        // Generate unique filename
        var fileExtension = Path.GetExtension(avatar.FileName);
        var uniqueSuffix = $"{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}-{Guid.NewGuid():N}";
        var fileName = $"avatar-{command.UserId}-{uniqueSuffix}{fileExtension}";
        var filePath = Path.Combine(uploadsPath, fileName);

        // Delete old avatar file if it exists
        if (!string.IsNullOrEmpty(user.AvatarUrl))
        {
            var oldFileName = Path.GetFileName(user.AvatarUrl);
            var oldFilePath = Path.Combine(uploadsPath, oldFileName);
            if (File.Exists(oldFilePath))
            {
                try
                {
                    File.Delete(oldFilePath);
                }
                catch
                {
                    // Ignore errors when deleting old avatar
                }
            }
        }

        // Save the file
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await avatar.CopyToAsync(stream, cancellationToken);
        }

        // Construct avatar URL (relative path)
        var avatarUrl = $"/{command.UploadDirectory}/{fileName}";

        // Update user with new avatar URL
        user.AvatarUrl = avatarUrl;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        return new UploadAvatarResult
        {
            AvatarUrl = avatarUrl
        };
    }
}
