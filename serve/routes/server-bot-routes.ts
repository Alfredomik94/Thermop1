// server/src/routes/bot.routes.ts
import express from 'express';
import botController from '../controllers/bot.controller';
import { isAuthenticated } from '../middleware/auth.middleware';

const router = express.Router();

// Rotte per le interazioni col bot
router.post('/', isAuthenticated, botController.createBotInteraction);
router.get('/', isAuthenticated, botController.getBotInteractions);
router.get('/stats', isAuthenticated, botController.getBotStats);
router.get('/:id', isAuthenticated, botController.getBotInteraction);
router.post('/:id/messages', isAuthenticated, botController.createBotMessage);
router.patch('/:id', isAuthenticated, botController.updateBotInteraction);

export default router;
