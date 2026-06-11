import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() { 
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!); 
  
  const {data: p, error: pe} = await supabase.from('perfis').select('id, filiado_id').limit(1).single(); 
  console.log('perfil:', p, pe); 

  const {data, error} = await supabase.from('gestao_membros').select('cargo_nome, filiado_id, gestoes!inner(is_atual)').eq('filiado_id', p?.filiado_id).eq('gestoes.is_atual', true).order('created_at', {ascending: false}).limit(1).maybeSingle(); 
  
  console.log('cargo:', data, error); 
} 
test();
