using System;
using System.ComponentModel.DataAnnotations;

namespace Cinestream.Domain.Entities;

public class MovieRating
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string MovieId { get; set; } = string.Empty;
    
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    
    [Range(1, 10)]
    public int Score { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
