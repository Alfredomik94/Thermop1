"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const env_config_1 = require("./config/env-config");
const supabase_1 = require("./utils/supabase");
const routes_1 = __importDefault(require("./routes"));
// Inizializza l'app Express
const app = (0, express_1.default)();
const PORT = env_config_1.config.port;
// Configura CORS
app.use((0, cors_1.default)({
    origin: env_config_1.config.corsOrigins.split(','),
    credentials: true,
}));
// Middleware per il parsing dei dati
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Configura le sessioni
app.use((0, express_session_1.default)({
    secret: env_config_1.config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: env_config_1.config.nodeEnv === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 ore
    }
}));
// Middleware per gestire gli errori
app.use((err, req, res, next) => {
    console.error('Errore non gestito:', err);
    res.status(500).json({ message: 'Si è verificato un errore sul server' });
});
// Middleware per aggiungere userId al body delle richieste
app.use((req, _res, next) => {
    if (req.session.userId && req.method !== 'GET') {
        req.body = { ...req.body, userId: req.session.userId };
    }
    next();
});
// Configura le rotte API
app.use('/api', routes_1.default);
// Se in produzione, servi i file statici da client/dist
if (env_config_1.config.nodeEnv === 'production') {
    app.use(express_1.default.static(path_1.default.join(__dirname, '../client/dist')));
    // Per tutte le richieste non API, servi l'app React
    app.get('*', (_req, res) => {
        res.sendFile(path_1.default.join(__dirname, '../client/dist/index.html'));
    });
}
// Inizializza il server
const startServer = async () => {
    try {
        // Verifica la struttura del database
        await (0, supabase_1.initializeDatabase)();
        // Avvia il server
        app.listen(PORT, () => {
            console.log(`Server in esecuzione sulla porta ${PORT} in modalità ${env_config_1.config.nodeEnv}`);
        });
    }
    catch (error) {
        console.error('Errore nell\'avvio del server:', error);
        process.exit(1);
    }
};
// Avvia il server se questo file è eseguito direttamente
if (require.main === module) {
    startServer();
}
exports.default = app;
