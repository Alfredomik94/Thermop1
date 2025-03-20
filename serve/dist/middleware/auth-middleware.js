"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.errorMiddleware = exports.onlusMiddleware = exports.restaurantMiddleware = exports.customerMiddleware = exports.roleMiddleware = exports.authMiddleware = void 0;
const usersDb = __importStar(require("../db/users-db.js"));
/**
 * Middleware per verificare se l'utente è autenticato
 */
const authMiddleware = async (req, res, next) => {
    try {
        // Verifica se l'utente è autenticato (ha un userId in sessione)
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Non autorizzato. Effettua il login.' });
        }
        // Se abbiamo già i dati dell'utente in sessione, li riutilizziamo
        if (!req.session.user) {
            // Altrimenti li recuperiamo dal database
            const user = await usersDb.getUserById(req.session.userId);
            if (!user) {
                // Se l'utente non esiste più, cancella la sessione
                req.session.destroy((err) => {
                    if (err)
                        console.error('Errore nella distruzione della sessione:', err);
                });
                return res.status(401).json({ message: 'Sessione non valida. Effettua nuovamente il login.' });
            }
            // Memorizza l'utente nella sessione per riutilizzarlo
            req.session.user = user;
        }
        next();
    }
    catch (error) {
        console.error('Errore nel middleware di autenticazione:', error);
        res.status(500).json({ message: 'Errore del server' });
    }
};
exports.authMiddleware = authMiddleware;
/**
 * Middleware per verificare se l'utente ha un ruolo specifico
 *
 * @param allowedRoles Array di ruoli consentiti
 */
const roleMiddleware = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            // Verifica se l'utente è autenticato
            if (!req.session.userId || !req.session.user) {
                return res.status(401).json({ message: 'Non autorizzato. Effettua il login.' });
            }
            const user = req.session.user;
            // Verifica se l'utente ha uno dei ruoli consentiti
            if (!allowedRoles.includes(user.user_type)) {
                return res.status(403).json({ message: 'Accesso negato. Non hai i permessi necessari.' });
            }
            next();
        }
        catch (error) {
            console.error('Errore nel middleware di ruolo:', error);
            res.status(500).json({ message: 'Errore del server' });
        }
    };
};
exports.roleMiddleware = roleMiddleware;
/**
 * Middleware specifico per gli utenti di tipo cliente
 */
exports.customerMiddleware = (0, exports.roleMiddleware)(['customer']);
/**
 * Middleware specifico per gli utenti di tipo ristorante (tavola calda)
 */
exports.restaurantMiddleware = (0, exports.roleMiddleware)(['tavola_calda']);
/**
 * Middleware specifico per gli utenti di tipo ONLUS
 */
exports.onlusMiddleware = (0, exports.roleMiddleware)(['onlus']);
/**
 * Middleware per la gestione centralizzata degli errori
 */
const errorMiddleware = (err, req, res, next) => {
    console.error('Errore:', err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Si è verificato un errore interno del server';
    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};
exports.errorMiddleware = errorMiddleware;
const zod_1 = require("zod");
/**
 * Middleware per la validazione degli input con Zod
 *
 * @param schema Schema Zod per la validazione
 */
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            // Valida la richiesta contro lo schema
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (error) {
            // Gestione degli errori di validazione Zod
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Dati di input non validi',
                    errors: error.errors,
                });
            }
            next(error);
        }
    };
};
exports.validate = validate;
// server/config/session-config.ts
const express_session_1 = __importDefault(require("express-session"));
const dotenv_1 = __importDefault(require("dotenv"));
// Carica le variabili d'ambiente
dotenv_1.default.config();
const ONE_DAY = 1000 * 60 * 60 * 24;
/**
 * Configurazione della sessione
 */
const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: ONE_DAY,
    },
};
/**
 * Middleware per la gestione delle sessioni
 */
const sessionMiddleware = (0, express_session_1.default)(sessionConfig);
exports.default = sessionMiddleware;
