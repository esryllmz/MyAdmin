using FluentValidation;

namespace Api.Features.Teams;

public class CreateTeamRequestValidator : AbstractValidator<CreateTeamRequest>
{
  public CreateTeamRequestValidator()
  {
    RuleFor(x => x.Name)
      .NotEmpty().WithMessage("Team name is required.")
      .MinimumLength(2).WithMessage("Team name must be at least 2 characters.")
      .MaximumLength(100).WithMessage("Team name can be at most 100 characters.");

    RuleFor(x => x.Description)
      .MaximumLength(500).WithMessage("Description can be at most 500 characters.");
  }
}

public class UpdateTeamRequestValidator : AbstractValidator<UpdateTeamRequest>
{
  public UpdateTeamRequestValidator()
  {
    RuleFor(x => x.Name)
      .NotEmpty().WithMessage("Team name is required.")
      .MinimumLength(2).WithMessage("Team name must be at least 2 characters.")
      .MaximumLength(100).WithMessage("Team name can be at most 100 characters.");

    RuleFor(x => x.Description)
      .MaximumLength(500).WithMessage("Description can be at most 500 characters.");
  }
}

public class AddTeamMemberRequestValidator : AbstractValidator<AddTeamMemberRequest>
{
  public AddTeamMemberRequestValidator()
  {
    RuleFor(x => x.UserId)
      .NotEmpty().WithMessage("A user must be selected.");

    RuleFor(x => x.MembershipRole)
      .Must(role => TeamMembershipRole.All.Contains(role))
      .WithMessage($"Membership role must be one of: {string.Join(", ", TeamMembershipRole.All)}.");
  }
}

public class UpdateTeamMemberRequestValidator : AbstractValidator<UpdateTeamMemberRequest>
{
  public UpdateTeamMemberRequestValidator()
  {
    RuleFor(x => x.MembershipRole)
      .Must(role => TeamMembershipRole.All.Contains(role))
      .WithMessage($"Membership role must be one of: {string.Join(", ", TeamMembershipRole.All)}.");
  }
}
