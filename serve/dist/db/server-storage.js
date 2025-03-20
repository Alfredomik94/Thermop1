"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.SupabaseStorage = void 0;
// server/src/services/storage.ts
const supabase_1 = __importDefault(require("../lib/supabase"));
class SupabaseStorage {
    // Metodi utente
    async getUser(id) {
        const { data, error } = await supabase_1.default
            .from('users')
            .select('*')
            .eq('id', id)
            .single();
        if (error) {
            console.error('Error fetching user:', error);
            return null;
        }
        return data;
    }
    async getUserByUsername(username) {
        const { data, error } = await supabase_1.default
            .from('users')
            .select('*')
            .eq('username', username)
            .single();
        if (error) {
            console.error('Error fetching user by username:', error);
            return null;
        }
        return data;
    }
    async createUser(insertUser) {
        const { data, error } = await supabase_1.default
            .from('users')
            .insert([{
                username: insertUser.username,
                password: insertUser.password,
                name: insertUser.name,
                user_type: insertUser.userType,
                business_name: insertUser.businessName,
                business_type: insertUser.businessType,
                assistance_type: insertUser.assistanceType,
                address: insertUser.address,
                description: insertUser.description,
                activities: insertUser.activities,
                preferred_pickup_point: insertUser.preferredPickupPoint,
                invite_code: insertUser.inviteCode,
                favorite_restaurants: insertUser.favoriteRestaurants,
            }])
            .select()
            .single();
        if (error) {
            console.error('Error creating user:', error);
            throw new Error('Failed to create user');
        }
        // Converti da snake_case a camelCase
        return {
            id: data.id,
            username: data.username,
            password: data.password,
            name: data.name,
            userType: data.user_type,
            businessName: data.business_name,
            businessType: data.business_type,
            assistanceType: data.assistance_type,
            address: data.address,
            description: data.description,
            activities: data.activities,
            preferredPickupPoint: data.preferred_pickup_point,
            inviteCode: data.invite_code,
            favoriteRestaurants: data.favorite_restaurants,
            emailVerified: data.email_verified,
            createdAt: data.created_at,
        };
    }
    async updateUser(id, updateData) {
        // Converti da camelCase a snake_case
        const snakeCaseData = {};
        if (updateData.username)
            snakeCaseData.username = updateData.username;
        if (updateData.password)
            snakeCaseData.password = updateData.password;
        if (updateData.name)
            snakeCaseData.name = updateData.name;
        if (updateData.userType)
            snakeCaseData.user_type = updateData.userType;
        if (updateData.businessName)
            snakeCaseData.business_name = updateData.businessName;
        if (updateData.businessType)
            snakeCaseData.business_type = updateData.businessType;
        if (updateData.assistanceType)
            snakeCaseData.assistance_type = updateData.assistanceType;
        if (updateData.address)
            snakeCaseData.address = updateData.address;
        if (updateData.description)
            snakeCaseData.description = updateData.description;
        if (updateData.activities)
            snakeCaseData.activities = updateData.activities;
        if (updateData.preferredPickupPoint)
            snakeCaseData.preferred_pickup_point = updateData.preferredPickupPoint;
        if (updateData.inviteCode)
            snakeCaseData.invite_code = updateData.inviteCode;
        if (updateData.favoriteRestaurants)
            snakeCaseData.favorite_restaurants = updateData.favoriteRestaurants;
        const { data, error } = await supabase_1.default
            .from('users')
            .update(snakeCaseData)
            .eq('id', id)
            .select()
            .single();
        if (error) {
            console.error('Error updating user:', error);
            return null;
        }
        // Converti da snake_case a camelCase
        return {
            id: data.id,
            username: data.username,
            password: data.password,
            name: data.name,
            userType: data.user_type,
            businessName: data.business_name,
            businessType: data.business_type,
            assistanceType: data.assistance_type,
            address: data.address,
            description: data.description,
            activities: data.activities,
            preferredPickupPoint: data.preferred_pickup_point,
            inviteCode: data.invite_code,
            favoriteRestaurants: data.favorite_restaurants,
            emailVerified: data.email_verified,
            createdAt: data.created_at,
        };
    }
    // Metodi piano abbonamento
    async getSubscriptionPlan(id) {
        const { data, error } = await supabase_1.default
            .from('subscription_plans')
            .select('*')
            .eq('id', id)
            .single();
        if (error) {
            console.error('Error fetching subscription plan:', error);
            return null;
        }
        // Converti da snake_case a camelCase
        return {
            id: data.id,
            userId: data.user_id,
            name: data.name,
            description: data.description,
            planType: data.plan_type,
            basePrice: data.base_price,
            createdAt: data.created_at,
        };
    }
    async getSubscriptionPlansByUserId(userId) {
        const { data, error } = await supabase_1.default
            .from('subscription_plans')
            .select('*')
            .eq('user_id', userId);
        if (error) {
            console.error('Error fetching subscription plans:', error);
            return [];
        }
        // Converti da snake_case a camelCase
        return data.map(plan => ({
            id: plan.id,
            userId: plan.user_id,
            name: plan.name,
            description: plan.description,
            planType: plan.plan_type,
            basePrice: plan.base_price,
            createdAt: plan.created_at,
        }));
    }
    async createSubscriptionPlan(plan) {
        const { data, error } = await supabase_1.default
            .from('subscription_plans')
            .insert([{
                user_id: plan.userId,
                name: plan.name,
                description: plan.description,
                plan_type: plan.planType,
                base_price: plan.basePrice,
            }])
            .select()
            .single();
        if (error) {
            console.error('Error creating subscription plan:', error);
            throw new Error('Failed to create subscription plan');
        }
        // Converti da snake_case a camelCase
        return {
            id: data.id,
            userId: data.user_id,
            name: data.name,
            description: data.description,
            planType: data.plan_type,
            basePrice: data.base_price,
            createdAt: data.created_at,
        };
    }
    // Metodi sconti abbonamento
    async getSubscriptionDiscounts(planId) {
        const { data, error } = await supabase_1.default
            .from('subscription_discounts')
            .select('*')
            .eq('plan_id', planId);
        if (error) {
            console.error('Error fetching subscription discounts:', error);
            return [];
        }
        // Converti da snake_case a camelCase
        return data.map(discount => ({
            id: discount.id,
            planId: discount.plan_id,
            deliveriesPerWeek: discount.deliveries_per_week,
            durationWeeks: discount.duration_weeks,
            discountPercentage: discount.discount_percentage,
            createdAt: discount.created_at,
        }));
    }
    async createSubscriptionDiscount(discount) {
        const { data, error } = await supabase_1.default
            .from('subscription_discounts')
            .insert([{
                plan_id: discount.planId,
                deliveries_per_week: discount.deliveriesPerWeek,
                duration_weeks: discount.durationWeeks,
                discount_percentage: discount.discountPercentage,
            }])
            .select()
            .single();
        if (error) {
            console.error('Error creating subscription discount:', error);
            throw new Error('Failed to create subscription discount');
        }
        // Converti da snake_case a camelCase
        return {
            id: data.id,
            planId: data.plan_id,
            deliveriesPerWeek: data.deliveries_per_week,
            durationWeeks: data.duration_weeks,
            discountPercentage: data.discount_percentage,
            createdAt: data.created_at,
        };
    }
    // Metodi ordine
    async getOrder(id) {
        const { data, error } = await supabase_1.default
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();
        if (error) {
            console.error('Error fetching order:', error);
            return null;
        }
        // Converti da snake_case a camelCase
        return {
            id: data.id,
            userId: data.user_id,
            planId: data.plan_id,
            restaurantId: data.restaurant_id,
            quantity: data.quantity,
            deliveryDate: data.delivery_date,
            status: data.status,
            pickupPointId: data.pickup_point_id,
            createdAt: data.created_at,
        };
    }
    async getOrdersByUserId(userId) {
        const { data, error } = await supabase_1.default
            .from('orders')
            .select('*')
            .eq('user_id', userId);
        if (error) {
            console.error('Error fetching orders by user id:', error);
            return [];
        }
        // Converti da snake_case a camelCase
        return data.map(order => ({
            id: order.id,
            userId: order.user_id,
            planId: order.plan_id,
            restaurantId: order.restaurant_id,
            quantity: order.quantity,
            deliveryDate: order.delivery_date,
            status: order.status,
            pickupPointId: order.pickup_point_id,
            createdAt: order.created_at,
        }));
    }
    async getOrdersByRestaurantId(restaurantId) {
        const { data, error } = await supabase_1.default
            .from('orders')
            .select('*')
            .eq('restaurant_id', restaurantId);
        if (error) {
            console.error('Error fetching orders by restaurant id:', error);
            return [];
        }
        // Converti da snake_case a camelCase
        return data.map(order => ({
            id: order.id,
            userId: order.user_id,
            planId: order.plan_id,
            restaurantId: order.restaurant_id,
            quantity: order.quantity,
            deliveryDate: order.delivery_date,
            status: order.status,
            pickupPointId: order.pickup_point_id,
            createdAt: order.created_at,
        }));
    }
    async createOrder(order) {
        const { data, error } = await supabase_1.default
            .from('orders')
            .insert([{
                user_id: order.userId,
                plan_id: order.planId,
                restaurant_id: order.restaurantId,
                quantity: order.quantity,
                delivery_date: order.deliveryDate,
                status: order.status,
                pickup_point_id: order.pickupPointId,
            }])
            .select()
            .single();
        if (error) {
            console.error('Error creating order:', error);
            throw new Error('Failed to create order');
        }
        // Converti da snake_case a camelCase
        return {
            id: data.id,
            userId: data.user_id,
            planId: data.plan_id,
            restaurantId: data.restaurant_id,
            quantity: data.quantity,
            deliveryDate: data.delivery_date,
            status: data.status,
            pickupPointId: data.pickup_point_id,
            createdAt: data.created_at,
        };
    }
    async updateOrderStatus(id, status) {
        const { data, error } = await supabase_1.default
            .from('orders')
            .update({ status })
            .eq('id', id)
            .select()
            .single();
        if (error) {
            console.error('Error updating order status:', error);
            return null;
        }
        // Converti da snake_case a camelCase
        return {
            id: data.id,
            userId: data.user_id,
            planId: data.plan_id,
            restaurantId: data.restaurant_id,
            quantity: data.quantity,
            deliveryDate: data.delivery_date,
            status: data.status,
            pickupPointId: data.pickup_point_id,
            createdAt: data.created_at,
        };
    }
    // Metodi donazione
    async getDonation(id) {
        const { data, error } = await supabase_1.default
            .from('donations')
            .select('*')
            .eq('id', id)
            .single();
        if (error) {
            console.error('Error fetching donation:', error);
            return null;
        }
        // Converti da snake_case a camelCase
        return {
            id: data.id,
            orderId: data.order_id,
            donorId: data.donor_id,
            onlusId: data.onlus_id,
            donationDate: data.donation_date,
            status: data.status,
            createdAt: data.created_at,
        };
    }
    async getDonationsByOnlusId(onlusId) {
        const { data, error } = await supabase_1.default
            .from('donations')
            .select('*')
            .eq('onlus_id', onlusId);
        if (error) {
            console.error('Error fetching donations by onlus id:', error);
            return [];
        }
        // Converti da snake_case a camelCase
        return data.map(donation => ({
            id: donation.id,
            orderId: donation.order_id,
            donorId: donation.donor_id,
            onlusId: donation.onlus_id,
            donationDate: donation.donation_date,
            status: donation.status,
            createdAt: donation.created_at,
        }));
    }
    async getDonationsByDonorId(donorId) {
        const { data, error } = await supabase_1.default
            .from('donations')
            .select('*')
            .eq('donor_id', donorId);
        if (error) {
            console.error('Error fetching donations by donor id:', error);
            return [];
        }
        // Converti da snake_case a camelCase
        return data.map(donation => ({
            id: donation.id,
            orderId: donation.order_id,
            donorId: donation.donor_id,
            onlusId: donation.onlus_id,
            donationDate: donation.donation_date,
            status: donation.status,
            createdAt: donation.created_at,
        }));
    }
    async createDonation(donation) {
        const { data, error } = await supabase_1.default
            .from('donations')
            .insert([{
                order_id: donation.orderId,
                donor_id: donation.donorId,
                onlus_id: donation.onlusId,
                donation_date: donation.donationDate,
                status: donation.status,
            }])
            .select()
            .single();
        if (error) {
            console.error('Error creating donation:', error);
            throw new Error('Failed to create donation');
        }
        // Converti da snake_case a camelCase
        return {
            id: data.id,
            orderId: data.order_id,
            donorId: data.donor_id,
            onlusId: data.onlus_id,
            donationDate: data.donation_date,
            status: data.status,
            createdAt: data.created_at,
        };
    }
    // Metodi verifica email
    async createEmailVerification(userId) {
        // Utilizza la funzione SQL personalizzata
        const { data, error } = await supabase_1.default.rpc('generate_email_verification', {
            user_id: userId
        });
        if (error) {
            console.error('Error creating email verification:', error);
            throw new Error('Failed to create email verification');
        }
        return data;
    }
    async verifyEmail(token) {
        const { data, error } = await supabase_1.default
            .from('email_verifications')
            .select('*')
            .eq('token', token)
            .gt('expires_at', new Date().toISOString())
            .single();
        if (error || !data) {
            console.error('Error verifying email:', error);
            return false;
        }
        // Aggiorna lo stato dell'email verificata
        const updateResult = await supabase_1.default
            .from('users')
            .update({ email_verified: true })
            .eq('id', data.user_id);
        if (updateResult.error) {
            console.error('Error updating email verified status:', updateResult.error);
            return false;
        }
        // Elimina il token di verifica
        await supabase_1.default
            .from('email_verifications')
            .delete()
            .eq('id', data.id);
        return true;
    }
    // Metodi recensione
    async getReviewsByPlanId(planId) {
        const { data, error } = await supabase_1.default
            .from('reviews')
            .select('*')
            .eq('plan_id', planId);
        if (error) {
            console.error('Error fetching reviews by plan id:', error);
            return [];
        }
        // Converti da snake_case a camelCase
        return data.map(review => ({
            id: review.id,
            userId: review.user_id,
            planId: review.plan_id,
            rating: review.rating,
            comment: review.comment,
            createdAt: review.created_at,
        }));
    }
    async createReview(review) {
        const { data, error } = await supabase_1.default
            .from('reviews')
            .insert([{
                user_id: review.userId,
                plan_id: review.planId,
                rating: review.rating,
                comment: review.comment,
            }])
            .select()
            .single();
        if (error) {
            console.error('Error creating review:', error);
            throw new Error('Failed to create review');
        }
        // Converti da snake_case a camelCase
        return {
            id: data.id,
            userId: data.user_id,
            planId: data.plan_id,
            rating: data.rating,
            comment: data.comment,
            createdAt: data.created_at,
        };
    }
    // Metodi notifica
    async getNotificationsByUserId(userId) {
        const { data, error } = await supabase_1.default
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching notifications by user id:', error);
            return [];
        }
        // Converti da snake_case a camelCase
        return data.map(notification => ({
            id: notification.id,
            userId: notification.user_id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            read: notification.read,
            link: notification.link,
            createdAt: notification.created_at,
        }));
    }
    async markNotificationAsRead(id) {
        const { error } = await supabase_1.default
            .from('notifications')
            .update({ read: true })
            .eq('id', id);
        if (error) {
            console.error('Error marking notification as read:', error);
            return false;
        }
        return true;
    }
    // Metodi per recuperare ristoranti
    async getRestaurants(type) {
        let query = supabase_1.default
            .from('users')
            .select('*')
            .eq('user_type', 'tavola_calda');
        if (type) {
            query = query.eq('business_type', type);
        }
        const { data, error } = await query;
        if (error) {
            console.error('Error fetching restaurants:', error);
            return [];
        }
        // Converti da snake_case a camelCase
        return data.map(user => ({
            id: user.id,
            username: user.username,
            password: user.password,
            name: user.name,
            userType: user.user_type,
            businessName: user.business_name,
            businessType: user.business_type,
            assistanceType: user.assistance_type,
            address: user.address,
            description: user.description,
            activities: user.activities,
            preferredPickupPoint: user.preferred_pickup_point,
            inviteCode: user.invite_code,
            favoriteRestaurants: user.favorite_restaurants,
            emailVerified: user.email_verified,
            createdAt: user.created_at,
        }));
    }
    async getRestaurantsByIds(ids) {
        const { data, error } = await supabase_1.default
            .from('users')
            .select('*')
            .eq('user_type', 'tavola_calda')
            .in('id', ids);
        if (error) {
            console.error('Error fetching restaurants by ids:', error);
            return [];
        }
        // Converti da snake_case a camelCase
        return data.map(user => ({
            id: user.id,
            username: user.username,
            password: user.password,
            name: user.name,
            userType: user.user_type,
            businessName: user.business_name,
            businessType: user.business_type,
            assistanceType: user.assistance_type,
            address: user.address,
            description: user.description,
            activities: user.activities,
            preferredPickupPoint: user.preferred_pickup_point,
            inviteCode: user.invite_code,
            favoriteRestaurants: user.favorite_restaurants,
            emailVerified: user.email_verified,
            createdAt: user.created_at,
        }));
    }
    async getNearbyRestaurants(lat, lng, radius) {
        // Nota: In una applicazione reale, questa funzione utilizzerebbe
        // un'estensione geografica come PostGIS per trovare i ristoranti nelle vicinanze.
        // Per questa implementazione di test, restituiamo semplicemente tutti i ristoranti
        const { data, error } = await supabase_1.default
            .from('users')
            .select('*')
            .eq('user_type', 'tavola_calda');
        if (error) {
            console.error('Error fetching nearby restaurants:', error);
            return [];
        }
        // Converti da snake_case a camelCase e aggiungi un campo distance simulato
        return data.map(user => ({
            id: user.id,
            username: user.username,
            password: user.password,
            name: user.name,
            userType: user.user_type,
            businessName: user.business_name,
            businessType: user.business_type,
            assistanceType: user.assistance_type,
            address: user.address,
            description: user.description,
            activities: user.activities,
            preferredPickupPoint: user.preferred_pickup_point,
            inviteCode: user.invite_code,
            favoriteRestaurants: user.favorite_restaurants,
            emailVerified: user.email_verified,
            createdAt: user.created_at,
            // Simula una distanza casuale
            distance: (Math.random() * radius).toFixed(1) + 'km'
        }));
    }
    // Metodi per recuperare ONLUS
    async getOnlus() {
        const { data, error } = await supabase_1.default
            .from('users')
            .select('*')
            .eq('user_type', 'onlus');
        if (error) {
            console.error('Error fetching onlus:', error);
            return [];
        }
        // Converti da snake_case a camelCase
        return data.map(user => ({
            id: user.id,
            username: user.username,
            password: user.password,
            name: user.name,
            userType: user.user_type,
            businessName: user.business_name,
            businessType: user.business_type,
            assistanceType: user.assistance_type,
            address: user.address,
            description: user.description,
            activities: user.activities,
            preferredPickupPoint: user.preferred_pickup_point,
            inviteCode: user.invite_code,
            favoriteRestaurants: user.favorite_restaurants,
            emailVerified: user.email_verified,
            createdAt: user.created_at,
        }));
    }
}
exports.SupabaseStorage = SupabaseStorage;
// Esporta un'istanza del servizio SupabaseStorage
exports.storage = new SupabaseStorage();
exports.default = exports.storage;
