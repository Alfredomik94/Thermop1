"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOperationalError = exports.formatError = exports.handleError = exports.createAppError = void 0;
/**
 * Utility per la gestione degli errori
 */
const zod_1 = require("zod");
const validation_utils_1 = require("../../shared/utils/validation-utils");
const logger_1 = require("./logger");
/**
 * Crea un nuovo errore dell'applicazione
 * @param message Messaggio di errore
 * @param statusCode Codice di stato HTTP
 * @param options Opzioni aggiuntive
 */
const createAppError = (message, statusCode = 500, options = {}) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.code = options.code;
    error.errors = options.errors;
    error.isOperational = options.isOperational !== undefined ? options.isOperational : true;
    error.originalError = options.originalError;
    // Cattura lo stack trace
    Error.captureStackTrace(error, exports.createAppError);
    return error;
};
exports.createAppError = createAppError;
/**
 * Elabora un errore e lo converte in un AppError standardizzato
 * @param error Errore da elaborare
 */
const handleError = (error) => {
    var _a;
    // Se è già un AppError, restituiscilo com'è
    if ('statusCode' in error && 'isOperational' in error) {
        return error;
    }
    // Gestione degli errori di validazione Zod
    if (error instanceof zod_1.ZodError) {
        const formattedErrors = (0, validation_utils_1.formatZodError)(error);
        return (0, exports.createAppError)('Errore di validazione', 400, {
            code: 'VALIDATION_ERROR',
            errors: formattedErrors,
            isOperational: true,
            originalError: error,
        });
    }
    // Gestione degli errori di Supabase
    if ((error === null || error === void 0 ? void 0 : error.name) === 'PostgrestError' || ((_a = error === null || error === void 0 ? void 0 : error.code) === null || _a === void 0 ? void 0 : _a.startsWith('PGRST'))) {
        return (0, exports.createAppError)(error.message || 'Errore del database', 400, {
            code: error.code || 'DATABASE_ERROR',
            isOperational: true,
            originalError: error,
        });
    }
    // Gestione degli errori di autenticazione JWT
    if ((error === null || error === void 0 ? void 0 : error.name) === 'JsonWebTokenError' || (error === null || error === void 0 ? void 0 : error.name) === 'TokenExpiredError') {
        return (0, exports.createAppError)('Sessione non valida o scaduta', 401, {
            code: 'INVALID_TOKEN',
            isOperational: true,
            originalError: error,
        });
    }
    // Errore non gestito - lo logghiamo come critico
    logger_1.logger.error({
        message: 'Errore non gestito',
        error: error.message,
        stack: error.stack,
        data: error,
    });
    // Restituisci un errore generico del server
    return (0, exports.createAppError)('Si è verificato un errore interno', 500, {
        code: 'INTERNAL_SERVER_ERROR',
        isOperational: false,
        originalError: error,
    });
};
exports.handleError = handleError;
/**
 * Formatta un AppError per l'invio al client
 * @param error Errore da formattare
 * @param includeStack Se includere lo stack trace
 */
const formatError = (error, includeStack = false) => {
    const response = {
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
exports.formatError = formatError;
/**
 * Determina se un errore è operazionale (previsto) o programmazione (bug)
 * @param error Errore da valutare
 */
const isOperationalError = (error) => {
    if ('isOperational' in error) {
        return error.isOperational;
    }
    return false;
};
exports.isOperationalError = isOperationalError;
exports.default = {
    createAppError: exports.createAppError,
    handleError: exports.handleError,
    formatError: exports.formatError,
    isOperationalError: exports.isOperationalError,
};
