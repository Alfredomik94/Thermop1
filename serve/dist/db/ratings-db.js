"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatingsDb = void 0;
/**
 * Servizio di accesso al database per la gestione delle valutazioni
 */
const supabase_client_1 = require("./supabase-client");
const logger_1 = require("../utils/logger");
/**
 * Classe per le operazioni relative alle valutazioni
 */
class RatingsDb {
    /**
     * Ottiene tutte le valutazioni per un piano di abbonamento
     * @param planId ID del piano
     * @returns Lista delle valutazioni
     */
    async getRatingsByPlan(planId) {
        try {
            const { data, error } = await supabase_client_1.supabase
                .from('ratings')
                .select(`
          *,
          users:user_id (
            name,
            user_type
          )
        `)
                .eq('plan_id', planId)
                .order('created_at', { ascending: false });
            if (error)
                throw error;
            // Formatta i dati
            return data.map(rating => {
                var _a, _b;
                return ({
                    id: rating.id,
                    planId: rating.plan_id,
                    userId: rating.user_id,
                    rating: rating.rating,
                    comment: rating.comment,
                    createdAt: rating.created_at,
                    userName: ((_a = rating.users) === null || _a === void 0 ? void 0 : _a.name) || 'Utente anonimo',
                    userType: ((_b = rating.users) === null || _b === void 0 ? void 0 : _b.user_type) || 'customer'
                });
            });
        }
        catch (error) {
            logger_1.logger.error(`Error getting ratings for plan ${planId}`, error);
            throw error;
        }
    }
    /**
     * Ottiene tutte le valutazioni date da un utente
     * @param userId ID dell'utente
     * @returns Lista delle valutazioni
     */
    async getRatingsByUser(userId) {
        try {
            const { data, error } = await supabase_client_1.supabase
                .from('ratings')
                .select(`
          *,
          subscription_plans:plan_id (
            title,
            restaurant_id,
            restaurants:restaurant_id (
              name,
              business_name
            )
          )
        `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            if (error)
                throw error;
            // Formatta i dati
            return data.map(rating => {
                var _a, _b, _c, _d, _e;
                return ({
                    id: rating.id,
                    planId: rating.plan_id,
                    userId: rating.user_id,
                    rating: rating.rating,
                    comment: rating.comment,
                    createdAt: rating.created_at,
                    planTitle: ((_a = rating.subscription_plans) === null || _a === void 0 ? void 0 : _a.title) || 'Piano sconosciuto',
                    restaurantName: ((_c = (_b = rating.subscription_plans) === null || _b === void 0 ? void 0 : _b.restaurants) === null || _c === void 0 ? void 0 : _c.business_name) ||
                        ((_e = (_d = rating.subscription_plans) === null || _d === void 0 ? void 0 : _d.restaurants) === null || _e === void 0 ? void 0 : _e.name) ||
                        'Ristorante sconosciuto'
                });
            });
        }
        catch (error) {
            logger_1.logger.error(`Error getting ratings for user ${userId}`, error);
            throw error;
        }
    }
    /**
     * Ottiene una valutazione specifica
     * @param ratingId ID della valutazione
     * @returns Dettagli della valutazione
     */
    async getRatingById(ratingId) {
        var _a, _b, _c;
        try {
            const { data, error } = await supabase_client_1.supabase
                .from('ratings')
                .select(`
          *,
          users:user_id (
            name,
            user_type
          ),
          subscription_plans:plan_id (
            title
          )
        `)
                .eq('id', ratingId)
                .single();
            if (error) {
                if (error.code === 'PGRST116') { // Record non trovato
                    return null;
                }
                throw error;
            }
            // Formatta i dati
            return {
                id: data.id,
                planId: data.plan_id,
                userId: data.user_id,
                rating: data.rating,
                comment: data.comment,
                createdAt: data.created_at,
                userName: ((_a = data.users) === null || _a === void 0 ? void 0 : _a.name) || 'Utente anonimo',
                userType: ((_b = data.users) === null || _b === void 0 ? void 0 : _b.user_type) || 'customer',
                planTitle: ((_c = data.subscription_plans) === null || _c === void 0 ? void 0 : _c.title) || 'Piano sconosciuto'
            };
        }
        catch (error) {
            logger_1.logger.error(`Error getting rating with ID ${ratingId}`, error);
            throw error;
        }
    }
    /**
     * Verifica se un utente ha già valutato un piano
     * @param userId ID dell'utente
     * @param planId ID del piano
     * @returns Valutazione esistente o null
     */
    async getUserRatingForPlan(userId, planId) {
        try {
            const { data, error } = await supabase_client_1.supabase
                .from('ratings')
                .select('*')
                .eq('user_id', userId)
                .eq('plan_id', planId)
                .maybeSingle();
            if (error)
                throw error;
            if (!data)
                return null;
            return {
                id: data.id,
                planId: data.plan_id,
                userId: data.user_id,
                rating: data.rating,
                comment: data.comment,
                createdAt: data.created_at
            };
        }
        catch (error) {
            logger_1.logger.error(`Error checking if user ${userId} has rated plan ${planId}`, error);
            throw error;
        }
    }
    /**
     * Crea una nuova valutazione
     * @param ratingData Dati della valutazione
     * @returns Valutazione creata
     */
    async createRating(ratingData) {
        try {
            // Prima verifica se l'utente ha già valutato questo piano
            const existingRating = await this.getUserRatingForPlan(ratingData.userId, ratingData.planId);
            if (existingRating) {
                throw new Error('L\'utente ha già valutato questo piano');
            }
            const { data, error } = await supabase_client_1.supabase
                .from('ratings')
                .insert({
                plan_id: ratingData.planId,
                user_id: ratingData.userId,
                rating: ratingData.rating,
                comment: ratingData.comment || null,
                created_at: new Date().toISOString()
            })
                .select()
                .single();
            if (error)
                throw error;
            return {
                id: data.id,
                planId: data.plan_id,
                userId: data.user_id,
                rating: data.rating,
                comment: data.comment,
                createdAt: data.created_at
            };
        }
        catch (error) {
            logger_1.logger.error('Error creating rating', error);
            throw error;
        }
    }
    /**
     * Aggiorna una valutazione esistente
     * @param ratingId ID della valutazione
     * @param userId ID dell'utente (per verifica)
     * @param ratingData Dati da aggiornare
     * @returns Valutazione aggiornata
     */
    async updateRating(ratingId, userId, ratingData) {
        try {
            // Verifica che la valutazione esista e appartenga all'utente
            const { data: existingRating, error: checkError } = await supabase_client_1.supabase
                .from('ratings')
                .select('*')
                .eq('id', ratingId)
                .eq('user_id', userId)
                .single();
            if (checkError) {
                throw new Error('Valutazione non trovata o non appartenente all\'utente');
            }
            // Aggiorna solo i campi forniti
            const updateData = {};
            if (ratingData.rating !== undefined)
                updateData.rating = ratingData.rating;
            if (ratingData.comment !== undefined)
                updateData.comment = ratingData.comment;
            const { data, error } = await supabase_client_1.supabase
                .from('ratings')
                .update(updateData)
                .eq('id', ratingId)
                .select()
                .single();
            if (error)
                throw error;
            return {
                id: data.id,
                planId: data.plan_id,
                userId: data.user_id,
                rating: data.rating,
                comment: data.comment,
                createdAt: data.created_at
            };
        }
        catch (error) {
            logger_1.logger.error(`Error updating rating with ID ${ratingId}`, error);
            throw error;
        }
    }
    /**
     * Elimina una valutazione
     * @param ratingId ID della valutazione
     * @param userId ID dell'utente (per verifica)
     */
    async deleteRating(ratingId, userId) {
        try {
            // Verifica che la valutazione esista e appartenga all'utente
            const { data: existingRating, error: checkError } = await supabase_client_1.supabase
                .from('ratings')
                .select('*')
                .eq('id', ratingId)
                .eq('user_id', userId)
                .single();
            if (checkError) {
                throw new Error('Valutazione non trovata o non appartenente all\'utente');
            }
            const { error } = await supabase_client_1.supabase
                .from('ratings')
                .delete()
                .eq('id', ratingId);
            if (error)
                throw error;
        }
        catch (error) {
            logger_1.logger.error(`Error deleting rating with ID ${ratingId}`, error);
            throw error;
        }
    }
    /**
     * Ottiene le statistiche delle valutazioni per un piano
     * @param planId ID del piano
     * @returns Statistiche delle valutazioni
     */
    async getRatingStats(planId) {
        try {
            const { data, error } = await supabase_client_1.supabase
                .from('ratings')
                .select('rating')
                .eq('plan_id', planId);
            if (error)
                throw error;
            // Calcola la media
            const ratingsCount = data.length;
            const averageRating = ratingsCount > 0
                ? data.reduce((sum, item) => sum + item.rating, 0) / ratingsCount
                : 0;
            // Distribuzione per rating
            const distributionByRating = {
                '1': 0,
                '2': 0,
                '3': 0,
                '4': 0,
                '5': 0
            };
            data.forEach(item => {
                distributionByRating[item.rating.toString()]++;
            });
            return {
                planId,
                averageRating,
                ratingsCount,
                distributionByRating
            };
        }
        catch (error) {
            logger_1.logger.error(`Error getting rating stats for plan ${planId}`, error);
            throw error;
        }
    }
}
exports.RatingsDb = RatingsDb;
exports.default = new RatingsDb();
