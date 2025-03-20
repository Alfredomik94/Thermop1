// server/src/routes/index.ts
import express from 'express';
import authRoutes from './auth.routes';
import subscriptionRoutes from './subscription.routes';
import orderRoutes from './order.routes';
import donationRoutes from './donation.routes';
import reviewRoutes from './review.routes';
import notificationRoutes from './notification.routes';
import restaurantRoutes from './restaurant.routes';
import onlusRoutes from './onlus.routes';
import pickupPointRoutes from './pickup-point.routes';

const router = express.Router();

// Collega tutte le rotte
router.use('/auth', authRoutes);
router.use('/subscription-plans', subscriptionRoutes);
router.use('/orders', orderRoutes);
router.use('/donations', donationRoutes);
router.use('/reviews', reviewRoutes);
router.use('/notifications', notificationRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/onlus', onlusRoutes);
router.use('/pickup-points', pickupPointRoutes);

export default router;
