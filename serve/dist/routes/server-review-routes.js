"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/routes/review.routes.ts
const express_1 = __importDefault(require("express"));
const review_controller_1 = __importDefault(require("../controllers/review.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Rotte per le recensioni
router.post('/', auth_middleware_1.isAuthenticated, auth_middleware_1.isCustomer, review_controller_1.default.createReview);
router.get('/plan/:planId', auth_middleware_1.isAuthenticated, review_controller_1.default.getReviewsByPlan);
exports.default = router;
