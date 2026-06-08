const fs = require('fs');
const path = require('path');
const https = require('https');

// URL do feed RSS do Melhores Cartões
const RSS_URL = 'https://www.melhorescartoes.com.br/feed';

function fetchRSS() {
  return new Promise((resolve, reject) => {
    https.get(RSS_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', (err) => reject(err));
  });
}

function cleanHTML(str) {
  if (!str) return '';
  return str
    .replace(/<[^>]*>/g, '') // remove tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function parseFeed(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemContent = match[1];
    
    // Titulo
    let title = '';
    const titleCdataMatch = itemContent.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i);
    if (titleCdataMatch) {
      title = titleCdataMatch[1];
    } else {
      const titleMatch = itemContent.match(/<title>([\s\S]*?)<\/title>/i);
      title = titleMatch ? titleMatch[1] : '';
    }

    // Link
    const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/i);
    const link = linkMatch ? linkMatch[1].trim() : '';

    // Data de publicação
    const pubDateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
    const pubDateStr = pubDateMatch ? pubDateMatch[1].trim() : '';

    // Descrição
    let description = '';
    const descCdataMatch = itemContent.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i);
    if (descCdataMatch) {
      description = descCdataMatch[1];
    } else {
      const descMatch = itemContent.match(/<description>([\s\S]*?)<\/description>/i);
      description = descMatch ? descMatch[1] : '';
    }

    items.push({
      title: cleanHTML(title),
      link: cleanHTML(link),
      pubDate: new Date(pubDateStr),
      description: cleanHTML(description)
    });
  }

  return items;
}

function identifyProgram(title, desc) {
  const content = (title + ' ' + desc).toLowerCase();
  
  if (content.includes('livelo')) return 'livelo';
  if (content.includes('esfera')) return 'esfera';
  if (content.includes('smiles')) return 'smiles';
  if (content.includes('latam') || content.includes('multiplus')) return 'latam';
  if (content.includes('tudoazul') || content.includes('azul fidelidade') || content.includes('clube azul') || content.includes(' azul ')) return 'azul';
  if (content.includes('tap') || content.includes('miles&go')) return 'tap';
  if (content.includes('aadvantage')) return 'aadvantage';
  
  return ''; // Geral
}

function parseExpiryDate(desc) {
  // Regex simples para tentar capturar data de término na descrição:
  // Ex: "até 15/06", "até dia 12/04", "até o dia 20 de novembro"
  const regexBarra = /até\s+(?:o\s+dia\s+)?(\d{2})\/(\d{2})/i;
  const matchBarra = desc.match(regexBarra);
  if (matchBarra) {
    const dia = matchBarra[1];
    const mes = matchBarra[2];
    const ano = new Date().getFullYear();
    return `${ano}-${mes}-${dia}`;
  }
  return null;
}

async function main() {
  try {
    console.log('Buscando feed RSS do Melhores Cartões...');
    const xml = await fetchRSS();
    console.log('Parseando feed...');
    const rawItems = parseFeed(xml);
    console.log(`Encontrados ${rawItems.length} itens no feed.`);

    const now = new Date();
    const activeOffers = [];

    rawItems.forEach((item, idx) => {
      // Filtrar apenas posts dos últimos 5 dias
      const diffTime = Math.abs(now - item.pubDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 5) {
        const titleLower = item.title.toLowerCase();
        
        // Filtrar palavras chaves de interesse
        const keywords = ['bônus', 'desconto', 'transferência', 'milhas', 'pontos', 'promoção', 'cpm', 'compra', 'assine', 'orange friday', 'black friday', 'aniversário', 'compre', 'pontue', 'acumule', 'por real', 'parceiro', 'cupom', 'cashback'];
        const isPromo = keywords.some(kw => titleLower.includes(kw));

        if (isPromo) {
          const programId = identifyProgram(item.title, item.description);
          const endDate = parseExpiryDate(item.description);
          
          // Formata data de início
          const startDate = item.pubDate.toISOString().split('T')[0];

          // Cortar descrição longa e anexar link de leitura
          let shortDesc = item.description;
          if (shortDesc.length > 200) {
            shortDesc = shortDesc.substring(0, 197) + '...';
          }
          shortDesc += ` <a href="${item.link}" target="_blank" style="text-decoration:underline; font-weight:600; color:var(--primary);">Ler no Melhores Cartões ➔</a>`;

          activeOffers.push({
            id: `auto_${startDate.replace(/-/g, '')}_${idx}`,
            title: item.title,
            description: shortDesc,
            programId: programId,
            startDate: startDate,
            endDate: endDate,
            active: true,
            isAuto: true // Marca que é um alerta automatizado
          });
        }
      }
    });

    console.log(`Filtrados ${activeOffers.length} alertas/promoções ativas.`);

    // Gerar conteúdo do arquivo offers.js
    const outputContent = `/* ============================================
   MILHAS ACKER — Ofertas em Tempo Real (Auto)
   Atualizado automaticamente via GitHub Actions
   Última atualização: ${now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
   ============================================ */

const LIVE_OFFERS = ${JSON.stringify(activeOffers, null, 2)};
`;

    const outputPath = path.join(__dirname, '../js/offers.js');
    fs.writeFileSync(outputPath, outputContent, 'utf-8');
    console.log(`Arquivo atualizado com sucesso em: ${outputPath}`);

  } catch (error) {
    console.error('Erro ao atualizar preços:', error);
    process.exit(1);
  }
}

main();
