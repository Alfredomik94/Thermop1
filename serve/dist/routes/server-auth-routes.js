"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/routes/auth.routes.ts
const express_1 = __importDefault(require("express"));
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Rotte di autenticazione
router.post('/register', auth_controller_1.default.register);
router.post('/login', auth_controller_1.default.login);
router.post('/logout', auth_controller_1.default.logout);
router.get('/verify-email/:token', auth_controller_1.default.verifyEmail);
router.get('/me', auth_middleware_1.isAuthenticated, auth_controller_1.default.getCurrentUser);
exports.default = router;
