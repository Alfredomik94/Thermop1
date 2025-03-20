"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/routes/order.routes.ts
const express_1 = __importDefault(require("express"));
const order_controller_1 = __importDefault(require("../controllers/order.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Rotte per gli ordini
router.post('/', auth_middleware_1.isAuthenticated, auth_middleware_1.isCustomer, order_controller_1.default.createOrder);
router.get('/', auth_middleware_1.isAuthenticated, order_controller_1.default.getOrders);
router.get('/:id', auth_middleware_1.isAuthenticated, order_controller_1.default.getOrder);
router.patch('/:id/status', auth_middleware_1.isAuthenticated, order_controller_1.default.updateOrderStatus);
exports.default = router;
