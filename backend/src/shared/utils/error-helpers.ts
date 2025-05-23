/**
 * u0648u0638u0627u0626u0641 u0645u0633u0627u0639u062fu0629 u0644u0644u062au0639u0627u0645u0644 u0645u0639 u0627u0644u0623u062eu0637u0627u0621
 */

/**
 * u062au0646u0633u064au0642 u0631u0633u0627u0626u0644 u0623u062eu0637u0627u0621 u0627u0644u062au062du0642u0642 u0645u0646 u0627u0644u0635u062du0629
 * @param validationErrors u0645u0635u0641u0648u0641u0629 u0623u062eu0637u0627u0621 u0627u0644u062au062du0642u0642
 * @returns u0645u0635u0641u0648u0641u0629 u0645u0646u0633u0642u0629 u0645u0646 u0623u062eu0637u0627u0621 u0627u0644u062au062du0642u0642
 */
export function formatValidationErrors(validationErrors: any[]): any[] {
  return validationErrors.map(error => {
    const constraints = error.constraints ? Object.values(error.constraints) : [];
    return {
      field: error.property,
      errors: constraints,
      children: error.children && error.children.length > 0 ? formatValidationErrors(error.children) : [],
    };
  });
}

/**
 * u0627u0633u062au062eu0631u0627u062c u0627u0644u0631u0633u0627u0644u0629 u0627u0644u0631u0626u064au0633u064au0629 u0645u0646 u0623u062eu0637u0627u0621 u0627u0644u062au062du0642u0642
 * @param validationErrors u0645u0635u0641u0648u0641u0629 u0623u062eu0637u0627u0621 u0627u0644u062au062du0642u0642
 * @returns u0631u0633u0627u0644u0629 u0645u0648u062du062fu0629 u0644u0644u062eu0637u0623
 */
export function extractValidationErrorMessage(validationErrors: any[]): string {
  const firstError = validationErrors[0];
  if (!firstError) return 'u0628u064au0627u0646u0627u062a u063au064au0631 u0635u0627u0644u062du0629';

  const constraints = firstError.constraints ? Object.values(firstError.constraints) : [];
  return constraints.length > 0 ? constraints[0] as string : `u062du0642u0644 ${firstError.property} u063au064au0631 u0635u0627u0644u062d`;
}

/**
 * u0627u0633u062au062eu0631u0627u062c u0631u0633u0627u0644u0629 u0627u0644u062eu0637u0623 u0645u0646 u0627u0633u062au062bu0646u0627u0621 PostgreSQL
 * @param error u0627u0644u062eu0637u0623 u0627u0644u0623u0635u0644u064a
 * @returns u0631u0633u0627u0644u0629 u062eu0637u0623 u0645u0641u0647u0648u0645u0629
 */
export function extractPostgresErrorMessage(error: any): string {
  // u0627u0644u062au0639u0627u0645u0644 u0645u0639 u0623u062eu0637u0627u0621 duplicate key
  if (error.code === '23505') {
    const match = error.detail.match(/\(([^)]+)\)=\(([^)]+)\)/);
    if (match && match.length >= 3) {
      const field = match[1];
      const value = match[2];
      return `u0627u0644u0642u064au0645u0629 ${value} u0645u0648u062cu0648u062fu0629 u0628u0627u0644u0641u0639u0644 u0644u0644u062du0642u0644 ${field}`;
    }
  }
  
  // u0627u0644u062au0639u0627u0645u0644 u0645u0639 u0623u062eu0637u0627u0621 foreign key
  if (error.code === '23503') {
    const match = error.detail.match(/Key \(([^)]+)\)=\(([^)]+)\) is not present in table "([^"]+)"/);
    if (match && match.length >= 4) {
      const field = match[1];
      const value = match[2];
      const table = match[3];
      return `u0627u0644u0642u064au0645u0629 ${value} u0644u0644u062du0642u0644 ${field} u063au064au0631 u0645u0648u062cu0648u062fu0629 u0641u064a u062cu062fu0648u0644 ${table}`;
    }
  }

  return error.message || 'u062du062fu062b u062eu0637u0623 u0641u064a u0642u0627u0639u062fu0629 u0627u0644u0628u064au0627u0646u0627u062a';
}