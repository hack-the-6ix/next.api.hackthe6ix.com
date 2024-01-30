import { Injectable } from '@nestjs/common';
import { PrismaService } from '@services/prisma/prisma.service';

@Injectable()
export class ResponseService {
  constructor(private prisma: PrismaService) {}

  list(currentUser: TypedUser, take: number, skip: number) {
    const prisma = this.prisma.withContext(currentUser);
    return Promise.all([
      prisma.response.findMany({ take, skip }),
      prisma.response.count(),
    ]);
  }

  get(currentUser: TypedUser, id: string) {
    return this.prisma.withContext(currentUser).response.findUniqueOrThrow({
      where: {
        id,
      },
    });
  }

  create(currentUser: TypedUser, formId: string) {
    return this.prisma.withContext(currentUser).response.create({
      data: {
        createdById: currentUser.id,
        formId,
      },
    });
  }

  update(currentUser: TypedUser, id: string, data: )
}
