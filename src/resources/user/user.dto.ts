import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserType, User } from '@prisma/client';

export class SerializedUser implements User {
  id: string;
  firstName: string;
  lastName: string;

  @ApiPropertyOptional()
  basicAuth?: { email: string; verified: boolean };

  @ApiPropertyOptional()
  googleAuth?: { email: string; reference: string };

  @ApiProperty({ enum: UserType })
  userType: UserType;

  constructor(data: TypedUser) {
    Object.assign(this, data);
  }
}
