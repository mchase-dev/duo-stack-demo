namespace DuoStackDemo.Data.Entities;

/// <summary>
/// Defines the role of a user in the system
/// </summary>
public enum UserRole
{
    /// <summary>
    /// Standard user with basic permissions
    /// </summary>
    User,

    /// <summary>
    /// Administrator with elevated permissions
    /// </summary>
    Admin,

    /// <summary>
    /// Super user with full system access
    /// </summary>
    Superuser
}
