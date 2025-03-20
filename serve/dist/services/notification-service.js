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
exports.getNotificationById = exports.deleteOldNotifications = exports.getUnreadNotificationsCount = exports.getNotificationsByUserId = exports.markAllNotificationsAsRead = exports.markNotificationAsRead = exports.createNotification = exports.notifyAllUsersByType = exports.sendSystemNotification = exports.notifyNewRating = exports.notifyDonation = exports.notifyOrderStatusChange = exports.notifyNewOrder = void 0;
// server/services/notification-service.ts
const notificationsDb = __importStar(require("../db/notifications-db.js"));
const usersDb = __importStar(require("../db/users-db.js"));
/**
 * Funzione per notificare un nuovo ordine al ristorante
 *
 * @param restaurantId ID del ristorante
 * @param orderId ID dell'ordine
 * @param customerName Nome del cliente
 */
const notifyNewOrder = async (restaurantId, orderId, customerName) => {
    try {
        return await notificationsDb.createNotification({
            user_id: restaurantId,
            title: 'Nuovo ordine',
            message: `Hai ricevuto un nuovo ordine da ${customerName}`,
            type: 'order',
            related_id: orderId,
        });
    }
    catch (error) {
        console.error('Errore nell\'invio della notifica di nuovo ordine:', error);
        throw error;
    }
};
exports.notifyNewOrder = notifyNewOrder;
/**
 * Funzione per notificare un cambio di stato dell'ordine al cliente
 *
 * @param userId ID del cliente
 * @param orderId ID dell'ordine
 * @param newStatus Nuovo stato dell'ordine
 */
const notifyOrderStatusChange = async (userId, orderId, newStatus) => {
    try {
        // Traduci lo stato in italiano per la notifica
        let statusText;
        switch (newStatus) {
            case 'confirmed':
                statusText = 'confermato';
                break;
            case 'ready':
                statusText = 'pronto per il ritiro';
                break;
            case 'completed':
                statusText = 'completato';
                break;
            case 'cancelled':
                statusText = 'cancellato';
                break;
            default:
                statusText = newStatus;
        }
        return await notificationsDb.createNotification({
            user_id: userId,
            title: 'Aggiornamento ordine',
            message: `Il tuo ordine #${orderId} è stato ${statusText}`,
            type: 'order',
            related_id: orderId,
        });
    }
    catch (error) {
        console.error('Errore nell\'invio della notifica di cambio stato ordine:', error);
        throw error;
    }
};
exports.notifyOrderStatusChange = notifyOrderStatusChange;
/**
 * Funzione per notificare una donazione all'ONLUS
 *
 * @param onlusId ID della ONLUS
 * @param orderId ID dell'ordine
 * @param donorName Nome del donatore
 */
const notifyDonation = async (onlusId, orderId, donorName) => {
    try {
        return await notificationsDb.createNotification({
            user_id: onlusId,
            title: 'Nuova donazione',
            message: `Hai ricevuto una donazione di pasto da ${donorName}`,
            type: 'donation',
            related_id: orderId,
        });
    }
    catch (error) {
        console.error('Errore nell\'invio della notifica di donazione:', error);
        throw error;
    }
};
exports.notifyDonation = notifyDonation;
/**
 * Funzione per notificare una nuova valutazione al ristorante
 *
 * @param restaurantId ID del ristorante
 * @param planId ID del piano di abbonamento
 * @param rating Valutazione (1-5)
 */
const notifyNewRating = async (restaurantId, planId, rating) => {
    try {
        return await notificationsDb.createNotification({
            user_id: restaurantId,
            title: 'Nuova valutazione',
            message: `Hai ricevuto una valutazione di ${rating} stelle per un tuo piano di abbonamento`,
            type: 'rating',
            related_id: planId,
        });
    }
    catch (error) {
        console.error('Errore nell\'invio della notifica di valutazione:', error);
        throw error;
    }
};
exports.notifyNewRating = notifyNewRating;
/**
 * Funzione per inviare una notifica di sistema a un utente
 *
 * @param userId ID dell'utente
 * @param title Titolo della notifica
 * @param message Messaggio della notifica
 * @param relatedId ID dell'entità correlata (opzionale)
 */
const sendSystemNotification = async (userId, title, message, relatedId) => {
    try {
        return await notificationsDb.createNotification({
            user_id: userId,
            title,
            message,
            type: 'system',
            related_id: relatedId || null,
        });
    }
    catch (error) {
        console.error('Errore nell\'invio della notifica di sistema:', error);
        throw error;
    }
};
exports.sendSystemNotification = sendSystemNotification;
/**
 * Funzione per inviare una notifica a tutti gli utenti di un certo tipo
 *
 * @param userType Tipo di utente ('customer', 'tavola_calda', 'onlus')
 * @param title Titolo della notifica
 * @param message Messaggio della notifica
 */
const notifyAllUsersByType = async (userType, title, message) => {
    try {
        // Ottieni tutti gli utenti del tipo specificato
        let users;
        if (userType === 'tavola_calda') {
            users = await usersDb.getRestaurants();
        }
        else if (userType === 'onlus') {
            users = await usersDb.getOnlusOrganizations();
        }
        else {
            // Per i clienti, dovremmo implementare un metodo specifico
            users = []; // Placeholder
        }
        // Invia notifica a ciascun utente
        const promises = users.map(user => notificationsDb.createNotification({
            user_id: user.id,
            title,
            message,
            type: 'system',
            related_id: null,
        }));
        return await Promise.all(promises);
    }
    catch (error) {
        console.error('Errore nell\'invio delle notifiche di massa:', error);
        throw error;
    }
};
exports.notifyAllUsersByType = notifyAllUsersByType;
// server/db/notifications-db.ts
const supabase_client_js_1 = require("./supabase-client.js");
/**
 * Crea una nuova notifica
 */
const createNotification = async (notification) => {
    const { data, error } = await supabase_client_js_1.supabaseAdmin
        .from('notifications')
        .insert({
        ...notification,
        is_read: false,
    })
        .select()
        .single();
    if (error)
        throw error;
    return data;
};
exports.createNotification = createNotification;
/**
 * Imposta una notifica come letta
 */
const markNotificationAsRead = async (id, userId) => {
    const { data, error } = await supabase_client_js_1.supabaseAdmin
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
    if (error)
        throw error;
    return data;
};
exports.markNotificationAsRead = markNotificationAsRead;
/**
 * Imposta tutte le notifiche di un utente come lette
 */
const markAllNotificationsAsRead = async (userId) => {
    const { data, error } = await supabase_client_js_1.supabaseAdmin
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)
        .select();
    if (error)
        throw error;
    return data;
};
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
/**
 * Ottieni le notifiche di un utente
 */
const getNotificationsByUserId = async (userId) => {
    const { data, error } = await supabase_client_js_1.supabaseAdmin
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error)
        throw error;
    return data;
};
exports.getNotificationsByUserId = getNotificationsByUserId;
/**
 * Conta le notifiche non lette di un utente
 */
const getUnreadNotificationsCount = async (userId) => {
    const { count, error } = await supabase_client_js_1.supabaseAdmin
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);
    if (error)
        throw error;
    return count;
};
exports.getUnreadNotificationsCount = getUnreadNotificationsCount;
/**
 * Elimina le notifiche più vecchie di un certo periodo
 */
const deleteOldNotifications = async (daysToKeep = 90) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const { data, error } = await supabase_client_js_1.supabaseAdmin
        .from('notifications')
        .delete()
        .lt('created_at', cutoffDate.toISOString());
    if (error)
        throw error;
    return { success: true, deletedCount: (data === null || data === void 0 ? void 0 : data.length) || 0 };
};
exports.deleteOldNotifications = deleteOldNotifications;
/**
 * Ottieni una notifica specifica
 */
const getNotificationById = async (id) => {
    const { data, error } = await supabase_client_js_1.supabaseAdmin
        .from('notifications')
        .select('*')
        .eq('id', id)
        .single();
    if (error)
        throw error;
    return data;
};
exports.getNotificationById = getNotificationById;
