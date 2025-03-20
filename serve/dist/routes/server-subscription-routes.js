"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/routes/subscription.routes.ts
const express_1 = __importDefault(require("express"));
const subscription_controller_1 = __importDefault(require("../controllers/subscription.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Rotte per i piani di abbonamento
router.post('/', auth_middleware_1.isAuthenticated, auth_middleware_1.isRestaurant, subscription_controller_1.default.createSubscriptionPlan);
router.get('/', auth_middleware_1.isAuthenticated, subscription_controller_1.default.getSubscriptionPlans);
router.get('/:id', auth_middleware_1.isAuthenticated, subscription_controller_1.default.getSubscriptionPlan);
exports.default = router;
