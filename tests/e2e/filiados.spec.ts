import { test, expect } from '@playwright/test';

// Credenciais de teste
const testEmail = process.env.TEST_EMAIL;
const testPassword = process.env.TEST_PASSWORD;

const testNomeFiliado = 'NOME E2E TESTE AUTOMATIZADO';
const testSiape = 'SIAPE-00000000';

test.describe('Filiados - Fluxo Crítico', () => {
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

  test('Deve cadastrar um novo filiado e listá-lo na tabela', async ({ page }) => {
    // 1. Navegar até a tela de novo filiado
    await page.goto('/filiados/novo');
    await expect(page.getByRole('heading', { name: /Nova Ficha de Filiado/i })).toBeVisible();

    // 2. Preencher os dados do formulário
    await page.fill('input[name="nome"]', testNomeFiliado);
    await page.fill('input[name="email"]', 'teste@sindicato.org');
    await page.fill('input[name="telefone"]', '(64) 99999-0000');
    await page.fill('input[name="siape"]', testSiape);
    await page.fill('input[name="cargo"]', 'Técnico Administrativo');

    // 3. Submeter formulário
    await page.click('button:has-text("Salvar Ficha")');

    // 4. Validar redirecionamento de sucesso para a lista
    await page.waitForURL('**/filiados');
    await expect(page.getByRole('heading', { name: /Gestão de Filiados/i })).toBeVisible();

    // 5. Verificar se o filiado inserido aparece na tabela HTML
    // Usamos o filter by text para encontrar a linha (TR) correta
    const linhaFiliado = page.locator('tr').filter({ hasText: testNomeFiliado }).first();
    await expect(linhaFiliado).toBeVisible();
    await expect(linhaFiliado.getByText('teste@sindicato.org')).toBeVisible();
    await expect(linhaFiliado.getByText(testSiape)).toBeVisible();
    await expect(linhaFiliado.getByText('Técnico Administrativo')).toBeVisible();
    await expect(linhaFiliado.getByText('Ativo', { exact: true })).toBeVisible();
  });
});
