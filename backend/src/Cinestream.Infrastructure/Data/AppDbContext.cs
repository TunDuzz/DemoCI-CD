using Microsoft.EntityFrameworkCore;
using Cinestream.Domain.Entities;

namespace Cinestream.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }

    public DbSet<WatchHistory> WatchHistories { get; set; }
    public DbSet<Favorite> Favorites { get; set; }
    public DbSet<AppSetting> AppSettings { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<CommentReaction> CommentReactions { get; set; }
    public DbSet<MovieRating> MovieRatings { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<User>()
            .Property(u => u.CreatedIpAddress)
            .HasMaxLength(45);

        builder.Entity<WatchHistory>()
            .HasOne(w => w.User)
            .WithMany(u => u.WatchHistories)
            .HasForeignKey(w => w.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Favorite>()
            .HasOne(f => f.User)
            .WithMany(u => u.Favorites)
            .HasForeignKey(f => f.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Favorite>()
            .HasIndex(f => new { f.UserId, f.MovieId }).IsUnique();

        builder.Entity<WatchHistory>()
            .HasIndex(w => new { w.UserId, w.MovieSlug, w.Episode }).IsUnique();

        builder.Entity<Comment>()
            .HasOne(c => c.User)
            .WithMany(u => u.Comments)
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Comment>()
            .HasOne(c => c.Parent)
            .WithMany(c => c.Replies)
            .HasForeignKey(c => c.ParentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Comment>().HasIndex(c => c.MovieId);
        builder.Entity<Comment>().HasIndex(c => c.ParentId);
        builder.Entity<Comment>().HasIndex(c => new { c.MovieId, c.CreatedAt }).IsDescending();
        builder.Entity<Comment>().HasIndex(c => new { c.MovieId, c.LikeCount }).IsDescending();

        builder.Entity<CommentReaction>()
            .HasOne(r => r.User)
            .WithMany(u => u.CommentReactions)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<CommentReaction>()
            .HasOne(r => r.Comment)
            .WithMany(c => c.Reactions)
            .HasForeignKey(r => r.CommentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<CommentReaction>()
            .HasIndex(r => new { r.CommentId, r.UserId }).IsUnique();

        builder.Entity<MovieRating>()
            .HasOne(r => r.User)
            .WithMany(u => u.MovieRatings)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<MovieRating>()
            .HasIndex(r => new { r.MovieId, r.UserId }).IsUnique();
    }
}
