import { Request, Response } from 'express';
import { supabase } from '../utils/server-supabase';
import { logger } from '../utils/logger';
import { catchAsync, createError } from '../utils/server-error-handler';
import { UpdateProfileSchema } from '@shared/schema/user-schema';

/**
 * Controller per ottenere l'utente corrente
 */
export const getCurrentUser = catchAsync(async (req: Request, res: Response) => {
  // L'utente è già stato caricato dal middleware di autenticazione
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Autenticazione richiesta',
    });
  }
  
  res.json({
    success: true,
    user: req.user,
  });
});

/**
 * Controller per ottenere un utente specifico per ID
 */
export const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  
  // Ottieni l'utente dal database
  const { data, error } = await supabase
    .from('users')
    .select(`
      id, 
      username, 
      name, 
      userType, 
      businessName, 
      businessType, 
      assistanceType, 
      address, 
      description, 
      activities,
      createdAt
    `)
    .eq('id', userId)
    .single();
  
  if (error || !data) {
    logger.warn(`Utente non trovato: ${userId}`);
    
    return res.status(404).json({
      success: false,
      message: 'Utente non trovato',
    });
  }
  
  // Rimuovi campi sensibili per utenti pubblici
  const publicUser = {
    id: data.id,
    username: data.username,
    name: data.name,
    userType: data.userType,
    businessName: data.businessName,
    businessType: data.businessType,
    assistanceType: data.assistanceType,
    address: data.address,
    description: data.description,
    activities: data.activities,
    createdAt: data.createdAt,
  };
  
  res.json({
    success: true,
    user: publicUser,
  });
});

/**
 * Controller per aggiornare il profilo dell'utente corrente
 */
export const updateUserProfile = catchAsync(async (req: Request, res: Response) => {
  if (!req.user || !req.userId) {
    return res.status(401).json({
      success: false,
      message: 'Autenticazione richiesta',
    });
  }
  
  const userId = req.userId;
  const updateData = req.body;
  
  // Aggiorna il profilo nel database
  const { data, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    logger.error(`Errore durante l'aggiornamento del profilo: ${error.message}`);
    
    return res.status(400).json({
      success: false,
      message: error.message || 'Errore durante l\'aggiornamento del profilo',
    });
  }
  
  logger.info(`Profilo aggiornato per l'utente ID: ${userId}`);
  
  res.json({
    success: true,
    message: 'Profilo aggiornato con successo',
    user: data,
  });
});

/**
 * Controller per eliminare l'account utente
 */
export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  if (!req.user || !req.userId) {
    return res.status(401).json({
      success: false,
      message: 'Autenticazione richiesta',
    });
  }
  
  const userId = req.userId;
  
  // Elimina l'utente dal database
  const { error: deleteError } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);
  
  if (deleteError) {
    logger.error(`Errore durante l'eliminazione dell'utente: ${deleteError.message}`);
    
    return res.status(400).json({
      success: false,
      message: deleteError.message || 'Errore durante l\'eliminazione dell\'utente',
    });
  }
  
  // Elimina l'utente da Auth
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);
  
  if (authError) {
    logger.error(`Errore durante l'eliminazione dell'utente da Auth: ${authError.message}`);
    
    return res.status(400).json({
      success: false,
      message: authError.message || 'Errore durante l\'eliminazione dell\'utente da Auth',
    });
  }
  
  logger.info(`Utente eliminato: ${userId}`);
  
  res.json({
    success: true,
    message: 'Account eliminato con successo',
  });
});

/**
 * Controller per ottenere la lista dei clienti (solo per admin)
 */
export const getCustomers = catchAsync(async (req: Request, res: Response) => {
  if (!req.user || !req.userId) {
    return res.status(401).json({
      success: false,
      message: 'Autenticazione richiesta',
    });
  }
  
  // Verifica autorizzazioni admin
  if (req.user.userType !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Accesso non autorizzato',
    });
  }
  
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  // Ottieni la lista dei clienti
  const { data, error, count } = await supabase
    .from('users')
    .select('id, username, name, createdAt', { count: 'exact' })
    .eq('userType', 'customer')
    .order('createdAt', { ascending: false })
    .range(from, to);
  
  if (error) {
    logger.error(`Errore durante il recupero dei clienti: ${error.message}`);
    
    return res.status(400).json({
      success: false,
      message: error.message || 'Errore durante il recupero dei clienti',
    });
  }
  
  res.json({
    success: true,
    customers: data,
    total: count || 0,
    page,
    limit,
    totalPages: count ? Math.ceil(count / limit) : 0,
  });
});

/**
 * Controller per ottenere la lista dei ristoranti
 */
export const getRestaurants = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  // Filtri
  const businessType = req.query.businessType as string;
  
  // Costruisci la query
  let query = supabase
    .from('users')
    .select(`
      id, 
      businessName, 
      businessType, 
      address, 
      description,
      latitude,
      longitude,
      createdAt
    `, { count: 'exact' })
    .eq('userType', 'tavola_calda')
    .order('createdAt', { ascending: false });
  
  // Applica filtri
  if (businessType) {
    query = query.eq('businessType', businessType);
  }
  
  // Applica paginazione
  query = query.range(from, to);
  
  // Esegui la query
  const { data, error, count } = await query;
  
  if (error) {
    logger.error(`Errore durante il recupero dei ristoranti: ${error.message}`);
    
    return res.status(400).json({
      success: false,
      message: error.message || 'Errore durante il recupero dei ristoranti',
    });
  }
  
  res.json({
    success: true,
    restaurants: data,
    total: count || 0,
    page,
    limit,
    totalPages: count ? Math.ceil(count / limit) : 0,
  });
});

/**
 * Controller per ottenere la lista delle ONLUS
 */
export const getOnlus = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  // Filtri
  const assistanceType = req.query.assistanceType as string;
  
  // Costruisci la query
  let query = supabase
    .from('users')
    .select(`
      id, 
      businessName, 
      assistanceType, 
      address, 
      description,
      activities,
      createdAt
    `, { count: 'exact' })
    .eq('userType', 'onlus')
    .order('createdAt', { ascending: false });
  
  // Applica filtri
  if (assistanceType) {
    query = query.eq('assistanceType', assistanceType);
  }
  
  // Applica paginazione
  query = query.range(from, to);
  
  // Esegui la query
  const { data, error, count } = await query;
  
  if (error) {
    logger.error(`Errore durante il recupero delle ONLUS: ${error.message}`);
    
    return res.status(400).json({
      success: false,
      message: error.message || 'Errore durante il recupero delle ONLUS',
    });
  }
  
  res.json({
    success: true,
    onlus: data,
    total: count || 0,
    page,
    limit,
    totalPages: count ? Math.ceil(count / limit) : 0,
  });
});
