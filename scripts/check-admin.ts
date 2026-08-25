import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to load env variables from .env files
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

async function checkAdmins() {
  const env = loadEnv();
  const supabaseUrl = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  // Use service role key if available for complete auth access, otherwise fallback to anon key
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment or .env.local file.');
    process.exit(1);
  }

  console.log(`Connecting to Supabase at: ${supabaseUrl}`);
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        id,
        user_id,
        role,
        created_at
      `)
      .eq('role', 'admin');

    if (error) {
      console.error('Error fetching admin roles:', error.message);
      return;
    }

    if (!data || data.length === 0) {
      console.log('No admin users found in user_roles table.');
      return;
    }

    console.log(`Found ${data.length} admin user(s):`);
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkAdmins();
