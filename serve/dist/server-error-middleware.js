"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchAsync = exports.createError = exports.notFoundHandler = exports.errorHandler = void 0;
const zod_1 = require("zod");
const logger_1 = require("../utils/logger");
/**
 * Middleware per gestire gli errori in modo centralizzato
 */
const errorHandler = (err, req, res, next) => {
    // Log dell'errore
    logger_1.logger.error(`${req.method} ${req.originalUrl}: ${err.message}`, {
        stack: err.stack,
        requestBody: req.body,
        requestParams: req.params,
        requestQuery: req.query,
    });
    // Errore di validazione Zod
    if (err instanceof zod_1.ZodError) {
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
    const appError = err;
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
    }
    else {
        // In sviluppo, fornire dettagli per il debug
        return res.status(500).json({
            success: false,
            message: 'Si è verificato un errore interno',
            error: err.message,
            stack: err.stack,
        });
    }
};
exports.errorHandler = errorHandler;
/**
 * Middleware per catturare le route non trovate
 */
const notFoundHandler = (req, res) => {
    logger_1.logger.warn(`Route non trovata: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        success: false,
        message: 'Risorsa non trovata',
    });
};
exports.notFoundHandler = notFoundHandler;
/**
 * Crea un errore operazionale con un codice di stato
 * @param message - Messaggio di errore
 * @param statusCode - Codice di stato HTTP
 */
const createError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
exports.createError = createError;
/**
 * Wrapper per le funzioni async dei controller
 * @param fn - Funzione async del controller
 */
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
exports.catchAsync = catchAsync;
