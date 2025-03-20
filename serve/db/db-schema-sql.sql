-- Thermopolio - Schema del database
-- Questo script crea tutte le tabelle necessarie per l'applicazione Thermopolio

-- Cancella le tabelle esistenti se necessario (utile per il reset)
-- DROP TABLE IF EXISTS notifications;
-- DROP TABLE IF EXISTS ratings;
-- DROP TABLE IF EXISTS orders;
-- DROP TABLE IF EXISTS subscription_discounts;
-- DROP TABLE IF EXISTS subscription_plans;
-- DROP TABLE IF EXISTS pickup_points;
-- DROP TABLE IF EXISTS users;

-- Crea i tipi enum
CREATE TYPE user_type AS ENUM ('customer', 'tavola_calda', 'onlus');
CREATE TYPE plan_type AS ENUM ('primo', 'secondo', 'completo');
CREATE TYPE order_status AS ENUM ('pending', 'completed', 'canceled', 'donated');
CREATE TYPE notification_type AS ENUM (
  'ORDER_CREATED', 
  'ORDER_UPDATED', 
  'DONATION_RECEIVED', 
  'RATING_RECEIVED', 
  'SUBSCRIPTION_UPDATED'
);

-- Tabella Utenti
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  user_type user_type NOT NULL,
  business_name VARCHAR(100),
  business_type VARCHAR(100),
  assistance_type VARCHAR(100),
  address VARCHAR(200),
  description TEXT,
  activities TEXT,
  preferred_pickup_point UUID,
  invite_code VARCHAR(20),
  favorite_restaurants UUID[],
  email_verified BOOLEAN DEFAULT FALSE,
  profile_image_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella Punti di Ritiro
CREATE TABLE IF NOT EXISTS pickup_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  address VARCHAR(200) NOT NULL,
  latitude NUMERIC(10, 8) NOT NULL,
  longitude NUMERIC(11, 8) NOT NULL,
  restaurant_id UUID,
  business_hours JSONB,
  pickup_times VARCHAR(100)[],
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  FOREIGN KEY (restaurant_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Aggiungi chiave esterna alla tabella utenti per i punti di ritiro preferiti
ALTER TABLE users 
ADD CONSTRAINT fk_users_pickup_points 
FOREIGN KEY (preferred_pickup_point) REFERENCES pickup_points(id) ON DELETE SET NULL;

-- Tabella Piani di Abbonamento
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  original_price NUMERIC(10, 2) NOT NULL,
  discounted_price NUMERIC(10, 2),
  pickup_time_start TIME NOT NULL,
  pickup_time_end TIME NOT NULL,
  pickup_location_id UUID NOT NULL,
  pickup_location VARCHAR(200),
  available_days VARCHAR(20) NOT NULL, -- Stringhe di numeri separati da virgole (1-7) per i giorni della settimana
  max_portions INTEGER NOT NULL,
  min_subscription_days INTEGER NOT NULL,
  available_portions INTEGER NOT NULL,
  tags VARCHAR(50)[],
  active BOOLEAN DEFAULT TRUE,
  image_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  FOREIGN KEY (restaurant_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (pickup_location_id) REFERENCES pickup_points(id) ON DELETE RESTRICT
);

-- Tabella Sconti per Piani di Abbonamento
CREATE TABLE IF NOT EXISTS subscription_discounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL,
  deliveries_per_week INTEGER NOT NULL,
  duration_weeks INTEGER NOT NULL,
  discount_percentage NUMERIC(5, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE,
  UNIQUE (plan_id, deliveries_per_week, duration_weeks)
);

-- Tabella Ordini
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  plan_id UUID NOT NULL,
  quantity INTEGER NOT NULL,
  delivery_date TIMESTAMP WITH TIME ZONE NOT NULL,
  pickup_point_id UUID NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  donated_to UUID, -- ID dell'organizzazione ONLUS a cui è stato donato l'ordine
  donation_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  FOREIGN KEY (pickup_point_id) REFERENCES pickup_points(id) ON DELETE RESTRICT,
  FOREIGN KEY (donated_to) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabella Valutazioni
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (plan_id, user_id)
);

-- Tabella Notifiche
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  type notification_type NOT NULL,
  title VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indici per migliorare le performance
CREATE INDEX idx_subscription_plans_restaurant_id ON subscription_plans(restaurant_id);
CREATE INDEX idx_subscription_plans_active ON subscription_plans(active);
CREATE INDEX idx_subscription_discounts_plan_id ON subscription_discounts(plan_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_plan_id ON orders(plan_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_ratings_plan_id ON ratings(plan_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_pickup_points_restaurant_id ON pickup_points(restaurant_id);

-- Funzione per aggiornare il timestamp 'updated_at'
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Funzione e trigger per calcolare il prezzo scontato automaticamente
CREATE OR REPLACE FUNCTION calculate_discounted_price()
RETURNS TRIGGER AS $$
BEGIN
    -- Se non è impostato un prezzo scontato, usa il prezzo originale
    IF NEW.discounted_price IS NULL THEN
        NEW.discounted_price = NEW.original_price;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_calculate_discounted_price
BEFORE INSERT OR UPDATE ON subscription_plans
FOR EACH ROW EXECUTE FUNCTION calculate_discounted_price();

-- Trigger per aggiornare quando cambia un record
CREATE TRIGGER update_subscription_plans_updated_at
BEFORE UPDATE ON subscription_plans
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Funzione per notificare gli aggiornamenti degli ordini
CREATE OR REPLACE FUNCTION notify_order_update()
RETURNS TRIGGER AS $$
DECLARE
    restaurant_id UUID;
    plan_title TEXT;
BEGIN
    -- Ottieni l'ID del ristorante e il titolo del piano
    SELECT sp.restaurant_id, sp.title
    INTO restaurant_id, plan_title
    FROM subscription_plans sp
    WHERE sp.id = NEW.plan_id;
    
    -- Se lo stato è cambiato, crea una notifica per il cliente
    IF OLD.status <> NEW.status THEN
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            data
        ) VALUES (
            NEW.user_id,
            'ORDER_UPDATED',
            'Aggiornamento ordine',
            'Lo stato del tuo ordine per "' || plan_title || '" è stato aggiornato a ' || NEW.status,
            jsonb_build_object('orderId', NEW.id, 'status', NEW.status)
        );
        
        -- Notifica anche al ristorante
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            data
        ) VALUES (
            restaurant_id,
            'ORDER_UPDATED',
            'Ordine aggiornato',
            'Lo stato dell''ordine #' || NEW.id || ' è stato aggiornato a ' || NEW.status,
            jsonb_build_object('orderId', NEW.id, 'userId', NEW.user_id, 'status', NEW.status)
        );
    END IF;
    
    -- Se l'ordine è stato donato, notifica la ONLUS
    IF NEW.donated_to IS NOT NULL AND (OLD.donated_to IS NULL OR OLD.donated_to <> NEW.donated_to) THEN
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            data
        ) VALUES (
            NEW.donated_to,
            'DONATION_RECEIVED',
            'Nuova donazione ricevuta',
            'Hai ricevuto una donazione di ' || NEW.quantity || ' porzioni di "' || plan_title || '"',
            jsonb_build_object('orderId', NEW.id, 'userId', NEW.user_id, 'quantity', NEW.quantity)
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_notify_order_update
AFTER UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION notify_order_update();

-- Funzione per notificare nuovi ordini
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
DECLARE
    restaurant_id UUID;
    plan_title TEXT;
BEGIN
    -- Ottieni l'ID del ristorante e il titolo del piano
    SELECT sp.restaurant_id, sp.title
    INTO restaurant_id, plan_title
    FROM subscription_plans sp
    WHERE sp.id = NEW.plan_id;
    
    -- Crea una notifica per il ristorante
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        data
    ) VALUES (
        restaurant_id,
        'ORDER_CREATED',
        'Nuovo ordine ricevuto',
        'Hai ricevuto un nuovo ordine per "' || plan_title || '" - ' || NEW.quantity || ' porzioni',
        jsonb_build_object('orderId', NEW.id, 'userId', NEW.user_id, 'planId', NEW.plan_id)
    );
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_notify_new_order
AFTER INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION notify_new_order();

-- Funzione per notificare nuove valutazioni
CREATE OR REPLACE FUNCTION notify_new_rating()
RETURNS TRIGGER AS $$
DECLARE
    restaurant_id UUID;
    plan_title TEXT;
    user_name TEXT;
BEGIN
    -- Ottieni l'ID del ristorante e il titolo del piano
    SELECT sp.restaurant_id, sp.title
    INTO restaurant_id, plan_title
    FROM subscription_plans sp
    WHERE sp.id = NEW.plan_id;
    
    -- Ottieni il nome dell'utente
    SELECT name
    INTO user_name
    FROM users
    WHERE id = NEW.user_id;
    
    -- Crea una notifica per il ristorante
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        data
    ) VALUES (
        restaurant_id,
        'RATING_RECEIVED',
        'Nuova valutazione ricevuta',
        user_name || ' ha valutato "' || plan_title || '" con ' || NEW.rating || ' stelle',
        jsonb_build_object('ratingId', NEW.id, 'userId', NEW.user_id, 'planId', NEW.plan_id, 'rating', NEW.rating)
    );
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_notify_new_rating
AFTER INSERT ON ratings
FOR EACH ROW EXECUTE FUNCTION notify_new_rating();

-- Inserisci dati di test (opzionale)
-- Inserisci questi dati solo se la tabella users è vuota
DO $
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users) THEN
        -- Inserisci gli utenti di test
        INSERT INTO users (
            id, 
            username, 
            password, 
            name, 
            user_type, 
            business_name, 
            business_type, 
            assistance_type, 
            address, 
            description, 
            email_verified
        ) VALUES
        (
            'f47ac10b-58cc-4372-a567-0e02b2c3d479', 
            'cliente', 
            'cliente123', 
            'Mario Rossi', 
            'customer', 
            NULL, 
            NULL, 
            NULL, 
            'Via Roma 123, Milano', 
            'Account cliente di test', 
            TRUE
        ),
        (
            'f47ac10b-58cc-4372-a567-0e02b2c3d480', 
            'ristorante', 
            'ristorante123', 
            'Ristorante Da Luigi', 
            'tavola_calda', 
            'Ristorante Da Luigi', 
            'Italiano', 
            NULL, 
            'Via Garibaldi 45, Milano', 
            'Ristorante italiano tradizionale con specialità milanesi. Serviamo piatti della tradizione lombarda con ingredienti freschi e di stagione.', 
            TRUE
        ),
        (
            'f47ac10b-58cc-4372-a567-0e02b2c3d481', 
            'onlus', 
            'onlus123', 
            'Aiutiamo Insieme', 
            'onlus', 
            'Aiutiamo Insieme ONLUS', 
            NULL, 
            'Assistenza alimentare', 
            'Via Vittorio Veneto 89, Milano', 
            'Organizazzione no-profit che distribuisce pasti ai senzatetto e alle famiglie in difficoltà.', 
            TRUE
        );

        -- Inserisci i punti di ritiro
        INSERT INTO pickup_points (
            id,
            name,
            address,
            latitude,
            longitude,
            restaurant_id,
            pickup_times,
            description
        ) VALUES
        (
            'f47ac10b-58cc-4372-a567-0e02b2c3d490',
            'Ristorante Da Luigi - Centro',
            'Via Garibaldi 45, Milano',
            45.4642,
            9.1900,
            'f47ac10b-58cc-4372-a567-0e02b2c3d480',
            ARRAY['12:00-14:00', '18:00-20:00'],
            'Punto di ritiro principale presso il nostro ristorante'
        ),
        (
            'f47ac10b-58cc-4372-a567-0e02b2c3d491',
            'Punto Ritiro Stazione',
            'Piazza Duca d''Aosta 1, Milano',
            45.4847,
            9.2027,
            'f47ac10b-58cc-4372-a567-0e02b2c3d480',
            ARRAY['11:30-14:30', '17:30-20:30'],
            'Comodo punto di ritiro nei pressi della Stazione Centrale'
        );

        -- Inserisci i piani di abbonamento
        INSERT INTO subscription_plans (
            id,
            restaurant_id,
            title,
            description,
            original_price,
            pickup_time_start,
            pickup_time_end,
            pickup_location_id,
            pickup_location,
            available_days,
            max_portions,
            min_subscription_days,
            available_portions,
            tags,
            active,
            image_url
        ) VALUES
        (
            'f47ac10b-58cc-4372-a567-0e02b2c3d485',
            'f47ac10b-58cc-4372-a567-0e02b2c3d480',
            'Pranzo Completo Settimanale',
            'Abbonamento settimanale per un pranzo completo con primo, secondo e contorno. Ideale per chi lavora in zona centro.',
            12.50,
            '12:00',
            '14:00',
            'f47ac10b-58cc-4372-a567-0e02b2c3d490',
            'Ristorante Da Luigi - Centro',
            '1,2,3,4,5',
            50,
            5,
            45,
            ARRAY['italiano', 'pranzo', 'completo'],
            TRUE,
            'https://example.com/images/meal-plan1.jpg'
        ),
        (
            'f47ac10b-58cc-4372-a567-0e02b2c3d486',
            'f47ac10b-58cc-4372-a567-0e02b2c3d480',
            'Cena Primo Piatto',
            'Abbonamento per primo piatto serale con grande varietà di pasta fresca e risotti.',
            9.00,
            '18:00',
            '20:00',
            'f47ac10b-58cc-4372-a567-0e02b2c3d490',
            'Ristorante Da Luigi - Centro',
            '1,2,3,4,5,6',
            40,
            3,
            35,
            ARRAY['italiano', 'cena', 'primo'],
            TRUE,
            'https://example.com/images/meal-plan2.jpg'
        );

        -- Inserisci gli sconti per i piani
        INSERT INTO subscription_discounts (
            plan_id,
            deliveries_per_week,
            duration_weeks,
            discount_percentage
        ) VALUES
        (
            'f47ac10b-58cc-4372-a567-0e02b2c3d485',
            3,
            2,
            10.00
        ),
        (
            'f47ac10b-58cc-4372-a567-0e02b2c3d485',
            5,
            4,
            20.00
        ),
        (
            'f47ac10b-58cc-4372-a567-0e02b2c3d486',
            3,
            2,
            8.00
        ),
        (
            'f47ac10b-58cc-4372-a567-0e02b2c3d486',
            5,
            4,
            15.00
        );

        -- Inserisci alcuni ordini di esempio
        INSERT INTO orders (
            id,
            user_id,
            plan_id,
            quantity,
            delivery_date,
            pickup_point_id,
            status,
            notes
        ) VALUES
        (
            'f47ac10b-58cc-4372-a567-0e02b2c3d495',
            'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            'f47ac10b-58cc-4372-a567-0e02b2c3d485',
            1,
            NOW() + INTERVAL '1 day',
            'f47ac10b-58cc-4372-a567-0e02b2c3d490',
            'pending',
            'Preferisco pasta al pomodoro se disponibile'
        ),
        (
            'f47ac10b-58cc-4372-a567-0e02b2c3d496',
            'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            'f47ac10b-58cc-4372-a567-0e02b2c3d486',
            2,
            NOW() + INTERVAL '2 days',
            'f47ac10b-58cc-4372-a567-0e02b2c3d490',
            'pending',
            'Senza glutine per una porzione'
        );

        -- Inserisci alcune valutazioni
        INSERT INTO ratings (
            plan_id,
            user_id,
            rating,
            comment
        ) VALUES
        (
            'f47ac10b-58cc-4372-a567-0e02b2c3d485',
            'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            5,
            'Ottimo pranzo, abbondante e gustoso. Il servizio è molto efficiente e il punto di ritiro comodo.'
        ),
        (
            'f47ac10b-58cc-4372-a567-0e02b2c3d486',
            'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            4,
            'Buona pasta, fresca e ben condita. Potrebbe migliorare la varietà dei condimenti.'
        );

        -- Inserisci alcune notifiche
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            read,
            data
        ) VALUES
        (
            'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            'ORDER_CREATED',
            'Ordine confermato',
            'Il tuo ordine #f47ac10b-58cc-4372-a567-0e02b2c3d495 è stato confermato.',
            FALSE,
            '{"orderId": "f47ac10b-58cc-4372-a567-0e02b2c3d495"}'
        ),
        (
            'f47ac10b-58cc-4372-a567-0e02b2c3d480',
            'RATING_RECEIVED',
            'Nuova valutazione ricevuta',
            'Mario Rossi ha valutato "Pranzo Completo Settimanale" con 5 stelle.',
            FALSE,
            '{"planId": "f47ac10b-58cc-4372-a567-0e02b2c3d485", "rating": 5}'
        );
    END IF;
END
$;