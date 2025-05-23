import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * u0632u062eu0631u0641u0629 u0644u0627u0633u062au062eu0631u0627u062c u0645u0639u0631u0641 u0627u0644u0645u0648u0631u062f u0645u0646 u0627u0644u0637u0644u0628
 * u064au0645u0643u0646 u062au062du062fu064au062f u0627u0633u0645 u0627u0644u0645u0639u0627u0645u0644 u0623u0648 u0645u0633u0627u0631 u0641u064a u0627u0644u062cu0633u0645
 */
export const ResourceId = createParamDecorator(
  (paramOrPath: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    
    if (paramOrPath) {
      // u0625u0630u0627 u0643u0627u0646 u0627u0644u0645u0633u0627u0631 u064au062du062au0648u064a u0639u0644u0649 u0646u0642u0627u0637 (u0645u062bu0644 user.id)u060c u0646u062au0639u0627u0645u0644 u0645u0639u0647 u0643u0645u0633u0627u0631 u0641u064a u0627u0644u062cu0633u0645
      if (paramOrPath.includes('.')) {
        const pathSegments = paramOrPath.split('.');
        let value = request.body;
        for (const segment of pathSegments) {
          if (value && value[segment]) {
            value = value[segment];
          } else {
            return undefined;
          }
        }
        return value;
      }
      
      // u0625u0630u0627 u0643u0627u0646 u0641u064a u0627u0644u0645u0639u0627u0645u0644u0627u062a
      if (request.params && request.params[paramOrPath]) {
        return request.params[paramOrPath];
      }
      
      // u0625u0630u0627 u0643u0627u0646 u0641u064a u0627u0644u062cu0633u0645
      if (request.body && request.body[paramOrPath]) {
        return request.body[paramOrPath];
      }
      
      // u0625u0630u0627 u0643u0627u0646 u0641u064a u0645u0639u0627u0645u0644u0627u062a u0627u0644u0627u0633u062au0639u0644u0627u0645
      if (request.query && request.query[paramOrPath]) {
        return request.query[paramOrPath];
      }
      
      return undefined;
    }
    
    // u0625u0630u0627 u0644u0645 u064au062au0645 u062au062du062fu064au062f u0645u0633u0627u0631u060c u0646u062du0627u0648u0644 u0627u0644u0639u062bu0648u0631 u0639u0644u0649 id u0641u064a u0627u0644u0645u0639u0627u0645u0644u0627u062a
    if (request.params && request.params.id) {
      return request.params.id;
    }
    
    return undefined;
  },
);