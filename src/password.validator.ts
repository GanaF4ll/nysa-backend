import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isStrongPassword', async: false })
export class IsStrongPassword implements ValidatorConstraintInterface {
  validate(password: string, args: ValidationArguments) {
    // Définissez ici les règles de robustesse du mot de passe
    // Exemple: au moins une majuscule, une minuscule, un chiffre et un caractère spécial
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialCharacter = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return hasUpperCase && hasLowerCase && hasNumber && hasSpecialCharacter;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
  }
}
