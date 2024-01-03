import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { PrismaService } from '@services/prisma/prisma.service';
import {
  IOAuth2StrategyOption,
  Profile,
  OAuth2Strategy as Strategy,
} from 'passport-google-oauth';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private prisma: PrismaService,
    config: ConfigService,
  ) {
    const args: IOAuth2StrategyOption = {
      clientID: config.getOrThrow('GOOGLE_CLIENT_ID'),
      clientSecret: config.getOrThrow('GOOGLE_CLIENT_SECRET'),
      callbackURL: `${config.getOrThrow('API_HOST')}/auth/google`,
    };
    super(args);
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ) {
    try {
      const email = profile.emails?.[0].value;
      if (!email) throw new Error('Missing email');

      const auth = await this.prisma.googleAuth.findUniqueOrThrow({
        select: {
          user: true,
        },
        where: {
          email,
        },
      });
      return auth.user;
    } catch (err) {
      throw new UnauthorizedException();
    }
  }
}
