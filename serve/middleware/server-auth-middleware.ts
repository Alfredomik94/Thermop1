// server/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';

// Middleware per verificare che l'utente sia autenticato
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      message: 'Non autenticato'
    });
  }
  
  next();
};

// Middleware per verificare che l'utente sia di un certo tipo
export const hasRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Non autenticato'
      });
    }
    
    if (!req.session.userType || !roles.includes(req.session.userType)) {
      return res.status(403).json({
        success: false,
        message: 'Accesso non autorizzato'
      });
    }
    
    next();
  };
};

// Middleware per verificare che l'utente sia un cliente
export const isCustomer = hasRole(['customer']);

// Middleware per verificare che l'utente sia un ristorante
export const isRestaurant = hasRole(['tavola_calda']);

// Middleware per verificare che l'utente sia una ONLUS
export const isOnlus = hasRole(['onlus']);

export default {
  isAuthenticated,
  hasRole,
  isCustomer,
  isRestaurant,
  isOnlus
};
