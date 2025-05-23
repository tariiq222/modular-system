import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

/**
 * u0627u0633u062au062bu0646u0627u0621 u0645u062eu0635u0635 u0644u0623u062eu0637u0627u0621 u0639u062fu0645 u0627u0644u062au0635u0631u064au062d
 */
export class UnauthorizedException extends BaseException {
  /**
   * u0625u0646u0634u0627u0621 u0627u0633u062au062bu0646u0627u0621 u062cu062fu064au062f u0644u0639u062fu0645 u0627u0644u062au0635u0631u064au062d
   * @param message u0631u0633u0627u0644u0629 u0627u0644u062eu0637u0623
   * @param details u062au0641u0627u0635u064au0644 u0625u0636u0627u0641u064au0629
   */
  constructor(
    message: string = 'u063au064au0631 u0645u0635u0631u062d u0644u0643 u0628u0627u0644u0648u0635u0648u0644',
    details?: any,
  ) {
    super(
      message,
      HttpStatus.UNAUTHORIZED,
      'UNAUTHORIZED',
      details,
    );
  }
}