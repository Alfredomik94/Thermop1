"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/routes/onlus.routes.ts
const express_1 = __importDefault(require("express"));
const onlus_controller_1 = __importDefault(require("../controllers/onlus.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Rotte per le ONLUS
router.get('/', auth_middleware_1.isAuthenticated, onlus_controller_1.default.getOnlus);
router.get('/stats', auth_middleware_1.isAuthenticated, auth_middleware_1.isOnlus, onlus_controller_1.default.getOnlusStats);
exports.default = router;
