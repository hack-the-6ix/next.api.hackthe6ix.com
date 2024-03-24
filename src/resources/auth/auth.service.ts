import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  RegisterUserDto,
  VerifyUserDto,
  ResetPasswordDto,
  VerifiedResetPasswordDto,
  ResendVerifyDto,
  RegisterFailDto,
} from './auth.dto';
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

    try {
      await this.prisma.withContext(user).basicAuth.createMany({
        data: [
          {
            password: payload.password,
            email: payload.email,
            userId: user.id,
          },
        ],
      });

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
        'HT6 Verify email',
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

  async registerFail(payload: RegisterFailDto) {
    const { email } = payload;

    // gets user data based on email
    const user = await this.prisma.basicAuth.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    try {
      // makes a url with the token and sends it to the given email
      const resetPasswordUrl = `${this.config.getOrThrow(
        'AUTH_HOST',
      )}/forgot-password`;

      await this.mailer.send(
        email,
        'HT6 Registration Failed: You Already Have an Account',
        `You tried to register for an account with the same email, you already have an account. \nIf you forgot your password, please change it using ${resetPasswordUrl}`,
      );

      /* try {
        await this.prisma.user.delete({ where: { id: user.userId } });
      } catch (err) {
        console.error('Failed to cleanup user', payload.email, err);
      } */

      return true;
    } catch (error) {
      console.error('Error sending email', payload.email);
      throw new InternalServerErrorException();
    }
  }

  async resendVerify(payload: ResendVerifyDto) {
    const { email } = payload;

    // gets user data based on email
    const user = await this.prisma.basicAuth.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    try {
      // get the registration verify token
      const verifyToken = await this.jwt.signAsync(
        { owo: 'uwu' },
        {
          audience: ['verify'],
          subject: user.userId,
          expiresIn: '1h',
        },
      );

      // makes a url with the token and sends it to the given email
      const verifyUrl = `${this.config.getOrThrow(
        'AUTH_HOST',
      )}/verify?token=${verifyToken}`;

      await this.mailer.send(
        email,
        'HT6 Verify email',
        `To verify, go to ${verifyUrl}`,
      );

      return true;
    } catch (error) {
      console.error('Error sending email', payload.email);
      throw new InternalServerErrorException();
    }
  }

  async verifiedResetPassword(payload: VerifiedResetPasswordDto) {
    const data = await this.jwt.verifyAsync(payload.token, {
      audience: ['resetPassword'],
    });

    // Update the password for the user
    await this.prisma.withContext({ id: data.sub }).basicAuth.update({
      where: {
        userId: data.sub,
      },
      data: {
        password: payload.newPassword,
      },
    });

    return true;
  }

  async resetPassword(payload: ResetPasswordDto) {
    const { email } = payload;

    // gets user data based on email
    const user = await this.prisma.basicAuth.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    try {
      // get a token for permission to reset password
      const passwordToken = await this.jwt.signAsync(
        { owo: 'uwu' },
        {
          audience: ['resetPassword'],
          subject: user.userId,
          expiresIn: '15m',
        },
      );

      // makes a url with the token and sends it to the given email
      const passwordUrl = `${this.config.getOrThrow(
        'AUTH_HOST',
      )}/reset-password?token=${passwordToken}`;

      await this.mailer.send(
        email,
        'HT6 Reset Password',
        `A request has been made to reset your password.\nIf you made this request, please go to the provided link: ${passwordUrl}`,
      );

      return true;
    } catch (error) {
      console.error('Error changing password', error);
      throw new InternalServerErrorException();
    }
  }
}
