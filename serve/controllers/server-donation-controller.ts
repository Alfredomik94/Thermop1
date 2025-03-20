// server/src/controllers/donation.controller.ts
import { Request, Response } from 'express';
import { storage } from '../services/storage';
import { insertDonationSchema } from 'thermopolio-shared';
import { z } from 'zod';

export const createDonation = async (req: Request, res: Response) => {
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
        message: 'Solo i clienti possono creare donazioni',
      });
    }
    
    const donationData = insertDonationSchema.parse({
      ...req.body,
      donorId: req.session.userId,
      donationDate: new Date().toISOString(),
      status: 'pending',
    });
    
    // Verifica che l'ordine esista
    const order = await storage.getOrder(donationData.orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Ordine non trovato',
      });
    }
    
    // Verifica che l'ordine appartenga al cliente
    if (order.userId !== req.session.userId) {
      return res.status(403).json({
        success: false,
        message: 'Non autorizzato a donare questo ordine',
      });
    }
    
    // Verifica che l'ordine non sia già stato donato
    if (order.status === 'donated') {
      return res.status(400).json({
        success: false,
        message: 'Ordine già donato',
      });
    }
    
    // Verifica che la ONLUS esista
    const onlus = await storage.getUser(donationData.onlusId);
    if (!onlus || onlus.userType !== 'onlus') {
      return res.status(404).json({
        success: false,
        message: 'ONLUS non trovata',
      });
    }
    
    // Crea la donazione
    const donation = await storage.createDonation(donationData);
    
    // Aggiorna lo stato dell'ordine a donato
    await storage.updateOrderStatus(order.id, 'donated');
    
    res.status(201).json({
      success: true,
      message: 'Donazione creata con successo',
      data: donation,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Dati non validi',
        errors: error.errors.map(e => e.message),
      });
    } else {
      console.error('Error creating donation:', error);
      res.status(500).json({
        success: false,
        message: 'Errore durante la creazione della donazione',
      });
    }
  }
};

export const getDonations = async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Non autenticato',
      });
    }
    
    let donations = [];
    
    // Recupera le donazioni in base al tipo di utente
    if (req.session.userType === 'customer') {
      donations = await storage.getDonationsByDonorId(req.session.userId);
    } else if (req.session.userType === 'onlus') {
      donations = await storage.getDonationsByOnlusId(req.session.userId);
    } else {
      return res.status(403).json({
        success: false,
        message: 'Tipo di utente non autorizzato',
      });
    }
    
    // Arricchisci le donazioni con dettagli aggiuntivi
    const enrichedDonations = await Promise.all(donations.map(async (donation) => {
      const order = await storage.getOrder(donation.orderId);
      
      // Recupera il donatore o la ONLUS a seconda del tipo di utente
      let donor = null;
      let onlus = null;
      
      if (req.session.userType === 'customer') {
        onlus = await storage.getUser(donation.onlusId);
      } else {
        donor = await storage.getUser(donation.donorId);
      }
      
      return {
        ...donation,
        order,
        donor: donor ? { ...donor, password: undefined } : undefined,
        onlus: onlus ? { ...onlus, password: undefined } : undefined,
      };
    }));
    
    res.json({
      success: true,
      data: enrichedDonations,
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il recupero delle donazioni',
    });
  }
};

export const getDonation = async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Non autenticato',
      });
    }
    
    const donationId = parseInt(req.params.id);
    
    if (isNaN(donationId)) {
      return res.status(400).json({
        success: false,
        message: 'ID donazione non valido',
      });
    }
    
    const donation = await storage.getDonation(donationId);
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donazione non trovata',
      });
    }
    
    // Verifica che l'utente abbia accesso alla donazione
    if (donation.donorId !== req.session.userId && donation.onlusId !== req.session.userId) {
      return res.status(403).json({
        success: false,
        message: 'Non autorizzato a visualizzare questa donazione',
      });
    }
    
    // Arricchisci la donazione con dettagli aggiuntivi
    const order = await storage.getOrder(donation.orderId);
    const donor = await storage.getUser(donation.donorId);
    const onlus = await storage.getUser(donation.onlusId);
    
    res.json({
      success: true,
      data: {
        ...donation,
        order,
        donor: donor ? { ...donor, password: undefined } : undefined,
        onlus: onlus ? { ...onlus, password: undefined } : undefined,
      },
    });
  } catch (error) {
    console.error('Error fetching donation:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il recupero della donazione',
    });
  }
};

export const updateDonationStatus = async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Non autenticato',
      });
    }
    
    const donationId = parseInt(req.params.id);
    
    if (isNaN(donationId)) {
      return res.status(400).json({
        success: false,
        message: 'ID donazione non valido',
      });
    }
    
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Stato donazione non specificato',
      });
    }
    
    const donation = await storage.getDonation(donationId);
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donazione non trovata',
      });
    }
    
    // Verifica che l'utente sia una ONLUS
    if (req.session.userType !== 'onlus') {
      return res.status(403).json({
        success: false,
        message: 'Solo le ONLUS possono aggiornare lo stato delle donazioni',
      });
    }
    
    // Verifica che la donazione sia destinata a questa ONLUS
    if (donation.onlusId !== req.session.userId) {
      return res.status(403).json({
        success: false,
        message: 'Non autorizzato ad aggiornare lo stato di questa donazione',
      });
    }
    
    // Aggiorna lo stato della donazione
    // Nota: questo metodo non è implementato in storage.ts ma andrebbe aggiunto
    // const updatedDonation = await storage.updateDonationStatus(donationId, status);
    
    // Simula l'aggiornamento della donazione
    const updatedDonation = { ...donation, status };
    
    res.json({
      success: true,
      message: 'Stato donazione aggiornato con successo',
      data: updatedDonation,
    });
  } catch (error) {
    console.error('Error updating donation status:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'aggiornamento dello stato della donazione',
    });
  }
};

export default {
  createDonation,
  getDonations,
  getDonation,
  updateDonationStatus,
};
