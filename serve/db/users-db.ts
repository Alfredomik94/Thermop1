// server/db/users-db.ts
import { supabaseAdmin } from './supabase-client.js';

/**
 * Ottieni un utente dal suo ID
 */
export const getUserById = async (id: number) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Ottieni un utente dal suo username
 */
export const getUserByUsername = async (username: string) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
};

/**
 * Crea un nuovo utente
 */
export const createUser = async (user: any) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert(user)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Aggiorna un utente esistente
 */
export const updateUser = async (id: number, updates: any) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Elimina un utente
 */
export const deleteUser = async (id: number) => {
  const { error } = await supabaseAdmin
    .from('users')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { success: true };
};

/**
 * Ottieni tutti i ristoranti (utenti di tipo tavola_calda)
 */
export const getRestaurants = async (cuisineType?: string) => {
  let query = supabaseAdmin
    .from('users')
    .select(`
      id, 
      name, 
      user_type,
      business_name,
      business_type,
      address,
      description,
      latitude,
      longitude,
      avg_rating,
      total_ratings
    `)
    .eq('user_type', 'tavola_calda');
  
  if (cuisineType && cuisineType !== 'Tutti') {
    query = query.eq('business_type', cuisineType);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

/**
 * Ottieni ristoranti per ID
 */
export const getRestaurantsByIds = async (ids: number[]) => {
  if (ids.length === 0) return [];

  const { data, error } = await supabaseAdmin
    .from('users')
    .select(`
      id, 
      name, 
      user_type,
      business_name,
      business_type,
      address,
      description,
      latitude,
      longitude,
      avg_rating,
      total_ratings
    `)
    .eq('user_type', 'tavola_calda')
    .in('id', ids);

  if (error) throw error;
  return data;
};

/**
 * Ottieni tutte le organizzazioni ONLUS (utenti di tipo onlus)
 */
export const getOnlusOrganizations = async () => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select(`
      id, 
      name, 
      user_type,
      business_name,
      assistance_type,
      address,
      description,
      activities
    `)
    .eq('user_type', 'onlus');

  if (error) throw error;
  return data;
};

/**
 * Ottieni un token di verifica email
 */
export const getEmailVerificationToken = async (token: string) => {
  const { data, error } = await supabaseAdmin
    .from('email_verifications')
    .select('*')
    .eq('token', token)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
};

/**
 * Elimina un token di verifica email
 */
export const deleteEmailVerificationToken = async (token: string) => {
  const { error } = await supabaseAdmin
    .from('email_verifications')
    .delete()
    .eq('token', token);

  if (error) throw error;
  return { success: true };
};

/**
 * Crea un token di verifica email
 */
export const createEmailVerificationToken = async (userId: number) => {
  // Genera un token univoco
  const token = generateRandomToken();
  
  // Imposta una scadenza di 24 ore
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);
  
  const { data, error } = await supabaseAdmin
    .from('email_verifications')
    .insert({
      user_id: userId,
      token,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Verifica un token di email e aggiorna l'utente come verificato
 */
export const verifyEmail = async (token: string) => {
  // Recupera il token di verifica
  const verification = await getEmailVerificationToken(token);
  
  if (!verification) {
    throw new Error('Token di verifica non valido');
  }
  
  // Verifica che il token non sia scaduto
  if (new Date(verification.expires_at) < new Date()) {
    throw new Error('Token di verifica scaduto');
  }
  
  // Aggiorna l'utente
  await updateUser(verification.user_id, {
    email_verified: true,
  });
  
  // Elimina il token di verifica
  await deleteEmailVerificationToken(token);
  
  return { success: true };
};

/**
 * Funzione di utilità per generare un token casuale
 */
function generateRandomToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}
