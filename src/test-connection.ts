import { supabase } from './integrations/supabase/client.js';

const testConnection = async () => {
  try {
    // Test query to fetch chat histories
    const { data, error } = await supabase
      .from('n8n_chat_histories')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Connection test failed:', error.message);
      return;
    }

    console.log('Successfully connected to Supabase!');
    console.log('Test query result:', data);
  } catch (err) {
    console.error('Error testing connection:', err);
  }
}

testConnection(); 