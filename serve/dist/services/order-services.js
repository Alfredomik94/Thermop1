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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOnlusDonations = exports.getRestaurantOrders = exports.getNextOrder = exports.getOrders = exports.donateOrder = exports.updateOrderStatus = exports.getNextOrderByUserId = exports.getDonationsByOnlusId = exports.getOrdersByRestaurantId = exports.getOrdersByUserId = exports.getOrderById = exports.createOrder = void 0;
// server/db/orders-db.ts
const supabase_client_1 = require("./supabase-client");
const createOrder = async (order) => {
    const { data, error } = await supabase_client_1.supabaseAdmin
        .from('orders')
        .insert({
        ...order,
        is_donated: false,
    })
        .select()
        .single();
    if (error)
        throw error;
    return data;
};
exports.createOrder = createOrder;
const getOrderById = async (id) => {
    const { data, error } = await supabase_client_1.supabaseAdmin
        .from('orders')
        .select(`
      *,
      subscription_plans:plan_id (*),
      users:user_id (name, username),
      restaurants:restaurant_id (name, business_name)
    `)
        .eq('id', id)
        .single();
    if (error)
        throw error;
    return data;
};
exports.getOrderById = getOrderById;
const getOrdersByUserId = async (userId) => {
    const { data, error } = await supabase_client_1.supabaseAdmin
        .from('orders')
        .select(`
      *,
      subscription_plans:plan_id (*),
      users:restaurant_id (name, business_name)
    `)
        .eq('user_id', userId)
        .order('delivery_date', { ascending: false });
    if (error)
        throw error;
    return data;
};
exports.getOrdersByUserId = getOrdersByUserId;
const getOrdersByRestaurantId = async (restaurantId) => {
    const { data, error } = await supabase_client_1.supabaseAdmin
        .from('orders')
        .select(`
      *,
      subscription_plans:plan_id (*),
      users:user_id (name, username)
    `)
        .eq('restaurant_id', restaurantId)
        .order('delivery_date', { ascending: false });
    if (error)
        throw error;
    return data;
};
exports.getOrdersByRestaurantId = getOrdersByRestaurantId;
const getDonationsByOnlusId = async (onlusId) => {
    const { data, error } = await supabase_client_1.supabaseAdmin
        .from('orders')
        .select(`
      *,
      subscription_plans:plan_id (*),
      users:user_id (name, username)
    `)
        .eq('onlus_id', onlusId)
        .eq('is_donated', true)
        .order('created_at', { ascending: false });
    if (error)
        throw error;
    return data;
};
exports.getDonationsByOnlusId = getDonationsByOnlusId;
const getNextOrderByUserId = async (userId) => {
    const { data, error } = await supabase_client_1.supabaseAdmin
        .from('orders')
        .select(`
      *,
      subscription_plans:plan_id (name, plan_type),
      users:restaurant_id (name, business_name)
    `)
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('delivery_date', { ascending: true })
        .limit(1)
        .single();
    if (error && error.code !== 'PGRST116')
        throw error;
    return data || null;
};
exports.getNextOrderByUserId = getNextOrderByUserId;
const updateOrderStatus = async (id, status) => {
    const { data, error } = await supabase_client_1.supabaseAdmin
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
    if (error)
        throw error;
    return data;
};
exports.updateOrderStatus = updateOrderStatus;
const donateOrder = async (id, onlusId) => {
    const { data, error } = await supabase_client_1.supabaseAdmin
        .from('orders')
        .update({
        status: 'donated',
        is_donated: true,
        onlus_id: onlusId
    })
        .eq('id', id)
        .select()
        .single();
    if (error)
        throw error;
    return data;
};
exports.donateOrder = donateOrder;
const ordersDb = __importStar(require("../db/orders-db"));
const subscriptionsDb = __importStar(require("../db/subscriptions-db"));
const notificationService = __importStar(require("../services/notification-service"));
const createOrder = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Non autorizzato' });
        }
        const { planId, restaurantId, quantity, deliveryDate, pickupPointId } = req.body;
        // Verifica che l'utente sia di tipo customer
        const user = req.session.user;
        if (user.userType !== 'customer') {
            return res.status(403).json({
                message: 'Solo i clienti possono effettuare ordini'
            });
        }
        // Verifica che il piano esista e appartenga al ristorante indicato
        const plan = await subscriptionsDb.getSubscriptionPlanById(planId);
        if (!plan) {
            return res.status(404).json({ message: 'Piano non trovato' });
        }
        if (plan.user_id !== restaurantId) {
            return res.status(400).json({
                message: 'Il piano non appartiene al ristorante indicato'
            });
        }
        const order = await ordersDb.createOrder({
            user_id: req.session.userId,
            plan_id: planId,
            restaurant_id: restaurantId,
            quantity,
            delivery_date: deliveryDate,
            pickup_point_id: pickupPointId || null,
            status: 'pending'
        });
        // Invia notifica al ristorante
        await notificationService.notifyNewOrder(restaurantId, order.id, user.name);
        res.status(201).json(order);
    }
    catch (error) {
        console.error('Errore nella creazione dell\'ordine:', error);
        res.status(500).json({ message: error.message || 'Errore del server' });
    }
};
exports.createOrder = createOrder;
const getOrders = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Non autorizzato' });
        }
        const orders = await ordersDb.getOrdersByUserId(req.session.userId);
        res.json(orders);
    }
    catch (error) {
        console.error('Errore nel recupero degli ordini:', error);
        res.status(500).json({ message: error.message || 'Errore del server' });
    }
};
exports.getOrders = getOrders;
const getNextOrder = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Non autorizzato' });
        }
        const order = await ordersDb.getNextOrderByUserId(req.session.userId);
        res.json(order);
    }
    catch (error) {
        console.error('Errore nel recupero del prossimo ordine:', error);
        res.status(500).json({ message: error.message || 'Errore del server' });
    }
};
exports.getNextOrder = getNextOrder;
const getRestaurantOrders = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Non autorizzato' });
        }
        // Verifica che l'utente sia di tipo tavola_calda
        const user = req.session.user;
        if (user.userType !== 'tavola_calda') {
            return res.status(403).json({
                message: 'Solo i ristoranti possono vedere i propri ordini'
            });
        }
        const orders = await ordersDb.getOrdersByRestaurantId(req.session.userId);
        res.json(orders);
    }
    catch (error) {
        console.error('Errore nel recupero degli ordini del ristorante:', error);
        res.status(500).json({ message: error.message || 'Errore del server' });
    }
};
exports.getRestaurantOrders = getRestaurantOrders;
const getOnlusDonations = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Non autorizzato' });
        }
        // Verifica che l'utente sia di tipo onlus
        const user = req.session.user;
        if (user.userType !== 'onlus') {
            return res.status(403).json({
                message: 'Solo le ONLUS possono vedere le proprie donazioni'
            });
        }
        const donations = await ordersDb.getDonationsByOnlusId(req.session.userId);
        res.json(donations);
    }
    catch (error) {
        console.error('Errore nel recupero delle donazioni:', error);
        res.status(500).json({ message: error.message || 'Errore del server' });
    }
};
exports.getOnlusDonations = getOnlusDonations;
const updateOrderStatus = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Non autorizzato' });
        }
        const { id } = req.params;
        const { status } = req.body;
        // Verifica che il nuovo stato sia valido
        const validStatuses = ['pending', 'confirmed', 'ready', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Stato non valido' });
        }
        // Recupera l'ordine per verificare che appartenga al ristorante
        const order = await ordersDb.getOrderById(parseInt(id));
        if (!order) {
            return res.status(404).json({ message: 'Ordine non trovato' });
        }
        // Solo il ristorante che ha ricevuto l'ordine può aggiornarlo
        if (order.restaurant_id !== req.session.userId) {
            return res.status(403).json({
                message: 'Non sei autorizzato ad aggiornare questo ordine'
            });
        }
        const updatedOrder = await ordersDb.updateOrderStatus(parseInt(id), status);
        // Invia notifica al cliente
        await notificationService.notifyOrderStatusChange(order.user_id, order.id, status);
        res.json(updatedOrder);
    }
    catch (error) {
        console.error('Errore nell\'aggiornamento dello stato dell\'ordine:', error);
        res.status(500).json({ message: error.message || 'Errore del server' });
    }
};
exports.updateOrderStatus = updateOrderStatus;
const donateOrder = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Non autorizzato' });
        }
        const { id } = req.params;
        const { onlusId } = req.body;
        // Recupera l'ordine per verificare che appartenga all'utente
        const order = await ordersDb.getOrderById(parseInt(id));
        if (!order) {
            return res.status(404).json({ message: 'Ordine non trovato' });
        }
        // Solo l'utente che ha effettuato l'ordine può donarlo
        if (order.user_id !== req.session.userId) {
            return res.status(403).json({
                message: 'Non sei autorizzato a donare questo ordine'
            });
        }
        // Verifica che l'ordine non sia già stato donato
        if (order.is_donated) {
            return res.status(400).json({ message: 'Ordine già donato' });
        }
        const donatedOrder = await ordersDb.donateOrder(parseInt(id), onlusId);
        // Invia notifica alla ONLUS
        await notificationService.notifyDonation(onlusId, order.id, req.session.user.name);
        res.json(donatedOrder);
    }
    catch (error) {
        console.error('Errore nella donazione dell\'ordine:', error);
        res.status(500).json({ message: error.message || 'Errore del server' });
    }
};
exports.donateOrder = donateOrder;
// server/routes/order-routes.ts
const express_1 = __importDefault(require("express"));
const orderController = __importStar(require("../controllers/order-controller"));
const auth_middleware_1 = require("../middleware/auth-middleware");
const router = express_1.default.Router();
// Tutte le rotte richiedono autenticazione
router.use(auth_middleware_1.authMiddleware);
// Rotte per tutti gli utenti
router.get('/:id', orderController.getOrderById);
// Rotte per i clienti
router.post('/', orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/next', orderController.getNextOrder);
router.post('/:id/donate', orderController.donateOrder);
// Rotte per i ristoranti
router.get('/restaurant', orderController.getRestaurantOrders);
router.patch('/:id/status', orderController.updateOrderStatus);
// Rotte per le ONLUS
router.get('/donations', orderController.getOnlusDonations);
exports.default = router;
