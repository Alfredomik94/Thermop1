const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log delle richieste - migliorato
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Servire file statici
app.use(express.static('public'));

// Crea la directory public se non esiste
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  console.log('Creazione della directory public...');
  fs.mkdirSync(publicDir, { recursive: true });
}

// Crea la directory public/dashboard se non esiste
const dashboardDir = path.join(publicDir, 'dashboard');
if (!fs.existsSync(dashboardDir)) {
  console.log('Creazione della directory dashboard...');
  fs.mkdirSync(dashboardDir, { recursive: true });
}

// Crea i file HTML per le dashboard se non esistono
const dashboardTypes = ['customer', 'tavola-calda', 'onlus'];
dashboardTypes.forEach(type => {
  const dashboardFile = path.join(dashboardDir, `${type}.html`);
  if (!fs.existsSync(dashboardFile)) {
    console.log(`Creazione del file dashboard per ${type}...`);
    
    const title = type === 'customer' ? 'Cliente' : 
                 type === 'tavola-calda' ? 'Tavola Calda' : 'ONLUS';
    
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>Dashboard ${title} - Thermopolio</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #f7f7f7;
            line-height: 1.6;
        }
        .card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        h1 { color: #333; margin-bottom: 20px; }
        h2 { color: #555; margin-top: 0; }
        .button {
            display: inline-block;
            background: #4a6cf7;
            color: white;
            text-decoration: none;
            padding: 10px 15px;
            border-radius: 4px;
            font-size: 16px;
            margin-top: 15px;
            cursor: pointer;
            border: none;
        }
        .button:hover {
            background: #3a5ce7;
        }
        .info {
            background-color: #e6f7ff;
            border-left: 4px solid #1890ff;
            padding: 10px;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>Dashboard ${title}</h1>
        <p>Benvenuto nella dashboard di Thermopolio per <strong>${title}</strong>! Questa è una versione di test dell'applicazione.</p>
        
        <div class="info">
            <p><strong>Utente:</strong> <span id="username"></span></p>
            <p><strong>Tipo:</strong> <span id="userType"></span></p>
        </div>
        
        <h2>Funzionalità disponibili:</h2>
        <ul>
            ${type === 'customer' ? `
            <li>Scoperta di ristoranti nelle vicinanze</li>
            <li>Abbonamento a piani pasto</li>
            <li>Donazione di pasti alle ONLUS</li>` : 
            type === 'tavola-calda' ? `
            <li>Creazione di piani di abbonamento</li>
            <li>Gestione degli ordini ricevuti</li>
            <li>Statistiche sugli ordini</li>` : `
            <li>Ricezione e gestione delle donazioni</li>
            <li>Statistiche sulle donazioni</li>
            <li>Gestione del profilo</li>`}
        </ul>
        
        <a href="/" class="button">Torna alla home</a>
        <button id="logoutBtn" class="button" style="background: #f44336; margin-left: 10px;">Logout</button>
    </div>
    
    <script>
        // Visualizza informazioni utente
        document.addEventListener('DOMContentLoaded', function() {
            const storedUser = localStorage.getItem('thermopolio_user');
            if (storedUser) {
                try {
                    const user = JSON.parse(storedUser);
                    document.getElementById('username').textContent = user.name || user.username;
                    document.getElementById('userType').textContent = user.userType;
                } catch (e) {
                    console.error('Errore nel parsing dell\'utente:', e);
                    window.location.href = '/';
                }
            } else {
                window.location.href = '/';
            }
            
            // Gestione logout
            document.getElementById('logoutBtn').addEventListener('click', function() {
                localStorage.removeItem('thermopolio_user');
                window.location.href = '/';
            });
        });
    </script>
</body>
</html>`;
    
    fs.writeFileSync(dashboardFile, htmlContent);
  }
});

// Rotte di base
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API di autenticazione di esempio - con più logging
app.post('/api/auth/login', (req, res) => {
  console.log('Richiesta di login ricevuta:', req.body);
  
  const { username, password } = req.body;
  
  // Credenziali di test hardcoded
  const users = {
    'cliente': { password: 'cliente123', userType: 'customer', name: 'Cliente Demo' },
    'ristorante': { password: 'ristorante123', userType: 'tavola_calda', name: 'Ristorante Demo' },
    'onlus': { password: 'onlus123', userType: 'onlus', name: 'ONLUS Demo' }
  };
  
  console.log(`Tentativo di login con username: ${username}, password: ${password}`);
  
  if (users[username] && users[username].password === password) {
    const user = {
      id: Math.floor(Math.random() * 1000),
      username,
      name: users[username].name,
      userType: users[username].userType
    };
    console.log('Login riuscito:', user);
    
    // Aggiungi l'URL di redirect in base al tipo di utente
    const userType = user.userType === 'tavola_calda' ? 'tavola-calda' : user.userType;
    
    res.json({ 
      success: true, 
      user,
      redirectUrl: `/dashboard/${userType}`
    });
  } else {
    console.log('Login fallito. Username trovato:', !!users[username]);
    if (users[username]) {
      console.log('Password inserita non corrisponde');
    }
    res.status(401).json({ success: false, message: 'Credenziali non valide' });
  }
});

// API per i ristoranti
app.get('/api/restaurants', (req, res) => {
  const restaurants = [
    { id: 1, name: 'Trattoria da Mario', type: 'Italiano', distance: '0.5 km', rating: 4.5 },
    { id: 2, name: 'Sushi Bar', type: 'Giapponese', distance: '1.2 km', rating: 4.3 },
    { id: 3, name: 'Pizzeria Napoletana', type: 'Italiano', distance: '0.8 km', rating: 4.7 },
    { id: 4, name: 'Bistrot Parigino', type: 'Francese', distance: '1.5 km', rating: 4.1 }
  ];
  res.json(restaurants);
});

// API per gli abbonamenti
app.get('/api/subscription-plans', (req, res) => {
  const plans = [
    { id: 1, userId: 2, name: 'Piano Pranzo', description: 'Pranzo completo', planType: 'completo', basePrice: 8.50 },
    { id: 2, userId: 2, name: 'Solo Primo', description: 'Solo primo piatto', planType: 'primo', basePrice: 5.00 },
    { id: 3, userId: 3, name: 'Piano Famiglia', description: 'Pasto completo famiglia', planType: 'completo', basePrice: 12.00 }
  ];
  res.json(plans);
});

// Crea un endpoint per creare nuovi piani di abbonamento
app.post('/api/subscription-plans', (req, res) => {
  console.log('Richiesta di creazione piano:', req.body);
  
  // Simuliamo la creazione di un piano - in una app reale salveremmo nel DB
  const newPlan = {
    id: Math.floor(Math.random() * 1000),
    userId: req.body.userId || 2,
    name: req.body.name,
    description: req.body.description,
    planType: req.body.planType,
    basePrice: parseFloat(req.body.basePrice)
  };
  
  res.json({ success: true, plan: newPlan });
});

// Gestione delle dashboard 
app.get('/dashboard/:type', (req, res) => {
  const { type } = req.params;
  const filePath = path.join(dashboardDir, `${type}.html`);
  
  console.log(`Richiesta dashboard per tipo: ${type}, percorso file: ${filePath}`);
  
  if (fs.existsSync(filePath)) {
    console.log('File dashboard trovato, serving...');
    res.sendFile(filePath);
  } else {
    console.log(`File dashboard "${type}.html" NON trovato!`);
    console.log('Contenuto della directory /dashboard:');
    try {
      if (fs.existsSync(dashboardDir)) {
        const files = fs.readdirSync(dashboardDir);
        console.log('File trovati:', files);
      } else {
        console.log('La directory dashboard non esiste!');
      }
    } catch (err) {
      console.log('Errore nella lettura della directory:', err);
    }
    res.status(404).send(`Dashboard di tipo "${type}" non trovata.`);
  }
});

// Pagina HTML di base per la home - MODIFICATA PER GESTIRE MEGLIO IL REINDIRIZZAMENTO
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Thermopolio</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #f7f7f7;
            line-height: 1.6;
          }
          .card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
          }
          h1 { color: #333; margin-bottom: 20px; }
          h2 { color: #555; margin-top: 0; }
          button {
            background: #4a6cf7;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
          }
          button:hover {
            background: #3a5ce7;
          }
          button:disabled {
            background: #cccccc;
            cursor: not-allowed;
          }
          .form-group {
            margin-bottom: 15px;
          }
          label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
          }
          input {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
          }
          .error {
            color: #e53e3e;
            margin-top: 5px;
          }
          .success {
            color: #38a169;
            margin-top: 5px;
          }
          pre {
            background: #f1f1f1;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
          }
          .user-info {
            background-color: #e6f7ff;
            border-left: 4px solid #1890ff;
            padding: 10px;
            margin-top: 10px;
            display: none;
          }
          .debug-panel {
            margin-top: 20px;
            padding: 10px;
            background-color: #ffe6e6;
            border-left: 4px solid #ff4d4d;
            display: none;
          }
        </style>
      </head>
      <body>
        <h1>Thermopolio - Food Sharing</h1>
        
        <div class="card">
          <h2>Benvenuto</h2>
          <p>Questa è una versione di test dell'applicazione Thermopolio per la condivisione di cibo tra ristoranti, clienti e ONLUS.</p>
          <p>Puoi testare l'API utilizzando le credenziali demo qui sotto.</p>
          <div id="userInfoPanel" class="user-info"></div>
        </div>
        
        <div class="card">
          <h2>Login</h2>
          <form id="loginForm">
            <div class="form-group">
              <label for="username">Username</label>
              <input type="text" id="username" name="username" placeholder="cliente, ristorante, onlus">
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" placeholder="cliente123, ristorante123, onlus123">
            </div>
            <button type="submit" id="loginButton">Accedi</button>
            <div id="loginMessage"></div>
          </form>
        </div>
        
        <div class="card">
          <h2>API Test</h2>
          <button id="getRestaurants" disabled>Carica Ristoranti</button>
          <button id="getSubscriptions" disabled>Carica Abbonamenti</button>
          <div id="apiResult" style="margin-top: 15px;"></div>
        </div>
        
        <!-- Pannello di debug (normalmente nascosto) -->
        <div id="debugPanel" class="debug-panel">
          <h3>Informazioni di debug</h3>
          <div id="debugInfo"></div>
          <button id="showDebugBtn" style="margin-top: 10px;">Mostra debug info</button>
          <button id="manualRedirectBtn" style="margin-top: 10px; margin-left: 10px; display: none;">Vai alla dashboard</button>
        </div>
        
        <script>
          // Controlla se l'utente è già loggato
          document.addEventListener('DOMContentLoaded', function() {
            // Abilita il pannello di debug in caso di problemi
            document.getElementById('debugPanel').style.display = 'block';
            
            document.getElementById('showDebugBtn').addEventListener('click', function() {
              const debugInfo = document.getElementById('debugInfo');
              try {
                const storedUser = localStorage.getItem('thermopolio_user');
                debugInfo.innerHTML = '<p><strong>localStorage:</strong> ' + 
                  (storedUser ? 'Contiene dati utente' : 'Vuoto') + '</p>';
                
                if (storedUser) {
                  const user = JSON.parse(storedUser);
                  const redirectUrl = '/dashboard/' + (user.userType === 'tavola_calda' ? 'tavola-calda' : user.userType);
                  
                  debugInfo.innerHTML += '<p><strong>Utente:</strong> ' + JSON.stringify(user) + '</p>';
                  debugInfo.innerHTML += '<p><strong>URL di redirect:</strong> ' + redirectUrl + '</p>';
                  
                  // Mostra il pulsante di redirect manuale
                  document.getElementById('manualRedirectBtn').style.display = 'inline-block';
                  document.getElementById('manualRedirectBtn').addEventListener('click', function() {
                    window.location.href = redirectUrl;
                  });
                }
              } catch (e) {
                debugInfo.innerHTML = '<p><strong>Errore:</strong> ' + e.message + '</p>';
              }
            });
            
            const storedUser = localStorage.getItem('thermopolio_user');
            if (storedUser) {
              try {
                const user = JSON.parse(storedUser);
                
                // Informazioni sull'utente loggato
                document.getElementById('userInfoPanel').style.display = 'block';
                document.getElementById('userInfoPanel').innerHTML = '<strong>Utente connesso:</strong> ' + user.name + 
                    ' (' + user.userType + ') - <a href="/dashboard/' + 
                    (user.userType === 'tavola_calda' ? 'tavola-calda' : user.userType) + 
                    '">Vai alla dashboard</a>';
                
                // Abilita i pulsanti di test API
                document.getElementById('getRestaurants').disabled = false;
                document.getElementById('getSubscriptions').disabled = false;
              } catch (e) {
                console.error('Errore nel parsing dell\'utente salvato:', e);
                localStorage.removeItem('thermopolio_user');
              }
            }
          });

          // Login form
          document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const messageEl = document.getElementById('loginMessage');
            const loginButton = document.getElementById('loginButton');
            const debugInfo = document.getElementById('debugInfo');
            
            // Validazione base
            if (!username || !password) {
              messageEl.textContent = 'Inserisci sia username che password';
              messageEl.className = 'error';
              return;
            }
            
            messageEl.textContent = 'Tentativo di login in corso...';
            messageEl.className = '';
            loginButton.disabled = true;
            
            try {
              console.log('Invio dati di login:', { username, password });
              debugInfo.innerHTML = '<p>Invio dati di login: ' + JSON.stringify({ username, password }) + '</p>';
              
              const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
              });
              
              console.log('Risposta ricevuta:', response.status);
              debugInfo.innerHTML += '<p>Status risposta: ' + response.status + '</p>';
              
              const data = await response.json();
              console.log('Dati ricevuti:', data);
              debugInfo.innerHTML += '<p>Dati ricevuti: ' + JSON.stringify(data) + '</p>';
              
              if (data.success) {
                // Salva l'utente in localStorage per simulare una sessione
                localStorage.setItem('thermopolio_user', JSON.stringify(data.user));
                debugInfo.innerHTML += '<p>Utente salvato in localStorage</p>';
                
                // Mostra messaggio di successo
                messageEl.innerHTML = 'Login effettuato con successo! Reindirizzamento in corso...';
                messageEl.className = 'success';
                
                // Mostra il pulsante di redirect manuale nel pannello di debug
                document.getElementById('manualRedirectBtn').style.display = 'inline-block';
                document.getElementById('manualRedirectBtn').addEventListener('click', function() {
                  window.location.href = data.redirectUrl;
                });
                
                // Verifica se la dashboard esiste prima di reindirizzare
                try {
                  const checkResponse = await fetch(data.redirectUrl, { method: 'HEAD' });
                  debugInfo.innerHTML += '<p>Verifica dashboard: ' + checkResponse.status + '</p>';
                  
                  if (checkResponse.ok) {
                    // Redirezione alla dashboard con un piccolo ritardo per evitare problemi
                    debugInfo.innerHTML += '<p>Reindirizzamento a: ' + data.redirectUrl + '</p>';
                    setTimeout(() => {
                      // Usa replace per evitare problemi con il pulsante "indietro" del browser
                      window.location.replace(data.redirectUrl);
                    }, 1500);
                  } else {
                    debugInfo.innerHTML += '<p>ERRORE: Dashboard non trovata!</p>';
                    messageEl.innerHTML = 'Login riuscito ma dashboard non trovata. <a href="' + data.redirectUrl + '">Prova qui</a>';
                  }
                } catch (checkError) {
                  debugInfo.innerHTML += '<p>ERRORE durante la verifica della dashboard: ' + checkError.message + '</p>';
                  // Tenta comunque il reindirizzamento
                  setTimeout(() => {
                    window.location.href = data.redirectUrl;
                  }, 1500);
                }
              } else {
                messageEl.textContent = data.message || 'Login fallito';
                messageEl.className = 'error';
                debugInfo.innerHTML += '<p>Login fallito: ' + (data.message || 'Nessun messaggio') + '</p>';
              }
            } catch (error) {
              console.error('Errore durante il login:', error);
              debugInfo.innerHTML += '<p>ERRORE: ' + error.message + '</p>';
              messageEl.textContent = 'Errore durante il login: ' + error.message;
              messageEl.className = 'error';
            } finally {
              loginButton.disabled = false;
            }
          });
          
          // API Test buttons
          document.getElementById('getRestaurants').addEventListener('click', async function() {
            const resultEl = document.getElementById('apiResult');
            const button = this;
            
            button.disabled = true;
            resultEl.innerHTML = '<div>Caricamento ristoranti...</div>';
            
            try {
              const response = await fetch('/api/restaurants');
              const data = await response.json();
              
              resultEl.innerHTML = '<h3>Ristoranti</h3><pre>' + JSON.stringify(data, null, 2) + '</pre>';
            } catch (error) {
              resultEl.innerHTML = '<div class="error">Errore: ' + error.message + '</div>';
            } finally {
              button.disabled = false;
            }
          });
          
          document.getElementById('getSubscriptions').addEventListener('click', async function() {
            const resultEl = document.getElementById('apiResult');
            const button = this;
            
            button.disabled = true;
            resultEl.innerHTML = '<div>Caricamento abbonamenti...</div>';
            
            try {
              const response = await fetch('/api/subscription-plans');
              const data = await response.json();
              
              resultEl.innerHTML = '<h3>Abbonamenti</h3><pre>' + JSON.stringify(data, null, 2) + '</pre>';
            } catch (error) {
              resultEl.innerHTML = '<div class="error">Errore: ' + error.message + '</div>';
            } finally {
              button.disabled = false;
            }
          });
        </script>
      </body>
    </html>
  `);
});

// Gestione per tutti gli altri percorsi non definiti
app.use((req, res) => {
  console.log(`Percorso non trovato: ${req.url}`);
  res.status(404).send('Pagina non trovata');
});

// Middleware per la gestione degli errori
app.use((err, req, res, next) => {
  console.error('Errore del server:', err);
  res.status(500).send('Si è verificato un errore sul server: ' + err.message);
});

// Avvio del server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server Thermopolio in esecuzione su http://0.0.0.0:${PORT}`);
  console.log(`Directory public: ${publicDir}`);
  console.log(`Directory dashboard: ${dashboardDir}`);
  
  // Stampa i file esistenti nella cartella public e dashboard
  try {
    console.log('Contenuto della directory public:');
    if (fs.existsSync(publicDir)) {
      const publicFiles = fs.readdirSync(publicDir);
      console.log(publicFiles);
    }
    
    console.log('Contenuto della directory dashboard:');
    if (fs.existsSync(dashboardDir)) {
      const dashboardFiles = fs.readdirSync(dashboardDir);
      console.log(dashboardFiles);
    }
  } catch (err) {
    console.error('Errore nella lettura delle directory:', err);
  }
});