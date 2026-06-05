import { expect, test } from '@playwright/test';

// Credenciais de teste
const testEmail = process.env.TEST_EMAIL;
const testPassword = process.env.TEST_PASSWORD;

test.describe('Documentos - Fluxo Crítico (Recibos)', () => {
  // Ignora os testes se não houver credenciais configuradas
  test.skip(!testEmail || !testPassword, 'Credenciais de teste não configuradas no .env.local');

  test.beforeEach(async ({ page }) => {
    // Fazer login antes de cada teste
    await page.goto('/login');
    await page.fill('input[name="email"]', testEmail!);
    await page.fill('input[name="password"]', testPassword!);
    await page.click('button:has-text("Autenticar Carteira")');
    await page.waitForURL('**/admin/dashboard');
  });

  test('Deve criar um novo recibo, validar visualização e cancelá-lo em seguida', async ({ page }) => {
    // 1. Navegar para listagem de Documentos
    await page.goto('/admin/documentos');
    await expect(page.getByRole('heading', { name: /Central de Documentos/i })).toBeVisible();

    // 2. Ir para criação de Novo Recibo
    await page.getByRole('link', { name: /Emitir Documento/i }).click();
    await expect(page.getByRole('heading', { name: /Emitir Novo Documento/i })).toBeVisible();
    await page.locator('a[href="/admin/documentos/recibos/novo"]').click();
    await expect(page.getByRole('heading', { name: /Novo Recibo/i })).toBeVisible();

    // 3. Preencher formulário
    await page.getByPlaceholder('Ex: Nome do Filiado ou Filiada completo').fill('Testador E2E Silva');
    await page.getByPlaceholder('Ex: 000.000.000-00').fill('123.456.789-00');
    await page.getByPlaceholder('Ex: 648.40').fill('450.75');
    await page.getByPlaceholder(/pagamento de 4 \(quatro\)/i).fill('Pagamento de Teste End-to-End');

    // 4. Validar preview com prop "Nº Gerado ao salvar"
    const printArea = page.locator('#recibo-print-area');
    await expect(printArea).toBeVisible();
    await expect(printArea.getByText('Nº Gerado ao salvar')).toBeVisible();
    await expect(printArea.getByText('R$ 450,75').first()).toBeVisible();

    // 5. Salvar e Gerar Recibo
    await page.getByRole('button', { name: /Salvar e Gerar Recibo/i }).click();

    // 6. Esperar redirecionamento para a página do documento salvo
    await page.waitForURL('**/admin/documentos/recibos/**');
    
    // 7. Validar a presença do número definitivo gerado no banco de dados (regex básico 00X/202X)
    const numeroDefinitivoLocator = page.locator('#recibo-print-area').getByText(/Nº \d{3}\/\d{4}/);
    await expect(numeroDefinitivoLocator).toBeVisible({ timeout: 10000 });

    // 8. Cancelar o Recibo
    // Precisamos do botão "CANCELAR" que fica no header superior do documento (AdminPageHeader)
    await page.getByRole('button', { name: /CANCELAR/i }).click();

    // Modal customizado abrirá
    const modalTitle = page.getByRole('heading', { name: /Confirmação/i });
    await expect(modalTitle).toBeVisible();

    await page.getByRole('button', { name: 'Confirmar' }).click();

    // 9. Validar se a marca d'água vermelha apareceu no documento
    const canceladoWatermark = page.locator('#recibo-print-area').getByText('CANCELADO', { exact: true });
    await expect(canceladoWatermark).toBeVisible({ timeout: 10000 });
  });
});
