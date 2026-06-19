import { expect, test } from '@playwright/test';

const testEmail = process.env.TEST_EMAIL;
const testPassword = process.env.TEST_PASSWORD;

test.describe('Diretoria - Fluxo Crítico', () => {
  test.skip(!testEmail || !testPassword, 'Credenciais de teste não configuradas no .env.local');

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', testEmail!);
    await page.fill('input[name="password"]', testPassword!);
    await page.click('button:has-text("Autenticar")');
    await page.waitForURL('**/admin/dashboard');
  });

  test('Deve visualizar o histórico e gestão atual', async ({ page }) => {
    await page.goto('/admin/diretoria');
    
    // Verifica cabeçalho
    await expect(page.getByRole('heading', { name: /Diretorias e Gestões/i })).toBeVisible();
    
    // Verifica se a lista de gestões ou a mensagem de vazia aparece
    await expect(page.getByRole('heading', { name: /Gestões Cadastradas/i })).toBeVisible({ timeout: 10000 });
  });
});
