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
exports.sendDonationConfirmationEmail = exports.sendOrderStatusUpdateEmail = exports.sendOrderConfirmationEmail = exports.sendPasswordResetEmail = exports.sendVerificationEmail = exports.resetPassword = exports.requestPasswordReset = exports.verifyEmail = exports.createVerificationToken = exports.loginUser = exports.registerUser = void 0;
// server/services/auth-service.ts
const usersDb = __importStar(require("../db/users-db.js"));
const emailService = __importStar(require("./email-service.js"));
const notificationService = __importStar(require("./notification-service.js"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
/**
 * Registra un nuovo utente
 *
 * @param userData Dati dell'utente da registrare
 * @returns Utente registrato
 */
const registerUser = async (userData) => {
    try {
        // Verifica se l'utente esiste già
        const existingUser = await usersDb.getUserByUsername(userData.username);
        if (existingUser) {
            throw new Error('Username già in uso');
        }
        // Cripta la password
        const hashedPassword = await bcrypt_1.default.hash(userData.password, 10);
        // Prepara i dati per il database (converti da camelCase a snake_case)
        const dbData = {
            ...userData,
            password: hashedPassword,
            user_type: userData.userType,
            business_name: userData.businessName,
            business_type: userData.businessType,
            assistance_type: userData.assistanceType,
            favorite_restaurants: userData.favoriteRestaurants || [],
            email_verified: false,
        };
        // Elimina i campi camelCase che abbiamo convertito
        delete dbData.userType;
        delete dbData.businessName;
        delete dbData.businessType;
        delete dbData.assistanceType;
        delete dbData.favoriteRestaurants;
        // Crea l'utente
        const user = await usersDb.createUser(dbData);
        // Crea token di verifica email
        await (0, exports.createVerificationToken)(user.id);
        // Invia una notifica di benvenuto
        await notificationService.sendSystemNotification(user.id, 'Benvenuto su Thermopolio', `Grazie per esserti registrato su Thermopolio, ${user.name}!`);
        return user;
    }
    catch (error) {
        console.error('Errore nella registrazione dell\'utente:', error);
        throw error;
    }
};
exports.registerUser = registerUser;
/**
 * Effettua il login di un utente
 *
 * @param username Username
 * @param password Password
 * @returns Utente autenticato
 */
const loginUser = async (username, password) => {
    try {
        // Recupera l'utente
        const user = await usersDb.getUserByUsername(username);
        if (!user) {
            throw new Error('Credenziali non valide');
        }
        // Verifica la password
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Credenziali non valide');
        }
        return user;
    }
    catch (error) {
        console.error('Errore nel login dell\'utente:', error);
        throw error;
    }
};
exports.loginUser = loginUser;
/**
 * Crea un token di verifica email
 *
 * @param userId ID dell'utente
 * @returns Token di verifica
 */
const createVerificationToken = async (userId) => {
    try {
        const token = (0, uuid_1.v4)();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // 24 ore di validità
        const verificationToken = await usersDb.createEmailVerificationToken({
            user_id: userId,
            token,
            expires_at: expiresAt.toISOString(),
        });
        // Recupera l'utente per inviare l'email
        const user = await usersDb.getUserById(userId);
        // Invia l'email di verifica
        await emailService.sendVerificationEmail(user.username, token);
        return verificationToken;
    }
    catch (error) {
        console.error('Errore nella creazione del token di verifica:', error);
        throw error;
    }
};
exports.createVerificationToken = createVerificationToken;
/**
 * Verifica un token di email
 *
 * @param token Token da verificare
 * @returns Risultato della verifica
 */
const verifyEmail = async (token) => {
    try {
        return await usersDb.verifyEmail(token);
    }
    catch (error) {
        console.error('Errore nella verifica dell\'email:', error);
        throw error;
    }
};
exports.verifyEmail = verifyEmail;
/**
 * Richiede un reset della password
 *
 * @param username Username dell'utente
 * @returns Token di reset
 */
const requestPasswordReset = async (username) => {
    try {
        // Verifica se l'utente esiste
        const user = await usersDb.getUserByUsername(username);
        if (!user) {
            throw new Error('Utente non trovato');
        }
        // Crea un token di reset
        const token = (0, uuid_1.v4)();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1); // 1 ora di validità
        // Salva il token (in un'implementazione reale, avresti una tabella apposita)
        // Invia l'email di reset
        await emailService.sendPasswordResetEmail(username, token);
        return { success: true };
    }
    catch (error) {
        console.error('Errore nella richiesta di reset della password:', error);
        throw error;
    }
};
exports.requestPasswordReset = requestPasswordReset;
/**
 * Reimposta la password di un utente
 *
 * @param token Token di reset
 * @param newPassword Nuova password
 * @returns Risultato del reset
 */
const resetPassword = async (token, newPassword) => {
    try {
        // Verifica il token (in un'implementazione reale, verificheresti dalla tabella)
        // Estrai l'ID utente dal token
        const userId = 1; // Placeholder
        // Cripta la nuova password
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        // Aggiorna la password
        await usersDb.updateUser(userId, { password: hashedPassword });
        // Elimina il token (in un'implementazione reale)
        return { success: true };
    }
    catch (error) {
        console.error('Errore nel reset della password:', error);
        throw error;
    }
};
exports.resetPassword = resetPassword;
// server/services/email-service.ts
/**
 * Invia un'email di verifica
 *
 * @param email Email del destinatario
 * @param token Token di verifica
 * @returns Risultato dell'invio
 */
const sendVerificationEmail = async (email, token) => {
    // In un ambiente reale, utilizzeresti un servizio di email come SendGrid, Mailgun, etc.
    console.log(`
    ==========================================
    Email di verifica inviata a ${email}
    Token: ${token}
    Link: http://localhost:5173/verify-email/${token}
    ==========================================
  `);
    return { success: true };
};
exports.sendVerificationEmail = sendVerificationEmail;
/**
 * Invia un'email di reset password
 *
 * @param email Email del destinatario
 * @param token Token di reset
 * @returns Risultato dell'invio
 */
const sendPasswordResetEmail = async (email, token) => {
    // In un ambiente reale, utilizzeresti un servizio di email
    console.log(`
    ==========================================
    Email di reset password inviata a ${email}
    Token: ${token}
    Link: http://localhost:5173/reset-password/${token}
    ==========================================
  `);
    return { success: true };
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
/**
 * Invia un'email di conferma ordine
 *
 * @param email Email del destinatario
 * @param order Dettagli dell'ordine
 * @returns Risultato dell'invio
 */
const sendOrderConfirmationEmail = async (email, order) => {
    // In un ambiente reale, utilizzeresti un servizio di email
    console.log(`
    ==========================================
    Email di conferma ordine inviata a ${email}
    Ordine: ${JSON.stringify(order)}
    ==========================================
  `);
    return { success: true };
};
exports.sendOrderConfirmationEmail = sendOrderConfirmationEmail;
/**
 * Invia un'email di aggiornamento stato ordine
 *
 * @param email Email del destinatario
 * @param orderId ID dell'ordine
 * @param status Nuovo stato
 * @returns Risultato dell'invio
 */
const sendOrderStatusUpdateEmail = async (email, orderId, status) => {
    // In un ambiente reale, utilizzeresti un servizio di email
    console.log(`
    ==========================================
    Email di aggiornamento stato ordine inviata a ${email}
    Ordine: ${orderId}
    Stato: ${status}
    ==========================================
  `);
    return { success: true };
};
exports.sendOrderStatusUpdateEmail = sendOrderStatusUpdateEmail;
/**
 * Invia un'email di conferma donazione
 *
 * @param email Email del destinatario
 * @param order Dettagli dell'ordine donato
 * @param onlus Dettagli della ONLUS destinataria
 * @returns Risultato dell'invio
 */
const sendDonationConfirmationEmail = async (email, order, onlus) => {
    // In un ambiente reale, utilizzeresti un servizio di email
    console.log(`
    ==========================================
    Email di conferma donazione inviata a ${email}
    Ordine: ${JSON.stringify(order)}
    ONLUS: ${JSON.stringify(onlus)}
    ==========================================
  `);
    return { success: true };
};
exports.sendDonationConfirmationEmail = sendDonationConfirmationEmail;
