import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiQuery } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  LoginUserDto,
  RegisterUserDto,
  VerifyUserDto,
  ResetPasswordDto,
  VerifiedResetPasswordDto,
  ResendVerifyDto,
} from './auth.dto';
import { CurrentUser } from 'src/decorators/CurrentUser.decorators';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('login')
  @ApiQuery({ name: 'redirect', type: 'string' })
  async loginRedirect(
    @Res({ passthrough: true }) res: Response,
    @Query('redirect') redirect: string,
  ) {
    if (!redirect) throw new BadRequestException();
    const origin = this.configService.getOrThrow('AUTH_HOST');
    const redirectToken = await this.authService.getRedirectToken(redirect);
    res.redirect(`${origin}?redirect=${redirectToken}`);
  }

  @Post('register')
  async register(@Body() body: RegisterUserDto) {
    return this.authService.registerUser(body);
  }

  @Post('login')
  @ApiBody({ type: LoginUserDto })
  @ApiQuery({ name: 'redirect', type: 'string', required: false })
  @UseGuards(AuthGuard('basic'))
  async loginWithPassword(
    @CurrentUser() user: TypedUser,
    @Res({ passthrough: true }) res: Response,
    @Query('redirect') redirect?: string,
  ) {
    try {
      const token = await this.authService.getToken('auth', user.id, '1d');
      if (!redirect) {
        if (this.configService.getOrThrow('NODE_ENV') === 'development') {
          res.json(token);
          return;
        }
        throw new Error();
      }

      const { redirectUrl } = await this.authService.verifyRedirectToken(
        redirect ?? '',
      );

      // TODO: Use a 301 when we are able to add proper headers at things
      res.setHeader('X-HT6-Redirect', redirectUrl);
      res.json(token);
    } catch (err) {
      throw new ForbiddenException('Bad Redirect');
    }
  }

  @Post('verify')
  async verifyUser(@Body() data: VerifyUserDto) {
    try {
      return this.authService.verifyUser(data);
    } catch (err) {
      throw new ForbiddenException('Bad Token');
    }
  }

  @Post('resend-verify')
  async resendVerify(@Body() data: ResendVerifyDto) {
    return this.authService.resendVerify(data);
  }

  @Post('reset-password')
  async resetPassword(@Body() data: ResetPasswordDto) {
    return this.authService.resetPassword(data);
  }

  @Post('reset-password/verify')
  async verifiedResetPassword(@Body() data: VerifiedResetPasswordDto) {
    try {
      await this.authService.verifiedResetPassword(data);
      return { message: 'Password reset successful' };
    } catch (err) {
      throw new ForbiddenException('Password reset failed');
    }
  }
}
