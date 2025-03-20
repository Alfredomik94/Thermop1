/**
 * Utility per la validazione dei dati
 */
import { z } from 'zod';
import { createAppError } from './error-handler';

/**
 * Opzioni per la validazione delle richieste
 */
export interface ValidationOptions {
  source: 'body' | 'params' | 'query' | 'headers';
  errorMessage?: string;
  errorCode?: string;
  abortEarly?: boolean;
}

/**
 * Valida i dati in base a uno schema Zod
 * @param data Dati da validare
 * @param schema Schema Zod
 * @param options Opzioni di validazione
 */
export const validateWithZod = <T>(
  data: any,
  schema: z.ZodSchema<T>,
  options: ValidationOptions
): T => {
  try {
    // Ottiene il risultato della validazione
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Formatta gli errori Zod
      const formattedErrors: Record<string, string[]> = {};
      
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!formattedErrors[path]) {
          formattedErrors[path] = [];
        }
        formattedErrors[path].push(err.message);
      });
      
      // Compone il messaggio di errore
      const errorMessage = options.errorMessage || 
        `Validazione fallita per ${options.source}`;
      
      // Lancia un AppError con i dettagli di validazione
      throw createAppError(
        errorMessage,
        400,
        {
          code: options.errorCode || 'VALIDATION_ERROR',
          errors: formattedErrors,
          isOperational: true,
        }
      );
    }
    
    // In caso di altri errori, li rilancia
    throw error;
  }
};

/**
 * Valida il corpo della richiesta
 */
export const validateBody = <T>(
  body: any,
  schema: z.ZodSchema<T>,
  options: Omit<ValidationOptions, 'source'> = {}
): T => {
  return validateWithZod(body, schema, {
    source: 'body',
    errorMessage: options.errorMessage || 'Dati di input non validi',
    errorCode: options.errorCode || 'INVALID_REQUEST_BODY',
    abortEarly: options.abortEarly,
  });
};

/**
 * Valida i parametri della richiesta
 */
export const validateParams = <T>(
  params: any,
  schema: z.ZodSchema<T>,
  options: Omit<ValidationOptions, 'source'> = {}
): T => {
  return validateWithZod(params, schema, {
    source: 'params',
    errorMessage: options.errorMessage || 'Parametri richiesta non validi',
    errorCode: options.errorCode || 'INVALID_REQUEST_PARAMS',
    abortEarly: options.abortEarly,
  });
};

/**
 * Valida i parametri di query della richiesta
 */
export const validateQuery = <T>(
  query: any,
  schema: z.ZodSchema<T>,
  options: Omit<ValidationOptions, 'source'> = {}
): T => {
  return validateWithZod(query, schema, {
    source: 'query',
    errorMessage: options.errorMessage || 'Parametri di query non validi',
    errorCode: options.errorCode || 'INVALID_QUERY_PARAMS',
    abortEarly: options.abortEarly,
  });
};

/**
 * Valida gli header della richiesta
 */
export const validateHeaders = <T>(
  headers: any,
  schema: z.ZodSchema<T>,
  options: Omit<ValidationOptions, 'source'> = {}
): T => {
  return validateWithZod(headers, schema, {
    source: 'headers',
    errorMessage: options.errorMessage || 'Header richiesta non validi',
    errorCode: options.errorCode || 'INVALID_REQUEST_HEADERS',
    abortEarly: options.abortEarly,
  });
};

/**
 * Schema comune per la validazione degli ID (UUID)
 */
export const idSchema = z.object({
  id: z.string().uuid('ID non valido'),
});

/**
 * Schema comune per la paginazione
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Schema comune per le coordinate geografiche
 */
export const geoCoordinatesSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(0.1).max(50).default(5),
});

export default {
  validateBody,
  validateParams,
  validateQuery,
  validateHeaders,
  idSchema,
  paginationSchema,
  geoCoordinatesSchema,
};
