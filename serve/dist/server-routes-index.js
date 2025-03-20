"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth-routes"));
const user_routes_1 = __importDefault(require("./user-routes"));
const subscription_routes_1 = __importDefault(require("./subscription-routes"));
const order_routes_1 = __importDefault(require("./order-routes"));
const pickup_routes_1 = __importDefault(require("./pickup-routes"));
const notification_routes_1 = __importDefault(require("./notification-routes"));
const rating_routes_1 = __importDefault(require("./rating-routes"));
const router = (0, express_1.Router)();
// Registra tutte le rotte API
router.use('/auth', auth_routes_1.default);
router.use('/users', user_routes_1.default);
router.use('/subscription-plans', subscription_routes_1.default);
router.use('/orders', order_routes_1.default);
router.use('/pickup-points', pickup_routes_1.default);
router.use('/notifications', notification_routes_1.default);
router.use('/ratings', rating_routes_1.default);
// Rotta di health check
router.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV });
});
exports.default = router;
