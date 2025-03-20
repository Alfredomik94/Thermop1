"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOnlus = exports.isRestaurant = exports.isCustomer = exports.hasRole = exports.isAuthenticated = void 0;
// Middleware per verificare che l'utente sia autenticato
const isAuthenticated = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({
            success: false,
            message: 'Non autenticato'
        });
    }
    next();
};
exports.isAuthenticated = isAuthenticated;
// Middleware per verificare che l'utente sia di un certo tipo
const hasRole = (roles) => {
    return (req, res, next) => {
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Non autenticato'
            });
        }
        if (!req.session.userType || !roles.includes(req.session.userType)) {
            return res.status(403).json({
                success: false,
                message: 'Accesso non autorizzato'
            });
        }
        next();
    };
};
exports.hasRole = hasRole;
// Middleware per verificare che l'utente sia un cliente
exports.isCustomer = (0, exports.hasRole)(['customer']);
// Middleware per verificare che l'utente sia un ristorante
exports.isRestaurant = (0, exports.hasRole)(['tavola_calda']);
// Middleware per verificare che l'utente sia una ONLUS
exports.isOnlus = (0, exports.hasRole)(['onlus']);
exports.default = {
    isAuthenticated: exports.isAuthenticated,
    hasRole: exports.hasRole,
    isCustomer: exports.isCustomer,
    isRestaurant: exports.isRestaurant,
    isOnlus: exports.isOnlus
};
