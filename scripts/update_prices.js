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

    // Tentar extrair a primeira imagem relevante (tag <img>) do itemContent
    let image = '';
    const imgMatches = itemContent.match(/<img[^>]+src="([^">]+)"/g) || [];
    for (const imgTag of imgMatches) {
      const srcMatch = imgTag.match(/src="([^">]+)"/i);
      if (srcMatch) {
        const src = srcMatch[1];
        // Ignorar emojis do WordPress, avatares ou favicons
        if (!src.includes('s.w.org') && !src.includes('wp-smiley') && !src.includes('cropped-favicon') && !src.includes('gravatar')) {
          image = src;
          break;
        }
      }
    }

    items.push({
      title: cleanHTML(title),
      link: cleanHTML(link),
      pubDate: new Date(pubDateStr),
      description: cleanHTML(description),
      image: image
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

function extractPriceFromContent(title, desc, programId) {
  const text = (title + ' ' + desc).toLowerCase();
  
  // Padrões comuns de citação de Custo por Milheiro (CPM)
  const regexes = [
    /milheiro\s+a\s+partir\s+de\s+r\$\s*(\d+(?:[.,]\d+)?)/i,
    /r\$\s*(\d+(?:[.,]\d+)?)\s+o\s+milheiro/i,
    /r\$\s*(\d+(?:[.,]\d+)?)\s+por\s+milheiro/i,
    /milheiro\s+(?:por|a)\s+r\$\s*(\d+(?:[.,]\d+)?)/i,
    /pontos\s+a\s+r\$\s*(\d+(?:[.,]\d+)?)/i,
    /milhas\s+a\s+r\$\s*(\d+(?:[.,]\d+)?)/i,
    /custo\s+de\s+r\$\s*(\d+(?:[.,]\d+)?)\s+por/i,
    /milheiro\s+sai\s+a\s+r\$\s*(\d+(?:[.,]\d+)?)/i,
    /cpm\s+(?:de\s+)?r\$\s*(\d+(?:[.,]\d+)?)/i,
  ];

  for (const regex of regexes) {
    const match = text.match(regex);
    if (match) {
      const val = parseFloat(match[1].replace(',', '.'));
      if (val > 0 && val < 200) {
        return val;
      }
    }
  }

  // Desconto na compra de pontos Livelo/Esfera (base R$ 70)
  if (programId === 'livelo' || programId === 'esfera') {
    const discountRegex = /(\d+)%\s*(?:de\s*)?desconto\s+na\s+compra/i;
    const matchDiscount = text.match(discountRegex);
    if (matchDiscount) {
      const discount = parseInt(matchDiscount[1]);
      if (discount > 0 && discount < 100) {
        return 70 * (1 - discount / 100);
      }
    }
    
    const offRegex = /(\d+)%\s*off/i;
    const matchOff = text.match(offRegex);
    if (matchOff) {
      const discount = parseInt(matchOff[1]);
      if (discount > 0 && discount < 100) {
        return 70 * (1 - discount / 100);
      }
    }
  }

  return null;
}

function attributePriceToProgram(price, text) {
  const programsFound = [];
  if (text.includes('livelo')) programsFound.push('livelo');
  if (text.includes('esfera')) programsFound.push('esfera');
  if (text.includes('smiles')) programsFound.push('smiles');
  if (text.includes('latam') || text.includes('multiplus')) programsFound.push('latam');
  if (text.includes('tudoazul') || text.includes('azul fidelidade') || text.includes('clube azul') || text.includes(' azul ')) programsFound.push('azul');
  if (text.includes('tap') || text.includes('miles&go')) programsFound.push('tap');
  if (text.includes('aadvantage')) programsFound.push('aadvantage');

  if (programsFound.length === 0) return null;
  if (programsFound.length === 1) return programsFound[0];

  // Heurísticas de faixa de preço se houver múltiplos programas citados
  if (price <= 13.50) {
    if (programsFound.includes('azul')) return 'azul';
    if (programsFound.includes('smiles')) return 'smiles';
  }
  if (price > 13.50 && price <= 18.50) {
    if (programsFound.includes('smiles')) return 'smiles';
    if (programsFound.includes('azul')) return 'azul';
    if (programsFound.includes('latam')) return 'latam';
  }
  if (price > 18.50 && price <= 24.50) {
    if (programsFound.includes('latam')) return 'latam';
    if (programsFound.includes('smiles')) return 'smiles';
  }
  if (price > 24.50 && price <= 38.00) {
    if (programsFound.includes('livelo') && (text.includes('compra') || text.includes('livelo mais'))) return 'livelo';
    if (programsFound.includes('esfera') && text.includes('compra')) return 'esfera';
    if (programsFound.includes('livelo')) return 'livelo';
    if (programsFound.includes('esfera')) return 'esfera';
  }
  if (price > 90.00) {
    if (programsFound.includes('aadvantage')) return 'aadvantage';
  }

  return programsFound[0];
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

    // Fallback de preços de mercado caso não encontre cotação nas notícias
    const fallbackPrices = {
      latam: 23.00,
      smiles: 17.50,
      azul: 13.00,
      livelo: 35.00,
      esfera: 35.00,
      aadvantage: 130.00,
      tap: 44.00
    };

    const currentMarketPrices = { ...fallbackPrices };

    // Mapear primeiro as ofertas
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
            image: item.image,
            active: true,
            isAuto: true
          });
        }
      }
    });

    // Processar cotações das promoções do feed em ordem cronológica (do mais antigo para o mais recente)
    // para que promoções mais novas sobrescrevam as mais antigas
    const sortedItems = [...rawItems].reverse();
    sortedItems.forEach(item => {
      const titleLower = item.title.toLowerCase();
      const keywords = ['bônus', 'desconto', 'transferência', 'milhas', 'pontos', 'promoção', 'cpm', 'compra', 'assine', 'aniversário', 'compre', 'cupom', 'cashback'];
      const isPromo = keywords.some(kw => titleLower.includes(kw));

      if (isPromo) {
        const programId = identifyProgram(item.title, item.description);
        const parsedPrice = extractPriceFromContent(item.title, item.description, programId);
        if (parsedPrice) {
          const progId = attributePriceToProgram(parsedPrice, titleLower);
          if (progId) {
            currentMarketPrices[progId] = parsedPrice;
            console.log(`Preço extraído automaticamente para ${progId}: R$ ${parsedPrice.toFixed(2)}`);
          }
        }
      }
    });

    console.log(`Filtrados ${activeOffers.length} alertas/promoções ativas.`);

    // Gerar conteúdo do arquivo offers.js com metadados para controle do frontend
    const outputContent = `/* ============================================
   MILHAS ACKER — Ofertas em Tempo Real (Auto)
   Atualizado automaticamente via GitHub Actions
   ============================================ */

const LIVE_OFFERS_METADATA = {
  lastUpdated: "${now.toISOString()}",
  status: "success",
  currentMarketPrices: ${JSON.stringify(currentMarketPrices, null, 2)}
};

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
