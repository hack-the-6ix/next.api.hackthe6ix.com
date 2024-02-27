import { Injectable } from '@nestjs/common';
import { Form } from '@prisma/client';
import { PrismaService } from '@services/prisma/prisma.service';
import { CreateFormDto, SerializedForm, UpdateFormDto } from './form.dto';

@Injectable()
export class FormService {
  constructor(private prisma: PrismaService) {}

  list(currentUser: TypedUser, take: number, skip: number) {
    const prisma = this.prisma.withContext(currentUser);
    return Promise.all([
      prisma.form.findMany({ take, skip }),
      prisma.form.count(),
    ]);
  }

  get(currentUser: TypedUser, id: string) {
    return this.prisma.withContext(currentUser).form.findUniqueOrThrow({
      where: {
        id,
      },
    });
  }

  create(currentUser: TypedUser, data: CreateFormDto) {
    return this.prisma.withContext(currentUser).form.create({ data });
  }

  update(currentUser: TypedUser, id: string, data: UpdateFormDto) {
    return this.prisma.withContext(currentUser).form.update({
      where: { id },
      data,
    });
  }

  serialize(form: Form): SerializedForm {
    return SerializedForm.schema.parse(form);
  }
}
