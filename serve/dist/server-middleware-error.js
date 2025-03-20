"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupUncaughtExceptionHandlers = exports.createAppError = exports.notFoundHandler = exports.errorHandler = void 0;
const zod_1 = require("zod");
const validation_utils_1 = require("../../shared/utils/validation-utils");
const logger_1 = require("../utils/logger");
/**
 * Middleware per la gestione degli errori non gestiti
 */
const errorHandler = (err, req, res, next) => {
    // Imposta valori predefiniti
    let statusCode = 500;
    let message = 'Si è verificato un errore sul server';
    let errors;
    let errorCode;
    let isOperational = false;
    // Log dell'errore
    logger_1.logger.error({
        message: `Error: ${err.message}`,
        path: req.path,
        method: req.method,
        ip: req.ip,
        stack: err.stack,
    });
    // Gestione di errori Zod (validazione)
    if (err instanceof zod_1.ZodError) {
        statusCode = 400;
        message = 'Dati di input non validi';
        errors = (0, validation_utils_1.formatZodError)(err);
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
exports.errorHandler = errorHandler;
/**
 * Middleware per gestire le richieste a percorsi non esistenti
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        status: 'error',
        message: `Percorso non trovato: ${req.originalUrl}`,
    });
};
exports.notFoundHandler = notFoundHandler;
/**
 * Crea un errore personalizzato dell'applicazione
 */
const createAppError = (message, statusCode = 500, options = {}) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.code = options.code;
    error.errors = options.errors;
    error.isOperational = options.isOperational !== undefined ? options.isOperational : true;
    return error;
};
exports.createAppError = createAppError;
/**
 * Gestore per le eccezioni non catturate
 */
const setupUncaughtExceptionHandlers = () => {
    // Gestione delle eccezioni non catturate
    process.on('uncaughtException', (err) => {
        logger_1.logger.error({
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
        logger_1.logger.error({
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
exports.setupUncaughtExceptionHandlers = setupUncaughtExceptionHandlers;
exports.default = {
    errorHandler: exports.errorHandler,
    notFoundHandler: exports.notFoundHandler,
    createAppError: exports.createAppError,
    setupUncaughtExceptionHandlers: exports.setupUncaughtExceptionHandlers,
};
