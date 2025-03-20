// server/src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { storage } from '../services/storage';
import { loginSchema, insertUserSchema } from 'thermopolio-shared';
import { z } from 'zod';

export const register = async (req: Request, res: Response) => {
  try {
    const data = insertUserSchema.parse(req.body);
    
    // Verifica se l'utente esiste già
    const existingUser = await storage.getUserByUsername(data.username);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username già esistente',
      });
    }
    
    const user = await storage.createUser(data);
    
    // Crea token di verifica e simulazione invio email
    const token = await storage.createEmailVerification(user.id);
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Dati non validi',
        errors: error.errors.map(e => e.message),
      });
    } else {
      console.error('Error during registration:', error);
      res.status(500).json({
        success: false,
        message: 'Errore durante la registrazione',
      });
    }
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = loginSchema.parse(req.body);
    
    const user = await storage.getUserByUsername(username);
    
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Dati non validi',
        errors: error.errors.map(e => e.message),
      });
    } else {
      console.error('Error during login:', error);
      res.status(500).json({
        success: false,
        message: 'Errore durante il login',
      });
    }
  }
};

export const logout = (req: Request, res: Response) => {
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

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    
    const isValid = await storage.verifyEmail(token);
    
    if (isValid) {
      res.json({
        success: true,
        message: 'Email verificata con successo',
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Token di verifica non valido o scaduto',
      });
    }
  } catch (error) {
    console.error('Error during email verification:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante la verifica dell\'email',
    });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Non autenticato',
      });
    }
    
    const user = await storage.getUser(req.session.userId);
    
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
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il recupero dell\'utente',
    });
  }
};

export default {
  register,
  login,
  logout,
  verifyEmail,
  getCurrentUser,
};
