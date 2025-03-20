// server/src/routes/order.routes.ts
import express from 'express';
import orderController from '../controllers/order.controller';
import { isAuthenticated, isCustomer } from '../middleware/auth.middleware';

const router = express.Router();

// Rotte per gli ordini
router.post('/', isAuthenticated, isCustomer, orderController.createOrder);
router.get('/', isAuthenticated, orderController.getOrders);
router.get('/:id', isAuthenticated, orderController.getOrder);
router.patch('/:id/status', isAuthenticated, orderController.updateOrderStatus);

export default router;
