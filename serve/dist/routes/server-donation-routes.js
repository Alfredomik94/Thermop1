"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/routes/donation.routes.ts
const express_1 = __importDefault(require("express"));
const donation_controller_1 = __importDefault(require("../controllers/donation.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Rotte per le donazioni
router.post('/', auth_middleware_1.isAuthenticated, auth_middleware_1.isCustomer, donation_controller_1.default.createDonation);
router.get('/', auth_middleware_1.isAuthenticated, donation_controller_1.default.getDonations);
router.get('/:id', auth_middleware_1.isAuthenticated, donation_controller_1.default.getDonation);
router.patch('/:id/status', auth_middleware_1.isAuthenticated, auth_middleware_1.isOnlus, donation_controller_1.default.updateDonationStatus);
exports.default = router;
