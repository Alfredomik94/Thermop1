"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOnlusStats = exports.getOnlus = void 0;
const storage_1 = require("../services/storage");
const getOnlus = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Non autenticato',
            });
        }
        const onlusList = await storage_1.storage.getOnlus();
        // Rimuovi le password dalle risposte
        const sanitizedOnlusList = onlusList.map(onlus => {
            const { password, ...rest } = onlus;
            return rest;
        });
        res.json({
            success: true,
            data: sanitizedOnlusList,
        });
    }
    catch (error) {
        console.error('Error fetching ONLUS list:', error);
        res.status(500).json({
            success: false,
            message: 'Errore durante il recupero delle ONLUS',
        });
    }
};
exports.getOnlus = getOnlus;
const getOnlusStats = async (req, res) => {
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
        const donations = await storage_1.storage.getDonationsByOnlusId(req.session.userId);
        // Calcola le statistiche
        const totalDonations = donations.length;
        // Calcola il numero di pasti totali (somma delle quantità degli ordini)
        let totalMeals = 0;
        const donorIds = new Set();
        for (const donation of donations) {
            const order = await storage_1.storage.getOrder(donation.orderId);
            if (order) {
                totalMeals += order.quantity;
                donorIds.add(donation.donorId);
            }
        }
        // Calcola la media giornaliera (ultimi 30 giorni)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentDonations = donations.filter(donation => new Date(donation.donationDate) >= thirtyDaysAgo);
        const averageDonationsPerDay = recentDonations.length / 30;
        // Recupera i top donatori (fino a 5)
        const topDonorIds = Array.from(donorIds);
        const topDonors = await Promise.all(topDonorIds.slice(0, 5).map(id => storage_1.storage.getUser(id)));
        // Filtra eventuali donatori non trovati e rimuovi le password
        const sanitizedTopDonors = topDonors
            .filter(donor => donor !== null)
            .map(donor => {
            if (!donor)
                return null; // TypeScript necessita di questo controllo aggiuntivo
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
    }
    catch (error) {
        console.error('Error fetching ONLUS stats:', error);
        res.status(500).json({
            success: false,
            message: 'Errore durante il recupero delle statistiche ONLUS',
        });
    }
};
exports.getOnlusStats = getOnlusStats;
exports.default = {
    getOnlus: exports.getOnlus,
    getOnlusStats: exports.getOnlusStats,
};
