"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.verifyEmail = exports.logout = exports.login = exports.register = void 0;
const storage_1 = require("../services/storage");
const thermopolio_shared_1 = require("thermopolio-shared");
const zod_1 = require("zod");
const register = async (req, res) => {
    try {
        const data = thermopolio_shared_1.insertUserSchema.parse(req.body);
        // Verifica se l'utente esiste già
        const existingUser = await storage_1.storage.getUserByUsername(data.username);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Username già esistente',
            });
        }
        const user = await storage_1.storage.createUser(data);
        // Crea token di verifica e simulazione invio email
        const token = await storage_1.storage.createEmailVerification(user.id);
        console.log(`Token di verifica per ${data.username}: ${token}`);
        // Crea sessione utente
        req.session.userId = user.id;
        req.session.userType = user.userType;
        // Rimuovi la password dalla risposta
        const { password, ...userWithoutPassword } = user;
        res.status(201).json({
            success: true,
            message: 'Utente registrato con successo',
            data: userWithoutPassword,
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                success: false,
                message: 'Dati non validi',
                errors: error.errors.map(e => e.message),
            });
        }
        else {
            console.error('Error during registration:', error);
            res.status(500).json({
                success: false,
                message: 'Errore durante la registrazione',
            });
        }
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { username, password } = thermopolio_shared_1.loginSchema.parse(req.body);
        const user = await storage_1.storage.getUserByUsername(username);
        if (!user || user.password !== password) {
            return res.status(401).json({
                success: false,
                message: 'Credenziali non valide',
            });
        }
        // Crea sessione utente
        req.session.userId = user.id;
        req.session.userType = user.userType;
        // Rimuovi la password dalla risposta
        const { password: _, ...userWithoutPassword } = user;
        res.json({
            success: true,
            message: 'Login effettuato con successo',
            data: userWithoutPassword,
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                success: false,
                message: 'Dati non validi',
                errors: error.errors.map(e => e.message),
            });
        }
        else {
            console.error('Error during login:', error);
            res.status(500).json({
                success: false,
                message: 'Errore durante il login',
            });
        }
    }
};
exports.login = login;
const logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error during logout:', err);
            return res.status(500).json({
                success: false,
                message: 'Errore durante il logout',
            });
        }
        res.json({
            success: true,
            message: 'Logout effettuato con successo',
        });
    });
};
exports.logout = logout;
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const isValid = await storage_1.storage.verifyEmail(token);
        if (isValid) {
            res.json({
                success: true,
                message: 'Email verificata con successo',
            });
        }
        else {
            res.status(400).json({
                success: false,
                message: 'Token di verifica non valido o scaduto',
            });
        }
    }
    catch (error) {
        console.error('Error during email verification:', error);
        res.status(500).json({
            success: false,
            message: 'Errore durante la verifica dell\'email',
        });
    }
};
exports.verifyEmail = verifyEmail;
const getCurrentUser = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Non autenticato',
            });
        }
        const user = await storage_1.storage.getUser(req.session.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utente non trovato',
            });
        }
        // Rimuovi la password dalla risposta
        const { password, ...userWithoutPassword } = user;
        res.json({
            success: true,
            data: userWithoutPassword,
        });
    }
    catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500).json({
            success: false,
            message: 'Errore durante il recupero dell\'utente',
        });
    }
};
exports.getCurrentUser = getCurrentUser;
exports.default = {
    register: exports.register,
    login: exports.login,
    logout: exports.logout,
    verifyEmail: exports.verifyEmail,
    getCurrentUser: exports.getCurrentUser,
};
