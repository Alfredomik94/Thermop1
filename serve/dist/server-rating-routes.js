"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRatingRoutes = void 0;
const express_1 = require("express");
const server_rating_controller_1 = require("../controllers/server-rating-controller");
const validation_middleware_1 = require("../middleware/validation-middleware");
const auth_middleware_1 = require("../middleware/auth-middleware");
const rating_schema_1 = require("@shared/schema/rating-schema");
/**
 * Registra le routes per le valutazioni nell'applicazione Express
 * @param app - Istanza Express
 * @param basePath - Percorso base per le routes
 */
const registerRatingRoutes = (app, basePath) => {
    const router = (0, express_1.Router)();
    // Route per creare una nuova valutazione
    router.post('/', auth_middleware_1.authenticateUser, (0, validation_middleware_1.validate)(rating_schema_1.CreateRatingSchema), server_rating_controller_1.createRating);
    // Route per aggiornare una valutazione esistente
    router.put('/:ratingId', auth_middleware_1.authenticateUser, (0, validation_middleware_1.validate)(rating_schema_1.UpdateRatingSchema), server_rating_controller_1.updateRating);
    // Route per eliminare una valutazione
    router.delete('/:ratingId', auth_middleware_1.authenticateUser, server_rating_controller_1.deleteRating);
    // Route per ottenere le valutazioni di un'entità
    router.get('/entity/:entityType/:entityId', server_rating_controller_1.getEntityRatings);
    // Route per ottenere le valutazioni di un utente
    router.get('/user/:userId?', auth_middleware_1.authenticateUser, server_rating_controller_1.getUserRatings);
    // Registra il router al percorso base
    app.use(basePath, router);
};
exports.registerRatingRoutes = registerRatingRoutes;
