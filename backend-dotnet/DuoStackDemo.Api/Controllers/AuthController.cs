using Microsoft.AspNetCore.Mvc;
using MediatR;
using DuoStackDemo.DTOs.Requests;
using DuoStackDemo.DTOs.Responses;
using DuoStackDemo.Domain.Auth.Commands;

namespace DuoStackDemo.Controllers;

/// <summary>
/// Controller for authentication operations
/// </summary>
[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IConfiguration _configuration;

    /// <summary>
    /// Initializes a new instance of the AuthController
    /// </summary>
    public AuthController(
        IMediator mediator,
        IConfiguration configuration)
    {
        _mediator = mediator;
        _configuration = configuration;
    }

    /// <summary>
    /// Register a new user
    /// </summary>
    /// <param name="request">Registration request</param>
    /// <returns>User data and access token</returns>
    [HttpPost("register")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status409Conflict)]
    public async Task<ActionResult> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiErrorResponse.CreateError("Invalid input"));
        }

        try
        {
            var command = new RegisterCommand { Request = request };
            var result = await _mediator.Send(command);

            // Set httpOnly cookie for refresh token
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = _configuration.GetValue<string>("ASPNETCORE_ENVIRONMENT") == "Production",
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddDays(7)
            };
            Response.Cookies.Append("refreshToken", result.RefreshToken, cookieOptions);

            return StatusCode(201, ApiResponse<AuthResponse>.Ok(result.AuthResponse));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ApiErrorResponse.CreateError(ex.Message));
        }
        catch (Exception)
        {
            return StatusCode(500, ApiErrorResponse.CreateError("An error occurred during registration"));
        }
    }

    /// <summary>
    /// Login user
    /// </summary>
    /// <param name="request">Login request</param>
    /// <returns>Access token</returns>
    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<TokenResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiErrorResponse.CreateError("Invalid input"));
        }

        try
        {
            var command = new LoginCommand { Request = request };
            var result = await _mediator.Send(command);

            // Set httpOnly cookie for refresh token
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = _configuration.GetValue<string>("ASPNETCORE_ENVIRONMENT") == "Production",
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddDays(7)
            };
            Response.Cookies.Append("refreshToken", result.RefreshToken, cookieOptions);

            return Ok(ApiResponse<TokenResponse>.Ok(result.TokenResponse));
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(ApiErrorResponse.CreateError("Invalid credentials"));
        }
        catch (Exception)
        {
            return StatusCode(500, ApiErrorResponse.CreateError("An error occurred during login"));
        }
    }

    /// <summary>
    /// Refresh access token using refresh token from cookie
    /// </summary>
    /// <returns>New access token</returns>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(ApiResponse<TokenResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult> Refresh()
    {
        try
        {
            var refreshToken = Request.Cookies["refreshToken"];

            if (string.IsNullOrEmpty(refreshToken))
            {
                return Unauthorized(ApiErrorResponse.CreateError("Refresh token not found"));
            }

            var command = new RefreshTokenCommand { RefreshToken = refreshToken };
            var result = await _mediator.Send(command);
            return Ok(ApiResponse<TokenResponse>.Ok(result));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ApiErrorResponse.CreateError(ex.Message));
        }
        catch (Exception)
        {
            return Unauthorized(ApiErrorResponse.CreateError("Invalid or expired refresh token"));
        }
    }

    /// <summary>
    /// Logout user by revoking refresh token
    /// </summary>
    /// <returns>Success message</returns>
    [HttpPost("logout")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<ActionResult> Logout()
    {
        try
        {
            var refreshToken = Request.Cookies["refreshToken"];

            if (!string.IsNullOrEmpty(refreshToken))
            {
                var command = new LogoutCommand { RefreshToken = refreshToken };
                await _mediator.Send(command);
            }

            // Clear the refresh token cookie
            Response.Cookies.Delete("refreshToken");

            return Ok(ApiResponse<object>.Ok(new { message = "Logout successful" }));
        }
        catch (Exception)
        {
            // Even if logout fails, clear the cookie
            Response.Cookies.Delete("refreshToken");
            return Ok(ApiResponse<object>.Ok(new { message = "Logout successful" }));
        }
    }

    /// <summary>
    /// Confirm user email address
    /// </summary>
    /// <param name="token">Email confirmation token</param>
    /// <returns>Success message</returns>
    [HttpGet("confirm-email")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> ConfirmEmail([FromQuery] string token)
    {
        if (string.IsNullOrEmpty(token))
        {
            return BadRequest(ApiErrorResponse.CreateError("Email confirmation token is required"));
        }

        try
        {
            var command = new ConfirmEmailCommand { Token = token };
            var result = await _mediator.Send(command);
            return Ok(ApiResponse<object>.Ok(new { message = result.Message }));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiErrorResponse.CreateError(ex.Message));
        }
        catch (Exception)
        {
            return BadRequest(ApiErrorResponse.CreateError("Email confirmation failed"));
        }
    }
}
