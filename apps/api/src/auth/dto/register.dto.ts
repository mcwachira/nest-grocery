import { IsEmail, MinLength, IsString, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  //MinLength is 8

  @IsString()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;
}
