import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

/**
 * u0627u0633u062au062bu0646u0627u0621 u0645u062eu0635u0635 u0644u0623u062eu0637u0627u0621 u0639u062fu0645 u0627u0644u0639u062bu0648u0631 u0639u0644u0649 u0627u0644u0645u0648u0627u0631u062f
 */
export class NotFoundException extends BaseException {
  /**
   * u0625u0646u0634u0627u0621 u0627u0633u062au062bu0646u0627u0621 u062cu062fu064au062f u0644u0639u062fu0645 u0627u0644u0639u062bu0648u0631 u0639u0644u0649 u0627u0644u0645u0648u0627u0631u062f
   * @param resourceName u0627u0633u0645 u0627u0644u0645u0648u0631u062f u0627u0644u0630u064a u0644u0645 u064au062au0645 u0627u0644u0639u062bu0648u0631 u0639u0644u064au0647
   * @param resourceId u0645u0639u0631u0641 u0627u0644u0645u0648u0631u062f u0627u0644u0630u064a u0644u0645 u064au062au0645 u0627u0644u0639u062bu0648u0631 u0639u0644u064au0647
   * @param message u0631u0633u0627u0644u0629 u0627u0644u062eu0637u0623 u0627u0644u0645u062eu0635u0635u0629
   */
  constructor(
    resourceName: string,
    resourceId?: string | number,
    message?: string,
  ) {
    const defaultMessage = resourceId
      ? `${resourceName} u0628u0627u0644u0645u0639u0631u0641 ${resourceId} u063au064au0631 u0645u0648u062cu0648u062f`
      : `${resourceName} u063au064au0631 u0645u0648u062cu0648u062f`;

    super(
      message || defaultMessage,
      HttpStatus.NOT_FOUND,
      'RESOURCE_NOT_FOUND',
      { resourceName, resourceId },
    );
  }
}