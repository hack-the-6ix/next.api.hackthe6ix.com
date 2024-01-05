import { Body, Controller, Post, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiQuery } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginUserDto, RegisterUserDto } from './auth.dto';
import { CurrentUser } from 'src/decorators/CurrentUser.decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    const token = await this.authService.getToken(user.id);
    if (redirect) {
      res.redirect(`${redirect}?token=${token}`);
    } else {
      res.json(token);
    }
  }
}
