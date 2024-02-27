import { Injectable } from '@nestjs/common';
import * as R from 'ramda';

import { PrismaService } from '@services/prisma/prisma.service';
import {
  CreateQuestionDto,
  SerializedQuestion,
  UpdateQuestionDto,
  questionInclude,
} from './question.dto';
import { Prisma } from '@prisma/client';

type QuestionType = Prisma.QuestionGetPayload<{
  include: typeof questionInclude;
}>;

const getTypeQuery = {
  select: {
    boolean: { select: { questionId: true } },
    text: { select: { questionId: true } },
  },
};

@Injectable()
export class QuestionService {
  constructor(private prisma: PrismaService) {}

  private getType(question: Prisma.QuestionGetPayload<typeof getTypeQuery>) {
    return R.cond(
      R.map(
        (type) => [R.pipe(R.prop(type), R.isNotNil), R.always(type)],
        R.keys(questionInclude),
      ),
    )(question);
  }

  private async fetchType(formId: string, questionId: string) {
    const result = await this.prisma.question.findUniqueOrThrow({
      ...getTypeQuery,
      where: { id: questionId, formId },
    });

    return this.getType(result);
  }

  list(currentUser: TypedUser, formId: string, take: number, skip: number) {
    const prisma = this.prisma.withContext(currentUser);
    const where = Prisma.validator<Prisma.QuestionWhereInput>()({
      formId,
    });

    return Promise.all([
      prisma.question.findMany({ include: questionInclude, where, take, skip }),
      prisma.question.count({ where }),
    ]);
  }

  create(
    currentUser: TypedUser,
    formId: string,
    { data, ...fields }: CreateQuestionDto,
  ) {
    return this.prisma.withContext(currentUser).question.create({
      include: questionInclude,
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

    const oldType = await this.fetchType(formId, questionId);
    if (data.type !== oldType) {
      payload = Prisma.validator<Prisma.QuestionUpdateArgs['data']>()({
        ...payload,
        [oldType]: { delete: true },
      });
    }

    return this.prisma.withContext(currentUser).question.update({
      include: questionInclude,
      where: { id: questionId },
      data: payload,
    });
  }

  serialize(question: QuestionType): SerializedQuestion {
    const type = this.getType(question);
    return SerializedQuestion.schema.parse({
      ...R.omit([type], question),
      data: {
        ...question[type],
        type,
      },
    });
  }
}
