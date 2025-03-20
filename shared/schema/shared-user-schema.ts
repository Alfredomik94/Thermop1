import { z } from 'zod';

// Schema per la validazione degli utenti
export const userSchema = z.object({
  id: z.string().uuid().optional(),
  username: z.string().email('Inserisci un indirizzo email valido').min(5, 'Email troppo corta'),
  password: z.string().min(8, 'La password deve essere di almeno 8 caratteri'),
  name: z.string().min(2, 'Il nome deve essere di almeno 2 caratteri'),
  userType: z.enum(['customer', 'tavola_calda', 'onlus']),
  businessName: z.string().optional(),
  businessType: z.string().optional(),
  assistanceType: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  activities: z.string().optional(),
  preferredPickupPoint: z.string().uuid().optional(),
  inviteCode: z.string().optional(),
  favoriteRestaurants: z.array(z.string().uuid()).optional(),
  emailVerified: z.boolean().default(false),
  profileImageUrl: z.string().url().optional(),
  createdAt: z.string().datetime().optional(),
});

// Schema per la registrazione (aggiunge la conferma password)
export const registerSchema = userSchema
  .omit({ id: true, emailVerified: true, createdAt: true })
  .extend({
    confirmPassword: z.string().min(8, 'La password deve essere di almeno 8 caratteri'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Le password non coincidono',
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      if (data.userType === 'customer') return true;
      return !!data.businessName;
    },
    {
      message: 'Il nome dell\'attività è obbligatorio per ristoranti e ONLUS',
      path: ['businessName'],
    }
  )
  .refine(
    (data) => {
      if (data.userType === 'customer') return true;
      return !!data.address;
    },
    {
      message: 'L\'indirizzo è obbligatorio per ristoranti e ONLUS',
      path: ['address'],
    }
  );

// Schema per il login
export const loginSchema = z.object({
  username: z.string().email('Inserisci un indirizzo email valido'),
  password: z.string().min(1, 'Inserisci la password'),
});

// Schema per l'aggiornamento del profilo
export const updateUserSchema = userSchema
  .omit({ id: true, username: true, password: true, userType: true, emailVerified: true, createdAt: true })
  .partial();

// Schema per la risposta dell'utente (senza password)
export const userResponseSchema = userSchema.omit({ password: true });

// Tipi TypeScript derivati dagli schema
export type User = z.infer<typeof userSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type RegisterUser = z.infer<typeof registerSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
