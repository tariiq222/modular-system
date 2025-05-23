import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // u0641u062du0635 u0625u0630u0627 u0643u0627u0646u062a u0646u0642u0637u0629 u0627u0644u0646u0647u0627u064au0629 u0639u0627u0645u0629
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // u0625u0636u0627u0641u0629 u0627u0644u0645u0632u064au062f u0645u0646 u0627u0644u062au0641u0627u0635u064au0644 u0625u0644u0649 u0631u0633u0627u0644u0629 u0627u0644u062eu0637u0623
    if (err || !user) {
      throw new UnauthorizedException({
        message: 'u063au064au0631 u0645u0635u0631u062d u0644u0643. u064au0631u062cu0649 u062au0633u062cu064au0644 u0627u0644u062fu062eu0648u0644.',
        details: info?.message || 'u0631u0645u0632 u0627u0644u0645u0635u0627u062fu0642u0629 u063au064au0631 u0635u0627u0644u062d u0623u0648 u0645u0646u062au0647u064a u0627u0644u0635u0644u0627u062du064au0629',
      });
    }
    return user;
  }
}