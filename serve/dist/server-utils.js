"use strict";
/**
 * Utility generiche per il server
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginateResults = exports.sanitizeString = exports.delay = exports.isEmptyObject = exports.generateSessionId = exports.calculateDiscountedPrice = exports.formatPrice = exports.formatDate = exports.calculateDistance = exports.generateEmailVerificationToken = exports.generateRandomCode = void 0;
/**
 * Genera un codice alfanumerico casuale
 * @param length Lunghezza del codice
 * @returns Codice generato
 */
const generateRandomCode = (length = 6) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};
exports.generateRandomCode = generateRandomCode;
/**
 * Genera un token di verifica email
 * @returns Token generato
 */
const generateEmailVerificationToken = () => {
    return (0, exports.generateRandomCode)(32);
};
exports.generateEmailVerificationToken = generateEmailVerificationToken;
/**
 * Calcola la distanza in km tra due coordinate geografiche
 * @param lat1 Latitudine punto 1
 * @param lon1 Longitudine punto 1
 * @param lat2 Latitudine punto 2
 * @param lon2 Longitudine punto 2
 * @returns Distanza in km
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Raggio terrestre in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distanza in km
};
exports.calculateDistance = calculateDistance;
/**
 * Formatta una data nel formato italiano (gg/mm/aaaa)
 * @param date Data da formattare
 * @returns Data formattata
 */
const formatDate = (date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};
exports.formatDate = formatDate;
/**
 * Formatta un prezzo in Euro
 * @param price Prezzo da formattare
 * @returns Prezzo formattato con simbolo €
 */
const formatPrice = (price) => {
    return `${price.toFixed(2).replace('.', ',')} €`;
};
exports.formatPrice = formatPrice;
/**
 * Calcola il prezzo scontato
 * @param originalPrice Prezzo originale
 * @param discountPercentage Percentuale di sconto
 * @returns Prezzo scontato
 */
const calculateDiscountedPrice = (originalPrice, discountPercentage) => {
    return originalPrice * (1 - discountPercentage / 100);
};
exports.calculateDiscountedPrice = calculateDiscountedPrice;
/**
 * Genera un ID univoco per una sessione
 * @returns ID sessione
 */
const generateSessionId = () => {
    return `session_${Date.now()}_${(0, exports.generateRandomCode)(8)}`;
};
exports.generateSessionId = generateSessionId;
/**
 * Controlla se un oggetto è vuoto
 * @param obj Oggetto da controllare
 * @returns true se l'oggetto è vuoto, false altrimenti
 */
const isEmptyObject = (obj) => {
    return Object.keys(obj).length === 0;
};
exports.isEmptyObject = isEmptyObject;
/**
 * Ritarda un'esecuzione
 * @param ms Millisecondi di attesa
 * @returns Promise che si risolve dopo ms millisecondi
 */
const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
exports.delay = delay;
/**
 * Rimuove caratteri speciali da una stringa
 * @param str Stringa da pulire
 * @returns Stringa pulita
 */
const sanitizeString = (str) => {
    return str.replace(/[^a-zA-Z0-9]/g, '');
};
exports.sanitizeString = sanitizeString;
/**
 * Pagina un array di risultati
 * @param items Array da paginare
 * @param page Numero di pagina (da 1)
 * @param limit Elementi per pagina
 * @returns Oggetto con risultati paginati
 */
const paginateResults = (items, page = 1, limit = 10) => {
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
exports.paginateResults = paginateResults;
exports.default = {
    generateRandomCode: exports.generateRandomCode,
    generateEmailVerificationToken: exports.generateEmailVerificationToken,
    calculateDistance: exports.calculateDistance,
    formatDate: exports.formatDate,
    formatPrice: exports.formatPrice,
    calculateDiscountedPrice: exports.calculateDiscountedPrice,
    generateSessionId: exports.generateSessionId,
    isEmptyObject: exports.isEmptyObject,
    delay: exports.delay,
    sanitizeString: exports.sanitizeString,
    paginateResults: exports.paginateResults,
};
