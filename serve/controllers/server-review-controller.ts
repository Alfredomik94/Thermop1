// server/src/controllers/review.controller.ts
import { Request, Response } from 'express';
import { storage } from '../services/storage';
import { insertReviewSchema } from 'thermopolio-shared';
import { z } from 'zod';

export const createReview = async (req: Request, res: Response) => {
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
        message: 'Solo i clienti possono creare recensioni',
      });
    }
    
    const reviewData = insertReviewSchema.parse({
      ...req.body,
      userId: req.session.userId,
    });
    
    // Verifica che il piano di abbonamento esista
    const plan = await storage.getSubscriptionPlan(reviewData.planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Piano di abbonamento non trovato',
      });
    }
    
    // Verifica che il cliente abbia acquistato il piano
    // Nota: In una implementazione reale, verificherebbe che l'utente
    // abbia effettivamente completato un ordine con questo piano
    
    const review = await storage.createReview(reviewData);
    
    res.status(201).json({
      success: true,
      message: 'Recensione creata con successo',
      data: review,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Dati non validi',
        errors: error.errors.map(e => e.message),
      });
    } else {
      console.error('Error creating review:', error);
      res.status(500).json({
        success: false,
        message: 'Errore durante la creazione della recensione',
      });
    }
  }
};

export const getReviewsByPlan = async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Non autenticato',
      });
    }
    
    const planId = parseInt(req.params.planId);
    
    if (isNaN(planId)) {
      return res.status(400).json({
        success: false,
        message: 'ID piano non valido',
      });
    }
    
    // Verifica che il piano di abbonamento esista
    const plan = await storage.getSubscriptionPlan(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Piano di abbonamento non trovato',
      });
    }
    
    const reviews = await storage.getReviewsByPlanId(planId);
    
    // Arricchisci le recensioni con i dettagli degli utenti
    const enrichedReviews = await Promise.all(reviews.map(async (review) => {
      const user = await storage.getUser(review.userId);
      return {
        ...review,
        user: user ? { ...user, password: undefined } : undefined,
      };
    }));
    
    res.json({
      success: true,
      data: enrichedReviews,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il recupero delle recensioni',
    });
  }
};

export default {
  createReview,
  getReviewsByPlan,
};
