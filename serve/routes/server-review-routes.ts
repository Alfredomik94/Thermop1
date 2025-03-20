// server/src/routes/review.routes.ts
import express from 'express';
import reviewController from '../controllers/review.controller';
import { isAuthenticated, isCustomer } from '../middleware/auth.middleware';

const router = express.Router();

// Rotte per le recensioni
router.post('/', isAuthenticated, isCustomer, reviewController.createReview);
router.get('/plan/:planId', isAuthenticated, reviewController.getReviewsByPlan);

export default router;
