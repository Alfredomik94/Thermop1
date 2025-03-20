"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateParams = exports.validateBody = void 0;
const zod_1 = require("zod");
const validation_utils_1 = require("../../shared/utils/validation-utils");
const error_middleware_1 = require("./error-middleware");
/**
 * Factory di middleware per validare il corpo della richiesta
 * @param schema Schema Zod per la validazione
 * @returns Middleware Express
 */
const validateBody = (schema) => {
    return (req, res, next) => {
        try {
            // Valida il corpo della richiesta contro lo schema
            const validatedData = schema.parse(req.body);
            // Sostituisce il corpo della richiesta con i dati validati
            req.body = validatedData;
            // Procede con il prossimo middleware
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                // Formatta gli errori di validazione
                const formattedErrors = (0, validation_utils_1.formatZodError)(error);
                // Crea un errore applicativo
                const appError = (0, error_middleware_1.createAppError)('Dati di input non validi', 400, {
                    code: 'VALIDATION_ERROR',
                    errors: formattedErrors,
                    isOperational: true,
                });
                // Passa l'errore al gestore di errori
                next(appError);
            }
            else {
                // Passa altri errori al gestore di errori
                next(error);
            }
        }
    };
};
exports.validateBody = validateBody;
/**
 * Factory di middleware per validare i parametri della richiesta
 * @param schema Schema Zod per la validazione
 * @returns Middleware Express
 */
const validateParams = (schema) => {
    return (req, res, next) => {
        try {
            // Valida i parametri della richiesta contro lo schema
            const validatedData = schema.parse(req.params);
            // Sostituisce i parametri della richiesta con i dati validati
            req.params = validatedData;
            // Procede con il prossimo middleware
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                // Formatta gli errori di validazione
                const formattedErrors = (0, validation_utils_1.formatZodError)(error);
                // Crea un errore applicativo
                const appError = (0, error_middleware_1.createAppError)('Parametri richiesta non validi', 400, {
                    code: 'VALIDATION_ERROR',
                    errors: formattedErrors,
                    isOperational: true,
                });
                // Passa l'errore al gestore di errori
                next(appError);
            }
            else {
                // Passa altri errori al gestore di errori
                next(error);
            }
        }
    };
};
exports.validateParams = validateParams;
/**
 * Factory di middleware per validare i parametri di query della richiesta
 * @param schema Schema Zod per la validazione
 * @returns Middleware Express
 */
const validateQuery = (schema) => {
    return (req, res, next) => {
        try {
            // Valida i parametri di query della richiesta contro lo schema
            const validatedData = schema.parse(req.query);
            // Sostituisce i parametri di query della richiesta con i dati validati
            req.query = validatedData;
            // Procede con il prossimo middleware
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                // Formatta gli errori di validazione
                const formattedErrors = (0, validation_utils_1.formatZodError)(error);
                // Crea un errore applicativo
                const appError = (0, error_middleware_1.createAppError)('Parametri di query non validi', 400, {
                    code: 'VALIDATION_ERROR',
                    errors: formattedErrors,
                    isOperational: true,
                });
                // Passa l'errore al gestore di errori
                next(appError);
            }
            else {
                // Passa altri errori al gestore di errori
                next(error);
            }
        }
    };
};
exports.validateQuery = validateQuery;
exports.default = {
    validateBody: exports.validateBody,
    validateParams: exports.validateParams,
    validateQuery: exports.validateQuery
};
