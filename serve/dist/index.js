"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_session_1 = __importDefault(require("express-session"));
const env_config_1 = require("./config/env-config");
const session_config_1 = require("./config/session-config");
const logger_1 = require("./utils/logger");
const server_error_handler_1 = require("./utils/server-error-handler");
const server_routes_index_1 = require("./routes/server-routes-index");
const server_supabase_1 = require("./utils/server-supabase");
// Valida le variabili d'ambiente
(0, env_config_1.validateEnv)();
// Crea l'app Express
const app = (0, express_1.default)();
const port = env_config_1.ENV.PORT;
// Middleware di sicurezza e parsing
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: env_config_1.ENV.NODE_ENV === 'production' ? ['https://yourapp.com'] : ['http://localhost:5173'],
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Configurazione sessione
app.use((0, express_session_1.default)(session_config_1.sessionConfig));
// Test connessione a Supabase
(0, server_supabase_1.testConnection)().catch(err => {
    logger_1.logger.error('Errore nella connessione a Supabase:', err);
    process.exit(1);
});
// Registra tutte le routes
(0, server_routes_index_1.registerRoutes)(app);
// Middleware per gestione errori
app.use(server_error_handler_1.errorHandler);
// Avvia il server
app.listen(port, () => {
    logger_1.logger.info(`Server avviato sulla porta ${port}`);
});
exports.default = app;
