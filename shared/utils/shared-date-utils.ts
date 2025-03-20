/**
 * Utility per la gestione delle date condivise tra client e server
 */

/**
 * Formatta una data nel formato italiano (gg/mm/aaaa)
 */
export const formatDate = (date: Date | string): string => {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  const day = String(parsedDate.getDate()).padStart(2, '0');
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const year = parsedDate.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Formatta una data nel formato italiano con orario (gg/mm/aaaa, HH:MM)
 */
export const formatDateWithTime = (date: Date | string): string => {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  const formattedDate = formatDate(parsedDate);
  const hours = String(parsedDate.getHours()).padStart(2, '0');
  const minutes = String(parsedDate.getMinutes()).padStart(2, '0');
  
  return `${formattedDate}, ${hours}:${minutes}`;
};

/**
 * Formatta un orario nel formato HH:MM
 */
export const formatTime = (time: Date | string): string => {
  const parsedTime = typeof time === 'string' ? new Date(time) : time;
  const hours = String(parsedTime.getHours()).padStart(2, '0');
  const minutes = String(parsedTime.getMinutes()).padStart(2, '0');
  
  return `${hours}:${minutes}`;
};

/**
 * Formatta un giorno della settimana
 * @param day Numero del giorno della settimana (1 = Lunedì, 7 = Domenica)
 * @param format Formato di output ('short' = 'Lun', 'long' = 'Lunedì')
 */
export const formatWeekday = (day: number | string, formatType: 'short' | 'long' = 'long'): string => {
  const dayNames = {
    short: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'],
    long: ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica']
  };
  
  const dayNumber = typeof day === 'string' ? parseInt(day) : day;
  const index = ((dayNumber - 1) % 7 + 7) % 7; // Ensure index is between 0-6
  return dayNames[formatType][index];
};

/**
 * Calcola il numero di giorni tra due date
 */
export const daysBetween = (date1: Date | string, date2: Date | string): number => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  // Reset time to midnight for accurate day calculation
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  
  // Calculate difference in milliseconds and convert to days
  const differenceMs = Math.abs(d2.getTime() - d1.getTime());
  return Math.round(differenceMs / (1000 * 60 * 60 * 24));
};

/**
 * Controlla se una data è nel passato
 */
export const isPastDate = (date: Date | string): boolean => {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  return parsedDate < new Date();
};

/**
 * Calcola la data di fine abbonamento in base ai giorni di durata
 */
export const calculateEndDate = (startDate: Date | string, durationDays: number): Date => {
  const parsedDate = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const endDate = new Date(parsedDate);
  endDate.setDate(endDate.getDate() + durationDays);
  return endDate;
};

/**
 * Verifica se un giorno della settimana è presente in un array di giorni
 * @param day Giorno da verificare (1-7)
 * @param availableDays Array di giorni disponibili (può essere un array di stringhe o una stringa con valori separati da virgola)
 */
export const isDayAvailable = (day: number, availableDays: string[] | string): boolean => {
  const dayStr = day.toString();
  
  if (Array.isArray(availableDays)) {
    return availableDays.includes(dayStr);
  }
  
  // Se è una stringa, dividi per virgola
  if (typeof availableDays === 'string') {
    const daysArray = availableDays.split(',').map(d => d.trim());
    return daysArray.includes(dayStr);
  }
  
  return false;
};

/**
 * Restituisce una data formattata per l'API (ISO 8601)
 */
export const formatDateForApi = (date: Date | string): string => {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  return parsedDate.toISOString();
};

/**
 * Restituisce l'indice del giorno della settimana per una data (1 = Lunedì, 7 = Domenica)
 */
export const getDayOfWeek = (date: Date | string): number => {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  // getDay() returns 0 for Sunday, 1 for Monday, etc.
  // We want 1 for Monday, 7 for Sunday
  const day = parsedDate.getDay();
  return day === 0 ? 7 : day;
};
