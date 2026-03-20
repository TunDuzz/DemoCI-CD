namespace Cinestream.Application.Interfaces.Services;

public interface ICloudinaryService
{
    Task<string?> UploadImageAsync(Stream fileStream, string fileName);
    Task<bool> DeleteImageAsync(string publicId);
}
