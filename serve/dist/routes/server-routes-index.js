"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/routes/index.ts
const express_1 = __importDefault(require("express"));
const auth_routes_1 = __importDefault(require("./auth.routes"));
const subscription_routes_1 = __importDefault(require("./subscription.routes"));
const order_routes_1 = __importDefault(require("./order.routes"));
const donation_routes_1 = __importDefault(require("./donation.routes"));
const review_routes_1 = __importDefault(require("./review.routes"));
const notification_routes_1 = __importDefault(require("./notification.routes"));
const restaurant_routes_1 = __importDefault(require("./restaurant.routes"));
const onlus_routes_1 = __importDefault(require("./onlus.routes"));
const pickup_point_routes_1 = __importDefault(require("./pickup-point.routes"));
const router = express_1.default.Router();
// Collega tutte le rotte
router.use('/auth', auth_routes_1.default);
router.use('/subscription-plans', subscription_routes_1.default);
router.use('/orders', order_routes_1.default);
router.use('/donations', donation_routes_1.default);
router.use('/reviews', review_routes_1.default);
router.use('/notifications', notification_routes_1.default);
router.use('/restaurants', restaurant_routes_1.default);
router.use('/onlus', onlus_routes_1.default);
router.use('/pickup-points', pickup_point_routes_1.default);
exports.default = router;
