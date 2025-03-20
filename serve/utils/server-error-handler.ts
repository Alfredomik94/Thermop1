/**
 * Utility per la gestione degli errori
 */
import { ZodError } from 'zod';
import { formatZodError } from '../../shared/utils/validation-utils';
import { logger } from './logger';

/**
 * Interfaccia per gli errori dell'applicazione
 */
export interface AppError extends Error {
  statusCode: number;
  code?: string;
  errors?: Record<string, string[]>;
  isOperational: boolean;
  originalError?: Error;
}

/**
 * Crea un nuovo errore dell'applicazione
 * @param message Messaggio di errore
 * @param statusCode Codice di stato HTTP
 * @param options Opzioni aggiuntive
 */
export const createAppError = (
  message: string,
  statusCode: number = 500,
  options: {
    code?: string;
    errors?: Record<string, string[]>;
    isOperational?: boolean;
    originalError?: Error;
  } = {}
): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.code = options.code;
  error.errors = options.errors;
  error.isOperational = options.isOperational !== undefined ? options.isOperational : true;
  error.originalError = options.originalError;
  
  // Cattura lo stack trace
  Error.captureStackTrace(error, createAppError);
  
  return error;
};

/**
 * Elabora un errore e lo converte in un AppError standardizzato
 * @param error Errore da elaborare
 */
export const handleError = (error: any): AppError => {
  // Se è già un AppError, restituiscilo com'è
  if ('statusCode' in error && 'isOperational' in error) {
    return error as AppError;
  }
  
  // Gestione degli errori di validazione Zod
  if (error instanceof ZodError) {
    const formattedErrors = formatZodError(error);
    return createAppError('Errore di validazione', 400, {
      code: 'VALIDATION_ERROR',
      errors: formattedErrors,
      isOperational: true,
      originalError: error,
    });
  }
  
  // Gestione degli errori di Supabase
  if (error?.name === 'PostgrestError' || error?.code?.startsWith('PGRST')) {
    return createAppError(
      error.message || 'Errore del database',
      400,
      {
        code: error.code || 'DATABASE_ERROR',
        isOperational: true,
        originalError: error,
      }
    );
  }
  
  // Gestione degli errori di autenticazione JWT
  if (error?.name === 'JsonWebTokenError' || error?.name === 'TokenExpiredError') {
    return createAppError(
      'Sessione non valida o scaduta',
      401,
      {
        code: 'INVALID_TOKEN',
        isOperational: true,
        originalError: error,
      }
    );
  }
  
  // Errore non gestito - lo logghiamo come critico
  logger.error({
    message: 'Errore non gestito',
    error: error.message,
    stack: error.stack,
    data: error,
  });
  
  // Restituisci un errore generico del server
  return createAppError(
    'Si è verificato un errore interno',
    500,
    {
      code: 'INTERNAL_SERVER_ERROR',
      isOperational: false,
      originalError: error,
    }
  );
};

/**
 * Formatta un AppError per l'invio al client
 * @param error Errore da formattare
 * @param includeStack Se includere lo stack trace
 */
export const formatError = (error: AppError, includeStack = false): Record<string, any> => {
  const response: Record<string, any> = {
    status: 'error',
    message: error.message,
    statusCode: error.statusCode,
  };
  
  if (error.code) {
    response.code = error.code;
  }
  
  if (error.errors) {
    response.errors = error.errors;
  }
  
  // Includi lo stack trace solo in sviluppo o se richiesto esplicitamente
  if ((process.env.NODE_ENV === 'development' || includeStack) && error.stack) {
    response.stack = error.stack;
  }
  
  return response;
};

/**
 * Determina se un errore è operazionale (previsto) o programmazione (bug)
 * @param error Errore da valutare
 */
export const isOperationalError = (error: Error): boolean => {
  if ('isOperational' in error) {
    return (error as AppError).isOperational;
  }
  return false;
};

export default {
  createAppError,
  handleError,
  formatError,
  isOperationalError,
};
