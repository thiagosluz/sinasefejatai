import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Credenciais de teste
const testEmail = process.env.TEST_EMAIL;
const testPassword = process.env.TEST_PASSWORD;

const testNumero = '001-TESTE/2026';

test.describe('Assembleias - Fluxo Crítico', () => {
  // Ignora os testes se não houver credenciais configuradas
  test.skip(!testEmail || !testPassword, 'Credenciais de teste não configuradas no .env.local');

  test.afterAll(async () => {
    // Limpeza (Teardown): Deletar a assembleia de teste para não sujar o banco
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase
        .from('assembleias')
        .delete()
        .eq('numero', testNumero);
    }
  });

  test.beforeEach(async ({ page }) => {
    // Fazer login antes de cada teste
    await page.goto('/login');
    await page.fill('input[name="email"]', testEmail!);
    await page.fill('input[name="password"]', testPassword!);
    await page.click('button:has-text("Autenticar Carteira")');
    await page.waitForURL('**/dashboard');
  });

  test('Deve criar uma nova assembleia e renderizar os botões de relatórios', async ({ page }) => {
    // 1. Navegar até a criação de assembleias
    await page.goto('/assembleias/nova');
    await expect(page.getByRole('heading', { name: /Agendar Assembleia/i })).toBeVisible();

    // 2. Preencher o formulário
    await page.fill('input[name="numero"]', testNumero);
    
    // Select tipo
    await page.selectOption('select[name="tipo"]', 'Ordinária');
    
    // Data
    await page.fill('input[name="data_realizacao"]', '2026-10-10');
    
    // Local
    await page.fill('input[name="local"]', 'Auditório Virtual Teste');
    
    // Horários (type="time" accept HH:mm)
    await page.fill('input[name="horario_1a_convocacao"]', '14:00');
    await page.fill('input[name="horario_2a_convocacao"]', '14:30');
    
    // Pautas
    await page.fill('textarea[name="pautas"]', '1. Discussão teste E2E\n2. Votação E2E');

    // 3. Submeter
    await page.click('button:has-text("Agendar Assembleia")');

    // 4. Validar redirecionamento e sucesso na lista
    await page.waitForURL('**/assembleias');
    await expect(page.getByRole('heading', { name: /Atos & Assembleias/i })).toBeVisible();

    // 5. Verificar se a assembleia criada aparece na lista
    const assembleiaCard = page.locator('div.bg-brand-card').filter({ hasText: testNumero }).first();
    await expect(assembleiaCard).toBeVisible();
    await expect(assembleiaCard.getByText('Assembleia Geral Ordinária')).toBeVisible();
    await expect(assembleiaCard.getByText('Auditório Virtual Teste')).toBeVisible();

    // 6. Verificar se os links (Edital, Presença, Ata) estão sendo renderizados corretamente
    await expect(assembleiaCard.getByRole('link', { name: /Edital/i })).toBeVisible();
    await expect(assembleiaCard.getByRole('link', { name: /Presença/i })).toBeVisible();
    await expect(assembleiaCard.getByRole('link', { name: /Redigir Ata/i })).toBeVisible();
  });
});
