using Cinestream.Application.DTOs.Comment;
using FluentValidation;

namespace Cinestream.Application.Validators.Comment;

public class UpdateCommentRequestValidator : AbstractValidator<UpdateCommentRequest>
{
    public UpdateCommentRequestValidator()
    {
        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Comment content is required.")
            .MaximumLength(1000).WithMessage("Comment content must not exceed 1000 characters.");
    }
}
