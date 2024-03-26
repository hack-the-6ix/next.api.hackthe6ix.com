import {
  UserCreateSchema,
  BasicAuthCreateSchema,
} from '@zenstackhq/runtime/zod/models';
import { passwordStrength } from 'check-password-strength';
import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';
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

export class VerifyUserDto extends createZodDto(
  z.object({
    token: z.string(),
  }),
) {}

export class ResendVerifyDto extends createZodDto(
  z.object({
    email: z.string().email(),
  }),
) {}

export class ResetPasswordDto extends createZodDto(
  z.object({
    email: z.string().email(),
  }),
) {}

export class VerifiedResetPasswordDto extends createZodDto(
  z.object({
    token: z.string(),
    newPassword: z
      .string()
      .refine(
        R.pipe(
          passwordStrength,
          R.prop('value'),
          R.toLower,
          R.includes('weak'),
          R.not,
        ),
        {
          message: 'Password too weak',
          path: ['newPassword'],
        },
      ),
  }),
) {}
