/**
 * Configurazione client Supabase
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Verifica se le variabili d'ambiente sono impostate
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  // Crea client Supabase
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('Client Supabase inizializzato con successo');
} else {
  console.warn('Variabili d\'ambiente SUPABASE_URL e/o SUPABASE_ANON_KEY non trovate. Client Supabase non inizializzato.');
}

module.exports = supabase;