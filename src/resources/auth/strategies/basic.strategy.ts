import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { PrismaService } from '@services/prisma/prisma.service';
import { compare } from 'bcryptjs';
import { IStrategyOptions, Strategy } from 'passport-local';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy, 'basic') {
  constructor(private prisma: PrismaService) {
    const args: IStrategyOptions = {
      passwordField: 'password',
      usernameField: 'email',
    };
    super(args);
  }

  async validate(email: string, password: string) {
    try {
      const auth = await this.prisma.basicAuth.findUniqueOrThrow({
        select: {
          user: true,
          password: true,
        },
        where: {
          verified: true,
          email,
        },
      });

      const isValid = await compare(password, auth.password);
      if (!isValid) {
        throw new Error();
      }
      return auth.user;
    } catch (err) {
      console.error(err);
      throw new UnauthorizedException();
    }
  }
}
