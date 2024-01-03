import {
  QuestionCreateSchema,
  QuestionUpdateSchema,
  TextQuestionCreateSchema,
  TextQuestionUpdateSchema,
} from '@zenstackhq/runtime/zod/models';
import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

export class CreateQuestionDto extends createZodDto(
  QuestionCreateSchema.extend({
    data: z.discriminatedUnion('type', [
      TextQuestionCreateSchema.extend({ type: z.literal('text') }).omit({
        questionId: true,
      }),
    ]),
  }).omit({ formId: true, id: true }),
) {}

export class UpdateQuestionDto extends createZodDto(
  QuestionUpdateSchema.extend({
    data: z.discriminatedUnion('type', [
      TextQuestionUpdateSchema.extend({ type: z.literal('text') }).omit({
        questionId: true,
      }),
    ]),
  })
    .omit({ formId: true })
    .required({ id: true }),
) {}
