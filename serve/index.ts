import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import { ENV, validateEnv } from './config/env-config';
import { sessionConfig } from './config/session-config';
import { logger } from './utils/logger';
import { errorHandler } from './utils/server-error-handler';
import { registerRoutes } from './routes/server-routes-index';
import { testConnection } from './utils/server-supabase';

// Valida le variabili d'ambiente
validateEnv();

// Crea l'app Express
const app = express();
const port = ENV.PORT;

// Middleware di sicurezza e parsing
app.use(helmet());
app.use(cors({
  origin: ENV.NODE_ENV === 'production' ? ['https://yourapp.com'] : ['http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurazione sessione
app.use(session(sessionConfig));

// Test connessione a Supabase
testConnection().catch(err => {
  logger.error('Errore nella connessione a Supabase:', err);
  process.exit(1);
});

// Registra tutte le routes
registerRoutes(app);

// Middleware per gestione errori
app.use(errorHandler);

// Avvia il server
app.listen(port, () => {
  logger.info(`Server avviato sulla porta ${port}`);
});

export default app;
