/**
 * Middleware per la gestione centralizzata degli errori
 */
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { formatZodError } from '../../shared/utils/validation-utils';
import { logger } from '../utils/logger';

// Interfaccia per errori personalizzati dell'applicazione
export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  errors?: Record<string, string[]>;
  isOperational?: boolean;
}

/**
 * Middleware per la gestione degli errori non gestiti
 */
export const errorHandler = (
  err: AppError | Error | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Imposta valori predefiniti
  let statusCode = 500;
  let message = 'Si è verificato un errore sul server';
  let errors: Record<string, string[]> | undefined;
  let errorCode: string | undefined;
  let isOperational = false;

  // Log dell'errore
  logger.error({
    message: `Error: ${err.message}`,
    path: req.path,
    method: req.method,
    ip: req.ip,
    stack: err.stack,
  });

  // Gestione di errori Zod (validazione)
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Dati di input non validi';
    errors = formatZodError(err);
    isOperational = true;
  }
  // Gestione di errori personalizzati dell'applicazione
  else if ('statusCode' in err) {
    statusCode = err.statusCode || 500;
    message = err.message || 'Si è verificato un errore';
    errorCode = err.code;
    errors = err.errors;
    isOperational = err.isOperational || false;
  }

  // In produzione non mostriamo stack trace o dettagli per errori non operazionali
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (!isDevelopment && !isOperational) {
    message = 'Si è verificato un errore. Riprova più tardi.';
    errors = undefined;
  }

  // Invia la risposta di errore
  res.status(statusCode).json({
    status: 'error',
    message,
    code: errorCode,
    errors,
    ...(isDevelopment && { stack: err.stack }),
  });
};

/**
 * Middleware per gestire le richieste a percorsi non esistenti
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: `Percorso non trovato: ${req.originalUrl}`,
  });
};

/**
 * Crea un errore personalizzato dell'applicazione
 */
export const createAppError = (
  message: string,
  statusCode: number = 500,
  options: {
    code?: string;
    errors?: Record<string, string[]>;
    isOperational?: boolean;
  } = {}
): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.code = options.code;
  error.errors = options.errors;
  error.isOperational = options.isOperational !== undefined ? options.isOperational : true;
  return error;
};

/**
 * Gestore per le eccezioni non catturate
 */
export const setupUncaughtExceptionHandlers = () => {
  // Gestione delle eccezioni non catturate
  process.on('uncaughtException', (err) => {
    logger.error({
      message: 'UNCAUGHT EXCEPTION',
      error: err.message,
      stack: err.stack,
    });
    
    // In produzione chiudiamo il processo per consentire il riavvio
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });

  // Gestione delle promesse rifiutate non gestite
  process.on('unhandledRejection', (reason, promise) => {
    logger.error({
      message: 'UNHANDLED REJECTION',
      reason,
      promise,
    });
    
    // In produzione chiudiamo il processo per consentire il riavvio
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });
};

export default {
  errorHandler,
  notFoundHandler,
  createAppError,
  setupUncaughtExceptionHandlers,
};
