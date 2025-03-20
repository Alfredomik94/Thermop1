// server/src/services/storage.ts
import supabase from '../lib/supabase';
import { 
  User, InsertUser, UpdateUser, 
  SubscriptionPlan, InsertSubscriptionPlan,
  SubscriptionDiscount, InsertSubscriptionDiscount,
  Order, InsertOrder,
  Donation, InsertDonation,
  Review, InsertReview,
  Notification
} from 'thermopolio-shared';

export interface IStorage {
  // Metodi utente
  getUser(id: number): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUser(id: number, updateData: UpdateUser): Promise<User | null>;
  
  // Metodi piano abbonamento
  getSubscriptionPlan(id: number): Promise<SubscriptionPlan | null>;
  getSubscriptionPlansByUserId(userId: number): Promise<SubscriptionPlan[]>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  
  // Metodi sconti abbonamento
  getSubscriptionDiscounts(planId: number): Promise<SubscriptionDiscount[]>;
  createSubscriptionDiscount(discount: InsertSubscriptionDiscount): Promise<SubscriptionDiscount>;
  
  // Metodi ordine
  getOrder(id: number): Promise<Order | null>;
  getOrdersByUserId(userId: number): Promise<Order[]>;
  getOrdersByRestaurantId(restaurantId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: Order['status']): Promise<Order | null>;
  
  // Metodi donazione
  getDonation(id: number): Promise<Donation | null>;
  getDonationsByOnlusId(onlusId: number): Promise<Donation[]>;
  getDonationsByDonorId(donorId: number): Promise<Donation[]>;
  createDonation(donation: InsertDonation): Promise<Donation>;
  
  // Metodi verifica email
  createEmailVerification(userId: number): Promise<string>;
  verifyEmail(token: string): Promise<boolean>;
  
  // Metodi recensione
  getReviewsByPlanId(planId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Metodi notifica
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<boolean>;
  
  // Metodi per recuperare ristoranti
  getRestaurants(type?: string): Promise<User[]>;
  getRestaurantsByIds(ids: number[]): Promise<User[]>;
  getNearbyRestaurants(lat: number, lng: number, radius: number): Promise<User[]>;
  
  // Metodi per recuperare ONLUS
  getOnlus(): Promise<User[]>;
}

export class SupabaseStorage implements IStorage {
  // Metodi utente
  async getUser(id: number): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }
    
    return data as User;
  }
  
  async getUserByUsername(username: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) {
      console.error('Error fetching user by username:', error);
      return null;
    }
    
    return data as User;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const { data, error } = await supabase
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
  
  async updateUser(id: number, updateData: UpdateUser): Promise<User | null> {
    // Converti da camelCase a snake_case
    const snakeCaseData: any = {};
    if (updateData.username) snakeCaseData.username = updateData.username;
    if (updateData.password) snakeCaseData.password = updateData.password;
    if (updateData.name) snakeCaseData.name = updateData.name;
    if (updateData.userType) snakeCaseData.user_type = updateData.userType;
    if (updateData.businessName) snakeCaseData.business_name = updateData.businessName;
    if (updateData.businessType) snakeCaseData.business_type = updateData.businessType;
    if (updateData.assistanceType) snakeCaseData.assistance_type = updateData.assistanceType;
    if (updateData.address) snakeCaseData.address = updateData.address;
    if (updateData.description) snakeCaseData.description = updateData.description;
    if (updateData.activities) snakeCaseData.activities = updateData.activities;
    if (updateData.preferredPickupPoint) snakeCaseData.preferred_pickup_point = updateData.preferredPickupPoint;
    if (updateData.inviteCode) snakeCaseData.invite_code = updateData.inviteCode;
    if (updateData.favoriteRestaurants) snakeCaseData.favorite_restaurants = updateData.favoriteRestaurants;
    
    const { data, error } = await supabase
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
  async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | null> {
    const { data, error } = await supabase
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
  
  async getSubscriptionPlansByUserId(userId: number): Promise<SubscriptionPlan[]> {
    const { data, error } = await supabase
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
  
  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const { data, error } = await supabase
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
  async getSubscriptionDiscounts(planId: number): Promise<SubscriptionDiscount[]> {
    const { data, error } = await supabase
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
  
  async createSubscriptionDiscount(discount: InsertSubscriptionDiscount): Promise<SubscriptionDiscount> {
    const { data, error } = await supabase
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
  async getOrder(id: number): Promise<Order | null> {
    const { data, error } = await supabase
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
  
  async getOrdersByUserId(userId: number): Promise<Order[]> {
    const { data, error } = await supabase
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
  
  async getOrdersByRestaurantId(restaurantId: number): Promise<Order[]> {
    const { data, error } = await supabase
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
  
  async createOrder(order: InsertOrder): Promise<Order> {
    const { data, error } = await supabase
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
  
  async updateOrderStatus(id: number, status: Order['status']): Promise<Order | null> {
    const { data, error } = await supabase
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
  async getDonation(id: number): Promise<Donation | null> {
    const { data, error } = await supabase
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
  
  async getDonationsByOnlusId(onlusId: number): Promise<Donation[]> {
    const { data, error } = await supabase
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
  
  async getDonationsByDonorId(donorId: number): Promise<Donation[]> {
    const { data, error } = await supabase
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
  
  async createDonation(donation: InsertDonation): Promise<Donation> {
    const { data, error } = await supabase
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
  async createEmailVerification(userId: number): Promise<string> {
    // Utilizza la funzione SQL personalizzata
    const { data, error } = await supabase.rpc('generate_email_verification', {
      user_id: userId
    });
    
    if (error) {
      console.error('Error creating email verification:', error);
      throw new Error('Failed to create email verification');
    }
    
    return data;
  }
  
  async verifyEmail(token: string): Promise<boolean> {
    const { data, error } = await supabase
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
    const updateResult = await supabase
      .from('users')
      .update({ email_verified: true })
      .eq('id', data.user_id);
    
    if (updateResult.error) {
      console.error('Error updating email verified status:', updateResult.error);
      return false;
    }
    
    // Elimina il token di verifica
    await supabase
      .from('email_verifications')
      .delete()
      .eq('id', data.id);
    
    return true;
  }
  
  // Metodi recensione
  async getReviewsByPlanId(planId: number): Promise<Review[]> {
    const { data, error } = await supabase
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
  
  async createReview(review: InsertReview): Promise<Review> {
    const { data, error } = await supabase
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
  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    const { data, error } = await supabase
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
  
  async markNotificationAsRead(id: number): Promise<boolean> {
    const { error } = await supabase
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
  async getRestaurants(type?: string): Promise<User[]> {
    let query = supabase
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
  
  async getRestaurantsByIds(ids: number[]): Promise<User[]> {
    const { data, error } = await supabase
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
  
  async getNearbyRestaurants(lat: number, lng: number, radius: number): Promise<User[]> {
    // Nota: In una applicazione reale, questa funzione utilizzerebbe
    // un'estensione geografica come PostGIS per trovare i ristoranti nelle vicinanze.
    // Per questa implementazione di test, restituiamo semplicemente tutti i ristoranti
    const { data, error } = await supabase
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
  async getOnlus(): Promise<User[]> {
    const { data, error } = await supabase
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

// Esporta un'istanza del servizio SupabaseStorage
export const storage = new SupabaseStorage();
export default storage;
