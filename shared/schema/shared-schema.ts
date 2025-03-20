// shared/src/schema.ts
import { z } from 'zod';

// Enumerazioni
export const UserTypeEnum = z.enum(['customer', 'tavola_calda', 'onlus']);
export type UserTypeEnum = z.infer<typeof UserTypeEnum>;

export const PlanTypeEnum = z.enum(['primo', 'secondo', 'completo']);
export type PlanTypeEnum = z.infer<typeof PlanTypeEnum>;

export const OrderStatusEnum = z.enum(['pending', 'confirmed', 'ready', 'completed', 'donated']);
export type OrderStatusEnum = z.infer<typeof OrderStatusEnum>;

export const DonationStatusEnum = z.enum(['pending', 'accepted', 'completed']);
export type DonationStatusEnum = z.infer<typeof DonationStatusEnum>;

export const NotificationTypeEnum = z.enum(['order', 'donation', 'system', 'review']);
export type NotificationTypeEnum = z.infer<typeof NotificationTypeEnum>;

// Schema base utente
export const userSchema = z.object({
  id: z.number(),
  username: z.string().min(3).max(50),
  password: z.string().min(8).max(100),
  name: z.string().min(2).max(100),
  userType: UserTypeEnum,
  businessName: z.string().nullable().optional(),
  businessType: z.string().nullable().optional(),
  assistanceType: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  activities: z.string().nullable().optional(),
  preferredPickupPoint: z.string().nullable().optional(),
  inviteCode: z.string().nullable().optional(),
  favoriteRestaurants: z.array(z.number()).nullable().optional(),
  emailVerified: z.boolean().default(false),
  createdAt: z.string().datetime().optional(),
});

export type User = z.infer<typeof userSchema>;

// Schema per creazione utente
export const insertUserSchema = userSchema.omit({ id: true, emailVerified: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;

// Schema per aggiornamento utente
export const updateUserSchema = userSchema.partial().omit({ id: true });
export type UpdateUser = z.infer<typeof updateUserSchema>;

// Schema per login
export const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

// Schema piano abbonamento
export const subscriptionPlanSchema = z.object({
  id: z.number(),
  userId: z.number(),
  name: z.string(),
  description: z.string(),
  planType: PlanTypeEnum,
  basePrice: z.number().positive(),
  createdAt: z.string().datetime().optional(),
});

export type SubscriptionPlan = z.infer<typeof subscriptionPlanSchema>;

// Schema per creazione piano abbonamento
export const insertSubscriptionPlanSchema = subscriptionPlanSchema.omit({ id: true, createdAt: true });
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;

// Schema sconto abbonamento
export const subscriptionDiscountSchema = z.object({
  id: z.number(),
  planId: z.number(),
  deliveriesPerWeek: z.number().int().positive(),
  durationWeeks: z.number().int().positive(),
  discountPercentage: z.number().min(0).max(100),
  createdAt: z.string().datetime().optional(),
});

export type SubscriptionDiscount = z.infer<typeof subscriptionDiscountSchema>;

// Schema per creazione sconto abbonamento
export const insertSubscriptionDiscountSchema = subscriptionDiscountSchema.omit({ id: true, createdAt: true });
export type InsertSubscriptionDiscount = z.infer<typeof insertSubscriptionDiscountSchema>;

// Schema punto di ritiro
export const pickupPointSchema = z.object({
  id: z.number(),
  name: z.string(),
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  businessName: z.string().nullable().optional(),
  pickupTimes: z.array(z.string()).optional(),
  distance: z.string().optional(),
  createdAt: z.string().datetime().optional(),
});

export type PickupPoint = z.infer<typeof pickupPointSchema>;

// Schema ordine
export const orderSchema = z.object({
  id: z.number(),
  userId: z.number(),
  planId: z.number(),
  restaurantId: z.number(),
  quantity: z.number().int().positive(),
  deliveryDate: z.string().datetime(),
  status: OrderStatusEnum,
  pickupPointId: z.number().optional().nullable(),
  createdAt: z.string().datetime().optional(),
});

export type Order = z.infer<typeof orderSchema>;

// Schema per creazione ordine
export const insertOrderSchema = orderSchema.omit({ id: true, createdAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;

// Schema donazione
export const donationSchema = z.object({
  id: z.number(),
  orderId: z.number(),
  donorId: z.number(),
  onlusId: z.number(),
  donationDate: z.string().datetime(),
  status: DonationStatusEnum,
  createdAt: z.string().datetime().optional(),
});

export type Donation = z.infer<typeof donationSchema>;

// Schema per creazione donazione
export const insertDonationSchema = donationSchema.omit({ id: true, createdAt: true });
export type InsertDonation = z.infer<typeof insertDonationSchema>;

// Schema verifica email
export const emailVerificationSchema = z.object({
  id: z.number(),
  userId: z.number(),
  token: z.string(),
  expiresAt: z.string().datetime(),
  createdAt: z.string().datetime().optional(),
});

export type EmailVerification = z.infer<typeof emailVerificationSchema>;

// Schema recensione
export const reviewSchema = z.object({
  id: z.number(),
  userId: z.number(),
  planId: z.number(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional().nullable(),
  createdAt: z.string().datetime().optional(),
});

export type Review = z.infer<typeof reviewSchema>;

// Schema per creazione recensione
export const insertReviewSchema = reviewSchema.omit({ id: true, createdAt: true });
export type InsertReview = z.infer<typeof insertReviewSchema>;

// Schema notifica
export const notificationSchema = z.object({
  id: z.number(),
  userId: z.number(),
  title: z.string(),
  message: z.string(),
  type: NotificationTypeEnum,
  read: z.boolean().default(false),
  link: z.string().optional().nullable(),
  createdAt: z.string().datetime().optional(),
});

export type Notification = z.infer<typeof notificationSchema>;

// Schema per risposta API
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
  errors: z.array(z.string()).optional(),
});

export type ApiResponse<T = any> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
};

// Tipi di dati estesi per utilizzare sul client

// Cliente esteso
export const customerSchema = userSchema.extend({
  userType: z.literal('customer'),
  preferredPickupPoint: z.string().nullable().optional(),
  favoriteRestaurants: z.array(z.number()).nullable().optional(),
});

export type Customer = z.infer<typeof customerSchema>;

// Ristorante esteso
export const restaurantSchema = userSchema.extend({
  userType: z.literal('tavola_calda'),
  businessName: z.string(),
  businessType: z.string(),
  address: z.string(),
  description: z.string().nullable().optional(),
});

export type Restaurant = z.infer<typeof restaurantSchema>;

// ONLUS estesa
export const onlusSchema = userSchema.extend({
  userType: z.literal('onlus'),
  businessName: z.string(),
  assistanceType: z.string(),
  address: z.string(),
  activities: z.string().nullable().optional(),
});

export type Onlus = z.infer<typeof onlusSchema>;

// Piano abbonamento con sconti
export const subscriptionPlanWithDiscountsSchema = subscriptionPlanSchema.extend({
  discounts: z.array(subscriptionDiscountSchema).optional(),
});

export type SubscriptionPlanWithDiscounts = z.infer<typeof subscriptionPlanWithDiscountsSchema>;

// Ordine con dettagli
export const orderWithDetailsSchema = orderSchema.extend({
  plan: subscriptionPlanSchema.optional(),
  restaurant: restaurantSchema.omit({ password: true }).optional(),
  pickupPoint: pickupPointSchema.optional(),
});

export type OrderWithDetails = z.infer<typeof orderWithDetailsSchema>;

// Notifica
export const notificationSchema = z.object({
  id: z.number(),
  userId: z.number(),
  title: z.string(),
  message: z.string(),
  type: NotificationTypeEnum,
  read: z.boolean().default(false),
  link: z.string().optional().nullable(),
  createdAt: z.string().datetime().optional(),
});

export type Notification = z.infer<typeof notificationSchema>;

// Recensione con dettagli
export const reviewWithDetailsSchema = reviewSchema.extend({
  user: userSchema.omit({ password: true }).optional(),
  plan: subscriptionPlanSchema.optional(),
});

export type ReviewWithDetails = z.infer<typeof reviewWithDetailsSchema>;

// Statistica ristorante
export const restaurantStatsSchema = z.object({
  totalOrders: z.number(),
  averageOrdersPerDay: z.number(),
  averageRating: z.number(),
  totalRevenue: z.number(),
  popularPlan: subscriptionPlanSchema.nullable().optional(),
});

export type RestaurantStats = z.infer<typeof restaurantStatsSchema>;

// Statistica ONLUS
export const onlusStatsSchema = z.object({
  totalDonations: z.number(),
  averageDonationsPerDay: z.number(),
  totalMeals: z.number(),
  topDonors: z.array(userSchema.omit({ password: true })).optional(),
});

export type OnlusStats = z.infer<typeof onlusStatsSchema>;

// Export del modulo
export default {
  UserTypeEnum,
  PlanTypeEnum,
  OrderStatusEnum,
  DonationStatusEnum,
  NotificationTypeEnum,
  userSchema,
  insertUserSchema,
  updateUserSchema,
  loginSchema,
  subscriptionPlanSchema,
  insertSubscriptionPlanSchema,
  subscriptionDiscountSchema,
  insertSubscriptionDiscountSchema,
  pickupPointSchema,
  orderSchema,
  insertOrderSchema,
  donationSchema,
  insertDonationSchema,
  emailVerificationSchema,
  reviewSchema,
  insertReviewSchema,
  notificationSchema,
  apiResponseSchema,
  customerSchema,
  restaurantSchema,
  onlusSchema,
  subscriptionPlanWithDiscountsSchema,
  orderWithDetailsSchema,
  reviewWithDetailsSchema,
  restaurantStatsSchema,
  onlusStatsSchema
};