const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

console.log('Test di connessione base a Supabase');

if (!supabaseUrl || !supabaseKey) {
  console.error('Variabili d\'ambiente mancanti!');
  process.exit(1);
}

console.log('URL e chiave trovati');

const supabase = createClient(supabaseUrl, supabaseKey);

// Test più semplice possibile
async function testSimpleConnection() {
  try {
    // Verifica solo che l'istanza Supabase esista
    console.log('Client Supabase creato:', !!supabase);

    // Tenta una semplice operazione di healthcheck
    const { error } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    console.log('✅ Connessione a Supabase riuscita!');
    console.log('Puoi procedere con la configurazione del database.');
  } catch (error) {
    console.error('❌ Errore di connessione:', error.message);
  }
}

testSimpleConnection();