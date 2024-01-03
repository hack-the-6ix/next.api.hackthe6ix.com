import { Form } from '@prisma/client';
import {
  FormCreateSchema,
  FormUpdateSchema,
} from '@zenstackhq/runtime/zod/models';
import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

export class SerializedForm implements Form {
  id: string;
  title: string;
  description: string | null;
  live: boolean;
  startAt: Date;
  endAt: Date;
}

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
