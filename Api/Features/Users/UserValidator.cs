using Api.Features.Authentication;
using FluentValidation;

namespace Api.Features.Users;

public class RegisterUserRequestValidator : AbstractValidator<RegisterUserRequest>
{
  public class LoginRequestValidator : AbstractValidator<LoginRequest>
  {
    public LoginRequestValidator()
    {
      RuleFor(x => x.Email)
        .NotEmpty().WithMessage("E-posta adresi boş olamaz.")
        .EmailAddress().WithMessage("Geçerli bir e-posta adresi giriniz.");

      RuleFor(x => x.Password)
        .NotEmpty().WithMessage("Şifre boş olamaz.");
    }
  }

  public RegisterUserRequestValidator()
  {
    RuleFor(x => x.Username)
      .NotEmpty().WithMessage("Kullanıcı adı boş olamaz.")
      .MinimumLength(3).WithMessage("Kullanıcı adı en az 3 karakter olmalıdır.")
      .MaximumLength(50).WithMessage("Kullanıcı adı en fazla 50 karakter olabilir.");

    RuleFor(x => x.Email)
      .NotEmpty().WithMessage("E-posta adresi boş olamaz.")
      .EmailAddress().WithMessage("Geçerli bir e-posta adresi giriniz.")
      .MaximumLength(150).WithMessage("E-posta adresi en fazla 150 karakter olabilir.");

    RuleFor(x => x.Password)
      .NotEmpty().WithMessage("Şifre boş olamaz.")
      .MinimumLength(8).WithMessage("Şifre en az 8 karakter olmalıdır.")
      .Matches(@"[A-Z]+").WithMessage("Şifre en az bir büyük harf içermelidir.")
      .Matches(@"[a-z]+").WithMessage("Şifre en az bir küçük harf içermelidir.")
      .Matches(@"[0-9]+").WithMessage("Şifre en az bir rakam içermelidir.")
      .Matches(@"[\!\?\*\.]+").WithMessage("Şifre en az bir özel karakter (!, ?, *, .) içermelidir.");

    RuleFor(x => x.ProfileImageUrl)
      .MaximumLength(500).WithMessage("Profil resmi yolu 500 karakterden fazla olamaz.");

    RuleFor(x => x.Bio)
      .MaximumLength(1000).WithMessage("Biyografi 1000 karakterden fazla olamaz.");
  }
}

public class UpdateUserRequestValidator : AbstractValidator<UpdateUserRequest>
{
  public UpdateUserRequestValidator()
  {
 
    RuleFor(x => x.Username)
      .NotEmpty().WithMessage("Kullanıcı adı boş olamaz.")
      .MinimumLength(3).WithMessage("Kullanıcı adı en az 3 karakter olmalıdır.")
      .MaximumLength(50).WithMessage("Kullanıcı adı en fazla 50 karakter olabilir.");

    RuleFor(x => x.Email)
      .NotEmpty().WithMessage("E-posta adresi boş olamaz.")
      .EmailAddress().WithMessage("Geçerli bir e-posta adresi giriniz.");

    RuleFor(x => x.Bio)
      .MaximumLength(1000).WithMessage("Biyografi 1000 karakterden fazla olamaz.");
  }
}

public class ChangePasswordRequestValidator : AbstractValidator<ChangePasswordRequest>
{
  public ChangePasswordRequestValidator()
  {
    RuleFor(x => x.CurrentPassword)
      .NotEmpty().WithMessage("Mevcut şifrenizi girmelisiniz.");

    RuleFor(x => x.NewPassword)
      .NotEmpty().WithMessage("Yeni şifre boş olamaz.")
      .MinimumLength(8).WithMessage("Yeni şifre en az 8 karakter olmalıdır.")
      .NotEqual(x => x.CurrentPassword).WithMessage("Yeni şifre mevcut şifre ile aynı olamaz.")
      .Matches(@"[A-Z]+").WithMessage("Şifre en az bir büyük harf içermelidir.")
      .Matches(@"[a-z]+").WithMessage("Şifre en az bir küçük harf içermelidir.")
      .Matches(@"[0-9]+").WithMessage("Şifre en az bir rakam içermelidir.")
      .Matches(@"[\!\?\*\.]+").WithMessage("Şifre en az bir özel karakter (!, ?, *, .) içermelidir.");

    RuleFor(x => x.ConfirmNewPassword)
      .NotEmpty().WithMessage("Şifre tekrarı boş olamaz.")
      .Equal(x => x.NewPassword).WithMessage("Yeni şifreler birbiriyle eşleşmiyor.");
  }
}
