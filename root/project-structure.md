# Struttura Completa dell'Applicazione Thermopolio

```
/thermopolio
├── /client                       # Frontend React
│   ├── /public                   # File statici
│   │   ├── /assets               # Immagini e risorse statiche
│   │   │   ├── /icons            # Icone dell'applicazione
│   │   │   └── /images           # Immagini varie
│   │   ├── favicon.ico           # Icona del sito
│   │   ├── manifest.json         # Manifest per PWA
│   │   └── index.html            # Template HTML di base
│   │
│   ├── /src                      # Codice sorgente React
│   │   ├── /components           # Componenti React riutilizzabili
│   │   │   ├── /ui               # Componenti UI (Shadcn)
│   │   │   │   ├── alert.tsx     # Componente Alert
│   │   │   │   ├── avatar.tsx    # Componente Avatar
│   │   │   │   ├── badge.tsx     # Componente Badge
│   │   │   │   ├── button.tsx    # Componente Button
│   │   │   │   ├── card.tsx      # Componente Card
│   │   │   │   ├── checkbox.tsx  # Componente Checkbox
│   │   │   │   ├── dialog.tsx    # Componente Dialog
│   │   │   │   ├── dropdown-menu.tsx # Componente Dropdown
│   │   │   │   ├── form.tsx      # Componente Form
│   │   │   │   ├── input.tsx     # Componente Input
│   │   │   │   ├── label.tsx     # Componente Label
│   │   │   │   ├── navigation-menu.tsx # Componente NavigationMenu
│   │   │   │   ├── popover.tsx   # Componente Popover
│   │   │   │   ├── scroll-area.tsx # Componente ScrollArea
│   │   │   │   ├── select.tsx    # Componente Select
│   │   │   │   ├── sheet.tsx     # Componente Sheet
│   │   │   │   ├── switch.tsx    # Componente Switch
│   │   │   │   ├── table.tsx     # Componente Table
│   │   │   │   ├── tabs.tsx      # Componente Tabs
│   │   │   │   ├── textarea.tsx  # Componente Textarea
│   │   │   │   ├── toast.tsx     # Componente Toast
│   │   │   │   ├── toaster.tsx   # Componente Toaster
│   │   │   │   └── use-toast.ts  # Hook per il toast
│   │   │   │
│   │   │   ├── dashboard-header.tsx   # Header per i dashboard
│   │   │   ├── dashboard-sidebar.tsx  # Sidebar per i dashboard
│   │   │   ├── subscription-plan-card.tsx # Card dei piani abbonamento
│   │   │   ├── order-list-item.tsx    # Item della lista ordini
│   │   │   ├── restaurant-card.tsx    # Card dei ristoranti
│   │   │   ├── pickup-point-map.tsx   # Mappa punti di ritiro
│   │   │   ├── notifications-dropdown.tsx # Dropdown notifiche
│   │   │   ├── rating-stars.tsx       # Componente per valutazioni
│   │   │   ├── donation-dialog.tsx    # Dialog per donazioni
│   │   │   └── loading-spinner.tsx    # Spinner di caricamento
│   │   │
│   │   ├── /hooks                # Hook personalizzati
│   │   │   ├── use-auth.ts       # Hook per gestione autenticazione
│   │   │   ├── use-notifications.ts # Hook per gestione notifiche
│   │   │   ├── use-geolocation.ts # Hook per geolocalizzazione
│   │   │   └── use-subscription-plans.ts # Hook per piani abbonamento
│   │   │
│   │   ├── /lib                  # Utility e configurazioni
│   │   │   ├── /utils            # Funzioni di utilità
│   │   │   │   ├── date-utils.ts  # Utility per date e orari
│   │   │   │   ├── price-utils.ts # Utility per prezzi e sconti
│   │   │   │   └── geo-utils.ts   # Utility per geolocalizzazione
│   │   │   │
│   │   │   ├── supabase.ts       # Configurazione client Supabase
│   │   │   ├── queryClient.ts    # Configurazione React Query
│   │   │   └── constants.ts      # Costanti dell'applicazione
│   │   │
│   │   ├── /pages                # Componenti pagina
│   │   │   ├── /dashboard        # Dashboard per i diversi utenti
│   │   │   │   ├── customer.tsx  # Dashboard cliente
│   │   │   │   ├── tavola-calda.tsx # Dashboard ristorante
│   │   │   │   └── onlus.tsx     # Dashboard ONLUS
│   │   │   │
│   │   │   ├── auth.tsx          # Pagina di autenticazione
│   │   │   ├── not-found.tsx     # Pagina 404
│   │   │   └── verify-email.tsx  # Pagina verifica email
│   │   │
│   │   ├── /types                # Definizioni TypeScript
│   │   │   ├── user.ts           # Tipi per utenti
│   │   │   ├── subscription.ts   # Tipi per abbonamenti
│   │   │   ├── order.ts          # Tipi per ordini
│   │   │   ├── notification.ts   # Tipi per notifiche
│   │   │   └── rating.ts         # Tipi per valutazioni
│   │   │
│   │   ├── /context              # Context API
│   │   │   ├── auth-context.tsx  # Context per autenticazione
│   │   │   └── notifications-context.tsx # Context per notifiche
│   │   │
│   │   ├── /services             # Servizi client
│   │   │   ├── auth-service.ts   # Servizio per autenticazione
│   │   │   ├── order-service.ts  # Servizio per ordini
│   │   │   ├── subscription-service.ts # Servizio per abbonamenti
│   │   │   ├── notification-service.ts # Servizio per notifiche
│   │   │   └── rating-service.ts # Servizio per valutazioni
│   │   │
│   │   ├── App.tsx               # Componente principale
│   │   ├── main.tsx              # Entry point React
│   │   └── index.css             # Stili globali CSS
│   │
│   ├── .eslintrc.json           # Configurazione ESLint
│   ├── package.json             # Dipendenze npm
│   ├── postcss.config.js        # Configurazione PostCSS
│   ├── tailwind.config.js       # Configurazione Tailwind CSS
│   ├── tsconfig.json            # Configurazione TypeScript
│   └── vite.config.ts           # Configurazione Vite
│
├── /server                       # Backend Node.js/Express
│   ├── /controllers              # Controller Express
│   │   ├── auth-controller.ts    # Controller autenticazione
│   │   ├── user-controller.ts    # Controller utenti
│   │   ├── subscription-controller.ts # Controller abbonamenti
│   │   ├── order-controller.ts   # Controller ordini
│   │   ├── pickup-controller.ts  # Controller punti ritiro
│   │   ├── notification-controller.ts # Controller notifiche
│   │   └── rating-controller.ts  # Controller valutazioni
│   │
│   ├── /middleware               # Middleware personalizzati
│   │   ├── auth-middleware.ts    # Middleware autenticazione
│   │   ├── error-middleware.ts   # Middleware gestione errori
│   │   └── validation-middleware.ts # Middleware validazione
│   │
│   ├── /routes                   # Route API
│   │   ├── auth-routes.ts        # Route autenticazione
│   │   ├── user-routes.ts        # Route utenti
│   │   ├── subscription-routes.ts # Route abbonamenti
│   │   ├── order-routes.ts       # Route ordini
│   │   ├── pickup-routes.ts      # Route punti ritiro
│   │   ├── notification-routes.ts # Route notifiche
│   │   └── rating-routes.ts      # Route valutazioni
│   │
│   ├── /services                 # Servizi business logic
│   │   ├── auth-service.ts       # Servizio autenticazione
│   │   ├── email-service.ts      # Servizio email
│   │   ├── order-service.ts      # Servizio ordini
│   │   ├── subscription-service.ts # Servizio abbonamenti
│   │   └── notification-service.ts # Servizio notifiche
│   │
│   ├── /utils                    # Utility per il backend
│   │   ├── supabase.ts           # Client Supabase
│   │   ├── logger.ts             # Utility di logging
│   │   ├── error-handler.ts      # Gestore errori
│   │   └── validators.ts         # Validatori
│   │
│   ├── /db                       # Layer database
│   │   ├── supabase-client.ts    # Client DB Supabase
│   │   ├── users-db.ts           # Operazioni DB utenti
│   │   ├── subscriptions-db.ts   # Operazioni DB abbonamenti
│   │   ├── orders-db.ts          # Operazioni DB ordini
│   │   ├── notifications-db.ts   # Operazioni DB notifiche
│   │   └── ratings-db.ts         # Operazioni DB valutazioni
│   │
│   ├── /config                   # Configurazioni
│   │   ├── app-config.ts         # Configurazione app
│   │   ├── session-config.ts     # Configurazione sessioni
│   │   └── env-config.ts         # Configurazione variabili ambiente
│   │
│   ├── index.ts                  # Entry point del server
│   ├── package.json              # Dipendenze npm per il backend
│   └── tsconfig.json             # Configurazione TypeScript per il backend
│
├── /shared                       # Codice condiviso tra client e server
│   ├── /schema                   # Schema DB e validazione
│   │   ├── user-schema.ts        # Schema utenti
│   │   ├── subscription-schema.ts # Schema abbonamenti
│   │   ├── order-schema.ts       # Schema ordini
│   │   ├── notification-schema.ts # Schema notifiche
│   │   └── rating-schema.ts      # Schema valutazioni
│   │
│   ├── /types                    # Tipi condivisi
│   │   ├── common-types.ts       # Tipi comuni
│   │   └── api-types.ts          # Tipi per le API
│   │
│   └── /utils                    # Utility condivise
│       ├── date-utils.ts         # Utility per date
│       └── validation-utils.ts   # Utility per validazione
│
├── .env                         # Variabili d'ambiente (non committare)
├── .env.example                 # Template per variabili d'ambiente
├── .gitignore                   # File da ignorare per Git
├── README.md                    # Documentazione
├── package.json                 # Dipendenze npm principali
└── tsconfig.json                # Configurazione TypeScript root
```

## File di Configurazione Principali

### Root `package.json`

Questo file contiene le dipendenze e gli script per gestire sia il client che il server.

### `.env.example`

Template per le variabili d'ambiente necessarie per il progetto:

```
# Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key

# Server
PORT=3000
NODE_ENV=development
SESSION_SECRET=your-secret-key

# Client
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### `.gitignore`

```
# Dipendenze
node_modules/
.npm

# Ambiente
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build
dist/
build/
out/

# Log
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Sistema operativo
.DS_Store
Thumbs.db

# Editor
.idea/
.vscode/
*.swp
*.swo

# Altri
.cache/
coverage/
.nyc_output/
```

## Nuove Funzionalità Implementate

### 1. Sistema di Notifiche

- Notifiche in tempo reale per nuovi ordini
- Notifiche per donazioni ricevute
- Notifiche per modifiche dello stato degli ordini
- Pannello di notifiche accessibile da ogni dashboard

### 2. Sistema di Valutazione degli Abbonamenti

- Possibilità per i clienti di valutare i piani di abbonamento
- Visualizzazione delle valutazioni medie per i ristoranti
- Filtraggio dei piani per valutazione
- Commenti e feedback

### 3. Integrazione con Supabase

- Migrazione dal sistema di storage in memoria a Supabase
- Autenticazione gestita tramite Supabase Auth
- Database relazionale per tutti i dati dell'applicazione
- Funzionalità di realtime per le notifiche
