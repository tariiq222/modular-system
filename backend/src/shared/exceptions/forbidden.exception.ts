import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

/**
 * u0627u0633u062au062bu0646u0627u0621 u0645u062eu0635u0635 u0644u0623u062eu0637u0627u0621 u0627u0644u0648u0635u0648u0644 u0627u0644u0645u0645u0646u0648u0639
 */
export class ForbiddenException extends BaseException {
  /**
   * u0625u0646u0634u0627u0621 u0627u0633u062au062bu0646u0627u0621 u062cu062fu064au062f u0644u0644u0648u0635u0648u0644 u0627u0644u0645u0645u0646u0648u0639
   * @param message u0631u0633u0627u0644u0629 u0627u0644u062eu0637u0623
   * @param requiredPermission u0627u0644u0635u0644u0627u062du064au0629 u0627u0644u0645u0637u0644u0648u0628u0629
   * @param details u062au0641u0627u0635u064au0644 u0625u0636u0627u0641u064au0629
   */
  constructor(
    message: string = 'u0644u064au0633 u0644u062fu064au0643 u0635u0644u0627u062du064au0627u062a u0643u0627u0641u064au0629 u0644u0644u0648u0635u0648u0644 u0625u0644u0649 u0647u0630u0627 u0627u0644u0645u0648u0631u062f',
    requiredPermission?: string,
    details?: any,
  ) {
    super(
      message,
      HttpStatus.FORBIDDEN,
      'FORBIDDEN',
      { requiredPermission, ...details },
    );
  }
}