export interface OFXTransaction {
  id: string; // FITID
  tipo: 'Entrada' | 'Saída'; // Baseado no sinal de TRNAMT
  data: string; // Formato YYYY-MM-DD
  descricao: string; // MEMO ou NAME
  valor: number; // Valor absoluto
}

/**
 * Analisa o conteúdo bruto de um arquivo OFX bancário e extrai suas transações.
 * Suporta o extrato padrão do Banco do Brasil contendo tags abertas ou fechadas.
 */
export function parseOFX(rawContent: string): OFXTransaction[] {
  const transactions: OFXTransaction[] = [];
  const occurenceMap = new Map<string, number>();
  
  // Encontra todos os blocos <STMTTRN>...</STMTTRN> insensível a maiúsculas/minúsculas
  const blockRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
  let match;

  while ((match = blockRegex.exec(rawContent)) !== null) {
    const blockContent = match[1];
    
    /**
     * Função auxiliar para extrair o valor de uma tag.
     * No padrão OFX do Banco do Brasil, as tags podem ser abertas: <TAG>VALOR
     * terminando no início da próxima tag (<) ou no final da linha.
     */
    const extractTag = (tag: string): string => {
      const regex = new RegExp(`<${tag}>([^<\\r\\n]+)`, 'i');
      const found = blockContent.match(regex);
      return found ? found[1].trim() : '';
    };

    const fitid = extractTag('FITID');
    const trnamtStr = extractTag('TRNAMT');
    const dtposted = extractTag('DTPOSTED');
    const memo = extractTag('MEMO') || extractTag('NAME');

    if (fitid && trnamtStr && dtposted) {
      // Substitui vírgula por ponto se o banco exportar no formato brasileiro
      const normalizedAmt = trnamtStr.replace(',', '.');
      const rawAmt = parseFloat(normalizedAmt);
      
      if (!isNaN(rawAmt)) {
        const valor = Math.abs(rawAmt);
        const tipo = rawAmt < 0 ? 'Saída' : 'Entrada';
        
        // Formata a data de YYYYMMDDHHMMSS para YYYY-MM-DD
        const year = dtposted.substring(0, 4);
        const month = dtposted.substring(4, 6);
        const day = dtposted.substring(6, 8);
        const dataFormatted = `${year}-${month}-${day}`;

        // Chave base da transação para detectar ocorrências repetidas no mesmo extrato
        const baseKey = `${fitid}_${dataFormatted}_${valor.toFixed(2)}_${tipo}`;
        const occurence = occurenceMap.get(baseKey) || 0;
        occurenceMap.set(baseKey, occurence + 1);

        // Gera o ID composto determinístico único
        const compositeId = `${baseKey}_${occurence}`;

        transactions.push({
          id: compositeId,
          tipo,
          data: dataFormatted,
          descricao: memo || 'Transação sem descrição',
          valor
        });
      }
    }
  }

  return transactions;
}
