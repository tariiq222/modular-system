import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

/**
 * u0627u0633u062au062bu0646u0627u0621 u0645u062eu0635u0635 u0644u0623u062eu0637u0627u0621 u0627u0644u062au062du0642u0642 u0645u0646 u0627u0644u0635u062du0629
 */
export class ValidationException extends BaseException {
  /**
   * u0625u0646u0634u0627u0621 u0627u0633u062au062bu0646u0627u0621 u062cu062fu064au062f u0644u0644u062au062du0642u0642 u0645u0646 u0627u0644u0635u062du0629
   * @param validationErrors u0645u0635u0641u0648u0641u0629 u0623u062eu0637u0627u0621 u0627u0644u062au062du0642u0642
   * @param message u0631u0633u0627u0644u0629 u0627u0644u062eu0637u0623
   */
  constructor(
    validationErrors: any[],
    message: string = 'u0628u064au0627u0646u0627u062a u063au064au0631 u0635u0627u0644u062du0629',
  ) {
    super(
      message,
      HttpStatus.BAD_REQUEST,
      'VALIDATION_ERROR',
      { errors: validationErrors },
    );
  }
}