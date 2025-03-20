// server/middleware/auth-middleware.ts
import { Request, Response, NextFunction } from 'express';
import * as usersDb from '../db/users-db.js';

// Estendi la definizione di SessionData per includere dati personalizzati
declare module 'express-session' {
  interface SessionData {
    userId: number;
    user: any;
  }
}

/**
 * Middleware per verificare se l'utente è autenticato
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
          if (err) console.error('Errore nella distruzione della sessione:', err);
        });
        return res.status(401).json({ message: 'Sessione non valida. Effettua nuovamente il login.' });
      }
      
      // Memorizza l'utente nella sessione per riutilizzarlo
      req.session.user = user;
    }

    next();
  } catch (error) {
    console.error('Errore nel middleware di autenticazione:', error);
    res.status(500).json({ message: 'Errore del server' });
  }
};

/**
 * Middleware per verificare se l'utente ha un ruolo specifico
 * 
 * @param allowedRoles Array di ruoli consentiti
 */
export const roleMiddleware = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
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
    } catch (error) {
      console.error('Errore nel middleware di ruolo:', error);
      res.status(500).json({ message: 'Errore del server' });
    }
  };
};

/**
 * Middleware specifico per gli utenti di tipo cliente
 */
export const customerMiddleware = roleMiddleware(['customer']);

/**
 * Middleware specifico per gli utenti di tipo ristorante (tavola calda)
 */
export const restaurantMiddleware = roleMiddleware(['tavola_calda']);

/**
 * Middleware specifico per gli utenti di tipo ONLUS
 */
export const onlusMiddleware = roleMiddleware(['onlus']);

// server/middleware/error-middleware.ts
import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  statusCode?: number;
}

/**
 * Middleware per la gestione centralizzata degli errori
 */
export const errorMiddleware = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

// server/middleware/validation-middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Middleware per la validazione degli input con Zod
 * 
 * @param schema Schema Zod per la validazione
 */
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Valida la richiesta contro lo schema
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      next();
    } catch (error) {
      // Gestione degli errori di validazione Zod
      if (error instanceof ZodError) {
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

// server/config/session-config.ts
import session from 'express-session';
import dotenv from 'dotenv';

// Carica le variabili d'ambiente
dotenv.config();

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
const sessionMiddleware = session(sessionConfig);

export default sessionMiddleware;
