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
exports.resendVerification = exports.getCurrentUser = exports.resetPassword = exports.forgotPassword = exports.verifyEmail = exports.logout = exports.login = exports.register = void 0;
// server/routes/auth-routes.ts
const express_1 = __importDefault(require("express"));
const authController = __importStar(require("../controllers/auth-controller.js"));
const validation_middleware_js_1 = require("../middleware/validation-middleware.js");
const user_schema_js_1 = require("../../shared/schema/user-schema.js");
const auth_middleware_js_1 = require("../middleware/auth-middleware.js");
const router = express_1.default.Router();
// Route pubbliche (non richiedono autenticazione)
router.post('/register', (0, validation_middleware_js_1.validate)(user_schema_js_1.registerUserSchema), authController.register);
router.post('/login', (0, validation_middleware_js_1.validate)(user_schema_js_1.loginSchema), authController.login);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
// Route che richiedono autenticazione
router.use(auth_middleware_js_1.authMiddleware);
router.get('/me', authController.getCurrentUser);
router.post('/logout', authController.logout);
router.post('/resend-verification', authController.resendVerification);
exports.default = router;
const authService = __importStar(require("../services/auth-service.js"));
const usersDb = __importStar(require("../db/users-db.js"));
/**
 * Registra un nuovo utente
 */
const register = async (req, res) => {
    try {
        // Estrai i dati dalla richiesta
        const userData = req.body;
        // Registra l'utente
        const user = await authService.registerUser(userData);
        // Imposta la sessione
        req.session.userId = user.id;
        req.session.user = user;
        // Rimuovi la password dalla risposta
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
    }
    catch (error) {
        console.error('Errore nella registrazione:', error);
        res.status(400).json({ message: error.message || 'Errore nella registrazione' });
    }
};
exports.register = register;
/**
 * Effettua il login di un utente
 */
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        // Effettua il login
        const user = await authService.loginUser(username, password);
        // Imposta la sessione
        req.session.userId = user.id;
        req.session.user = user;
        // Rimuovi la password dalla risposta
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    }
    catch (error) {
        console.error('Errore nel login:', error);
        res.status(401).json({ message: error.message || 'Credenziali non valide' });
    }
};
exports.login = login;
/**
 * Effettua il logout dell'utente corrente
 */
const logout = (req, res) => {
    // Distruggi la sessione
    req.session.destroy((err) => {
        if (err) {
            console.error('Errore nel logout:', err);
            return res.status(500).json({ message: 'Errore nel logout' });
        }
        // Cancella il cookie di sessione
        res.clearCookie('connect.sid');
        res.json({ message: 'Logout effettuato con successo' });
    });
};
exports.logout = logout;
/**
 * Verifica un token di email
 */
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        // Verifica l'email
        const result = await authService.verifyEmail(token);
        res.json({ message: 'Email verificata con successo' });
    }
    catch (error) {
        console.error('Errore nella verifica dell\'email:', error);
        res.status(400).json({ message: error.message || 'Token di verifica non valido' });
    }
};
exports.verifyEmail = verifyEmail;
/**
 * Richiede un reset della password
 */
const forgotPassword = async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ message: 'Username richiesto' });
        }
        // Richiedi il reset
        await authService.requestPasswordReset(username);
        // Restituisci sempre una risposta positiva per motivi di sicurezza
        // (non vogliamo rivelare se l'username esiste o meno)
        res.json({ message: 'Se l\'username esiste, riceverai un\'email con le istruzioni per il reset della password' });
    }
    catch (error) {
        console.error('Errore nella richiesta di reset della password:', error);
        // Restituisci sempre una risposta positiva per motivi di sicurezza
        res.json({ message: 'Se l\'username esiste, riceverai un\'email con le istruzioni per il reset della password' });
    }
};
exports.forgotPassword = forgotPassword;
/**
 * Reimposta la password di un utente
 */
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token e nuova password richiesti' });
        }
        // Reimposta la password
        await authService.resetPassword(token, newPassword);
        res.json({ message: 'Password reimpostata con successo' });
    }
    catch (error) {
        console.error('Errore nel reset della password:', error);
        res.status(400).json({ message: error.message || 'Token non valido o scaduto' });
    }
};
exports.resetPassword = resetPassword;
/**
 * Ottiene l'utente corrente
 */
const getCurrentUser = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Non autenticato' });
        }
        // Recupera l'utente dal database
        const user = await usersDb.getUserById(req.session.userId);
        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }
        // Rimuovi la password dalla risposta
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    }
    catch (error) {
        console.error('Errore nel recupero dell\'utente corrente:', error);
        res.status(500).json({ message: error.message || 'Errore nel recupero dell\'utente' });
    }
};
exports.getCurrentUser = getCurrentUser;
/**
 * Rinvia l'email di verifica
 */
const resendVerification = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Non autenticato' });
        }
        // Recupera l'utente
        const user = await usersDb.getUserById(req.session.userId);
        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }
        // Verifica se l'email è già verificata
        if (user.email_verified) {
            return res.status(400).json({ message: 'Email già verificata' });
        }
        // Crea un nuovo token e invia l'email
        await authService.createVerificationToken(user.id);
        res.json({ message: 'Email di verifica inviata' });
    }
    catch (error) {
        console.error('Errore nell\'invio dell\'email di verifica:', error);
        res.status(500).json({ message: error.message || 'Errore nell\'invio dell\'email di verifica' });
    }
};
exports.resendVerification = resendVerification;
