import { Injectable } from '@nestjs/common';
import * as R from 'ramda';

import { PrismaService } from '@services/prisma/prisma.service';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  questionTypes,
} from './question.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class QuestionService {
  constructor(private prisma: PrismaService) {}

  private async getType(formId: string, questionId: string) {
    const result = await this.prisma.question.findUnique({
      select: R.reduce(
        (acc, type) => R.assoc(type, { select: { questionId: true } }, acc),
        { id: true },
        questionTypes,
      ),
      where: {
        id: questionId,
        formId,
      },
    });

    return R.cond(
      R.map(
        (type) => [R.pipe(R.prop(type), R.isNotNil), R.always(type)],
        questionTypes,
      ),
    )(result);
  }

  list(currentUser: TypedUser, formId: string) {
    return this.prisma.withContext(currentUser).question.findMany({
      where: { formId },
    });
  }

  create(
    currentUser: TypedUser,
    formId: string,
    { data, ...fields }: CreateQuestionDto,
  ) {
    return this.prisma.withContext(currentUser).question.create({
      data: {
        formId,
        ...fields,
        [data.type]: {
          create: R.omit(['type'], data),
        },
      },
    });
  }

  delete(currentUser: TypedUser, formId: string, questionId: string) {
    return this.prisma.withContext(currentUser).question.delete({
      where: {
        id: questionId,
        formId,
      },
    });
  }

  async update(
    currentUser: TypedUser,
    formId: string,
    questionId: string,
    { data, ...fields }: UpdateQuestionDto,
  ) {
    let payload = Prisma.validator<Prisma.QuestionUpdateArgs['data']>()({
      ...fields,
      [data.type]: {
        upsert: {
          create: R.omit(['type'], data),
          update: R.omit(['type'], data),
          where: {
            questionId,
          },
        },
      },
    });

    const oldType = await this.getType(formId, questionId);
    if (data.type !== oldType) {
      payload = Prisma.validator<Prisma.QuestionUpdateArgs['data']>()({
        ...payload,
        [oldType]: { delete: true },
      });
    }

    return this.prisma.withContext(currentUser).question.update({
      where: { id: questionId },
      data: payload,
    });
  }
}
