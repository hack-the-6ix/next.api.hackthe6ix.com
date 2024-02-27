import {
  FormCreateSchema,
  FormUpdateSchema,
} from '@zenstackhq/runtime/zod/models';
import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

export class SerializedForm extends createZodDto(
  z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    live: z.boolean(),
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
  }),
) {}

export class CreateFormDto extends createZodDto(
  FormCreateSchema.omit({ id: true, startAt: true, endAt: true }).merge(
    z.object({
      startAt: z.dateString(),
      endAt: z.dateString(),
    }),
  ),
) {}

export class UpdateFormDto extends createZodDto(
  FormUpdateSchema.omit({ id: true, startAt: true, endAt: true }).merge(
    z.object({
      startAt: z.dateString(),
      endAt: z.dateString(),
    }),
  ),
) {}
