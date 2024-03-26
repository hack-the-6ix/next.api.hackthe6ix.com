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

  getToken(aud: string, userId: string, time: string) {
    return this.jwt.signAsync(
      {
        owo: 'uwu',
      },
      {
        audience: [`${aud}`],
        subject: userId,
        expiresIn: `${time}`,
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

  async sendLinkEmail(
    email: string,
    path: string,
    subject: string,
    body: string,
  ) {
    const verifyUrl = `${this.config.getOrThrow('AUTH_HOST')}/${path}`;

    await this.mailer.send(email, `${subject}`, `${body} ${verifyUrl}`);
  }

  private async getUserByEmail(email: string) {
    const user = await this.prisma.basicAuth.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return user;
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

      const verifyToken = await this.getToken('verify', user.id, '1h');

      this.sendLinkEmail(
        payload.email,
        `verify?token=${verifyToken}`,
        'HT6 Verify email',
        `To verify, go to`,
      );
    } catch (err) {
      try {
        // makes a url with the token and sends it to the given email
        this.sendLinkEmail(
          payload.email,
          `forgot-password`,
          'HT6 Registration Failed: You Already Have an Account',
          `You tried to register for an account with the same email, you already have an account. \nIf you forgot your password, please change it using`,
        );
      } catch (error) {
        console.error('Error sending email', payload.email);
      }

      try {
        await this.prisma.user.delete({ where: { id: user.id } });
      } catch (err) {
        console.error('Failed to cleanup user', payload.email, err);
      }

      throw new InternalServerErrorException();
    }

    return true;
  }

  async resendVerify(payload: ResendVerifyDto) {
    // gets user data based on email
    const user = await this.getUserByEmail(payload.email);

    try {
      // get the registration verify token
      const verifyToken = await this.getToken('verify', user.userId, '1h');

      // makes a url with the token and sends it to the given email
      this.sendLinkEmail(
        payload.email,
        `verify?token=${verifyToken}`,
        'HT6 Verify email',
        `To verify, go to`,
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
    // gets user data based on email
    const user = await this.getUserByEmail(payload.email);

    try {
      // get a token for permission to reset password
      const passwordToken = await this.getToken(
        'resetPassword',
        user.userId,
        '15m',
      );

      // makes a url with the token and sends it to the given email
      this.sendLinkEmail(
        payload.email,
        `reset-password?token=${passwordToken}`,
        'HT6 Reset Password',
        `A request has been made to reset your password.\nIf you made this request, please go to the provided link:`,
      );

      return true;
    } catch (error) {
      console.error('Error sending email', error);
      throw new InternalServerErrorException();
    }
  }
}
