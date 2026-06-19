import { expect, test } from '@playwright/test';

const testEmail = process.env.TEST_EMAIL;
const testPassword = process.env.TEST_PASSWORD;

test.describe('Financeiro - Fluxo Crítico', () => {
  test.skip(!testEmail || !testPassword, 'Credenciais de teste não configuradas no .env.local');

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', testEmail!);
    await page.fill('input[name="password"]', testPassword!);
    await page.click('button:has-text("Autenticar")');
    await page.waitForURL('**/admin/dashboard');
  });

  test('Deve visualizar a listagem de financeiro', async ({ page }) => {
    await page.goto('/admin/financeiro');
    
    // Verifica cabeçalho
    await expect(page.getByRole('heading', { name: /Livro Caixa/i })).toBeVisible();
    
    // Verifica botão de importação
    await expect(page.getByRole('link', { name: /Importar Extrato/i })).toBeVisible();
    
    // Verifica abas (Receitas, Despesas)
    await expect(page.getByRole('button', { name: /^Entrada$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Saída$/i })).toBeVisible();
  });

  test('Deve abrir o modal de nova despesa/receita manual', async ({ page }) => {
    await page.goto('/admin/financeiro');
    
    // Clique no botão Adicionar Registro Manual
    const addButton = page.getByRole('button', { name: /Lançar Movimento/i });
    await addButton.click();
    
    // Modal/Drawer aparece
    await expect(page.getByRole('heading', { name: /Lançar Movimentação/i })).toBeVisible();
    await expect(page.getByLabel(/Descrição/i)).toBeVisible();
    await expect(page.getByLabel(/Valor/i)).toBeVisible();
    await expect(page.getByLabel(/Data do Lançamento/i)).toBeVisible();
  });
});
