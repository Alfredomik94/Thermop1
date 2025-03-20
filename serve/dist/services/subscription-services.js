"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateFinalPrice = exports.getSubscriptionPlansByCuisineType = exports.subscribeToPlans = exports.getUserSubscriptionPlans = exports.createSubscriptionDiscount = exports.getSubscriptionDiscountsByPlanId = exports.deleteSubscriptionPlan = exports.updateSubscriptionPlan = exports.getSubscriptionPlanById = exports.getAllSubscriptionPlans = exports.createSubscriptionPlan = void 0;
const subscriptionsDb = __importStar(require("../db/subscriptions-db"));
const createSubscriptionPlan = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Non autorizzato' });
        }
        // Verifica che l'utente sia di tipo tavola_calda
        const user = req.session.user;
        if (user.userType !== 'tavola_calda') {
            return res.status(403).json({
                message: 'Solo i ristoranti possono creare piani di abbonamento'
            });
        }
        const { name, description, planType, basePrice } = req.body;
        const plan = await subscriptionsDb.createSubscriptionPlan({
            name,
            description,
            plan_type: planType,
            base_price: parseFloat(basePrice),
            user_id: req.session.userId,
        });
        // Se ci sono sconti, li crea
        if (req.body.discounts && Array.isArray(req.body.discounts)) {
            for (const discount of req.body.discounts) {
                await subscriptionsDb.createSubscriptionDiscount({
                    plan_id: plan.id,
                    deliveries_per_week: discount.deliveriesPerWeek,
                    duration_weeks: discount.durationWeeks,
                    discount_percentage: discount.discountPercentage,
                });
            }
        }
        res.status(201).json(plan);
    }
    catch (error) {
        console.error('Errore nella creazione del piano di abbonamento:', error);
        res.status(500).json({ message: error.message || 'Errore del server' });
    }
};
exports.createSubscriptionPlan = createSubscriptionPlan;
const getAllSubscriptionPlans = async (req, res) => {
    try {
        const { cuisineType } = req.query;
        let query = subscriptionsDb.getAllSubscriptionPlans();
        if (cuisineType && cuisineType !== 'Tutti') {
            query = subscriptionsDb.getSubscriptionPlansByCuisineType(cuisineType);
        }
        const plans = await query;
        res.json(plans);
    }
    catch (error) {
        console.error('Errore nel recupero dei piani di abbonamento:', error);
        res.status(500).json({ message: error.message || 'Errore del server' });
    }
};
exports.getAllSubscriptionPlans = getAllSubscriptionPlans;
const getSubscriptionPlanById = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await subscriptionsDb.getSubscriptionPlanById(parseInt(id));
        if (!plan) {
            return res.status(404).json({ message: 'Piano non trovato' });
        }
        res.json(plan);
    }
    catch (error) {
        console.error('Errore nel recupero del piano di abbonamento:', error);
        res.status(500).json({ message: error.message || 'Errore del server' });
    }
};
exports.getSubscriptionPlanById = getSubscriptionPlanById;
const updateSubscriptionPlan = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Non autorizzato' });
        }
        const { id } = req.params;
        const { name, description, planType, basePrice } = req.body;
        // Recupera il piano per verificare che appartenga al ristorante
        const plan = await subscriptionsDb.getSubscriptionPlanById(parseInt(id));
        if (!plan) {
            return res.status(404).json({ message: 'Piano non trovato' });
        }
        // Solo il ristorante che ha creato il piano può modificarlo
        if (plan.user_id !== req.session.userId) {
            return res.status(403).json({
                message: 'Non sei autorizzato a modificare questo piano'
            });
        }
        const updatedPlan = await subscriptionsDb.updateSubscriptionPlan(parseInt(id), {
            name,
            description,
            plan_type: planType,
            base_price: parseFloat(basePrice),
        });
        res.json(updatedPlan);
    }
    catch (error) {
        console.error('Errore nell\'aggiornamento del piano di abbonamento:', error);
        res.status(500).json({ message: error.message || 'Errore del server' });
    }
};
exports.updateSubscriptionPlan = updateSubscriptionPlan;
const deleteSubscriptionPlan = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Non autorizzato' });
        }
        const { id } = req.params;
        // Recupera il piano per verificare che appartenga al ristorante
        const plan = await subscriptionsDb.getSubscriptionPlanById(parseInt(id));
        if (!plan) {
            return res.status(404).json({ message: 'Piano non trovato' });
        }
        // Solo il ristorante che ha creato il piano può eliminarlo
        if (plan.user_id !== req.session.userId) {
            return res.status(403).json({
                message: 'Non sei autorizzato a eliminare questo piano'
            });
        }
        await subscriptionsDb.deleteSubscriptionPlan(parseInt(id));
        res.json({ message: 'Piano eliminato con successo' });
    }
    catch (error) {
        console.error('Errore nell\'eliminazione del piano di abbonamento:', error);
        res.status(500).json({ message: error.message || 'Errore del server' });
    }
};
exports.deleteSubscriptionPlan = deleteSubscriptionPlan;
const getSubscriptionDiscountsByPlanId = async (req, res) => {
    try {
        const { id } = req.params;
        const discounts = await subscriptionsDb.getSubscriptionDiscountsByPlanId(parseInt(id));
        res.json(discounts);
    }
    catch (error) {
        console.error('Errore nel recupero degli sconti:', error);
        res.status(500).json({ message: error.message || 'Errore del server' });
    }
};
exports.getSubscriptionDiscountsByPlanId = getSubscriptionDiscountsByPlanId;
const createSubscriptionDiscount = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Non autorizzato' });
        }
        const { id } = req.params;
        const { deliveriesPerWeek, durationWeeks, discountPercentage } = req.body;
        // Recupera il piano per verificare che appartenga al ristorante
        const plan = await subscriptionsDb.getSubscriptionPlanById(parseInt(id));
        if (!plan) {
            return res.status(404).json({ message: 'Piano non trovato' });
        }
        // Solo il ristorante che ha creato il piano può aggiungere sconti
        if (plan.user_id !== req.session.userId) {
            return res.status(403).json({
                message: 'Non sei autorizzato a modificare questo piano'
            });
        }
        const discount = await subscriptionsDb.createSubscriptionDiscount({
            plan_id: parseInt(id),
            deliveries_per_week: deliveriesPerWeek,
            duration_weeks: durationWeeks,
            discount_percentage: discountPercentage,
        });
        res.status(201).json(discount);
    }
    catch (error) {
        console.error('Errore nella creazione dello sconto:', error);
        res.status(500).json({ message: error.message || 'Errore del server' });
    }
};
exports.createSubscriptionDiscount = createSubscriptionDiscount;
const getUserSubscriptionPlans = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Non autorizzato' });
        }
        const plans = await subscriptionsDb.getSubscriptionPlansByUserId(req.session.userId);
        res.json(plans);
    }
    catch (error) {
        console.error('Errore nel recupero dei piani dell\'utente:', error);
        res.status(500).json({ message: error.message || 'Errore del server' });
    }
};
exports.getUserSubscriptionPlans = getUserSubscriptionPlans;
const subscribeToPlans = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Non autorizzato' });
        }
        // Verifica che l'utente sia di tipo customer
        const user = req.session.user;
        if (user.userType !== 'customer') {
            return res.status(403).json({
                message: 'Solo i clienti possono abbonarsi ai piani'
            });
        }
        // Implementazione della sottoscrizione a un piano
        // Qui andrebbero gestiti i dettagli del pagamento e della creazione dell'abbonamento
        // Per semplicità, consideriamo solo la risposta di conferma
        res.json({ message: 'Abbonamento effettuato con successo' });
    }
    catch (error) {
        console.error('Errore nella sottoscrizione al piano:', error);
        res.status(500).json({ message: error.message || 'Errore del server' });
    }
};
exports.subscribeToPlans = subscribeToPlans;
// server/db/subscriptions-db.ts
const supabase_client_1 = require("./supabase-client");
const getAllSubscriptionPlans = async () => {
    const { data, error } = await supabase_client_1.supabaseAdmin
        .from('subscription_plans')
        .select(`
      *,
      users:user_id (id, business_name, business_type, address)
    `)
        .order('created_at', { ascending: false });
    if (error)
        throw error;
    return data;
};
exports.getAllSubscriptionPlans = getAllSubscriptionPlans;
const getSubscriptionPlansByCuisineType = async (cuisineType) => {
    const { data, error } = await supabase_client_1.supabaseAdmin
        .from('subscription_plans')
        .select(`
      *,
      users:user_id (id, business_name, business_type, address)
    `)
        .eq('users.business_type', cuisineType)
        .order('created_at', { ascending: false });
    if (error)
        throw error;
    return data;
};
exports.getSubscriptionPlansByCuisineType = getSubscriptionPlansByCuisineType;
const createSubscriptionDiscount = async (discount) => {
    const { data, error } = await supabase_client_1.supabaseAdmin
        .from('subscription_discounts')
        .insert(discount)
        .select()
        .single();
    if (error)
        throw error;
    return data;
};
exports.createSubscriptionDiscount = createSubscriptionDiscount;
// Funzione per calcolare il prezzo finale di un piano con sconti
const calculateFinalPrice = async (planId, deliveriesPerWeek, durationWeeks) => {
    try {
        // Recupera il piano
        const plan = await (0, exports.getSubscriptionPlanById)(planId);
        if (!plan)
            throw new Error('Piano non trovato');
        // Recupera gli sconti applicabili
        const { data: discounts, error } = await supabase_client_1.supabaseAdmin
            .from('subscription_discounts')
            .select('*')
            .eq('plan_id', planId)
            .lte('deliveries_per_week', deliveriesPerWeek)
            .lte('duration_weeks', durationWeeks)
            .order('discount_percentage', { ascending: false })
            .limit(1);
        if (error)
            throw error;
        // Calcola il prezzo base totale
        const baseTotal = plan.base_price * deliveriesPerWeek * durationWeeks;
        // Applica lo sconto se disponibile
        if (discounts && discounts.length > 0) {
            const discount = discounts[0];
            const discountAmount = baseTotal * (discount.discount_percentage / 100);
            return {
                basePrice: plan.base_price,
                baseTotal,
                discountPercentage: discount.discount_percentage,
                discountAmount,
                finalPrice: baseTotal - discountAmount
            };
        }
        // Nessuno sconto applicabile
        return {
            basePrice: plan.base_price,
            baseTotal,
            discountPercentage: 0,
            discountAmount: 0,
            finalPrice: baseTotal
        };
    }
    catch (error) {
        console.error('Errore nel calcolo del prezzo finale:', error);
        throw error;
    }
};
exports.calculateFinalPrice = calculateFinalPrice;
