/**
 * File delle rotte API
 */

const express = require('express');
const router = express.Router();

// API health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API di autenticazione
router.post('/auth/login', (req, res) => {
  console.log('Richiesta di login ricevuta:', req.body);
  
  const { username, password } = req.body;
  
  // Credenziali di test hardcoded
  const users = {
    'cliente': { password: 'cliente123', userType: 'customer', name: 'Cliente Demo' },
    'ristorante': { password: 'ristorante123', userType: 'tavola-calda', name: 'Ristorante Demo' },
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
    
    res.json({ 
      success: true, 
      user,
      dashboardType: user.userType
    });
  } else {
    console.log('Login fallito. Username trovato:', !!users[username]);
    res.status(401).json({ success: false, message: 'Credenziali non valide' });
  }
});

// API per i ristoranti
router.get('/restaurants', (req, res) => {
  const restaurants = [
    { id: 1, name: 'Trattoria da Mario', type: 'Italiano', distance: '0.5 km', rating: 4.5 },
    { id: 2, name: 'Sushi Bar', type: 'Giapponese', distance: '1.2 km', rating: 4.3 },
    { id: 3, name: 'Pizzeria Napoletana', type: 'Italiano', distance: '0.8 km', rating: 4.7 },
    { id: 4, name: 'Bistrot Parigino', type: 'Francese', distance: '1.5 km', rating: 4.1 }
  ];
  res.json(restaurants);
});

// API per gli abbonamenti
router.get('/subscription-plans', (req, res) => {
  const plans = [
    { id: 1, userId: 2, name: 'Piano Pranzo', description: 'Pranzo completo', planType: 'completo', basePrice: 8.50 },
    { id: 2, userId: 2, name: 'Solo Primo', description: 'Solo primo piatto', planType: 'primo', basePrice: 5.00 },
    { id: 3, userId: 3, name: 'Piano Famiglia', description: 'Pasto completo famiglia', planType: 'completo', basePrice: 12.00 }
  ];
  res.json(plans);
});

// Crea un endpoint per creare nuovi piani di abbonamento
router.post('/subscription-plans', (req, res) => {
  console.log('Richiesta di creazione piano:', req.body);
  
  // Simuliamo la creazione di un piano
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

module.exports = router;