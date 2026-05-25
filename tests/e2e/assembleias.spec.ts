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

  // Limpeza feita no global.teardown.ts


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

    // O campo numero vem pré-preenchido, mas vamos setar um específico para o teste
    await page.fill('input[name="numero"]', testNumero);
    await page.selectOption('select[name="tipo"]', 'Ordinária');
    await page.fill('input[name="data_realizacao"]', '2026-10-10');
    // Preencher select de local e salvar o texto completo (value) pra verificar na listagem
    const localOptionValue = await page.locator('select[name="local"] option').nth(1).getAttribute('value');
    await page.locator('select[name="local"]').selectOption({ index: 1 });
    await page.fill('input[name="horario_1a_convocacao"]', '14:00');
    // A 2ª convocação será preenchida automaticamente com 14:15 devido ao nosso JS! Mas podemos preencher se quisermos
    await page.fill('input[name="horario_2a_convocacao"]', '14:30');
    await page.fill('textarea[name="pautas"]', '1. Avaliação de conjuntura\n2. Aprovação de contas');

    // 3. Submeter
    await page.click('button:has-text("Agendar Oficialmente")');

    // 4. Validar redirecionamento e sucesso na lista
    await page.waitForURL('**/assembleias');
    await expect(page.getByRole('heading', { name: /Atos & Assembleias/i })).toBeVisible();

    // 4.1 Limpar filtro de ano para garantir que a assembleia de teste apareça independente do ano atual
    await page.selectOption('select', { label: 'Todos os Anos' });

    // 5. Verificar se a assembleia criada aparece na lista
    const assembleiaCard = page.locator('div.bg-brand-card').filter({ hasText: testNumero }).first();
    await expect(assembleiaCard).toBeVisible();
    await expect(assembleiaCard.getByText('Assembleia Geral Ordinária')).toBeVisible();
    if (localOptionValue) {
      await expect(assembleiaCard.getByText(localOptionValue)).toBeVisible();
    }

    // 6. Verificar se os links (Edital, Presença, Ata) estão sendo renderizados corretamente
    await expect(assembleiaCard.getByRole('link', { name: /Edital/i })).toBeVisible();
    await expect(assembleiaCard.getByRole('link', { name: /Presença/i })).toBeVisible();
    await expect(assembleiaCard.getByRole('link', { name: 'Ata', exact: true })).toBeVisible();
  });
});
