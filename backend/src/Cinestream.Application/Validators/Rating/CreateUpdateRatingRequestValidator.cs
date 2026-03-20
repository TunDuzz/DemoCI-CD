using Cinestream.Application.DTOs.Rating;
using FluentValidation;

namespace Cinestream.Application.Validators.Rating;

public class CreateUpdateRatingRequestValidator : AbstractValidator<CreateUpdateRatingRequest>
{
    public CreateUpdateRatingRequestValidator()
    {
        RuleFor(x => x.Score)
            .InclusiveBetween(1, 10).WithMessage("Rating score must be between 1 and 10.");
    }
}
