// Script to check admin users in Supabase
import { supabase } from './lib/supabase';

async function checkAdmins() {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        id,
        user_id,
        role,
        created_at,
        users:auth.users!user_id(email)
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