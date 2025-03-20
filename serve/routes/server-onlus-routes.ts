// server/src/routes/onlus.routes.ts
import express from 'express';
import onlusController from '../controllers/onlus.controller';
import { isAuthenticated, isOnlus } from '../middleware/auth.middleware';

const router = express.Router();

// Rotte per le ONLUS
router.get('/', isAuthenticated, onlusController.getOnlus);
router.get('/stats', isAuthenticated, isOnlus, onlusController.getOnlusStats);

export default router;
