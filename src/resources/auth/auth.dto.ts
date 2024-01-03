import {
  UserCreateSchema,
  BasicAuthCreateSchema,
} from '@zenstackhq/runtime/zod/models';
import { passwordStrength } from 'check-password-strength';
import { createZodDto } from 'nestjs-zod';
import * as R from 'ramda';

export class RegisterUserDto extends createZodDto(
  BasicAuthCreateSchema.pick({ email: true, password: true })
    .merge(
      UserCreateSchema.pick({
        firstName: true,
        lastName: true,
      }),
    )
    .refine(
      R.pipe(
        R.prop('password'),
        passwordStrength,
        R.prop('value'),
        R.toLower,
        R.includes('weak'),
        R.not,
      ),
      {
        message: 'Password too weak',
        path: ['password'],
      },
    ),
) {}

export class LoginUserDto extends createZodDto(
  BasicAuthCreateSchema.pick({ email: true, password: true }),
) {}
