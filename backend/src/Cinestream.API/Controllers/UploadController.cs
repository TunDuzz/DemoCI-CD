using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Cinestream.Application.Interfaces.Services;

namespace Cinestream.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class UploadController : ControllerBase
{
    private readonly ICloudinaryService _cloudinaryService;

    public UploadController(ICloudinaryService cloudinaryService)
    {
        _cloudinaryService = cloudinaryService;
    }

    [HttpPost("image")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0) return BadRequest("File is empty.");

        using var stream = file.OpenReadStream();
        var result = await _cloudinaryService.UploadImageAsync(stream, file.FileName);

        if (result == null)
        {
            return BadRequest(new { Message = "Image upload failed." });
        }

        return Ok(new { Url = result });
    }
}
