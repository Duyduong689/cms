import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../utils/token.util';

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext): JwtPayload | any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;
    
    return data ? user?.[data] : user;
  },
);
