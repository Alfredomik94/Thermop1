import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import { config } from './config/env-config';
import { initializeDatabase } from './utils/supabase';
import routes from './routes';

// Inizializza l'app Express
const app = express();
const PORT = config.port;

// Configura CORS
app.use(cors({
  origin: config.corsOrigins.split(','),
  credentials: true,
}));

// Middleware per il parsing dei dati
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configura le sessioni
app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.nodeEnv === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 // 24 ore
    }
  })
);

// Middleware per gestire gli errori
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Errore non gestito:', err);
  res.status(500).json({ message: 'Si è verificato un errore sul server' });
});

// Middleware per aggiungere userId al body delle richieste
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (req.session.userId && req.method !== 'GET') {
    req.body = { ...req.body, userId: req.session.userId };
  }
  next();
});

// Configura le rotte API
app.use('/api', routes);

// Se in produzione, servi i file statici da client/dist
if (config.nodeEnv === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  // Per tutte le richieste non API, servi l'app React
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Inizializza il server
const startServer = async () => {
  try {
    // Verifica la struttura del database
    await initializeDatabase();
    
    // Avvia il server
    app.listen(PORT, () => {
      console.log(`Server in esecuzione sulla porta ${PORT} in modalità ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('Errore nell\'avvio del server:', error);
    process.exit(1);
  }
};

// Avvia il server se questo file è eseguito direttamente
if (require.main === module) {
  startServer();
}

export default app;
