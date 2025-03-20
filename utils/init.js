/**
 * Modulo di inizializzazione dell'applicazione
 * Crea i file necessari se non esistono
 */

const fs = require('fs');
const path = require('path');

// HTML della SPA principale
const mainHtml = `<!DOCTYPE html>
<html>
  <head>
    <title>Thermopolio - Food Sharing</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/css/style.css">
  </head>
  <body>
    <h1>Thermopolio - Food Sharing</h1>
    
    <!-- SEZIONE HOME -->
    <div id="home-section" class="section active">
      <div class="card">
        <h2>Benvenuto</h2>
        <p>Questa è una versione di test dell'applicazione Thermopolio per la condivisione di cibo tra ristoranti, clienti e ONLUS.</p>
        <p>Puoi testare l'API utilizzando le credenziali demo qui sotto.</p>
        <div id="userInfoPanel" class="user-info" style="display: none;">
          <strong>Utente connesso:</strong> <span id="userInfo"></span>
          <button id="goToDashboardBtn" class="button" style="margin-left: 10px;">Vai alla dashboard</button>
        </div>
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
    </div>
    
    <!-- SEZIONE DASHBOARD CLIENTE -->
    <div id="customer-dashboard" class="section">
      <div class="card">
        <h1>Dashboard Cliente</h1>
        <p>Benvenuto nella dashboard di Thermopolio per <strong>Cliente</strong>! Questa è una versione di test dell'applicazione.</p>
        
        <div class="info">
          <p><strong>Utente:</strong> <span id="customer-username"></span></p>
          <p><strong>Tipo:</strong> <span id="customer-userType"></span></p>
        </div>
        
        <h2>Funzionalità disponibili:</h2>
        <ul>
          <li>Scoperta di ristoranti nelle vicinanze</li>
          <li>Abbonamento a piani pasto</li>
          <li>Donazione di pasti alle ONLUS</li>
        </ul>
        
        <button class="button back-to-home">Torna alla home</button>
        <button id="customer-logout" class="button" style="background: #f44336; margin-left: 10px;">Logout</button>
      </div>
    </div>
    
    <!-- SEZIONE DASHBOARD TAVOLA CALDA -->
    <div id="tavola-calda-dashboard" class="section">
      <div class="card">
        <h1>Dashboard Tavola Calda</h1>
        <p>Benvenuto nella dashboard di Thermopolio per <strong>Tavola Calda</strong>! Questa è una versione di test dell'applicazione.</p>
        
        <div class="info">
          <p><strong>Utente:</strong> <span id="tavola-calda-username"></span></p>
          <p><strong>Tipo:</strong> <span id="tavola-calda-userType"></span></p>
        </div>
        
        <h2>Funzionalità disponibili:</h2>
        <ul>
          <li>Creazione di piani di abbonamento</li>
          <li>Gestione degli ordini ricevuti</li>
          <li>Statistiche sugli ordini</li>
        </ul>
        
        <button class="button back-to-home">Torna alla home</button>
        <button id="tavola-calda-logout" class="button" style="background: #f44336; margin-left: 10px;">Logout</button>
      </div>
    </div>
    
    <!-- SEZIONE DASHBOARD ONLUS -->
    <div id="onlus-dashboard" class="section">
      <div class="card">
        <h1>Dashboard ONLUS</h1>
        <p>Benvenuto nella dashboard di Thermopolio per <strong>ONLUS</strong>! Questa è una versione di test dell'applicazione.</p>
        
        <div class="info">
          <p><strong>Utente:</strong> <span id="onlus-username"></span></p>
          <p><strong>Tipo:</strong> <span id="onlus-userType"></span></p>
        </div>
        
        <h2>Funzionalità disponibili:</h2>
        <ul>
          <li>Ricezione e gestione delle donazioni</li>
          <li>Statistiche sulle donazioni</li>
          <li>Gestione del profilo</li>
        </ul>
        
        <button class="button back-to-home">Torna alla home</button>
        <button id="onlus-logout" class="button" style="background: #f44336; margin-left: 10px;">Logout</button>
      </div>
    </div>
    
    <script src="/js/app.js"></script>
  </body>
</html>`;

// CSS principale
const mainCss = `body { 
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
}
.section {
  display: none;
}
.active {
  display: block;
}
.info {
  background-color: #e6f7ff;
  border-left: 4px solid #1890ff;
  padding: 10px;
  margin-top: 10px;
}
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
}`;

// JavaScript principale
const mainJs = `// Funzioni di utilità per la navigazione
function showSection(sectionId) {
  // Nascondi tutte le sezioni
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });
  
  // Mostra la sezione richiesta
  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.add('active');
  }
}

// Gestore per il router basato su hash
function handleRouting() {
  const hash = window.location.hash.substring(1) || '';
  
  // Controllo se l'utente è loggato
  const user = JSON.parse(localStorage.getItem('thermopolio_user') || 'null');
  
  if (hash.startsWith('dashboard/')) {
    const dashboardType = hash.split('/')[1];
    
    // Se non c'è utente loggato, torna alla home
    if (!user) {
      window.location.hash = '';
      return;
    }
    
    // Carica la dashboard appropriata
    const dashboardId = \`\${dashboardType}-dashboard\`;
    showSection(dashboardId);
    
    // Aggiungiamo controlli per assicurarci che gli elementi DOM esistano
    const usernameElement = document.getElementById(\`\${dashboardType}-username\`);
    const userTypeElement = document.getElementById(\`\${dashboardType}-userType\`);
    
    if (usernameElement) usernameElement.textContent = user.name;
    if (userTypeElement) userTypeElement.textContent = user.userType;
  } else {
    // Mostra la home
    showSection('home-section');
    
    // Se l'utente è loggato, mostra il pannello info utente
    const userInfoPanel = document.getElementById('userInfoPanel');
    const userInfo = document.getElementById('userInfo');
    const goToDashboardBtn = document.getElementById('goToDashboardBtn');
    const getRestaurantsBtn = document.getElementById('getRestaurants');
    const getSubscriptionsBtn = document.getElementById('getSubscriptions');
    
    if (user) {
      if (userInfoPanel) userInfoPanel.style.display = 'block';
      if (userInfo) userInfo.textContent = user.name + ' (' + user.userType + ')';
      
      if (goToDashboardBtn) {
        goToDashboardBtn.onclick = function() {
          window.location.hash = \`dashboard/\${user.userType}\`;
        };
      }
      
      // Abilita i pulsanti API
      if (getRestaurantsBtn) getRestaurantsBtn.disabled = false;
      if (getSubscriptionsBtn) getSubscriptionsBtn.disabled = false;
    } else {
      if (userInfoPanel) userInfoPanel.style.display = 'none';
      if (getRestaurantsBtn) getRestaurantsBtn.disabled = true;
      if (getSubscriptionsBtn) getSubscriptionsBtn.disabled = true;
    }
  }
}

// Aggiungi listener per cambiamenti hash
window.addEventListener('hashchange', handleRouting);

// Inizializza la pagina quando è caricata
document.addEventListener('DOMContentLoaded', function() {
  // Gestisci il routing iniziale
  handleRouting();
  
  // Gestisci form di login
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const username = document.getElementById('username')?.value || '';
      const password = document.getElementById('password')?.value || '';
      const messageEl = document.getElementById('loginMessage');
      const loginButton = document.getElementById('loginButton');
      
      // Validazione base
      if (!username || !password) {
        if (messageEl) {
          messageEl.textContent = 'Inserisci sia username che password';
          messageEl.className = 'error';
        }
        return;
      }
      
      if (messageEl) {
        messageEl.textContent = 'Tentativo di login in corso...';
        messageEl.className = '';
      }
      
      if (loginButton) loginButton.disabled = true;
      
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Salva l'utente in localStorage
          localStorage.setItem('thermopolio_user', JSON.stringify(data.user));
          
          // Mostra messaggio di successo
          if (messageEl) {
            messageEl.textContent = 'Login effettuato con successo!';
            messageEl.className = 'success';
          }
          
          // Aggiorna UI
          const userInfoPanel = document.getElementById('userInfoPanel');
          const userInfo = document.getElementById('userInfo');
          const goToDashboardBtn = document.getElementById('goToDashboardBtn');
          const getRestaurantsBtn = document.getElementById('getRestaurants');
          const getSubscriptionsBtn = document.getElementById('getSubscriptions');
          
          if (userInfoPanel) userInfoPanel.style.display = 'block';
          if (userInfo) userInfo.textContent = data.user.name + ' (' + data.user.userType + ')';
          
          // Abilita pulsanti API
          if (getRestaurantsBtn) getRestaurantsBtn.disabled = false;
          if (getSubscriptionsBtn) getSubscriptionsBtn.disabled = false;
          
          // Configura pulsante per andare alla dashboard
          if (goToDashboardBtn) {
            goToDashboardBtn.onclick = function() {
              window.location.hash = \`dashboard/\${data.dashboardType}\`;
            };
          }
          
          // Navigazione automatica alla dashboard dopo un breve ritardo
          setTimeout(() => {
            window.location.hash = \`dashboard/\${data.dashboardType}\`;
          }, 1000);
        } else {
          if (messageEl) {
            messageEl.textContent = data.message || 'Login fallito';
            messageEl.className = 'error';
          }
        }
      } catch (error) {
        console.error('Errore durante il login:', error);
        if (messageEl) {
          messageEl.textContent = 'Errore durante il login: ' + error.message;
          messageEl.className = 'error';
        }
      } finally {
        if (loginButton) loginButton.disabled = false;
      }
    });
  }
  
  // Gestisci pulsanti torna alla home
  document.querySelectorAll('.back-to-home').forEach(button => {
    button.addEventListener('click', function() {
      window.location.hash = '';
    });
  });
  
  // Gestisci pulsanti logout
  document.querySelectorAll('#customer-logout, #tavola-calda-logout, #onlus-logout').forEach(button => {
    button.addEventListener('click', function() {
      localStorage.removeItem('thermopolio_user');
      window.location.hash = '';
    });
  });
  
  // API Test buttons
  const getRestaurantsBtn = document.getElementById('getRestaurants');
  if (getRestaurantsBtn) {
    getRestaurantsBtn.addEventListener('click', async function() {
      const resultEl = document.getElementById('apiResult');
      const button = this;
      
      button.disabled = true;
      if (resultEl) resultEl.innerHTML = '<div>Caricamento ristoranti...</div>';
      
      try {
        const response = await fetch('/api/restaurants');
        const data = await response.json();
        
        if (resultEl) resultEl.innerHTML = '<h3>Ristoranti</h3><pre>' + JSON.stringify(data, null, 2) + '</pre>';
      } catch (error) {
        if (resultEl) resultEl.innerHTML = '<div class="error">Errore: ' + error.message + '</div>';
      } finally {
        button.disabled = false;
      }
    });
  }
  
  const getSubscriptionsBtn = document.getElementById('getSubscriptions');
  if (getSubscriptionsBtn) {
    getSubscriptionsBtn.addEventListener('click', async function() {
      const resultEl = document.getElementById('apiResult');
      const button = this;
      
      button.disabled = true;
      if (resultEl) resultEl.innerHTML = '<div>Caricamento abbonamenti...</div>';
      
      try {
        const response = await fetch('/api/subscription-plans');
        const data = await response.json();
        
        if (resultEl) resultEl.innerHTML = '<h3>Abbonamenti</h3><pre>' + JSON.stringify(data, null, 2) + '</pre>';
      } catch (error) {
        if (resultEl) resultEl.innerHTML = '<div class="error">Errore: ' + error.message + '</div>';
      } finally {
        button.disabled = false;
      }
    });
  }
});`;

/**
 * Funzione che crea file se non esistono
 */
function init() {
  console.log('Inizializzazione dell\'applicazione...');
  
  try {
    const publicDir = path.join(__dirname, '..', 'public');
    const cssDir = path.join(publicDir, 'css');
    const jsDir = path.join(publicDir, 'js');
    
    // Assicurati che le directory esistano
    if (!fs.existsSync(publicDir)) {
      console.log('Creazione della directory public...');
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    if (!fs.existsSync(cssDir)) {
      console.log('Creazione della directory css...');
      fs.mkdirSync(cssDir, { recursive: true });
    }
    
    if (!fs.existsSync(jsDir)) {
      console.log('Creazione della directory js...');
      fs.mkdirSync(jsDir, { recursive: true });
    }
    
    // Crea i file se non esistono
    const indexHtmlPath = path.join(publicDir, 'index.html');
    if (!fs.existsSync(indexHtmlPath)) {
      console.log('Creazione del file index.html...');
      fs.writeFileSync(indexHtmlPath, mainHtml);
    }
    
    const cssPath = path.join(cssDir, 'style.css');
    if (!fs.existsSync(cssPath)) {
      console.log('Creazione del file style.css...');
      fs.writeFileSync(cssPath, mainCss);
    }
    
    const jsPath = path.join(jsDir, 'app.js');
    if (!fs.existsSync(jsPath)) {
      console.log('Creazione del file app.js...');
      fs.writeFileSync(jsPath, mainJs);
    }
    
    console.log('Inizializzazione completata con successo!');
  } catch (err) {
    console.error('Errore durante l\'inizializzazione:', err);
  }
}

module.exports = init;