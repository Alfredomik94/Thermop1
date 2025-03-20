import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

// Interfaccia per errori personalizzati
export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * Middleware per gestire gli errori in modo centralizzato
 */
export const errorHandler = (
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log dell'errore
  logger.error(`${req.method} ${req.originalUrl}: ${err.message}`, {
    stack: err.stack,
    requestBody: req.body,
    requestParams: req.params,
    requestQuery: req.query,
  });
  
  // Errore di validazione Zod
  if (err instanceof ZodError) {
    const errors = err.errors.map(e => ({
      path: e.path.join('.'),
      message: e.message,
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Errore di validazione',
      errors,
    });
  }
  
  // Errore operazionale personalizzato
  const appError = err as AppError;
  
  if (appError.isOperational) {
    return res.status(appError.statusCode || 500).json({
      success: false,
      message: appError.message,
    });
  }
  
  // Errore non gestito (errore di programmazione)
  if (process.env.NODE_ENV === 'production') {
    // In produzione, non esporre dettagli degli errori interni
    return res.status(500).json({
      success: false,
      message: 'Si è verificato un errore interno',
    });
  } else {
    // In sviluppo, fornire dettagli per il debug
    return res.status(500).json({
      success: false,
      message: 'Si è verificato un errore interno',
      error: err.message,
      stack: err.stack,
    });
  }
};

/**
 * Middleware per catturare le route non trovate
 */
export const notFoundHandler = (req: Request, res: Response) => {
  logger.warn(`Route non trovata: ${req.method} ${req.originalUrl}`);
  
  res.status(404).json({
    success: false,
    message: 'Risorsa non trovata',
  });
};

/**
 * Crea un errore operazionale con un codice di stato
 * @param message - Messaggio di errore
 * @param statusCode - Codice di stato HTTP
 */
export const createError = (message: string, statusCode: number): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  
  return error;
};

/**
 * Wrapper per le funzioni async dei controller
 * @param fn - Funzione async del controller
 */
export const catchAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
