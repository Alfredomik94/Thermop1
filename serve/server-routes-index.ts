import { Router } from 'express';
import authRoutes from './auth-routes';
import userRoutes from './user-routes';
import subscriptionRoutes from './subscription-routes';
import orderRoutes from './order-routes';
import pickupRoutes from './pickup-routes';
import notificationRoutes from './notification-routes';
import ratingRoutes from './rating-routes';

const router = Router();

// Registra tutte le rotte API
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/subscription-plans', subscriptionRoutes);
router.use('/orders', orderRoutes);
router.use('/pickup-points', pickupRoutes);
router.use('/notifications', notificationRoutes);
router.use('/ratings', ratingRoutes);

// Rotta di health check
router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV });
});

export default router;
