import { createClient } from '@/lib/supabase/server'; 
async function test() { 
  const supabase = await createClient(); 
  
  const {data: p} = await supabase.from('perfis').select('id, filiado_id').limit(1).single(); 
  console.log('perfil:', p); 

  const {data, error} = await supabase.from('gestao_membros').select('cargo_nome, filiado_id, gestoes!inner(is_atual)').eq('filiado_id', p?.filiado_id).eq('gestoes.is_atual', true).order('created_at', {ascending: false}).limit(1).maybeSingle(); 
  
  console.log('cargo:', data, error); 
} 
test();
