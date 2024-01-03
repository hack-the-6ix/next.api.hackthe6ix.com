import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@services/prisma/prisma.service';
import { SerializedUser } from './user.dto';

export const userIncludes = Prisma.validator<Prisma.UserInclude>()({
  basicAuth: {
    select: {
      email: true,
      verified: true,
    },
  },
  googleAuth: {
    select: {
      email: true,
      reference: true,
    },
  },
});
export type UserIncludes = Prisma.UserGetPayload<{
  include: typeof userIncludes;
}>;

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  list(currentUser: TypedUser, take: number, skip: number, email?: string) {
    const prisma = this.prisma.withContext(currentUser);
    const query: { where?: Prisma.UserWhereInput } = {};
    if (email) {
      query.where = Prisma.validator<Prisma.UserWhereInput>()({
        OR: [
          {
            basicAuth: {
              email: {
                contains: email,
              },
            },
          },
          {
            googleAuth: {
              email: {
                contains: email,
              },
            },
          },
        ],
      });
    }

    return Promise.all([
      prisma.user.findMany({ include: userIncludes, take, skip, ...query }),
      prisma.user.count(query),
    ]);
  }

  get(currentUser: TypedUser, userId: string) {
    return this.prisma.withContext(currentUser).user.findUniqueOrThrow({
      include: userIncludes,
      where: {
        id: userId,
      },
    });
  }

  serialize(user: TypedUser) {
    return new SerializedUser(user);
  }
}
