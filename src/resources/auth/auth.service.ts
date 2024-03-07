import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { RegisterUserDto, VerifyUserDto } from './auth.dto';
import { PrismaService } from '@services/prisma/prisma.service';
import { NodemailerService } from '@services/nodemailer/nodemailer.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private mailer: NodemailerService,
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  getAuthToken(userId: string) {
    return this.jwt.signAsync(
      {
        owo: 'uwu',
      },
      {
        audience: ['auth'],
        subject: userId,
        expiresIn: '1d',
      },
    );
  }

  getRedirectToken(redirectUrl: string) {
    return this.jwt.signAsync(
      { redirectUrl },
      {
        audience: ['redirect'],
        expiresIn: '5m',
      },
    );
  }

  verifyRedirectToken(token: string) {
    return this.jwt.verifyAsync<{ redirectUrl: string }>(token, {
      audience: ['redirect'],
    });
  }

  async verifyUser(payload: VerifyUserDto) {
    const data = await this.jwt.verifyAsync(payload.token, {
      audience: ['verify'],
    });
    await this.prisma.withContext({ id: data.sub }).basicAuth.update({
      where: {
        userId: data.sub,
      },
      data: {
        verified: true,
      },
    });
    return true;
  }

  async registerUser(payload: RegisterUserDto) {
    const user = await this.prisma.withContext().user.create({
      data: {
        firstName: payload.firstName,
        lastName: payload.lastName,
      },
    });

    await this.prisma.withContext(user).basicAuth.createMany({
      data: [
        {
          password: payload.password,
          email: payload.email,
          userId: user.id,
        },
      ],
    });

    try {
      const verifyToken = await this.jwt.signAsync(
        { owo: 'uwu' },
        {
          audience: ['verify'],
          subject: user.id,
          expiresIn: '1h',
        },
      );

      const verifyUrl = `${this.config.getOrThrow(
        'AUTH_HOST',
      )}/verify?token=${verifyToken}`;
      await this.mailer.send(
        payload.email,
        'Verify email',
        `To verify, go to ${verifyUrl}`,
      );
    } catch (err) {
      console.error('Error sending email', payload.email, err);

      try {
        await this.prisma.user.delete({ where: { id: user.id } });
      } catch (err) {
        console.error('Failed to cleanup user', payload.email, err);
      }
      throw new InternalServerErrorException();
    }

    return true;
  }
}
