using MediatR;
using Microsoft.AspNetCore.Http;

namespace DuoStackDemo.Domain.Profile.Commands;

/// <summary>
/// Command to upload avatar for current user
/// </summary>
public class UploadAvatarCommand : IRequest<UploadAvatarResult>
{
    /// <summary>
    /// Current user ID
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Avatar image file
    /// </summary>
    public IFormFile Avatar { get; set; } = null!;

    /// <summary>
    /// Upload directory path
    /// </summary>
    public string UploadDirectory { get; set; } = "uploads";
}

/// <summary>
/// Result of avatar upload
/// </summary>
public class UploadAvatarResult
{
    /// <summary>
    /// URL of the uploaded avatar
    /// </summary>
    public string AvatarUrl { get; set; } = string.Empty;
}
