import { ApiProperty } from '@nestjs/swagger';
import { UserType, User } from '@prisma/client';

export class SerializedUser implements User {
  id: string;
  firstName: string;
  lastName: string;
  basicAuth?: { email: string; verified: boolean };
  googleAuth?: { email: string; reference: string };

  @ApiProperty({ enum: UserType })
  userType: UserType;

  constructor(data: TypedUser) {
    Object.assign(this, data);
  }
}
