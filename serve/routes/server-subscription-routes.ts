// server/src/routes/subscription.routes.ts
import express from 'express';
import subscriptionController from '../controllers/subscription.controller';
import { isAuthenticated, isRestaurant } from '../middleware/auth.middleware';

const router = express.Router();

// Rotte per i piani di abbonamento
router.post('/', isAuthenticated, isRestaurant, subscriptionController.createSubscriptionPlan);
router.get('/', isAuthenticated, subscriptionController.getSubscriptionPlans);
router.get('/:id', isAuthenticated, subscriptionController.getSubscriptionPlan);

export default router;
