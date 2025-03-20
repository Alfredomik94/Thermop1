/**
 * Controller per la gestione dei punti di ritiro
 */
import { Request, Response, NextFunction } from 'express';
import { supabase } from '../utils/supabase';
import { createAppError } from '../utils/error-handler';
import { validateBody } from '../utils/validators';
import { z } from 'zod';

// Schema per la creazione/aggiornamento di un punto di ritiro
const pickupPointSchema = z.object({
  name: z.string().min(3, 'Il nome deve essere di almeno 3 caratteri'),
  address: z.string().min(5, 'L\'indirizzo deve essere di almeno 5 caratteri'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  businessHours: z
    .record(z.string(), z.array(z.object({ start: z.string(), end: z.string() })))
    .optional(),
  pickupTimes: z.array(z.string()).optional(),
  description: z.string().optional(),
});

/**
 * Controller per la gestione dei punti di ritiro
 */
export class PickupController {
  /**
   * Ottiene tutti i punti di ritiro
   */
  async getAllPickupPoints(req: Request, res: Response, next: NextFunction) {
    try {
      // Parametri di query opzionali
      const { restaurantId } = req.query;

      let query = supabase.from('pickup_points').select('*');

      // Filtro per ristorante specifico
      if (restaurantId) {
        query = query.eq('restaurant_id', restaurantId);
      }

      const { data, error } = await query;

      if (error) throw error;

      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Ottiene un punto di ritiro specifico
   */
  async getPickupPointById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from('pickup_points')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return res.status(404).json({ message: 'Punto di ritiro non trovato' });
      }

      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crea un nuovo punto di ritiro
   */
  async createPickupPoint(req: Request, res: Response, next: NextFunction) {
    try {
      // Verifica che l'utente sia autenticato
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Non autorizzato' });
      }

      // Verifica che l'utente sia un ristorante
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      if (user.user_type !== 'tavola_calda') {
        return res.status(403).json({
          message: 'Solo i ristoranti possono creare punti di ritiro',
        });
      }

      // Valida i dati di input
      const pickupData = validateBody(req.body, pickupPointSchema);

      // Crea il punto di ritiro
      const { data, error } = await supabase
        .from('pickup_points')
        .insert({
          ...pickupData,
          restaurant_id: userId,
        })
        .select()
        .single();

      if (error) throw error;

      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Aggiorna un punto di ritiro esistente
   */
  async updatePickupPoint(req: Request, res: Response, next: NextFunction) {
    try {
      // Verifica che l'utente sia autenticato
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Non autorizzato' });
      }

      const { id } = req.params;

      // Verifica che il punto di ritiro esista ed appartenga all'utente
      const { data: pickupPoint, error: pickupError } = await supabase
        .from('pickup_points')
        .select('restaurant_id')
        .eq('id', id)
        .single();

      if (pickupError) {
        return res.status(404).json({ message: 'Punto di ritiro non trovato' });
      }

      if (pickupPoint.restaurant_id !== userId) {
        return res.status(403).json({
          message: 'Non sei autorizzato a modificare questo punto di ritiro',
        });
      }

      // Valida i dati di input
      const pickupData = validateBody(req.body, pickupPointSchema.partial());

      // Aggiorna il punto di ritiro
      const { data, error } = await supabase
        .from('pickup_points')
        .update(pickupData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Elimina un punto di ritiro
   */
  async deletePickupPoint(req: Request, res: Response, next: NextFunction) {
    try {
      // Verifica che l'utente sia autenticato
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Non autorizzato' });
      }

      const { id } = req.params;

      // Verifica che il punto di ritiro esista ed appartenga all'utente
      const { data: pickupPoint, error: pickupError } = await supabase
        .from('pickup_points')
        .select('restaurant_id')
        .eq('id', id)
        .single();

      if (pickupError) {
        return res.status(404).json({ message: 'Punto di ritiro non trovato' });
      }

      if (pickupPoint.restaurant_id !== userId) {
        return res.status(403).json({
          message: 'Non sei autorizzato a eliminare questo punto di ritiro',
        });
      }

      // Verifica se ci sono piani o ordini associati a questo punto di ritiro
      const { data: plans, error: plansError } = await supabase
        .from('subscription_plans')
        .select('id')
        .eq('pickup_location_id', id);

      if (plansError) throw plansError;

      if (plans && plans.length > 0) {
        return res.status(400).json({
          message: 'Non è possibile eliminare questo punto di ritiro perché è associato a uno o più piani',
        });
      }

      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .eq('pickup_point_id', id);

      if (ordersError) throw ordersError;

      if (orders && orders.length > 0) {
        return res.status(400).json({
          message: 'Non è possibile eliminare questo punto di ritiro perché è associato a uno o più ordini',
        });
      }

      // Elimina il punto di ritiro
      const { error } = await supabase
        .from('pickup_points')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Ottiene i punti di ritiro nelle vicinanze
   */
  async getNearbyPickupPoints(req: Request, res: Response, next: NextFunction) {
    try {
      const { lat, lng, radius = 5 } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({
          message: 'Coordinate di geolocalizzazione mancanti (lat, lng)',
        });
      }

      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);
      const radiusValue = parseFloat(radius as string);

      if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusValue)) {
        return res.status(400).json({
          message: 'Coordinate o raggio non validi',
        });
      }

      // In una soluzione reale, utilizzeremmo una query spaziale con PostGIS
      // Per questa demo, calcoliamo manualmente la distanza con la formula di Haversine
      const { data, error } = await supabase
        .from('pickup_points')
        .select(`
          *,
          restaurants:restaurant_id (
            name,
            business_name,
            business_type
          )
        `);

      if (error) throw error;

      // Calcola la distanza per ogni punto di ritiro e filtra
      const nearbyPoints = data
        .map(point => {
          const distance = calculateDistance(
            latitude,
            longitude,
            point.latitude,
            point.longitude
          );
          return { ...point, distance };
        })
        .filter(point => point.distance <= radiusValue)
        .sort((a, b) => a.distance - b.distance);

      res.json(nearbyPoints);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Ottiene i punti di ritiro di un ristorante
   */
  async getRestaurantPickupPoints(req: Request, res: Response, next: NextFunction) {
    try {
      // Verifica che l'utente sia autenticato
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Non autorizzato' });
      }

      const { data, error } = await supabase
        .from('pickup_points')
        .select('*')
        .eq('restaurant_id', userId);

      if (error) throw error;

      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Controlla la disponibilità di un punto di ritiro per una data specifica
   */
  async checkPickupPointAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({
          message: 'Data mancante',
        });
      }

      // Verifica che il punto di ritiro esista
      const { data: pickupPoint, error: pickupError } = await supabase
        .from('pickup_points')
        .select('*')
        .eq('id', id)
        .single();

      if (pickupError) {
        return res.status(404).json({ message: 'Punto di ritiro non trovato' });
      }

      // Ottieni gli ordini per la data specificata
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('pickup_point_id', id)
        .like('delivery_date', `${date}%`);

      if (ordersError) throw ordersError;

      // In un'implementazione reale, verificheremmo la disponibilità
      // considerando la capacità massima del punto di ritiro e gli orari
      const availability = {
        available: true,
        totalOrders: orders?.length || 0,
        availableSlots: pickupPoint.business_hours || {},
      };

      res.json(availability);
    } catch (error) {
      next(error);
    }
  }
}

/**
 * Calcola la distanza tra due coordinate in km (formula di Haversine)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Raggio della Terra in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distanza in km
}

export default new PickupController();
