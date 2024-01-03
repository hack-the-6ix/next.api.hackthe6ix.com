import { UserIncludes } from '@resources/user/user.service';

declare global {
  export type TypedUser = UserIncludes;

  export type Constructor<T = any> = { new (...args: any[]): T };
}
