namespace DuoStackDemo.DTOs.Responses;

/// <summary>
/// Standard API response wrapper for successful responses
/// </summary>
/// <typeparam name="T">Type of the data being returned</typeparam>
public class ApiResponse<T>
{
    /// <summary>
    /// Indicates whether the request was successful
    /// </summary>
    public bool Success { get; set; } = true;

    /// <summary>
    /// The response data
    /// </summary>
    public T? Data { get; set; }

    /// <summary>
    /// Creates a successful response with data
    /// </summary>
    public static ApiResponse<T> Ok(T data)
    {
        return new ApiResponse<T>
        {
            Success = true,
            Data = data
        };
    }
}

/// <summary>
/// Standard API response wrapper for error responses
/// </summary>
public class ApiErrorResponse
{
    /// <summary>
    /// Indicates whether the request was successful (always false for errors)
    /// </summary>
    public bool Success { get; set; } = false;

    /// <summary>
    /// Error message
    /// </summary>
    public string Error { get; set; } = string.Empty;

    /// <summary>
    /// Creates an error response
    /// </summary>
    public static ApiErrorResponse CreateError(string message)
    {
        return new ApiErrorResponse
        {
            Success = false,
            Error = message
        };
    }
}
