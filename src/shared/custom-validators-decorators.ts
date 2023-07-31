import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsAfterCurrentDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isAfterCurrentDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const currentDate = new Date();
          currentDate.setHours(0, 0, 0, 0); // Set time to 00:00:00.000
          const inputDate = new Date(value);
          return inputDate.getTime() > currentDate.getTime();
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a date after the current date.`;
        },
      },
    });
  };
}