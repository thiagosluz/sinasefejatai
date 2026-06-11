import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() { 
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!); 
  
  const anoAtual = new Date().getFullYear();
  const { data: ultimosDocs, error } = await supabase
    .from('documentos_administrativos')
    .select('numero')
    .eq('tipo', 'recibo_pagamento')
    .neq('status', 'cancelado')
    .ilike('numero', `%/${anoAtual}`)
    .order('created_at', { ascending: false })
    .limit(50);
  console.log('docs:', ultimosDocs, error);
} 
test();
