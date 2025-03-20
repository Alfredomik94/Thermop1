/**
 * Utility per la validazione dati condivise tra client e server
 */
import { z } from 'zod';

/**
 * Verifica se una stringa è un'email valida
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return emailRegex.test(email);
};

/**
 * Verifica la validità di una password secondo le regole specificate
 * @returns Un oggetto con il risultato della validazione e eventuali errori
 */
export const validatePassword = (
  password: string,
  options: {
    minLength?: number;
    requiresUppercase?: boolean;
    requiresLowercase?: boolean;
    requiresNumber?: boolean;
    requiresSpecial?: boolean;
  } = {}
): { isValid: boolean; errors: string[] } => {
  const {
    minLength = 8,
    requiresUppercase = true,
    requiresLowercase = true,
    requiresNumber = true,
    requiresSpecial = false,
  } = options;

  const errors: string[] = [];

  if (password.length < minLength) {
    errors.push(`La password deve contenere almeno ${minLength} caratteri`);
  }

  if (requiresUppercase && !/[A-Z]/.test(password)) {
    errors.push('La password deve contenere almeno una lettera maiuscola');
  }

  if (requiresLowercase && !/[a-z]/.test(password)) {
    errors.push('La password deve contenere almeno una lettera minuscola');
  }

  if (requiresNumber && !/\d/.test(password)) {
    errors.push('La password deve contenere almeno un numero');
  }

  if (requiresSpecial && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('La password deve contenere almeno un carattere speciale');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Verifica se un codice fiscale italiano è valido
 */
export const isValidFiscalCode = (fiscalCode: string): boolean => {
  const fiscalCodeRegex = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/i;
  return fiscalCodeRegex.test(fiscalCode);
};

/**
 * Verifica se una partita IVA italiana è valida
 */
export const isValidVatNumber = (vatNumber: string): boolean => {
  const vatRegex = /^\d{11}$/;
  return vatRegex.test(vatNumber);
};

/**
 * Verifica se un numero di telefono è valido
 */
export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  // Molto semplificato, in produzione usare una libreria specifica
  const phoneRegex = /^(\+\d{1,3})?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
  return phoneRegex.test(phoneNumber);
};

/**
 * Verifica se un codice postale italiano è valido
 */
export const isValidPostalCode = (postalCode: string): boolean => {
  const postalCodeRegex = /^\d{5}$/;
  return postalCodeRegex.test(postalCode);
};

/**
 * Verifica se una data è valida e nel formato corretto
 */
export const isValidDate = (date: string): boolean => {
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
};

/**
 * Verifica se una stringa è un URL valido
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
};

/**
 * Trasforma gli errori Zod in un formato più leggibile
 */
export const formatZodError = (error: z.ZodError): Record<string, string[]> => {
  const result: Record<string, string[]> = {};
  
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!result[path]) {
      result[path] = [];
    }
    result[path].push(err.message);
  });
  
  return result;
};

/**
 * Verifica se un oggetto è vuoto
 */
export const isEmptyObject = (obj: Record<string, any>): boolean => {
  return Object.keys(obj).length === 0;
};

/**
 * Sanitizza una stringa per evitare iniezioni di script
 */
export const sanitizeString = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};
