// server/services/auth-service.ts
import * as usersDb from '../db/users-db.js';
import * as emailService from './email-service.js';
import * as notificationService from './notification-service.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

/**
 * Registra un nuovo utente
 * 
 * @param userData Dati dell'utente da registrare
 * @returns Utente registrato
 */
export const registerUser = async (userData: any) => {
  try {
    // Verifica se l'utente esiste già
    const existingUser = await usersDb.getUserByUsername(userData.username);
    if (existingUser) {
      throw new Error('Username già in uso');
    }
    
    // Cripta la password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Prepara i dati per il database (converti da camelCase a snake_case)
    const dbData = {
      ...userData,
      password: hashedPassword,
      user_type: userData.userType,
      business_name: userData.businessName,
      business_type: userData.businessType,
      assistance_type: userData.assistanceType,
      favorite_restaurants: userData.favoriteRestaurants || [],
      email_verified: false,
    };
    
    // Elimina i campi camelCase che abbiamo convertito
    delete dbData.userType;
    delete dbData.businessName;
    delete dbData.businessType;
    delete dbData.assistanceType;
    delete dbData.favoriteRestaurants;
    
    // Crea l'utente
    const user = await usersDb.createUser(dbData);
    
    // Crea token di verifica email
    await createVerificationToken(user.id);
    
    // Invia una notifica di benvenuto
    await notificationService.sendSystemNotification(
      user.id,
      'Benvenuto su Thermopolio',
      `Grazie per esserti registrato su Thermopolio, ${user.name}!`
    );
    
    return user;
  } catch (error) {
    console.error('Errore nella registrazione dell\'utente:', error);
    throw error;
  }
};

/**
 * Effettua il login di un utente
 * 
 * @param username Username
 * @param password Password
 * @returns Utente autenticato
 */
export const loginUser = async (username: string, password: string) => {
  try {
    // Recupera l'utente
    const user = await usersDb.getUserByUsername(username);
    if (!user) {
      throw new Error('Credenziali non valide');
    }
    
    // Verifica la password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Credenziali non valide');
    }
    
    return user;
  } catch (error) {
    console.error('Errore nel login dell\'utente:', error);
    throw error;
  }
};

/**
 * Crea un token di verifica email
 * 
 * @param userId ID dell'utente
 * @returns Token di verifica
 */
export const createVerificationToken = async (userId: number) => {
  try {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 ore di validità
    
    const verificationToken = await usersDb.createEmailVerificationToken({
      user_id: userId,
      token,
      expires_at: expiresAt.toISOString(),
    });
    
    // Recupera l'utente per inviare l'email
    const user = await usersDb.getUserById(userId);
    
    // Invia l'email di verifica
    await emailService.sendVerificationEmail(user.username, token);
    
    return verificationToken;
  } catch (error) {
    console.error('Errore nella creazione del token di verifica:', error);
    throw error;
  }
};

/**
 * Verifica un token di email
 * 
 * @param token Token da verificare
 * @returns Risultato della verifica
 */
export const verifyEmail = async (token: string) => {
  try {
    return await usersDb.verifyEmail(token);
  } catch (error) {
    console.error('Errore nella verifica dell\'email:', error);
    throw error;
  }
};

/**
 * Richiede un reset della password
 * 
 * @param username Username dell'utente
 * @returns Token di reset
 */
export const requestPasswordReset = async (username: string) => {
  try {
    // Verifica se l'utente esiste
    const user = await usersDb.getUserByUsername(username);
    if (!user) {
      throw new Error('Utente non trovato');
    }
    
    // Crea un token di reset
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 ora di validità
    
    // Salva il token (in un'implementazione reale, avresti una tabella apposita)
    
    // Invia l'email di reset
    await emailService.sendPasswordResetEmail(username, token);
    
    return { success: true };
  } catch (error) {
    console.error('Errore nella richiesta di reset della password:', error);
    throw error;
  }
};

/**
 * Reimposta la password di un utente
 * 
 * @param token Token di reset
 * @param newPassword Nuova password
 * @returns Risultato del reset
 */
export const resetPassword = async (token: string, newPassword: string) => {
  try {
    // Verifica il token (in un'implementazione reale, verificheresti dalla tabella)
    
    // Estrai l'ID utente dal token
    const userId = 1; // Placeholder
    
    // Cripta la nuova password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Aggiorna la password
    await usersDb.updateUser(userId, { password: hashedPassword });
    
    // Elimina il token (in un'implementazione reale)
    
    return { success: true };
  } catch (error) {
    console.error('Errore nel reset della password:', error);
    throw error;
  }
};

// server/services/email-service.ts
/**
 * Invia un'email di verifica
 * 
 * @param email Email del destinatario
 * @param token Token di verifica
 * @returns Risultato dell'invio
 */
export const sendVerificationEmail = async (email: string, token: string) => {
  // In un ambiente reale, utilizzeresti un servizio di email come SendGrid, Mailgun, etc.
  
  console.log(`
    ==========================================
    Email di verifica inviata a ${email}
    Token: ${token}
    Link: http://localhost:5173/verify-email/${token}
    ==========================================
  `);
  
  return { success: true };
};

/**
 * Invia un'email di reset password
 * 
 * @param email Email del destinatario
 * @param token Token di reset
 * @returns Risultato dell'invio
 */
export const sendPasswordResetEmail = async (email: string, token: string) => {
  // In un ambiente reale, utilizzeresti un servizio di email
  
  console.log(`
    ==========================================
    Email di reset password inviata a ${email}
    Token: ${token}
    Link: http://localhost:5173/reset-password/${token}
    ==========================================
  `);
  
  return { success: true };
};

/**
 * Invia un'email di conferma ordine
 * 
 * @param email Email del destinatario
 * @param order Dettagli dell'ordine
 * @returns Risultato dell'invio
 */
export const sendOrderConfirmationEmail = async (email: string, order: any) => {
  // In un ambiente reale, utilizzeresti un servizio di email
  
  console.log(`
    ==========================================
    Email di conferma ordine inviata a ${email}
    Ordine: ${JSON.stringify(order)}
    ==========================================
  `);
  
  return { success: true };
};

/**
 * Invia un'email di aggiornamento stato ordine
 * 
 * @param email Email del destinatario
 * @param orderId ID dell'ordine
 * @param status Nuovo stato
 * @returns Risultato dell'invio
 */
export const sendOrderStatusUpdateEmail = async (email: string, orderId: number, status: string) => {
  // In un ambiente reale, utilizzeresti un servizio di email
  
  console.log(`
    ==========================================
    Email di aggiornamento stato ordine inviata a ${email}
    Ordine: ${orderId}
    Stato: ${status}
    ==========================================
  `);
  
  return { success: true };
};

/**
 * Invia un'email di conferma donazione
 * 
 * @param email Email del destinatario
 * @param order Dettagli dell'ordine donato
 * @param onlus Dettagli della ONLUS destinataria
 * @returns Risultato dell'invio
 */
export const sendDonationConfirmationEmail = async (email: string, order: any, onlus: any) => {
  // In un ambiente reale, utilizzeresti un servizio di email
  
  console.log(`
    ==========================================
    Email di conferma donazione inviata a ${email}
    Ordine: ${JSON.stringify(order)}
    ONLUS: ${JSON.stringify(onlus)}
    ==========================================
  `);
  
  return { success: true };
};
