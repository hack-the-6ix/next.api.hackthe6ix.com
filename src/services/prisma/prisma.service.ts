import {
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient, User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { enhance } from '@zenstackhq/runtime';

type UserContext = Partial<User>;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(private configService: ConfigService) {
    super({
      log:
        configService.get('NODE_ENV') === 'development' ?
          [
            {
              emit: 'event',
              level: 'query',
            },
          ]
        : undefined,
    });
  }

  async onModuleInit() {
    await this.$connect();
    if (this.configService.get('NODE_ENV') === 'development') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.$on('query', async (e) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        console.log(`${e.query} ${e.params}`);
      });
    }
  }

  withContext(user?: UserContext) {
    try {
      if (!user) return enhance(this);
      return enhance(this, { user });
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.meta?.reason === 'ACCESS_POLICY_VIOLATION') {
          throw new UnauthorizedException();
        }
      }
      throw err;
    }
  }
}
