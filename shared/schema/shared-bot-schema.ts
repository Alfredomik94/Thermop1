// shared/src/bot-schema.ts
import { z } from 'zod';

// Tipi di interazione col bot
export const BotInteractionTypeEnum = z.enum([
  'help',         // Richiesta di assistenza
  'feedback',     // Feedback sul funzionamento dell'app
  'bug',          // Segnalazione di errori
  'suggestion',   // Suggerimenti per miglioramenti
  'info'          // Richiesta di informazioni
]);
export type BotInteractionTypeEnum = z.infer<typeof BotInteractionTypeEnum>;

// Stato dell'interazione
export const BotInteractionStatusEnum = z.enum([
  'open',         // Interazione aperta
  'in_progress',  // In corso di elaborazione
  'resolved',     // Risolta
  'closed'        // Chiusa
]);
export type BotInteractionStatusEnum = z.infer<typeof BotInteractionStatusEnum>;

// Schema messaggio
export const botMessageSchema = z.object({
  id: z.number(),
  interactionId: z.number(),
  userId: z.number().nullable(),  // NULL se è un messaggio del bot
  content: z.string(),
  timestamp: z.string().datetime(),
  isBot: z.boolean().default(false)
});
export type BotMessage = z.infer<typeof botMessageSchema>;

// Schema per inserimento messaggio
export const insertBotMessageSchema = botMessageSchema.omit({ 
  id: true, 
  timestamp: true 
});
export type InsertBotMessage = z.infer<typeof insertBotMessageSchema>;

// Schema interazione
export const botInteractionSchema = z.object({
  id: z.number(),
  userId: z.number(),
  type: BotInteractionTypeEnum,
  status: BotInteractionStatusEnum,
  title: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  feedbackRating: z.number().min(1).max(5).nullable().optional(),
  feedbackComment: z.string().nullable().optional()
});
export type BotInteraction = z.infer<typeof botInteractionSchema>;

// Schema per inserimento interazione
export const insertBotInteractionSchema = botInteractionSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  status: true
}).extend({
  initialMessage: z.string()
});
export type InsertBotInteraction = z.infer<typeof insertBotInteractionSchema>;

// Schema per aggiornamento interazione
export const updateBotInteractionSchema = z.object({
  status: BotInteractionStatusEnum.optional(),
  feedbackRating: z.number().min(1).max(5).optional(),
  feedbackComment: z.string().optional()
});
export type UpdateBotInteraction = z.infer<typeof updateBotInteractionSchema>;

// Schema statistiche del bot
export const botStatsSchema = z.object({
  totalInteractions: z.number(),
  openInteractions: z.number(),
  resolvedInteractions: z.number(),
  avgResponseTime: z.number(), // in secondi
  avgFeedbackRating: z.number(),
  interactionsByType: z.record(z.string(), z.number()),
  interactionsByUserType: z.record(z.string(), z.number()),
  popularTopics: z.array(z.object({
    topic: z.string(),
    count: z.number()
  })),
  responseTimeByDay: z.record(z.string(), z.number()),
  feedbackDistribution: z.array(z.object({
    rating: z.number(),
    count: z.number() 
  }))
});
export type BotStats = z.infer<typeof botStatsSchema>;

// Esporta tutti gli schemi
export default {
  BotInteractionTypeEnum,
  BotInteractionStatusEnum,
  botMessageSchema,
  insertBotMessageSchema,
  botInteractionSchema,
  insertBotInteractionSchema,
  updateBotInteractionSchema,
  botStatsSchema
};
