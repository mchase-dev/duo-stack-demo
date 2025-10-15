namespace DuoStackDemo.Data.Entities;

/// <summary>
/// Defines the visibility level of an event
/// </summary>
public enum EventVisibility
{
    /// <summary>
    /// Event is private and only visible to the creator
    /// </summary>
    Private,

    /// <summary>
    /// Event is public and visible to all users
    /// </summary>
    Public,

    /// <summary>
    /// Event is restricted to specific users
    /// </summary>
    Restricted
}
