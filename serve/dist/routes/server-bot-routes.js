"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/routes/bot.routes.ts
const express_1 = __importDefault(require("express"));
const bot_controller_1 = __importDefault(require("../controllers/bot.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Rotte per le interazioni col bot
router.post('/', auth_middleware_1.isAuthenticated, bot_controller_1.default.createBotInteraction);
router.get('/', auth_middleware_1.isAuthenticated, bot_controller_1.default.getBotInteractions);
router.get('/stats', auth_middleware_1.isAuthenticated, bot_controller_1.default.getBotStats);
router.get('/:id', auth_middleware_1.isAuthenticated, bot_controller_1.default.getBotInteraction);
router.post('/:id/messages', auth_middleware_1.isAuthenticated, bot_controller_1.default.createBotMessage);
router.patch('/:id', auth_middleware_1.isAuthenticated, bot_controller_1.default.updateBotInteraction);
exports.default = router;
