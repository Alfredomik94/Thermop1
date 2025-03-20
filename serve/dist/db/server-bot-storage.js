"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.botStorage = exports.SupabaseBotStorage = void 0;
// server/src/services/bot-storage.ts
const supabase_1 = __importDefault(require("../lib/supabase"));
// Implementazione per Supabase
class SupabaseBotStorage {
    // Metodi per le interazioni
    async createBotInteraction(interaction) {
        const { data, error } = await supabase_1.default
            .from('bot_interactions')
            .insert([{
                user_id: interaction.userId,
                type: interaction.type,
                status: interaction.status || 'open',
                title: interaction.title
            }])
            .select()
            .single();
        if (error) {
            console.error('Error creating bot interaction:', error);
            throw new Error('Failed to create bot interaction');
        }
        // Converti da snake_case a camelCase
        return {
            id: data.id,
            userId: data.user_id,
            type: data.type,
            status: data.status,
            title: data.title,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            feedbackRating: data.feedback_rating,
            feedbackComment: data.feedback_comment
        };
    }
    async getBotInteraction(id) {
        const { data, error } = await supabase_1.default
            .from('bot_interactions')
            .select('*')
            .eq('id', id)
            .single();
        if (error) {
            console.error('Error fetching bot interaction:', error);
            return null;
        }
        // Converti da snake_case a camelCase
        return {
            id: data.id,
            userId: data.user_id,
            type: data.type,
            status: data.status,
            title: data.title,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            feedbackRating: data.feedback_rating,
            feedbackComment: data.feedback_comment
        };
    }
    async getBotInteractionsByUserId(userId) {
        const { data, error } = await supabase_1.default
            .from('bot_interactions')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });
        if (error) {
            console.error('Error fetching bot interactions:', error);
            return [];
        }
        // Converti da snake_case a camelCase
        return data.map(item => ({
            id: item.id,
            userId: item.user_id,
            type: item.type,
            status: item.status,
            title: item.title,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
            feedbackRating: item.feedback_rating,
            feedbackComment: item.feedback_comment
        }));
    }
    async updateBotInteraction(id, data) {
        // Converti da camelCase a snake_case
        const updateData = {};
        if (data.status !== undefined)
            updateData.status = data.status;
        if (data.feedbackRating !== undefined)
            updateData.feedback_rating = data.feedbackRating;
        if (data.feedbackComment !== undefined)
            updateData.feedback_comment = data.feedbackComment;
        const { data: result, error } = await supabase_1.default
            .from('bot_interactions')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();
        if (error) {
            console.error('Error updating bot interaction:', error);
            return null;
        }
        // Converti da snake_case a camelCase
        return {
            id: result.id,
            userId: result.user_id,
            type: result.type,
            status: result.status,
            title: result.title,
            createdAt: result.created_at,
            updatedAt: result.updated_at,
            feedbackRating: result.feedback_rating,
            feedbackComment: result.feedback_comment
        };
    }
    // Metodi per i messaggi
    async createBotMessage(message) {
        const { data, error } = await supabase_1.default
            .from('bot_messages')
            .insert([{
                interaction_id: message.interactionId,
                user_id: message.userId,
                content: message.content,
                is_bot: message.isBot
            }])
            .select()
            .single();
        if (error) {
            console.error('Error creating bot message:', error);
            throw new Error('Failed to create bot message');
        }
        // Converti da snake_case a camelCase
        return {
            id: data.id,
            interactionId: data.interaction_id,
            userId: data.user_id,
            content: data.content,
            timestamp: data.timestamp,
            isBot: data.is_bot
        };
    }
    async getBotMessage(id) {
        const { data, error } = await supabase_1.default
            .from('bot_messages')
            .select('*')
            .eq('id', id)
            .single();
        if (error) {
            console.error('Error fetching bot message:', error);
            return null;
        }
        // Converti da snake_case a camelCase
        return {
            id: data.id,
            interactionId: data.interaction_id,
            userId: data.user_id,
            content: data.content,
            timestamp: data.timestamp,
            isBot: data.is_bot
        };
    }
    async getBotMessagesByInteractionId(interactionId) {
        const { data, error } = await supabase_1.default
            .from('bot_messages')
            .select('*')
            .eq('interaction_id', interactionId)
            .order('timestamp', { ascending: true });
        if (error) {
            console.error('Error fetching bot messages:', error);
            return [];
        }
        // Converti da snake_case a camelCase
        return data.map(item => ({
            id: item.id,
            interactionId: item.interaction_id,
            userId: item.user_id,
            content: item.content,
            timestamp: item.timestamp,
            isBot: item.is_bot
        }));
    }
    // Metodi per le statistiche
    async getBotStats() {
        const { data, error } = await supabase_1.default
            .from('v_bot_stats')
            .select('*')
            .single();
        if (error) {
            console.error('Error fetching bot stats:', error);
            // Restituisci statistiche vuote in caso di errore
            return {
                totalInteractions: 0,
                openInteractions: 0,
                resolvedInteractions: 0,
                avgResponseTime: 0,
                avgFeedbackRating: 0,
                interactionsByType: {},
                interactionsByUserType: {},
                popularTopics: [],
                responseTimeByDay: {},
                feedbackDistribution: []
            };
        }
        // La vista SQL restituisce già il formato corretto
        return {
            totalInteractions: data.total_interactions,
            openInteractions: data.open_interactions,
            resolvedInteractions: data.resolved_interactions,
            avgResponseTime: data.avg_response_time,
            avgFeedbackRating: data.avg_rating,
            interactionsByType: data.interactions_by_type,
            interactionsByUserType: data.interactions_by_user_type,
            popularTopics: [], // Da implementare in SQL
            responseTimeByDay: {}, // Da implementare in SQL
            feedbackDistribution: data.feedback_distribution
        };
    }
}
exports.SupabaseBotStorage = SupabaseBotStorage;
// Crea e esporta una istanza
exports.botStorage = new SupabaseBotStorage();
exports.default = exports.botStorage;
