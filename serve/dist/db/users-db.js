"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmail = exports.createEmailVerificationToken = exports.deleteEmailVerificationToken = exports.getEmailVerificationToken = exports.getOnlusOrganizations = exports.getRestaurantsByIds = exports.getRestaurants = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserByUsername = exports.getUserById = void 0;
// server/db/users-db.ts
const supabase_client_js_1 = require("./supabase-client.js");
/**
 * Ottieni un utente dal suo ID
 */
const getUserById = async (id) => {
    const { data, error } = await supabase_client_js_1.supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
    if (error)
        throw error;
    return data;
};
exports.getUserById = getUserById;
/**
 * Ottieni un utente dal suo username
 */
const getUserByUsername = async (username) => {
    const { data, error } = await supabase_client_js_1.supabaseAdmin
        .from('users')
        .select('*')
        .eq('username', username)
        .single();
    if (error && error.code !== 'PGRST116')
        throw error;
    return data || null;
};
exports.getUserByUsername = getUserByUsername;
/**
 * Crea un nuovo utente
 */
const createUser = async (user) => {
    const { data, error } = await supabase_client_js_1.supabaseAdmin
        .from('users')
        .insert(user)
        .select()
        .single();
    if (error)
        throw error;
    return data;
};
exports.createUser = createUser;
/**
 * Aggiorna un utente esistente
 */
const updateUser = async (id, updates) => {
    const { data, error } = await supabase_client_js_1.supabaseAdmin
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error)
        throw error;
    return data;
};
exports.updateUser = updateUser;
/**
 * Elimina un utente
 */
const deleteUser = async (id) => {
    const { error } = await supabase_client_js_1.supabaseAdmin
        .from('users')
        .delete()
        .eq('id', id);
    if (error)
        throw error;
    return { success: true };
};
exports.deleteUser = deleteUser;
/**
 * Ottieni tutti i ristoranti (utenti di tipo tavola_calda)
 */
const getRestaurants = async (cuisineType) => {
    let query = supabase_client_js_1.supabaseAdmin
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
    if (error)
        throw error;
    return data;
};
exports.getRestaurants = getRestaurants;
/**
 * Ottieni ristoranti per ID
 */
const getRestaurantsByIds = async (ids) => {
    if (ids.length === 0)
        return [];
    const { data, error } = await supabase_client_js_1.supabaseAdmin
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
    if (error)
        throw error;
    return data;
};
exports.getRestaurantsByIds = getRestaurantsByIds;
/**
 * Ottieni tutte le organizzazioni ONLUS (utenti di tipo onlus)
 */
const getOnlusOrganizations = async () => {
    const { data, error } = await supabase_client_js_1.supabaseAdmin
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
    if (error)
        throw error;
    return data;
};
exports.getOnlusOrganizations = getOnlusOrganizations;
/**
 * Ottieni un token di verifica email
 */
const getEmailVerificationToken = async (token) => {
    const { data, error } = await supabase_client_js_1.supabaseAdmin
        .from('email_verifications')
        .select('*')
        .eq('token', token)
        .single();
    if (error && error.code !== 'PGRST116')
        throw error;
    return data || null;
};
exports.getEmailVerificationToken = getEmailVerificationToken;
/**
 * Elimina un token di verifica email
 */
const deleteEmailVerificationToken = async (token) => {
    const { error } = await supabase_client_js_1.supabaseAdmin
        .from('email_verifications')
        .delete()
        .eq('token', token);
    if (error)
        throw error;
    return { success: true };
};
exports.deleteEmailVerificationToken = deleteEmailVerificationToken;
/**
 * Crea un token di verifica email
 */
const createEmailVerificationToken = async (userId) => {
    // Genera un token univoco
    const token = generateRandomToken();
    // Imposta una scadenza di 24 ore
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    const { data, error } = await supabase_client_js_1.supabaseAdmin
        .from('email_verifications')
        .insert({
        user_id: userId,
        token,
        expires_at: expiresAt.toISOString(),
    })
        .select()
        .single();
    if (error)
        throw error;
    return data;
};
exports.createEmailVerificationToken = createEmailVerificationToken;
/**
 * Verifica un token di email e aggiorna l'utente come verificato
 */
const verifyEmail = async (token) => {
    // Recupera il token di verifica
    const verification = await (0, exports.getEmailVerificationToken)(token);
    if (!verification) {
        throw new Error('Token di verifica non valido');
    }
    // Verifica che il token non sia scaduto
    if (new Date(verification.expires_at) < new Date()) {
        throw new Error('Token di verifica scaduto');
    }
    // Aggiorna l'utente
    await (0, exports.updateUser)(verification.user_id, {
        email_verified: true,
    });
    // Elimina il token di verifica
    await (0, exports.deleteEmailVerificationToken)(token);
    return { success: true };
};
exports.verifyEmail = verifyEmail;
/**
 * Funzione di utilità per generare un token casuale
 */
function generateRandomToken() {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
}
