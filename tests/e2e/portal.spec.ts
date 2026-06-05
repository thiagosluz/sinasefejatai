import { expect,test } from '@playwright/test';

test.describe('Portal Público', () => {
  test('Deve carregar a Home Page com Navbar e Footer Públicos', async ({ page }) => {
    await page.goto('/');

    // Navbar
    await expect(page.getByRole('link', { name: 'Início' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Assembleias' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Filiação' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Contato' }).first()).toBeVisible();

    // CTA Filiação (Main banner)
    const filiacaoBtn = page.locator('a:has-text("Faça sua Filiação")').first();
    await expect(filiacaoBtn).toBeVisible();

    // Footer
    await expect(page.getByText('Seção Sindical Jataí').first()).toBeVisible();
    await expect(page.getByText('©').first()).toBeVisible();
  });

  test('Deve navegar para a página pública de Assembleias', async ({ page }) => {
    await page.goto('/assembleias');
    
    await expect(page.getByRole('heading', { name: 'Assembleias' })).toBeVisible();
  });

  test('Deve navegar para a página pública de Filiação', async ({ page }) => {
    await page.goto('/filiacao');
    
    await expect(page.getByRole('heading', { name: 'Solicitação de Filiação' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Enviar Pedido de Filiação/i })).toBeVisible();
  });
});
