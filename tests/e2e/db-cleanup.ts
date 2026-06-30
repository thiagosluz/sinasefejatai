import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const testEmail = process.env.TEST_EMAIL;
const testPassword = process.env.TEST_PASSWORD;

export async function cleanTestData(caller: string) {
  if (!supabaseUrl || !supabaseKey || !testEmail || !testPassword) {
    console.warn('Variáveis de ambiente incompletas para limpeza de dados E2E.');
    return;
  }

  console.log(`[${caller}] Iniciando limpeza de dados no banco...`);

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Fazer login para ter poderes e ignorar o RLS de exclusão na maior parte das regras!
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (authError) {
    console.error('Erro de autenticação na limpeza E2E:', authError.message);
    return;
  }

  // 2. Apagar atas vinculadas às assembleias de teste e depois as assembleias
  const { data: assembleiasTeste } = await supabase
    .from('assembleias')
    .select('id')
    .ilike('numero', '%TESTE%');

  if (assembleiasTeste && assembleiasTeste.length > 0) {
    const ids = assembleiasTeste.map(a => a.id);
    const { error: errAtas } = await supabase
      .from('atas')
      .delete()
      .in('assembleia_id', ids);
    if (errAtas) console.error('Erro ao deletar atas:', errAtas.message);
  }

  const { error: errAss } = await supabase
    .from('assembleias')
    .delete()
    .ilike('numero', '%TESTE%');
  if (errAss) console.error('Erro ao deletar assembleias:', errAss.message);

  // 3. Apagar filiados teste
  const { error: errFil } = await supabase
    .from('filiados')
    .delete()
    .eq('siape', 'SIAPE-00000000');
  if (errFil) console.error('Erro ao deletar filiados:', errFil.message);

  const { error: errFil2 } = await supabase
    .from('filiados')
    .delete()
    .ilike('nome', '%TESTE AUTOMATIZADO%');
  if (errFil2) console.error('Erro ao deletar filiados 2:', errFil2.message);

  // 4. Apagar finanças teste
  const { error: errFin } = await supabase
    .from('financeiro')
    .delete()
    .ilike('descricao', '%TESTE-E2E-CAIXA%');
  if (errFin) console.error('Erro ao deletar finanças:', errFin.message);

  // 5. Restaurar configurações
  const { error: errConf } = await supabase
    .from('configuracoes')
    .update({
      titulo: 'SINDICATO NACIONAL DOS SERVIDORES FEDERAIS DA EDUCAÇÃO BÁSICA, PROFISSIONAL E TECNOLÓGICA',
      secao_sindical: 'SINASEFE - SEÇÃO SINDICAL JATAÍ',
      endereco: 'RUA RIACHUELO, 2090 – SETOR SAMUEL GRAHAM – JATAÍ/GO',
      cep: 'CEP: 75804-020',
      filiacao: 'FILIADO À CEA',
      fundacao: 'FUNDADO EM 16 de maio de 2005',
      cnpj: 'CNPJ: 08.236.344/0001-06',
      logo_url: 'https://lwnrctksvlzhlzldelit.supabase.co/storage/v1/object/public/sistema/logo-1782837436226.png' // Ou valor default original
    })
    .eq('id', 1);
  if (errConf) console.error('Erro ao restaurar config:', errConf.message);

  console.log(`[${caller}] Limpeza de banco finalizada com sucesso.`);
}
