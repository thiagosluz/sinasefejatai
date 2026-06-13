import { expect,test } from '@playwright/test';

// Credenciais de teste (Devem estar no .env.local)
const testEmail = process.env.TEST_EMAIL;
const testPassword = process.env.TEST_PASSWORD;

// Limpeza feita no global.teardown.ts

test.describe('Admin - Configurações do Cabeçalho', () => {
  // Ignora os testes se não houver credenciais configuradas
  test.skip(!testEmail || !testPassword, 'Credenciais de teste não configuradas no .env.local (TEST_EMAIL, TEST_PASSWORD)');

  test.beforeEach(async ({ page }) => {
    // Fazer login antes de cada teste
    await page.goto('/login');
    await page.fill('input[name="email"]', testEmail!);
    await page.fill('input[name="password"]', testPassword!);
    await page.click('button:has-text("Autenticar Carteira")');
    await page.waitForURL('**/admin/dashboard');
  });

  test('Deve carregar a página de configurações e exibir o formulário', async ({ page }) => {
    await page.goto('/admin/configuracoes');
    
    // Verifica se a página carregou
    await expect(page.getByRole('heading', { name: /Configuração de Cabeçalhos/i })).toBeVisible();
    
    // Verifica se os campos do formulário estão presentes
    await expect(page.getByLabel(/Título Geral da Entidade/i)).toBeVisible();
    await expect(page.getByLabel(/Nome da Seção Sindical/i)).toBeVisible();
  });

  test('Deve permitir digitar nos campos de texto e salvar', async ({ page }) => {
    await page.goto('/admin/configuracoes');
    
    // Preencher o Título
    const inputTitulo = page.getByLabel(/Título Geral da Entidade/i);
    await inputTitulo.clear();
    await inputTitulo.fill('TITULO TESTE PLAYWRIGHT');
    await expect(inputTitulo).toHaveValue('TITULO TESTE PLAYWRIGHT');

    // Preencher a Seção Sindical
    const inputSecao = page.getByLabel(/Nome da Seção Sindical/i);
    await inputSecao.clear();
    await inputSecao.fill('SECAO TESTE PLAYWRIGHT');
    await expect(inputSecao).toHaveValue('SECAO TESTE PLAYWRIGHT');
    
    // We will let the action hit the real database. The test environment has a dedicated DB cleanup.

    // Agora podemos clicar no botão de salvar com segurança!
    await page.getByRole('button', { name: /Salvar Alterações/i }).click();

    // Verifica se o toast de sucesso (disparado pelo frontend ao receber o success: true) apareceu
    await expect(page.getByText('Configurações de cabeçalho salvas com sucesso')).toBeVisible();
  });
});

