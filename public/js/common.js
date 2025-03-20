// Funzioni comuni per tutte le dashboard

// Verifica se l'utente è loggato e reindirizza se necessario
function checkAuth() {
  const user = getLoggedInUser();
  if (!user) {
    window.location.href = '/';
    return null;
  }
  return user;
}

// Ottieni l'utente loggato dal localStorage
function getLoggedInUser() {
  const storedUser = localStorage.getItem('thermopolio_user');
  if (!storedUser) {
    return null;
  }
  try {
    return JSON.parse(storedUser);
  } catch (e) {
    console.error('Errore nel parsing dell\'utente:', e);
    return null;
  }
}

// Logout: rimuove l'utente dal localStorage e reindirizza alla pagina di login
function logout() {
  localStorage.removeItem('thermopolio_user');
  window.location.href = '/';
}

// Formatta il prezzo come valuta
function formatCurrency(amount) {
  return new Intl.NumberFormat('it-IT', { 
    style: 'currency', 
    currency: 'EUR' 
  }).format(amount);
}

// Formatta data
function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('it-IT', { 
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

// Mostra messaggio di notifica
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Imposta il nome utente nell'header
function setUserInfo() {
  const user = getLoggedInUser();
  if (user && document.getElementById('userNameDisplay')) {
    document.getElementById('userNameDisplay').textContent = user.name;
  }
}

// Inizializza gli elementi comuni quando la pagina è caricata
document.addEventListener('DOMContentLoaded', function() {
  // Controlla l'autenticazione
  const user = checkAuth();
  if (!user) return;
  
  // Imposta info utente
  setUserInfo();
  
  // Gestione logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
});

// Funzioni comuni per tutte le dashboard

// Verifica se l'utente è loggato e reindirizza se necessario
function checkAuth() {
  const user = getLoggedInUser();
  if (!user) {
    window.location.href = '/';
    return null;
  }
  return user;
}

// Ottieni l'utente loggato dal localStorage
function getLoggedInUser() {
  const storedUser = localStorage.getItem('thermopolio_user');
  if (!storedUser) {
    return null;
  }
  try {
    return JSON.parse(storedUser);
  } catch (e) {
    console.error('Errore nel parsing dell\'utente:', e);
    return null;
  }
}

// Logout: rimuove l'utente dal localStorage e reindirizza alla pagina di login
function logout() {
  localStorage.removeItem('thermopolio_user');
  window.location.href = '/';
}

// Formatta il prezzo come valuta
function formatCurrency(amount) {
  return new Intl.NumberFormat('it-IT', { 
    style: 'currency', 
    currency: 'EUR' 
  }).format(amount);
}

// Formatta data
function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('it-IT', { 
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

// Mostra messaggio di notifica
function showNotification(message, type = 'info') {
  // Rimuovi notifiche esistenti
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(note => note.remove());
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Imposta il nome utente nell'header
function setUserInfo() {
  const user = getLoggedInUser();
  if (user && document.getElementById('userNameDisplay')) {
    document.getElementById('userNameDisplay').textContent = user.name;
  }
}

// Inizializza gli elementi comuni quando la pagina è caricata
document.addEventListener('DOMContentLoaded', function() {
  // Controlla l'autenticazione
  const user = checkAuth();
  if (!user) return;
  
  // Imposta info utente
  setUserInfo();
  
  // Gestione logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
});
