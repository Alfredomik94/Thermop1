# Thermopolio 🍽️

Thermopolio è una piattaforma di food sharing che mette in connessione ristoranti, clienti e organizzazioni ONLUS per ridurre lo spreco alimentare e promuovere la solidarietà.

## Panoramica del Progetto

Thermopolio consente:
- Ai **clienti** di abbonarsi a piani pasto presso ristoranti locali
- Ai **ristoranti** di offrire abbonamenti con sconti progressivi
- Alle **ONLUS** di ricevere donazioni di pasti dagli utenti

L'applicazione è costruita con un'architettura moderna e scalabile:
- **Frontend**: React con TypeScript, Tailwind CSS e componenti UI basati su Shadcn/UI
- **Backend**: Express.js con Node.js
- **Database**: Supabase (PostgreSQL)

## Funzionalità Principali

### Per i Clienti
- Scoperta di ristoranti nelle vicinanze tramite geolocalizzazione
- Abbonamento a piani pasto con sconti progressivi
- Donazione di pasti alle ONLUS
- Visualizzazione e gestione degli ordini
- Valutazione dei piani di abbonamento

### Per i Ristoranti
- Creazione e gestione di piani di abbonamento
- Visualizzazione e gestione degli ordini ricevuti
- Statistiche sugli ordini e valutazioni
- Gestione del profilo

### Per le ONLUS
- Ricezione e gestione delle donazioni di pasti
- Visualizzazione delle statistiche sulle donazioni
- Gestione del profilo

### Caratteristiche Aggiuntive
- **Sistema di notifiche in tempo reale**: Per aggiornamenti su ordini, donazioni e valutazioni
- **Sistema di valutazione**: Per feedback sui piani di abbonamento
- **Geolocalizzazione**: Per trovare ristoranti e punti di ritiro nelle vicinanze
- **Punti di ritiro**: Una rete di punti dove ritirare i pasti ordinati

## Tecnologie Utilizzate

### Frontend
- **React**: Libreria per interfacce utente
- **TypeScript**: Per tipizzazione statica
- **Tailwind CSS**: Per lo styling
- **Shadcn/UI**: Componenti UI
- **React Query**: Per la gestione dello stato e le chiamate API
- **Zod**: Per la validazione degli input
- **Wouter**: Per il routing

### Backend
- **Node.js**: Runtime JavaScript
- **Express.js**: Framework web
- **Supabase JS**: Client per interagire con Supabase
- **Zod**: Per la validazione degli input
- **JWT**: Per l'autenticazione
- **BCrypt**: Per l'hashing delle password

### Database
- **Supabase**: Piattaforma backend costruita su PostgreSQL

## Struttura del Progetto

```
/thermopolio
├── /client                       # Frontend React
│   ├── /public                   # File statici
│   ├── /src                      # Codice sorgente React
│   │   ├── /components           # Componenti riutilizzabili
│   │   ├── /hooks                # Hook personalizzati
│   │   ├── /lib                  # Utility
│   │   ├── /pages                # Componenti pagina
│   │   ├── /types                # Definizioni TypeScript
│   │   ├── /context              # Context API
│   │   ├── /services             # Servizi client
│   │   ├── App.tsx               # Componente principale
│   │   └── main.tsx              # Entry point
│   └── ...                       # File di configurazione
│
├── /server                       # Backend Node.js/Express
│   ├── /controllers              # Controller Express
│   ├── /middleware               # Middleware
│   ├── /routes                   # Route API
│   ├── /services                 # Servizi business logic
│   ├── /utils                    # Utility
│   ├── /db                       # Layer database
│   ├── /config                   # Configurazioni
│   └── index.ts                  # Entry point del server
│
└── /shared                       # Codice condiviso
    ├── /schema                   # Schema DB e validazione
    ├── /types                    # Tipi condivisi
    └── /utils                    # Utility condivise
```

## Configurazione e Installazione

### Prerequisiti
- Node.js (v16+)
- npm o yarn
- Account Supabase

### Configurazione di Supabase
1. Crea un nuovo progetto su [Supabase](https://supabase.com)
2. Utilizza lo script SQL fornito in `server/db/schema.sql` per creare le tabelle necessarie
3. Copia l'URL e la chiave anonima di Supabase per la configurazione

### Installazione
1. Clona il repository:
   ```bash
   git clone https://github.com/yourusername/thermopolio.git
   cd thermopolio
   ```

2. Installa le dipendenze:
   ```bash
   # Installa le dipendenze del root
   npm install
   
   # Installa le dipendenze del client
   cd client
   npm install
   
   # Installa le dipendenze del server
   cd ../server
   npm install
   ```

3. Configura le variabili d'ambiente:
   - Crea un file `.env` nella cartella root basato su `.env.example`
   - Crea un file `.env` nella cartella `client` basato su `.env.example`

### Avvio in modalità sviluppo
1. Avvia il server:
   ```bash
   # Dalla cartella server
   npm run dev
   ```

2. Avvia il client:
   ```bash
   # Dalla cartella client
   npm run dev
   ```

3. Accedi all'applicazione su `http://localhost:5173`

## Account di Test

Sono disponibili i seguenti account di test:

- **Cliente**: cliente/cliente123
- **Ristorante**: ristorante/ristorante123
- **ONLUS**: onlus/onlus123

## Autori

Questo progetto è stato sviluppato per [Nome del Committente].

## Licenza

Questo progetto è sotto licenza MIT. Vedi il file `LICENSE` per i dettagli.
