using System.ComponentModel.DataAnnotations;

namespace DuoStackDemo.DTOs.Requests;

/// <summary>
/// Request DTO for sending a direct message
/// </summary>
public class SendMessageRequest
{
    /// <summary>
    /// ID of the user to send the message to
    /// </summary>
    [Required(ErrorMessage = "ToUserId is required")]
    public Guid ToUserId { get; set; }

    /// <summary>
    /// Content of the message
    /// </summary>
    [Required(ErrorMessage = "Content is required")]
    [MinLength(1, ErrorMessage = "Message content cannot be empty")]
    public string Content { get; set; } = string.Empty;
}
