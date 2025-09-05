import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, Matches, Validate, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'passwordMatch', async: false })
export class PasswordMatchConstraint implements ValidatorConstraintInterface {
  validate(confirmPassword: string, args: ValidationArguments) {
    const object = args.object as any;
    return confirmPassword === object.password;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Passwords do not match';
  }
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Password reset token',
    example: 'abc123def456ghi789',
  })
  @IsString({ message: 'Token must be a string' })
  @IsNotEmpty({ message: 'Token is required' })
  token: string;

  @ApiProperty({
    description: 'New password',
    example: 'NewSecurePass123!',
    minLength: 8,
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/,
    {
      message: 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
    },
  )
  password: string;

  @ApiProperty({
    description: 'Confirm new password',
    example: 'NewSecurePass123!',
  })
  @IsString({ message: 'Confirm password must be a string' })
  @IsNotEmpty({ message: 'Confirm password is required' })
  @Validate(PasswordMatchConstraint)
  confirmPassword: string;
}
