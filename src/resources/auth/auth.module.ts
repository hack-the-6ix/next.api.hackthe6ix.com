import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '@services/prisma/prisma.service';
import { BasicStrategy } from './strategies/basic.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { NodemailerService } from '@services/nodemailer/nodemailer.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow('JWT_SECRET'),
        signOptions: {
          issuer: configService.getOrThrow('JWT_ISSUER'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    NodemailerService,
    JwtStrategy,
    BasicStrategy,
    GoogleStrategy,
  ],
})
export class AuthModule {}
