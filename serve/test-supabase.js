const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

console.log('=== TEST CONNESSIONE SUPABASE ===');
console.log('Verifico le variabili d\'ambiente...');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Errore: Variabili d\'ambiente mancanti');
  process.exit(1);
}

console.log('✅ Variabili d\'ambiente trovate');
console.log(`URL Supabase: ${supabaseUrl.substring(0, 10)}...`);
console.log('Tentativo di connessione al database...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Usa la tabella test_connection invece di users
    const { data, error } = await supabase
      .from('test_connection')
      .select('*');

    if (error) throw error;

    console.log('✅ Connessione a Supabase riuscita!');
    console.log(`Dati recuperati: ${JSON.stringify(data)}`);
  } catch (error) {
    console.error('❌ Errore di connessione a Supabase:');
    console.error(error.message);
    console.log('\nPossibili cause:');
    console.log('- URL o chiave API non corretti');
    console.log('- Tabella "test_connection" non esiste');
    console.log('- Problema di rete o firewall');
  }
}

testConnection();