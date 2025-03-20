import { Router } from 'express';
import { 
  createRating,
  updateRating,
  deleteRating,
  getEntityRatings,
  getUserRatings
} from '../controllers/server-rating-controller';
import { validate } from '../middleware/validation-middleware';
import { authenticateUser } from '../middleware/auth-middleware';
import { CreateRatingSchema, UpdateRatingSchema } from '@shared/schema/rating-schema';

/**
 * Registra le routes per le valutazioni nell'applicazione Express
 * @param app - Istanza Express
 * @param basePath - Percorso base per le routes
 */
export const registerRatingRoutes = (app, basePath: string) => {
  const router = Router();
  
  // Route per creare una nuova valutazione
  router.post(
    '/',
    authenticateUser,
    validate(CreateRatingSchema),
    createRating
  );
  
  // Route per aggiornare una valutazione esistente
  router.put(
    '/:ratingId',
    authenticateUser,
    validate(UpdateRatingSchema),
    updateRating
  );
  
  // Route per eliminare una valutazione
  router.delete(
    '/:ratingId',
    authenticateUser,
    deleteRating
  );
  
  // Route per ottenere le valutazioni di un'entità
  router.get(
    '/entity/:entityType/:entityId',
    getEntityRatings
  );
  
  // Route per ottenere le valutazioni di un utente
  router.get(
    '/user/:userId?',
    authenticateUser,
    getUserRatings
  );
  
  // Registra il router al percorso base
  app.use(basePath, router);
};
