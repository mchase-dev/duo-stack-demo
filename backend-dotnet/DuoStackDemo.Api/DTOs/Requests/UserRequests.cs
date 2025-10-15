using System.ComponentModel.DataAnnotations;
using DuoStackDemo.Data.Entities;

namespace DuoStackDemo.DTOs.Requests;

/// <summary>
/// Request DTO for updating user profile
/// </summary>
public class UpdateProfileRequest
{
    /// <summary>
    /// User's unique username (optional)
    /// </summary>
    [MinLength(3, ErrorMessage = "Username must be at least 3 characters")]
    [MaxLength(100)]
    public string? Username { get; set; }

    /// <summary>
    /// User's first name (optional)
    /// </summary>
    [MaxLength(100)]
    public string? FirstName { get; set; }

    /// <summary>
    /// User's last name (optional)
    /// </summary>
    [MaxLength(100)]
    public string? LastName { get; set; }

    /// <summary>
    /// User's phone number (optional)
    /// </summary>
    [MaxLength(20)]
    public string? PhoneNumber { get; set; }

    /// <summary>
    /// User's biography text (optional)
    /// </summary>
    public string? Bio { get; set; }
}

/// <summary>
/// Request DTO for changing user password
/// </summary>
public class ChangePasswordRequest
{
    /// <summary>
    /// Current password for verification
    /// </summary>
    [Required(ErrorMessage = "Current password is required")]
    public string CurrentPassword { get; set; } = string.Empty;

    /// <summary>
    /// New password (must meet strength requirements)
    /// </summary>
    [Required(ErrorMessage = "New password is required")]
    [MinLength(8, ErrorMessage = "New password must be at least 8 characters")]
    public string NewPassword { get; set; } = string.Empty;
}

/// <summary>
/// Request DTO for updating user role (admin only)
/// </summary>
public class UpdateUserRoleRequest
{
    /// <summary>
    /// New role for the user
    /// </summary>
    [Required(ErrorMessage = "Role is required")]
    public UserRole Role { get; set; }
}
