import { test, expect } from '@playwright/test';

// Credenciais de teste
const testEmail = process.env.TEST_EMAIL;
const testPassword = process.env.TEST_PASSWORD;

const testDescricaoEntrada = 'TESTE-E2E-CAIXA-ENTRADA';
const testDescricaoSaida = 'TESTE-E2E-CAIXA-SAIDA';

test.describe('Financeiro - Fluxo Crítico', () => {
  // Ignora os testes se não houver credenciais configuradas
  test.skip(!testEmail || !testPassword, 'Credenciais de teste não configuradas no .env.local');

  // Limpeza feita no global.teardown.ts


  test.beforeEach(async ({ page }) => {
    // Fazer login antes de cada teste
    await page.goto('/login');
    await page.fill('input[name="email"]', testEmail!);
    await page.fill('input[name="password"]', testPassword!);
    await page.click('button:has-text("Autenticar Carteira")');
    await page.waitForURL('**/admin/dashboard');
  });

  test('Deve registrar uma Entrada no caixa e visualizá-la na tabela', async ({ page }) => {
    await page.goto('/admin/financeiro');
    await expect(page.getByRole('heading', { name: /Livro Caixa/i })).toBeVisible();

    // 1. Abrir Drawer de Lançamento
    await page.click('button:has-text("Lançar Movimento")');
    await expect(page.getByRole('heading', { name: /Lançar Movimentação/i })).toBeVisible();

    // 2. Selecionar Entrada
    await page.click('button:has-text("Entrada (Receita)")');

    // 3. Preencher formulário
    await page.fill('input[name="descricao"]', testDescricaoEntrada);
    await page.fill('input[name="valor"]', '100,50');
    
    // 4. Confirmar Lançamento
    await page.click('button:has-text("Confirmar")');

    // 5. Esperar a mensagem de sucesso e o fechamento do Drawer
    await expect(page.getByText('Lançamento registrado com sucesso!')).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('heading', { name: /Lançar Movimentação/i })).toBeHidden();

    // 6. Verificar se a Entrada aparece na tabela HTML
    const linha = page.locator('tr').filter({ hasText: testDescricaoEntrada }).first();
    await expect(linha).toBeVisible();
    await expect(linha.getByText('R$ 100,50', { exact: true })).toBeVisible();
    await expect(linha.getByText('Entrada', { exact: true })).toBeVisible();
  });

  test('Deve registrar uma Saída no caixa e visualizá-la na tabela', async ({ page }) => {
    await page.goto('/admin/financeiro');
    await expect(page.getByRole('heading', { name: /Livro Caixa/i })).toBeVisible();

    // 1. Abrir Drawer de Lançamento
    await page.click('button:has-text("Lançar Movimento")');
    await expect(page.getByRole('heading', { name: /Lançar Movimentação/i })).toBeVisible();

    // 2. Selecionar Saída (Default) - Garantir clicando
    await page.click('button:has-text("Saída (Despesa)")');

    // 3. Preencher formulário
    await page.fill('input[name="descricao"]', testDescricaoSaida);
    await page.fill('input[name="valor"]', '50,00');
    
    // 4. Confirmar Lançamento
    await page.click('button:has-text("Confirmar")');

    // 5. Esperar a mensagem de sucesso e o fechamento do Drawer
    await expect(page.getByText('Lançamento registrado com sucesso!')).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('heading', { name: /Lançar Movimentação/i })).toBeHidden();

    // 6. Verificar se a Saída aparece na tabela HTML
    const linha = page.locator('tr').filter({ hasText: testDescricaoSaida }).first();
    await expect(linha).toBeVisible();
    await expect(linha.getByText('R$ 50,00', { exact: true })).toBeVisible();
    await expect(linha.getByText('Saída', { exact: true })).toBeVisible();
  });

  test('Deve visualizar o fluxo de Caixa na página de Prestação de Contas', async ({ page }) => {
    await page.goto('/admin/financeiro/prestacao');
    await expect(page.getByRole('heading', { name: /Prestação de Contas/i, exact: true })).toBeVisible();

    // Verifica se os botões de Impressão e de Voltar estão na tela
    await expect(page.getByRole('button', { name: /Imprimir/i })).toBeVisible();
    await expect(page.getByRole('link', { name: '← Livro Caixa' })).toBeVisible();
  });
});
