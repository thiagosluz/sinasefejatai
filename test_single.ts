import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() { 
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!); 
  
  const { data, error } = await supabase
    .from('documento_verificacoes')
    .select('*')
    .eq('documento_id', '00000000-0000-0000-0000-000000000000')
    .single();
  console.log('single:', data, error);
} 
test();
