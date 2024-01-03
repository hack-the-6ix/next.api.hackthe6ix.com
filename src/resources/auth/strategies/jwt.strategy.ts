import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { userIncludes } from '@resources/user/user.service';
import { PrismaService } from '@services/prisma/prisma.service';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';

interface JwtPayload {
  sub: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private prisma: PrismaService,
    configService: ConfigService,
  ) {
    const args: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
      issuer: configService.getOrThrow('JWT_ISSUER'),
      audience: ['auth'],
    };
    super(args);
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUniqueOrThrow({
      select: { userType: true, id: true },
      where: { id: payload.sub },
    });

    return this.prisma.withContext(user).user.findUnique({
      include: userIncludes,
      where: { id: payload.sub },
    });
  }
}
