// server/routes/auth-routes.ts
import express from 'express';
import * as authController from '../controllers/auth-controller.js';
import { validate } from '../middleware/validation-middleware.js';
import { registerUserSchema, loginSchema } from '../../shared/schema/user-schema.js';
import { authMiddleware } from '../middleware/auth-middleware.js';

const router = express.Router();

// Route pubbliche (non richiedono autenticazione)
router.post('/register', validate(registerUserSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Route che richiedono autenticazione
router.use(authMiddleware);
router.get('/me', authController.getCurrentUser);
router.post('/logout', authController.logout);
router.post('/resend-verification', authController.resendVerification);

export default router;

// server/controllers/auth-controller.ts
import { Request, Response } from 'express';
import * as authService from '../services/auth-service.js';
import * as usersDb from '../db/users-db.js';

/**
 * Registra un nuovo utente
 */
export const register = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    console.error('Errore nella registrazione:', error);
    res.status(400).json({ message: error.message || 'Errore nella registrazione' });
  }
};

/**
 * Effettua il login di un utente
 */
export const login = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    console.error('Errore nel login:', error);
    res.status(401).json({ message: error.message || 'Credenziali non valide' });
  }
};

/**
 * Effettua il logout dell'utente corrente
 */
export const logout = (req: Request, res: Response) => {
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

/**
 * Verifica un token di email
 */
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    
    // Verifica l'email
    const result = await authService.verifyEmail(token);
    
    res.json({ message: 'Email verificata con successo' });
  } catch (error: any) {
    console.error('Errore nella verifica dell\'email:', error);
    res.status(400).json({ message: error.message || 'Token di verifica non valido' });
  }
};

/**
 * Richiede un reset della password
 */
export const forgotPassword = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    console.error('Errore nella richiesta di reset della password:', error);
    
    // Restituisci sempre una risposta positiva per motivi di sicurezza
    res.json({ message: 'Se l\'username esiste, riceverai un\'email con le istruzioni per il reset della password' });
  }
};

/**
 * Reimposta la password di un utente
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token e nuova password richiesti' });
    }
    
    // Reimposta la password
    await authService.resetPassword(token, newPassword);
    
    res.json({ message: 'Password reimpostata con successo' });
  } catch (error: any) {
    console.error('Errore nel reset della password:', error);
    res.status(400).json({ message: error.message || 'Token non valido o scaduto' });
  }
};

/**
 * Ottiene l'utente corrente
 */
export const getCurrentUser = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    console.error('Errore nel recupero dell\'utente corrente:', error);
    res.status(500).json({ message: error.message || 'Errore nel recupero dell\'utente' });
  }
};

/**
 * Rinvia l'email di verifica
 */
export const resendVerification = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    console.error('Errore nell\'invio dell\'email di verifica:', error);
    res.status(500).json({ message: error.message || 'Errore nell\'invio dell\'email di verifica' });
  }
};
