import { ZodValidationPipe } from 'nestjs-zod';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { Module } from '@nestjs/common';

import { PrismaService } from '@services/prisma/prisma.service';
import { AuthModule } from '@resources/auth/auth.module';
import { AppController } from './app.controller';
import { NodemailerService } from './services/nodemailer/nodemailer.service';
import { UserModule } from './resources/user/user.module';
import { FormModule } from './resources/form/form.module';
import { QuestionModule } from './resources/question/question.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      expandVariables: true,
      isGlobal: true,
      cache: true,
    }),
    AuthModule,
    UserModule,
    FormModule,
    QuestionModule,
  ],
  controllers: [AppController],
  providers: [
    {
      useClass: ZodValidationPipe,
      provide: APP_PIPE,
    },
    PrismaService,
    NodemailerService,
  ],
})
export class AppModule {}
