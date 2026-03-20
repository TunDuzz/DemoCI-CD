using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Cinestream.Application.Interfaces.Services;

namespace Cinestream.Infrastructure.ExternalServices;

public class CloudinaryService : ICloudinaryService
{
    private readonly Cloudinary _cloudinary;
    private readonly ILogger<CloudinaryService> _logger;

    public CloudinaryService(IConfiguration config, ILogger<CloudinaryService> logger)
    {
        _logger = logger;
        
        var account = new Account(
            config["Cloudinary:CloudName"],
            config["Cloudinary:ApiKey"],
            config["Cloudinary:ApiSecret"]
        );

        _cloudinary = new Cloudinary(account);
        _cloudinary.Api.Secure = true;
    }

    public async Task<string?> UploadImageAsync(Stream fileStream, string fileName)
    {
        if (fileStream.Length == 0) return null;

        try
        {
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(fileName, fileStream),
                Transformation = new Transformation().Height(500).Width(500).Crop("fill").Gravity("face"),
                Folder = "cinestream_avatars"
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult.Error != null)
            {
                _logger.LogError(uploadResult.Error.Message);
                return null;
            }

            return uploadResult.SecureUrl.ToString();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading image to Cloudinary.");
            return null;
        }
    }

    public async Task<bool> DeleteImageAsync(string publicId)
    {
        try
        {
            var deleteParams = new DeletionParams(publicId);
            var result = await _cloudinary.DestroyAsync(deleteParams);
            return result.Result == "ok";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error deleting image {publicId} from Cloudinary.");
            return false;
        }
    }
}
