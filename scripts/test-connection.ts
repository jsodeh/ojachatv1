import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnv() {
  const envPaths = [
    path.join(__dirname, '../.env.local'),
    path.join(__dirname, '../.env')
  ];

  const env: Record<string, string> = { ...process.env };

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const firstEqual = trimmed.indexOf('=');
          if (firstEqual !== -1) {
            const key = trimmed.substring(0, firstEqual).trim();
            const value = trimmed.substring(firstEqual + 1).trim().replace(/^['"]|['"]$/g, '');
            if (key && !env[key]) {
              env[key] = value;
            }
          }
        }
      }
    }
  }
  return env;
}

const testConnection = async () => {
  const env = loadEnv();
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment or .env.local file.');
    process.exit(1);
  }

  console.log(`Testing connection to Supabase at: ${supabaseUrl}`);
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data, error } = await supabase
      .from('user_subscriptions') // Test a public table
      .select('*')
      .limit(1);

    if (error) {
      console.error('Connection test failed:', error.message);
      return;
    }

    console.log('Successfully connected to Supabase!');
    console.log('Test query result (first row from user_subscriptions):', data);
  } catch (err) {
    console.error('Unexpected error testing connection:', err);
  }
};

testConnection();
