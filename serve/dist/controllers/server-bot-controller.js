"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBotStats = exports.updateBotInteraction = exports.createBotMessage = exports.getBotInteraction = exports.getBotInteractions = exports.createBotInteraction = void 0;
const storage_1 = require("../services/storage");
const thermopolio_shared_1 = require("thermopolio-shared");
const zod_1 = require("zod");
// Funzione per generare una risposta automatica del bot
const generateBotResponse = async (message, interactionType) => {
    // In una implementazione reale, qui utilizzeremmo un servizio AI come OpenAI GPT
    // Per questa demo, usiamo risposte prefabbricate in base al tipo di interazione
    const helpResponses = [
        "Ciao! Come posso aiutarti con l'app Thermopolio?",
        "Sono qui per aiutarti a utilizzare l'app. Cosa ti serve sapere?",
        "Grazie per la tua domanda. Ecco come puoi procedere..."
    ];
    const bugResponses = [
        "Mi dispiace per il problema che stai riscontando. Puoi fornire maggiori dettagli?",
        "Grazie per la segnalazione. Il nostro team tecnico la esaminerà al più presto.",
        "Potrebbe essere utile sapere quale dispositivo e browser stai utilizzando per aiutarci a risolvere il problema."
    ];
    const feedbackResponses = [
        "Grazie per il tuo feedback! Il tuo parere è molto importante per noi.",
        "Apprezziamo il tempo che hai dedicato a condividere la tua opinione.",
        "Il tuo feedback ci aiuterà a migliorare l'esperienza per tutti gli utenti."
    ];
    const suggestionResponses = [
        "Grazie per il suggerimento! Lo condivideremo con il nostro team di sviluppo.",
        "È un'ottima idea! La valuteremo per i prossimi aggiornamenti.",
        "Apprezziamo molto i suggerimenti degli utenti. Grazie per il tuo contributo!"
    ];
    const infoResponses = [
        "Ecco le informazioni che hai richiesto...",
        "Sono felice di poterti fornire queste informazioni.",
        "Ti confermo che questa è la procedura corretta."
    ];
    // Scegliamo una risposta casuale in base al tipo
    let responses;
    switch (interactionType) {
        case 'help':
            responses = helpResponses;
            break;
        case 'bug':
            responses = bugResponses;
            break;
        case 'feedback':
            responses = feedbackResponses;
            break;
        case 'suggestion':
            responses = suggestionResponses;
            break;
        case 'info':
            responses = infoResponses;
            break;
        default:
            responses = helpResponses;
    }
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
};
// Crea una nuova interazione con il bot
const createBotInteraction = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Non autenticato',
            });
        }
        const data = thermopolio_shared_1.insertBotInteractionSchema.parse({
            ...req.body,
            userId: req.session.userId
        });
        // Crea l'interazione
        const interaction = await storage_1.storage.createBotInteraction({
            userId: data.userId,
            type: data.type,
            title: data.title,
            status: 'open'
        });
        // Crea il messaggio iniziale dell'utente
        const userMessage = await storage_1.storage.createBotMessage({
            interactionId: interaction.id,
            userId: data.userId,
            content: data.initialMessage,
            isBot: false
        });
        // Genera e crea la risposta automatica del bot
        const botResponse = await generateBotResponse(data.initialMessage, data.type);
        const botMessage = await storage_1.storage.createBotMessage({
            interactionId: interaction.id,
            userId: null,
            content: botResponse,
            isBot: true
        });
        res.status(201).json({
            success: true,
            message: 'Interazione con il bot creata con successo',
            data: {
                interaction,
                messages: [userMessage, botMessage]
            },
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                success: false,
                message: 'Dati non validi',
                errors: error.errors.map(e => e.message),
            });
        }
        else {
            console.error('Error creating bot interaction:', error);
            res.status(500).json({
                success: false,
                message: 'Errore durante la creazione dell\'interazione con il bot',
            });
        }
    }
};
exports.createBotInteraction = createBotInteraction;
// Ottieni tutte le interazioni dell'utente corrente
const getBotInteractions = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Non autenticato',
            });
        }
        const interactions = await storage_1.storage.getBotInteractionsByUserId(req.session.userId);
        res.json({
            success: true,
            data: interactions,
        });
    }
    catch (error) {
        console.error('Error fetching bot interactions:', error);
        res.status(500).json({
            success: false,
            message: 'Errore durante il recupero delle interazioni con il bot',
        });
    }
};
exports.getBotInteractions = getBotInteractions;
// Ottieni una specifica interazione con i relativi messaggi
const getBotInteraction = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Non autenticato',
            });
        }
        const interactionId = parseInt(req.params.id);
        if (isNaN(interactionId)) {
            return res.status(400).json({
                success: false,
                message: 'ID non valido',
            });
        }
        const interaction = await storage_1.storage.getBotInteraction(interactionId);
        if (!interaction) {
            return res.status(404).json({
                success: false,
                message: 'Interazione non trovata',
            });
        }
        // Verifica che l'interazione appartenga all'utente corrente
        if (interaction.userId !== req.session.userId) {
            return res.status(403).json({
                success: false,
                message: 'Non autorizzato ad accedere a questa interazione',
            });
        }
        // Recupera i messaggi dell'interazione
        const messages = await storage_1.storage.getBotMessagesByInteractionId(interactionId);
        res.json({
            success: true,
            data: {
                interaction,
                messages,
            },
        });
    }
    catch (error) {
        console.error('Error fetching bot interaction:', error);
        res.status(500).json({
            success: false,
            message: 'Errore durante il recupero dell\'interazione con il bot',
        });
    }
};
exports.getBotInteraction = getBotInteraction;
// Aggiungi un nuovo messaggio a un'interazione esistente
const createBotMessage = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Non autenticato',
            });
        }
        const interactionId = parseInt(req.params.id);
        if (isNaN(interactionId)) {
            return res.status(400).json({
                success: false,
                message: 'ID non valido',
            });
        }
        const interaction = await storage_1.storage.getBotInteraction(interactionId);
        if (!interaction) {
            return res.status(404).json({
                success: false,
                message: 'Interazione non trovata',
            });
        }
        // Verifica che l'interazione appartenga all'utente corrente
        if (interaction.userId !== req.session.userId) {
            return res.status(403).json({
                success: false,
                message: 'Non autorizzato ad accedere a questa interazione',
            });
        }
        // Verifica che l'interazione non sia chiusa
        if (interaction.status === 'closed') {
            return res.status(400).json({
                success: false,
                message: 'Impossibile aggiungere messaggi a un\'interazione chiusa',
            });
        }
        const data = thermopolio_shared_1.insertBotMessageSchema.parse({
            interactionId,
            userId: req.session.userId,
            content: req.body.content,
            isBot: false
        });
        // Crea il messaggio dell'utente
        const userMessage = await storage_1.storage.createBotMessage(data);
        // Genera e crea la risposta automatica del bot
        const botResponse = await generateBotResponse(data.content, interaction.type);
        const botMessage = await storage_1.storage.createBotMessage({
            interactionId,
            userId: null,
            content: botResponse,
            isBot: true
        });
        // Se l'interazione era in stato "open", passa a "in_progress"
        if (interaction.status === 'open') {
            await storage_1.storage.updateBotInteraction(interactionId, { status: 'in_progress' });
        }
        res.status(201).json({
            success: true,
            message: 'Messaggi aggiunti con successo',
            data: {
                userMessage,
                botMessage,
            },
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                success: false,
                message: 'Dati non validi',
                errors: error.errors.map(e => e.message),
            });
        }
        else {
            console.error('Error creating bot messages:', error);
            res.status(500).json({
                success: false,
                message: 'Errore durante la creazione dei messaggi',
            });
        }
    }
};
exports.createBotMessage = createBotMessage;
// Aggiorna lo stato di un'interazione
const updateBotInteraction = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Non autenticato',
            });
        }
        const interactionId = parseInt(req.params.id);
        if (isNaN(interactionId)) {
            return res.status(400).json({
                success: false,
                message: 'ID non valido',
            });
        }
        const interaction = await storage_1.storage.getBotInteraction(interactionId);
        if (!interaction) {
            return res.status(404).json({
                success: false,
                message: 'Interazione non trovata',
            });
        }
        // Verifica che l'interazione appartenga all'utente corrente
        if (interaction.userId !== req.session.userId) {
            return res.status(403).json({
                success: false,
                message: 'Non autorizzato ad aggiornare questa interazione',
            });
        }
        const data = thermopolio_shared_1.updateBotInteractionSchema.parse(req.body);
        const updatedInteraction = await storage_1.storage.updateBotInteraction(interactionId, data);
        res.json({
            success: true,
            message: 'Interazione aggiornata con successo',
            data: updatedInteraction,
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                success: false,
                message: 'Dati non validi',
                errors: error.errors.map(e => e.message),
            });
        }
        else {
            console.error('Error updating bot interaction:', error);
            res.status(500).json({
                success: false,
                message: 'Errore durante l\'aggiornamento dell\'interazione',
            });
        }
    }
};
exports.updateBotInteraction = updateBotInteraction;
// Ottieni le statistiche del bot
const getBotStats = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Non autenticato',
            });
        }
        // Verifica che l'utente sia un amministratore (o un tipo di utente specifico autorizzato)
        // In una implementazione reale, qui verificheresti il ruolo dell'utente
        const stats = await storage_1.storage.getBotStats();
        res.json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        console.error('Error fetching bot stats:', error);
        res.status(500).json({
            success: false,
            message: 'Errore durante il recupero delle statistiche del bot',
        });
    }
};
exports.getBotStats = getBotStats;
exports.default = {
    createBotInteraction: exports.createBotInteraction,
    getBotInteractions: exports.getBotInteractions,
    getBotInteraction: exports.getBotInteraction,
    createBotMessage: exports.createBotMessage,
    updateBotInteraction: exports.updateBotInteraction,
    getBotStats: exports.getBotStats
};
