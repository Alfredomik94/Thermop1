"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getOrder = exports.getOrders = exports.createOrder = void 0;
const storage_1 = require("../services/storage");
const thermopolio_shared_1 = require("thermopolio-shared");
const zod_1 = require("zod");
const createOrder = async (req, res) => {
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
                message: 'Solo i clienti possono creare ordini',
            });
        }
        const orderData = thermopolio_shared_1.insertOrderSchema.parse({
            ...req.body,
            userId: req.session.userId,
        });
        // Verifica che il piano di abbonamento esista
        const plan = await storage_1.storage.getSubscriptionPlan(orderData.planId);
        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Piano di abbonamento non trovato',
            });
        }
        const order = await storage_1.storage.createOrder(orderData);
        res.status(201).json({
            success: true,
            message: 'Ordine creato con successo',
            data: order,
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
            console.error('Error creating order:', error);
            res.status(500).json({
                success: false,
                message: 'Errore durante la creazione dell\'ordine',
            });
        }
    }
};
exports.createOrder = createOrder;
const getOrders = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Non autenticato',
            });
        }
        let orders = [];
        // Recupera gli ordini in base al tipo di utente
        if (req.session.userType === 'customer') {
            orders = await storage_1.storage.getOrdersByUserId(req.session.userId);
        }
        else if (req.session.userType === 'tavola_calda') {
            orders = await storage_1.storage.getOrdersByRestaurantId(req.session.userId);
        }
        else {
            return res.status(403).json({
                success: false,
                message: 'Tipo di utente non autorizzato',
            });
        }
        // Arricchisci gli ordini con dettagli aggiuntivi
        const enrichedOrders = await Promise.all(orders.map(async (order) => {
            const plan = await storage_1.storage.getSubscriptionPlan(order.planId);
            // Recupera il ristorante o il cliente a seconda del tipo di utente
            let restaurant = null;
            let customer = null;
            if (req.session.userType === 'customer') {
                restaurant = await storage_1.storage.getUser(order.restaurantId);
            }
            else {
                customer = await storage_1.storage.getUser(order.userId);
            }
            // Recupera il punto di ritiro se presente
            let pickupPoint = null;
            if (order.pickupPointId) {
                // Nota: questo metodo non è implementato in storage.ts ma andrebbe aggiunto
                // pickupPoint = await storage.getPickupPoint(order.pickupPointId);
                // Simula il recupero del punto di ritiro
                pickupPoint = {
                    id: order.pickupPointId,
                    name: "Punto di ritiro",
                    address: "Indirizzo del punto di ritiro",
                    latitude: 0,
                    longitude: 0,
                };
            }
            return {
                ...order,
                plan,
                restaurant: restaurant ? { ...restaurant, password: undefined } : undefined,
                customer: customer ? { ...customer, password: undefined } : undefined,
                pickupPoint,
            };
        }));
        res.json({
            success: true,
            data: enrichedOrders,
        });
    }
    catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: 'Errore durante il recupero degli ordini',
        });
    }
};
exports.getOrders = getOrders;
const getOrder = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Non autenticato',
            });
        }
        const orderId = parseInt(req.params.id);
        if (isNaN(orderId)) {
            return res.status(400).json({
                success: false,
                message: 'ID ordine non valido',
            });
        }
        const order = await storage_1.storage.getOrder(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Ordine non trovato',
            });
        }
        // Verifica che l'utente abbia accesso all'ordine
        if (order.userId !== req.session.userId && order.restaurantId !== req.session.userId) {
            return res.status(403).json({
                success: false,
                message: 'Non autorizzato a visualizzare questo ordine',
            });
        }
        // Arricchisci l'ordine con dettagli aggiuntivi
        const plan = await storage_1.storage.getSubscriptionPlan(order.planId);
        const restaurant = await storage_1.storage.getUser(order.restaurantId);
        const customer = await storage_1.storage.getUser(order.userId);
        let pickupPoint = null;
        if (order.pickupPointId) {
            // Nota: questo metodo non è implementato in storage.ts ma andrebbe aggiunto
            // pickupPoint = await storage.getPickupPoint(order.pickupPointId);
            // Simula il recupero del punto di ritiro
            pickupPoint = {
                id: order.pickupPointId,
                name: "Punto di ritiro",
                address: "Indirizzo del punto di ritiro",
                latitude: 0,
                longitude: 0,
            };
        }
        res.json({
            success: true,
            data: {
                ...order,
                plan,
                restaurant: restaurant ? { ...restaurant, password: undefined } : undefined,
                customer: customer ? { ...customer, password: undefined } : undefined,
                pickupPoint,
            },
        });
    }
    catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({
            success: false,
            message: 'Errore durante il recupero dell\'ordine',
        });
    }
};
exports.getOrder = getOrder;
const updateOrderStatus = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Non autenticato',
            });
        }
        const orderId = parseInt(req.params.id);
        if (isNaN(orderId)) {
            return res.status(400).json({
                success: false,
                message: 'ID ordine non valido',
            });
        }
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Stato ordine non specificato',
            });
        }
        const order = await storage_1.storage.getOrder(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Ordine non trovato',
            });
        }
        // Verifica le autorizzazioni in base allo stato
        if (status === 'donated') {
            // Solo il cliente può donare un ordine
            if (req.session.userType !== 'customer' || order.userId !== req.session.userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Non autorizzato a donare questo ordine',
                });
            }
        }
        else if (status === 'completed' || status === 'confirmed' || status === 'ready') {
            // Solo il ristorante può aggiornare lo stato a completato, confermato o pronto
            if (req.session.userType !== 'tavola_calda' || order.restaurantId !== req.session.userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Non autorizzato ad aggiornare lo stato di questo ordine',
                });
            }
        }
        const updatedOrder = await storage_1.storage.updateOrderStatus(orderId, status);
        res.json({
            success: true,
            message: 'Stato ordine aggiornato con successo',
            data: updatedOrder,
        });
    }
    catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: 'Errore durante l\'aggiornamento dello stato dell\'ordine',
        });
    }
};
exports.updateOrderStatus = updateOrderStatus;
exports.default = {
    createOrder: exports.createOrder,
    getOrders: exports.getOrders,
    getOrder: exports.getOrder,
    updateOrderStatus: exports.updateOrderStatus,
};
