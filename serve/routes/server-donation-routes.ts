// server/src/routes/donation.routes.ts
import express from 'express';
import donationController from '../controllers/donation.controller';
import { isAuthenticated, isCustomer, isOnlus } from '../middleware/auth.middleware';

const router = express.Router();

// Rotte per le donazioni
router.post('/', isAuthenticated, isCustomer, donationController.createDonation);
router.get('/', isAuthenticated, donationController.getDonations);
router.get('/:id', isAuthenticated, donationController.getDonation);
router.patch('/:id/status', isAuthenticated, isOnlus, donationController.updateDonationStatus);

export default router;
