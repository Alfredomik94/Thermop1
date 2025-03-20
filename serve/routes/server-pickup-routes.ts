// server/src/routes/pickup-point.routes.ts
import express from 'express';
import { isAuthenticated } from '../middleware/auth.middleware';
import { Request, Response } from 'express';

const router = express.Router();

// Forniamo dei punti di ritiro simulati
router.get('/', isAuthenticated, (req: Request, res: Response) => {
  const { lat, lng, radius = 5 } = req.query;
  
  // Dati simulati per i punti di ritiro
  const pickupPoints = [
    {
      id: 1,
      name: "Punto Ritiro Centro",
      address: "Via Roma 123, Milano",
      latitude: 45.4642,
      longitude: 9.1900,
      businessName: "Ristorante da Mario",
      pickupTimes: ["12:00-14:00", "18:00-20:00"],
      distance: "0.5km"
    },
    {
      id: 2,
      name: "Punto Ritiro Stazione",
      address: "Piazza Duca d'Aosta 1, Milano",
      latitude: 45.4847,
      longitude: 9.2027,
      businessName: "Tavola Calda Milano",
      pickupTimes: ["11:30-14:30", "17:30-20:30"],
      distance: "1.2km"
    },
    {
      id: 3,
      name: "Punto Ritiro Duomo",
      address: "Piazza del Duomo, Milano",
      latitude: 45.4642,
      longitude: 9.1900,
      businessName: "Caffè Duomo",
      pickupTimes: ["10:00-22:00"],
      distance: "0.8km"
    },
    {
      id: 4,
      name: "Punto Ritiro Navigli",
      address: "Alzaia Naviglio Grande 34, Milano",
      latitude: 45.4545,
      longitude: 9.1742,
      businessName: "Osteria del Naviglio",
      pickupTimes: ["12:00-15:00", "19:00-23:00"],
      distance: "2.3km"
    },
    {
      id: 5,
      name: "Punto Ritiro Porta Nuova",
      address: "Piazza Gae Aulenti, Milano",
      latitude: 45.4822,
      longitude: 9.1897,
      businessName: "Bistrot Verticale",
      pickupTimes: ["08:00-20:00"],
      distance: "1.7km"
    }
  ];
  
  res.json({
    success: true,
    data: pickupPoints,
  });
});

router.get('/:id', isAuthenticated, (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  
  // Dati simulati per il punto di ritiro specifico
  const pickupPoint = {
    id: id,
    name: `Punto Ritiro ${id}`,
    address: `Via Esempio ${id}, Milano`,
    latitude: 45.4642 + (id / 100),
    longitude: 9.1900 + (id / 100),
    businessName: `Attività ${id}`,
    pickupTimes: ["12:00-14:00", "18:00-20:00"],
  };
  
  res.json({
    success: true,
    data: pickupPoint,
  });
});

export default router;
