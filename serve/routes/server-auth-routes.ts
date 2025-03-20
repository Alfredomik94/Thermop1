// server/src/routes/auth.routes.ts
import express from 'express';
import authController from '../controllers/auth.controller';
import { isAuthenticated } from '../middleware/auth.middleware';

const router = express.Router();

// Rotte di autenticazione
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/verify-email/:token', authController.verifyEmail);
router.get('/me', isAuthenticated, authController.getCurrentUser);

export default router;
