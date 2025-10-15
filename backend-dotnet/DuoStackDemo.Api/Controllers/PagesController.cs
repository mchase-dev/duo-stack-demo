using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using DuoStackDemo.Data.Entities;
using DuoStackDemo.DTOs.Requests;
using DuoStackDemo.DTOs.Responses;
using DuoStackDemo.Domain.Pages.Queries;
using DuoStackDemo.Domain.Pages.Commands;
using System.Security.Claims;

namespace DuoStackDemo.Controllers;

/// <summary>
/// Controller for CMS page operations
/// </summary>
[ApiController]
[Route("api/v1/pages")]
public class PagesController : ControllerBase
{
    private readonly IMediator _mediator;

    public PagesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    private Guid? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst("userId")?.Value;
        return userIdClaim != null ? Guid.Parse(userIdClaim) : null;
    }

    private UserRole? GetCurrentUserRole()
    {
        var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
        if (roleClaim == null) return null;

        // Case-insensitive enum parsing
        return Enum.TryParse<UserRole>(roleClaim, ignoreCase: true, out var role) ? role : null;
    }

    /// <summary>
    /// Get all pages (public: published only, Superuser: all)
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetAllPages()
    {
        try
        {
            var isSuperuser = GetCurrentUserRole() == UserRole.Superuser;
            var query = new GetAllPagesQuery { IncludeUnpublished = isSuperuser };
            var pages = await _mediator.Send(query);
            return Ok(ApiResponse<List<PageDto>>.Ok(pages));
        }
        catch (Exception)
        {
            return StatusCode(500, ApiErrorResponse.CreateError("An error occurred while retrieving pages"));
        }
    }

    /// <summary>
    /// Get page by slug
    /// </summary>
    [HttpGet("{slug}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<PageDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> GetPageBySlug(string slug)
    {
        try
        {
            var isSuperuser = GetCurrentUserRole() == UserRole.Superuser;
            var query = new GetPageBySlugQuery
            {
                Slug = slug,
                IncludeUnpublished = isSuperuser
            };

            var pageDto = await _mediator.Send(query);
            return Ok(ApiResponse<PageDto>.Ok(pageDto));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(ApiErrorResponse.CreateError("Page not found"));
        }
        catch (UnauthorizedAccessException)
        {
            return NotFound(ApiErrorResponse.CreateError("Page not found"));
        }
        catch (Exception)
        {
            return StatusCode(500, ApiErrorResponse.CreateError("An error occurred while retrieving page"));
        }
    }

    /// <summary>
    /// Create new page (Superuser only)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Superuser")]
    [ProducesResponseType(typeof(ApiResponse<PageDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult> CreatePage([FromBody] CreatePageRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiErrorResponse.CreateError("Invalid input"));
        }

        try
        {
            var command = new CreatePageCommand
            {
                Request = request,
                CreatedBy = GetCurrentUserId()!.Value
            };

            var pageDto = await _mediator.Send(command);
            return StatusCode(201, ApiResponse<PageDto>.Ok(pageDto));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ApiErrorResponse.CreateError(ex.Message));
        }
        catch (Exception)
        {
            return StatusCode(500, ApiErrorResponse.CreateError("An error occurred while creating page"));
        }
    }

    /// <summary>
    /// Update page (Superuser only)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Superuser")]
    [ProducesResponseType(typeof(ApiResponse<PageDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> UpdatePage(Guid id, [FromBody] UpdatePageRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiErrorResponse.CreateError("Invalid input"));
        }

        try
        {
            var command = new UpdatePageCommand
            {
                PageId = id,
                Request = request
            };

            var pageDto = await _mediator.Send(command);
            return Ok(ApiResponse<PageDto>.Ok(pageDto));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(ApiErrorResponse.CreateError("Page not found"));
        }
        catch (Exception)
        {
            return StatusCode(500, ApiErrorResponse.CreateError("An error occurred while updating page"));
        }
    }

    /// <summary>
    /// Soft delete page (Superuser only)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Superuser")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeletePage(Guid id)
    {
        try
        {
            var command = new DeletePageCommand { PageId = id };
            await _mediator.Send(command);
            return Ok(ApiResponse<object>.Ok(new { message = "Page deleted successfully" }));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(ApiErrorResponse.CreateError("Page not found"));
        }
        catch (Exception)
        {
            return StatusCode(500, ApiErrorResponse.CreateError("An error occurred while deleting page"));
        }
    }
}
