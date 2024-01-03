import { UseGuards, applyDecorators } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';

export const Protected = () =>
  applyDecorators(ApiBearerAuth(), UseGuards(AuthGuard('jwt')));
