"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geoCoordinatesSchema = exports.paginationSchema = exports.idSchema = exports.validateHeaders = exports.validateQuery = exports.validateParams = exports.validateBody = exports.validateWithZod = void 0;
/**
 * Utility per la validazione dei dati
 */
const zod_1 = require("zod");
const error_handler_1 = require("./error-handler");
/**
 * Valida i dati in base a uno schema Zod
 * @param data Dati da validare
 * @param schema Schema Zod
 * @param options Opzioni di validazione
 */
const validateWithZod = (data, schema, options) => {
    try {
        // Ottiene il risultato della validazione
        return schema.parse(data);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            // Formatta gli errori Zod
            const formattedErrors = {};
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
            throw (0, error_handler_1.createAppError)(errorMessage, 400, {
                code: options.errorCode || 'VALIDATION_ERROR',
                errors: formattedErrors,
                isOperational: true,
            });
        }
        // In caso di altri errori, li rilancia
        throw error;
    }
};
exports.validateWithZod = validateWithZod;
/**
 * Valida il corpo della richiesta
 */
const validateBody = (body, schema, options = {}) => {
    return (0, exports.validateWithZod)(body, schema, {
        source: 'body',
        errorMessage: options.errorMessage || 'Dati di input non validi',
        errorCode: options.errorCode || 'INVALID_REQUEST_BODY',
        abortEarly: options.abortEarly,
    });
};
exports.validateBody = validateBody;
/**
 * Valida i parametri della richiesta
 */
const validateParams = (params, schema, options = {}) => {
    return (0, exports.validateWithZod)(params, schema, {
        source: 'params',
        errorMessage: options.errorMessage || 'Parametri richiesta non validi',
        errorCode: options.errorCode || 'INVALID_REQUEST_PARAMS',
        abortEarly: options.abortEarly,
    });
};
exports.validateParams = validateParams;
/**
 * Valida i parametri di query della richiesta
 */
const validateQuery = (query, schema, options = {}) => {
    return (0, exports.validateWithZod)(query, schema, {
        source: 'query',
        errorMessage: options.errorMessage || 'Parametri di query non validi',
        errorCode: options.errorCode || 'INVALID_QUERY_PARAMS',
        abortEarly: options.abortEarly,
    });
};
exports.validateQuery = validateQuery;
/**
 * Valida gli header della richiesta
 */
const validateHeaders = (headers, schema, options = {}) => {
    return (0, exports.validateWithZod)(headers, schema, {
        source: 'headers',
        errorMessage: options.errorMessage || 'Header richiesta non validi',
        errorCode: options.errorCode || 'INVALID_REQUEST_HEADERS',
        abortEarly: options.abortEarly,
    });
};
exports.validateHeaders = validateHeaders;
/**
 * Schema comune per la validazione degli ID (UUID)
 */
exports.idSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('ID non valido'),
});
/**
 * Schema comune per la paginazione
 */
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(10),
    sortBy: zod_1.z.string().optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
/**
 * Schema comune per le coordinate geografiche
 */
exports.geoCoordinatesSchema = zod_1.z.object({
    lat: zod_1.z.coerce.number().min(-90).max(90),
    lng: zod_1.z.coerce.number().min(-180).max(180),
    radius: zod_1.z.coerce.number().min(0.1).max(50).default(5),
});
exports.default = {
    validateBody: exports.validateBody,
    validateParams: exports.validateParams,
    validateQuery: exports.validateQuery,
    validateHeaders: exports.validateHeaders,
    idSchema: exports.idSchema,
    paginationSchema: exports.paginationSchema,
    geoCoordinatesSchema: exports.geoCoordinatesSchema,
};
