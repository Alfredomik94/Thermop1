import { z } from 'zod';

// Schema per la validazione degli ordini
export const orderSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  planId: z.string().uuid(),
  quantity: z.number().min(1, 'La quantità deve essere almeno 1'),
  deliveryDate: z.string().datetime(),
  pickupPointId: z.string().uuid(),
  status: z.enum(['pending', 'completed', 'canceled', 'donated']).default('pending'),
  donatedTo: z.string().uuid().optional(),
  donationDate: z.string().datetime().optional(),
  notes: z.string().max(500, 'Le note non possono superare i 500 caratteri').optional(),
  createdAt: z.string().datetime().optional(),
});

// Schema per la creazione di un nuovo ordine
export const createOrderSchema = orderSchema.omit({ 
  id: true, 
  createdAt: true, 
  status: true, 
  donatedTo: true, 
  donationDate: true 
});

// Schema per l'aggiornamento di un ordine esistente
export const updateOrderSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['pending', 'completed', 'canceled', 'donated']).optional(),
  deliveryDate: z.string().datetime().optional(),
  pickupPointId: z.string().uuid().optional(),
  notes: z.string().max(500, 'Le note non possono superare i 500 caratteri').optional(),
});

// Schema per la donazione di un ordine
export const donateOrderSchema = z.object({
  id: z.string().uuid(),
  donatedTo: z.string().uuid(),
});

// Schema per la risposta API degli ordini
export const orderResponseSchema = orderSchema.extend({
  planTitle: z.string().optional(),
  restaurantName: z.string().optional(),
  pickupLocationName: z.string().optional(),
  pickupAddress: z.string().optional(),
  originalPrice: z.number().optional(),
  discountedPrice: z.number().optional(),
  totalPrice: z.number().optional(),
});

// Schema per le statistiche degli ordini
export const orderStatsSchema = z.object({
  totalOrders: z.number(),
  completedOrders: z.number(),
  canceledOrders: z.number(),
  donatedOrders: z.number(),
  ordersToday: z.number(),
  ordersThisWeek: z.number(),
  ordersThisMonth: z.number(),
  totalRevenue: z.number(),
  averageOrderValue: z.number(),
  mostPopularPlan: z.object({
    id: z.string().uuid(),
    title: z.string(),
    orderCount: z.number(),
  }).optional(),
});

// Tipi TypeScript derivati dagli schema
export type Order = z.infer<typeof orderSchema>;
export type CreateOrder = z.infer<typeof createOrderSchema>;
export type UpdateOrder = z.infer<typeof updateOrderSchema>;
export type DonateOrder = z.infer<typeof donateOrderSchema>;
export type OrderResponse = z.infer<typeof orderResponseSchema>;
export type OrderStats = z.infer<typeof orderStatsSchema>;
