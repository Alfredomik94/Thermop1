"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubscriptionPlan = exports.getSubscriptionPlans = exports.createSubscriptionPlan = void 0;
const storage_1 = require("../services/storage");
const thermopolio_shared_1 = require("thermopolio-shared");
const zod_1 = require("zod");
const createSubscriptionPlan = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Non autenticato',
            });
        }
        // Verifica che l'utente sia un ristorante
        if (req.session.userType !== 'tavola_calda') {
            return res.status(403).json({
                success: false,
                message: 'Solo i ristoranti possono creare piani di abbonamento',
            });
        }
        const planData = thermopolio_shared_1.insertSubscriptionPlanSchema.parse({
            ...req.body,
            userId: req.session.userId
        });
        const plan = await storage_1.storage.createSubscriptionPlan(planData);
        // Crea gli sconti associati
        if (req.body.discounts && Array.isArray(req.body.discounts)) {
            for (const discount of req.body.discounts) {
                const discountData = thermopolio_shared_1.insertSubscriptionDiscountSchema.parse({
                    ...discount,
                    planId: plan.id
                });
                await storage_1.storage.createSubscriptionDiscount(discountData);
            }
        }
        res.status(201).json({
            success: true,
            message: 'Piano di abbonamento creato con successo',
            data: plan,
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                success: false,
                message: 'Dati non validi',
                errors: error.errors.map(e => e.message),
            });
        }
        else {
            console.error('Error creating subscription plan:', error);
            res.status(500).json({
                success: false,
                message: 'Errore durante la creazione del piano di abbonamento',
            });
        }
    }
};
exports.createSubscriptionPlan = createSubscriptionPlan;
const getSubscriptionPlans = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Non autenticato',
            });
        }
        const userId = parseInt(req.query.userId) || req.session.userId;
        // Se l'utente richiede i piani di un altro utente, verifica che sia un cliente
        if (userId !== req.session.userId && req.session.userType !== 'customer') {
            return res.status(403).json({
                success: false,
                message: 'Non autorizzato a visualizzare i piani di altri utenti',
            });
        }
        const plans = await storage_1.storage.getSubscriptionPlansByUserId(userId);
        // Recupera gli sconti per ciascun piano
        const plansWithDiscounts = await Promise.all(plans.map(async (plan) => {
            const discounts = await storage_1.storage.getSubscriptionDiscounts(plan.id);
            return { ...plan, discounts };
        }));
        res.json({
            success: true,
            data: plansWithDiscounts,
        });
    }
    catch (error) {
        console.error('Error fetching subscription plans:', error);
        res.status(500).json({
            success: false,
            message: 'Errore durante il recupero dei piani di abbonamento',
        });
    }
};
exports.getSubscriptionPlans = getSubscriptionPlans;
const getSubscriptionPlan = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Non autenticato',
            });
        }
        const planId = parseInt(req.params.id);
        if (isNaN(planId)) {
            return res.status(400).json({
                success: false,
                message: 'ID piano non valido',
            });
        }
        const plan = await storage_1.storage.getSubscriptionPlan(planId);
        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Piano di abbonamento non trovato',
            });
        }
        // Verifica che l'utente abbia accesso al piano
        if (plan.userId !== req.session.userId && req.session.userType !== 'customer') {
            return res.status(403).json({
                success: false,
                message: 'Non autorizzato a visualizzare questo piano',
            });
        }
        // Recupera gli sconti
        const discounts = await storage_1.storage.getSubscriptionDiscounts(planId);
        res.json({
            success: true,
            data: { ...plan, discounts },
        });
    }
    catch (error) {
        console.error('Error fetching subscription plan:', error);
        res.status(500).json({
            success: false,
            message: 'Errore durante il recupero del piano di abbonamento',
        });
    }
};
exports.getSubscriptionPlan = getSubscriptionPlan;
exports.default = {
    createSubscriptionPlan: exports.createSubscriptionPlan,
    getSubscriptionPlans: exports.getSubscriptionPlans,
    getSubscriptionPlan: exports.getSubscriptionPlan,
};
