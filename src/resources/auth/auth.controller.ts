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
import { LoginUserDto, RegisterUserDto } from './auth.dto';
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
      if (!redirect) throw new Error();
      const { redirectUrl } =
        await this.authService.verifyRedirectToken(redirect);
      const token = await this.authService.getAuthToken(user.id);

      // TODO: Use a 301 when we are able to add proper headers at things
      res.setHeader('X-HT6-Redirect', redirectUrl);
      res.json(token);
    } catch (err) {
      throw new ForbiddenException('Bad Redirect');
    }
  }
}
