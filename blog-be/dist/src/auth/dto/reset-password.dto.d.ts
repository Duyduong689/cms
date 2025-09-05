import { ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
export declare class PasswordMatchConstraint implements ValidatorConstraintInterface {
    validate(confirmPassword: string, args: ValidationArguments): boolean;
    defaultMessage(args: ValidationArguments): string;
}
export declare class ResetPasswordDto {
    token: string;
    password: string;
    confirmPassword: string;
}
