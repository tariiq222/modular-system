import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

/**
 * u0627u0633u062au062bu0646u0627u0621 u0645u062eu0635u0635 u0644u0623u062eu0637u0627u0621 u0645u0646u0637u0642 u0627u0644u0623u0639u0645u0627u0644
 */
export class BusinessLogicException extends BaseException {
  /**
   * u0625u0646u0634u0627u0621 u0627u0633u062au062bu0646u0627u0621 u062cu062fu064au062f u0644u0645u0646u0637u0642 u0627u0644u0623u0639u0645u0627u0644
   * @param message u0631u0633u0627u0644u0629 u0627u0644u062eu0637u0623
   * @param errorCode u0631u0645u0632 u0627u0644u062eu0637u0623 u0627u0644u0645u062eu0635u0635
   * @param details u062au0641u0627u0635u064au0644 u0625u0636u0627u0641u064au0629
   */
  constructor(
    message: string,
    errorCode: string = 'BUSINESS_LOGIC_ERROR',
    details?: any,
  ) {
    super(
      message,
      HttpStatus.BAD_REQUEST,
      errorCode,
      details,
    );
  }
}