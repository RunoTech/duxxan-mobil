export abstract class BaseService {
  protected async handleError(error: unknown, context: string): Promise<never> {
    console.error(`${context}:`, error);
    
    if (error instanceof Error) {
      throw new Error(`${context}: ${error.message}`);
    }
    
    throw new Error(`${context}: Unknown error occurred`);
  }

  protected validateRequired(value: any, fieldName: string): void {
    if (value === null || value === undefined || value === '') {
      throw new Error(`${fieldName} is required`);
    }
  }

  protected validatePositiveNumber(value: number, fieldName: string): void {
    if (typeof value !== 'number' || value <= 0) {
      throw new Error(`${fieldName} must be a positive number`);
    }
  }

  protected sanitizeString(value: string): string {
    return value.trim().replace(/\s+/g, ' ');
  }
}