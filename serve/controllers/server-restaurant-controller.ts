// server/src/controllers/restaurant.controller.ts
import { Request, Response } from 'express';
import { storage } from '../services/storage';

export const getRestaurants = async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Non autenticato',
      });
    }
    
    // Recupera il tipo di cucina dalla query se presente
    const cuisineType = req.query.cuisineType as string;
    
    const restaurants = await storage.getRestaurants(cuisineType);
    
    // Rimuovi le password dalle risposte
    const sanitizedRestaurants = restaurants.map(restaurant => {
      const { password, ...rest } = restaurant;
      return rest;
    });
    
    res.json({
      success: true,
      data: sanitizedRestaurants,
    });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il recupero dei ristoranti',
    });
  }
};

export const getNearbyRestaurants = async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Non autenticato',
      });
    }
    
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = parseInt(req.query.radius as string) || 5; // Default 5km
    
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: 'Coordinate non valide',
      });
    }
    
    const restaurants = await storage.getNearbyRestaurants(lat, lng, radius);
    
    // Rimuovi le password dalle risposte
    const sanitizedRestaurants = restaurants.map(restaurant => {
      const { password, ...rest } = restaurant;
      return rest;
    });
    
    res.json({
      success: true,
      data: sanitizedRestaurants,
    });
  } catch (error) {
    console.error('Error fetching nearby restaurants:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il recupero dei ristoranti nelle vicinanze',
    });
  }
};

export const getFavoriteRestaurants = async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Non autenticato',
      });
    }
    
    // Verifica che l'utente sia un cliente
    if (req.session.userType !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Solo i clienti possono avere ristoranti preferiti',
      });
    }
    
    // Recupera l'utente
    const user = await storage.getUser(req.session.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utente non trovato',
      });
    }
    
    // Verifica se ci sono ristoranti preferiti
    if (!user.favoriteRestaurants || user.favoriteRestaurants.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }
    
    // Recupera i ristoranti preferiti
    const favoriteRestaurants = await storage.getRestaurantsByIds(user.favoriteRestaurants);
    
    // Rimuovi le password dalle risposte
    const sanitizedRestaurants = favoriteRestaurants.map(restaurant => {
      const { password, ...rest } = restaurant;
      return rest;
    });
    
    res.json({
      success: true,
      data: sanitizedRestaurants,
    });
  } catch (error) {
    console.error('Error fetching favorite restaurants:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il recupero dei ristoranti preferiti',
    });
  }
};

export const addFavoriteRestaurant = async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Non autenticato',
      });
    }
    
    // Verifica che l'utente sia un cliente
    if (req.session.userType !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Solo i clienti possono aggiungere ristoranti preferiti',
      });
    }
    
    const restaurantId = parseInt(req.params.id);
    
    if (isNaN(restaurantId)) {
      return res.status(400).json({
        success: false,
        message: 'ID ristorante non valido',
      });
    }
    
    // Verifica che il ristorante esista
    const restaurant = await storage.getUser(restaurantId);
    
    if (!restaurant || restaurant.userType !== 'tavola_calda') {
      return res.status(404).json({
        success: false,
        message: 'Ristorante non trovato',
      });
    }
    
    // Recupera l'utente
    const user = await storage.getUser(req.session.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utente non trovato',
      });
    }
    
    // Aggiorna la lista dei ristoranti preferiti
    const favoriteRestaurants = user.favoriteRestaurants || [];
    
    // Verifica se il ristorante è già nei preferiti
    if (favoriteRestaurants.includes(restaurantId)) {
      return res.status(400).json({
        success: false,
        message: 'Ristorante già presente nei preferiti',
      });
    }
    
    // Aggiungi il ristorante ai preferiti
    const updatedUser = await storage.updateUser(user.id, {
      favoriteRestaurants: [...favoriteRestaurants, restaurantId],
    });
    
    if (!updatedUser) {
      return res.status(500).json({
        success: false,
        message: 'Errore durante l\'aggiornamento dei ristoranti preferiti',
      });
    }
    
    res.json({
      success: true,
      message: 'Ristorante aggiunto ai preferiti',
    });
  } catch (error) {
    console.error('Error adding favorite restaurant:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'aggiunta del ristorante ai preferiti',
    });
  }
};

export const removeFavoriteRestaurant = async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Non autenticato',
      });
    }
    
    // Verifica che l'utente sia un cliente
    if (req.session.userType !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Solo i clienti possono rimuovere ristoranti preferiti',
      });
    }
    
    const restaurantId = parseInt(req.params.id);
    
    if (isNaN(restaurantId)) {
      return res.status(400).json({
        success: false,
        message: 'ID ristorante non valido',
      });
    }
    
    // Recupera l'utente
    const user = await storage.getUser(req.session.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utente non trovato',
      });
    }
    
    // Aggiorna la lista dei ristoranti preferiti
    const favoriteRestaurants = user.favoriteRestaurants || [];
    
    // Verifica se il ristorante è nei preferiti
    if (!favoriteRestaurants.includes(restaurantId)) {
      return res.status(400).json({
        success: false,
        message: 'Ristorante non presente nei preferiti',
      });
    }
    
    // Rimuovi il ristorante dai preferiti
    const updatedUser = await storage.updateUser(user.id, {
      favoriteRestaurants: favoriteRestaurants.filter(id => id !== restaurantId),
    });
    
    if (!updatedUser) {
      return res.status(500).json({
        success: false,
        message: 'Errore durante la rimozione del ristorante dai preferiti',
      });
    }
    
    res.json({
      success: true,
      message: 'Ristorante rimosso dai preferiti',
    });
  } catch (error) {
    console.error('Error removing favorite restaurant:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante la rimozione del ristorante dai preferiti',
    });
  }
};

export default {
  getRestaurants,
  getNearbyRestaurants,
  getFavoriteRestaurants,
  addFavoriteRestaurant,
  removeFavoriteRestaurant,
};
