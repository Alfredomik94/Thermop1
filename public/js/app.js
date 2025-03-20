// Funzioni di utilità per la navigazione
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
    const dashboardId = `${dashboardType}-dashboard`;
    showSection(dashboardId);
    
    // Aggiungiamo controlli per assicurarci che gli elementi DOM esistano
    const usernameElement = document.getElementById(`${dashboardType}-username`);
    const userTypeElement = document.getElementById(`${dashboardType}-userType`);
    
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
          window.location.hash = `dashboard/${user.userType}`;
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
              window.location.hash = `dashboard/${data.dashboardType}`;
            };
          }
          
          // Navigazione automatica alla dashboard dopo un breve ritardo
          setTimeout(() => {
            window.location.hash = `dashboard/${data.dashboardType}`;
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
});