using System.ComponentModel.DataAnnotations;

namespace DuoStackDemo.DTOs.Responses;

/// <summary>
/// DTO representing a direct message
/// </summary>
public class MessageDto
{
    /// <summary>
    /// Unique identifier for the message
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// ID of the user who sent the message
    /// </summary>
    public Guid FromUserId { get; set; }

    /// <summary>
    /// ID of the user who receives the message
    /// </summary>
    public Guid ToUserId { get; set; }

    /// <summary>
    /// Content of the message
    /// </summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// Indicates whether the message has been read
    /// </summary>
    public bool IsRead { get; set; }

    /// <summary>
    /// Timestamp when the message was created
    /// </summary>
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO representing a conversation with another user
/// </summary>
public class ConversationDto
{
    /// <summary>
    /// ID of the other user in the conversation
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// User data for the other user
    /// </summary>
    [Required]
    public UserDto User { get; set; } = null!;

    /// <summary>
    /// Last message in the conversation
    /// </summary>
    public MessageDto? LastMessage { get; set; }

    /// <summary>
    /// Number of unread messages in this conversation
    /// </summary>
    public int UnreadCount { get; set; }
}
