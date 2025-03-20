/**
 * Utility generiche per il server
 */

/**
 * Genera un codice alfanumerico casuale
 * @param length Lunghezza del codice
 * @returns Codice generato
 */
export const generateRandomCode = (length: number = 6): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

/**
 * Genera un token di verifica email
 * @returns Token generato
 */
export const generateEmailVerificationToken = (): string => {
  return generateRandomCode(32);
};

/**
 * Calcola la distanza in km tra due coordinate geografiche
 * @param lat1 Latitudine punto 1
 * @param lon1 Longitudine punto 1
 * @param lat2 Latitudine punto 2
 * @param lon2 Longitudine punto 2
 * @returns Distanza in km
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Raggio terrestre in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distanza in km
};

/**
 * Formatta una data nel formato italiano (gg/mm/aaaa)
 * @param date Data da formattare
 * @returns Data formattata
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

/**
 * Formatta un prezzo in Euro
 * @param price Prezzo da formattare
 * @returns Prezzo formattato con simbolo €
 */
export const formatPrice = (price: number): string => {
  return `${price.toFixed(2).replace('.', ',')} €`;
};

/**
 * Calcola il prezzo scontato
 * @param originalPrice Prezzo originale
 * @param discountPercentage Percentuale di sconto
 * @returns Prezzo scontato
 */
export const calculateDiscountedPrice = (originalPrice: number, discountPercentage: number): number => {
  return originalPrice * (1 - discountPercentage / 100);
};

/**
 * Genera un ID univoco per una sessione
 * @returns ID sessione
 */
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${generateRandomCode(8)}`;
};

/**
 * Controlla se un oggetto è vuoto
 * @param obj Oggetto da controllare
 * @returns true se l'oggetto è vuoto, false altrimenti
 */
export const isEmptyObject = (obj: Record<string, any>): boolean => {
  return Object.keys(obj).length === 0;
};

/**
 * Ritarda un'esecuzione
 * @param ms Millisecondi di attesa
 * @returns Promise che si risolve dopo ms millisecondi
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Rimuove caratteri speciali da una stringa
 * @param str Stringa da pulire
 * @returns Stringa pulita
 */
export const sanitizeString = (str: string): string => {
  return str.replace(/[^a-zA-Z0-9]/g, '');
};

/**
 * Pagina un array di risultati
 * @param items Array da paginare
 * @param page Numero di pagina (da 1)
 * @param limit Elementi per pagina
 * @returns Oggetto con risultati paginati
 */
export const paginateResults = <T>(items: T[], page: number = 1, limit: number = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const results = {
    data: items.slice(startIndex, endIndex),
    pagination: {
      total: items.length,
      page,
      limit,
      pages: Math.ceil(items.length / limit),
    },
  };
  return results;
};

export default {
  generateRandomCode,
  generateEmailVerificationToken,
  calculateDistance,
  formatDate,
  formatPrice,
  calculateDiscountedPrice,
  generateSessionId,
  isEmptyObject,
  delay,
  sanitizeString,
  paginateResults,
};
