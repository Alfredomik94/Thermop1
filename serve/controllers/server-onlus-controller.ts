// server/src/controllers/onlus.controller.ts
import { Request, Response } from 'express';
import { storage } from '../services/storage';

export const getOnlus = async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Non autenticato',
      });
    }
    
    const onlusList = await storage.getOnlus();
    
    // Rimuovi le password dalle risposte
    const sanitizedOnlusList = onlusList.map(onlus => {
      const { password, ...rest } = onlus;
      return rest;
    });
    
    res.json({
      success: true,
      data: sanitizedOnlusList,
    });
  } catch (error) {
    console.error('Error fetching ONLUS list:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il recupero delle ONLUS',
    });
  }
};

export const getOnlusStats = async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Non autenticato',
      });
    }
    
    // Verifica che l'utente sia una ONLUS
    if (req.session.userType !== 'onlus') {
      return res.status(403).json({
        success: false,
        message: 'Solo le ONLUS possono visualizzare le proprie statistiche',
      });
    }
    
    // Recupera le donazioni ricevute
    const donations = await storage.getDonationsByOnlusId(req.session.userId);
    
    // Calcola le statistiche
    const totalDonations = donations.length;
    
    // Calcola il numero di pasti totali (somma delle quantità degli ordini)
    let totalMeals = 0;
    const donorIds = new Set<number>();
    
    for (const donation of donations) {
      const order = await storage.getOrder(donation.orderId);
      if (order) {
        totalMeals += order.quantity;
        donorIds.add(donation.donorId);
      }
    }
    
    // Calcola la media giornaliera (ultimi 30 giorni)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentDonations = donations.filter(
      donation => new Date(donation.donationDate) >= thirtyDaysAgo
    );
    
    const averageDonationsPerDay = recentDonations.length / 30;
    
    // Recupera i top donatori (fino a 5)
    const topDonorIds = Array.from(donorIds);
    const topDonors = await Promise.all(
      topDonorIds.slice(0, 5).map(id => storage.getUser(id))
    );
    
    // Filtra eventuali donatori non trovati e rimuovi le password
    const sanitizedTopDonors = topDonors
      .filter(donor => donor !== null)
      .map(donor => {
        if (!donor) return null; // TypeScript necessita di questo controllo aggiuntivo
        const { password, ...rest } = donor;
        return rest;
      });
    
    res.json({
      success: true,
      data: {
        totalDonations,
        averageDonationsPerDay,
        totalMeals,
        topDonors: sanitizedTopDonors,
      },
    });
  } catch (error) {
    console.error('Error fetching ONLUS stats:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il recupero delle statistiche ONLUS',
    });
  }
};

export default {
  getOnlus,
  getOnlusStats,
};
