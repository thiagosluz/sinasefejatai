import { expect, test } from '@playwright/test';

const testEmail = process.env.TEST_EMAIL;
const testPassword = process.env.TEST_PASSWORD;

test.describe('Filiados - Fluxo Crítico', () => {
  test.skip(!testEmail || !testPassword, 'Credenciais de teste não configuradas no .env.local');

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', testEmail!);
    await page.fill('input[name="password"]', testPassword!);
    await page.click('button:has-text("Autenticar")');
    await page.waitForURL('**/admin/dashboard');
  });

  test('Deve visualizar a listagem de filiados', async ({ page }) => {
    await page.goto('/admin/filiados');
    
    // Verifica cabeçalho principal
    await expect(page.getByRole('heading', { name: /Gestão de Filiados/i })).toBeVisible();
    
    // Verifica botão de cadastro
    await expect(page.getByRole('link', { name: /Cadastrar Filiado/i })).toBeVisible();
  });
});
