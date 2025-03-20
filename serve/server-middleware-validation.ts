/**
 * Middleware per la validazione delle richieste
 */
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { formatZodError } from '../../shared/utils/validation-utils';
import { createAppError } from './error-middleware';

/**
 * Factory di middleware per validare il corpo della richiesta
 * @param schema Schema Zod per la validazione
 * @returns Middleware Express
 */
export const validateBody = <T>(schema: ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Valida il corpo della richiesta contro lo schema
      const validatedData = schema.parse(req.body);
      
      // Sostituisce il corpo della richiesta con i dati validati
      req.body = validatedData;
      
      // Procede con il prossimo middleware
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Formatta gli errori di validazione
        const formattedErrors = formatZodError(error);
        
        // Crea un errore applicativo
        const appError = createAppError(
          'Dati di input non validi',
          400,
          {
            code: 'VALIDATION_ERROR',
            errors: formattedErrors,
            isOperational: true,
          }
        );
        
        // Passa l'errore al gestore di errori
        next(appError);
      } else {
        // Passa altri errori al gestore di errori
        next(error);
      }
    }
  };
};

/**
 * Factory di middleware per validare i parametri della richiesta
 * @param schema Schema Zod per la validazione
 * @returns Middleware Express
 */
export const validateParams = <T>(schema: ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Valida i parametri della richiesta contro lo schema
      const validatedData = schema.parse(req.params);
      
      // Sostituisce i parametri della richiesta con i dati validati
      req.params = validatedData as any;
      
      // Procede con il prossimo middleware
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Formatta gli errori di validazione
        const formattedErrors = formatZodError(error);
        
        // Crea un errore applicativo
        const appError = createAppError(
          'Parametri richiesta non validi',
          400,
          {
            code: 'VALIDATION_ERROR',
            errors: formattedErrors,
            isOperational: true,
          }
        );
        
        // Passa l'errore al gestore di errori
        next(appError);
      } else {
        // Passa altri errori al gestore di errori
        next(error);
      }
    }
  };
};

/**
 * Factory di middleware per validare i parametri di query della richiesta
 * @param schema Schema Zod per la validazione
 * @returns Middleware Express
 */
export const validateQuery = <T>(schema: ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Valida i parametri di query della richiesta contro lo schema
      const validatedData = schema.parse(req.query);
      
      // Sostituisce i parametri di query della richiesta con i dati validati
      req.query = validatedData as any;
      
      // Procede con il prossimo middleware
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Formatta gli errori di validazione
        const formattedErrors = formatZodError(error);
        
        // Crea un errore applicativo
        const appError = createAppError(
          'Parametri di query non validi',
          400,
          {
            code: 'VALIDATION_ERROR',
            errors: formattedErrors,
            isOperational: true,
          }
        );
        
        // Passa l'errore al gestore di errori
        next(appError);
      } else {
        // Passa altri errori al gestore di errori
        next(error);
      }
    }
  };
};

export default {
  validateBody,
  validateParams,
  validateQuery
};
