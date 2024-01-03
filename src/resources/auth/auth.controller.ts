import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody } from '@nestjs/swagger';
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
  @UseGuards(AuthGuard('basic'))
  async loginWithPassword(@CurrentUser() user: TypedUser) {
    return this.authService.getToken(user.id);
  }
}
