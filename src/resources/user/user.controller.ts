import { Controller, Get, Param, Query } from '@nestjs/common';
import { UserService } from './user.service';
import {
  CurrentUser,
  Paginated,
  PaginatedResult,
  Protected,
  SkipQuery,
  TakeQuery,
} from 'src/decorators';
import { SerializedUser } from './user.dto';
import { ApiQuery } from '@nestjs/swagger';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Protected()
  @ApiQuery({
    required: false,
    name: 'email',
    type: String,
  })
  @Paginated(SerializedUser)
  async getUsers(
    @CurrentUser() currentUser: TypedUser,
    @TakeQuery() take: number,
    @SkipQuery() skip: number,
    @Query('email') email?: string,
  ) {
    const [users, total] = await this.userService.list(
      currentUser,
      take,
      skip,
      email,
    );
    return new PaginatedResult({
      items: users.map(this.userService.serialize),
      total,
      take,
      skip,
    });
  }

  @Get('/me')
  @Protected()
  async getMe(@CurrentUser() currentUser: TypedUser) {
    return this.userService.serialize(currentUser);
  }

  @Get('/:userId')
  @Protected()
  async getUser(
    @CurrentUser() currentUser: TypedUser,
    @Param('userId') userId: string,
  ) {
    const user = await this.userService.get(currentUser, userId);
    return this.userService.serialize(user);
  }
}
