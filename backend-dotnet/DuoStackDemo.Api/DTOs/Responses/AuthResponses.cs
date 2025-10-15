using System.ComponentModel.DataAnnotations;
using DuoStackDemo.Data.Entities;

namespace DuoStackDemo.DTOs.Responses;

/// <summary>
/// Response DTO containing user data and access token after registration
/// </summary>
public class AuthResponse
{
    /// <summary>
    /// User data without sensitive information
    /// </summary>
    [Required]
    public UserDto User { get; set; } = null!;

    /// <summary>
    /// JWT access token
    /// </summary>
    [Required]
    public string AccessToken { get; set; } = string.Empty;
}

/// <summary>
/// Response DTO containing access token after login
/// </summary>
public class TokenResponse
{
    /// <summary>
    /// User data without sensitive information
    /// </summary>
    [Required]
    public UserDto User { get; set; } = null!;

    /// <summary>
    /// JWT access token
    /// </summary>
    [Required]
    public string AccessToken { get; set; } = string.Empty;
}

/// <summary>
/// DTO representing user data without sensitive information
/// </summary>
public class UserDto
{
    /// <summary>
    /// Unique identifier for the user
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// User's email address
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Indicates whether the user's email has been confirmed
    /// </summary>
    public bool EmailConfirmed { get; set; }

    /// <summary>
    /// User's unique username
    /// </summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// User's first name
    /// </summary>
    public string? FirstName { get; set; }

    /// <summary>
    /// User's last name
    /// </summary>
    public string? LastName { get; set; }

    /// <summary>
    /// User's phone number
    /// </summary>
    public string? PhoneNumber { get; set; }

    /// <summary>
    /// URL to user's avatar image
    /// </summary>
    public string? AvatarUrl { get; set; }

    /// <summary>
    /// User's biography text
    /// </summary>
    public string? Bio { get; set; }

    /// <summary>
    /// User's role in the system
    /// </summary>
    public UserRole Role { get; set; }

    /// <summary>
    /// Timestamp when the user was created
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Timestamp when the user was last updated
    /// </summary>
    public DateTime UpdatedAt { get; set; }

    /// <summary>
    /// Maps a User entity to a UserDto
    /// </summary>
    public static UserDto FromUser(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            EmailConfirmed = user.EmailConfirmed,
            Username = user.Username,
            FirstName = user.FirstName,
            LastName = user.LastName,
            PhoneNumber = user.PhoneNumber,
            AvatarUrl = user.AvatarUrl,
            Bio = user.Bio,
            Role = user.Role,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }
}
