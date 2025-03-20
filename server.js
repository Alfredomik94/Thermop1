/**
 * Thermopolio - Food Sharing Platform
 * File principale del server
 */

// Importa le dipendenze
const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const dotenv = require('dotenv');

// Configura le variabili d'ambiente
dotenv.config();

// Inizializza l'app Express
const app = express();
const PORT = process.env.PORT || 8080;

// Log informazioni di avvio
console.log('Avvio del server Thermopolio...');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`PORT: ${PORT}`);

// Assicurati che la directory 'public' esista
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  console.log('Creazione della directory public...');
  fs.mkdirSync(publicDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log delle richieste
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Servire file statici dalla cartella 'public'
app.use(express.static(publicDir));

// Importa e usa le rotte API
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Pagina HTML principale (Single Page Application)
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Gestione degli errori
app.use((err, req, res, next) => {
  console.error('Errore del server:', err);
  res.status(500).send('Si è verificato un errore sul server: ' + err.message);
});

// Inizializza i dati necessari (crea file index.html se non esiste)
require('./utils/init')();

// Avvio del server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server Thermopolio in esecuzione su http://0.0.0.0:${PORT}`);
});