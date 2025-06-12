// Script to check admin users in Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client - make sure these values are in your .env file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdmins() {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        id,
        user_id,
        role,
        created_at,
        users:user_id (
          email
        )
      `)
      .eq('role', 'admin');
    
    if (error) {
      console.error('Error fetching admin users:', error);
      return;
    }
    
    console.log('Admin users:');
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkAdmins(); 