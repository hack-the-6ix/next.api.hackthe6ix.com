import { Prisma } from '@prisma/client';
import {
  BooleanQuestionCreateSchema,
  BooleanQuestionScalarSchema,
  BooleanQuestionUpdateSchema,
  QuestionCreateSchema,
  QuestionScalarSchema,
  QuestionUpdateSchema,
  TextQuestionCreateSchema,
  TextQuestionScalarSchema,
  TextQuestionUpdateSchema,
} from '@zenstackhq/runtime/zod/models';
import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

export const questionInclude = Prisma.validator<Prisma.QuestionInclude>()({
  boolean: true,
  text: true,
});

export class SerializedQuestion extends createZodDto(
  QuestionScalarSchema.extend({
    data: z.discriminatedUnion('type', [
      TextQuestionScalarSchema.extend({ type: z.literal('text') }).omit({
        questionId: true,
      }),
      BooleanQuestionScalarSchema.extend({ type: z.literal('boolean') }).omit({
        questionId: true,
      }),
    ]),
  }),
) {}

export class CreateQuestionDto extends createZodDto(
  QuestionCreateSchema.extend({
    data: z.discriminatedUnion('type', [
      TextQuestionCreateSchema.extend({ type: z.literal('text') }).omit({
        questionId: true,
      }),
      BooleanQuestionCreateSchema.extend({ type: z.literal('boolean') }).omit({
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
      BooleanQuestionUpdateSchema.extend({ type: z.literal('boolean') }).omit({
        questionId: true,
      }),
    ]),
  })
    .omit({ formId: true })
    .required({ id: true }),
) {}
