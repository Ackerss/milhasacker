# Especificação de Design: Otimização de Layout (Sidebar e Tabelas Responsivas)

**Data:** 2026-06-08  
**Autor:** Antigravity (AI Coding Assistant)  
**Status:** Aprovado pelo Usuário  

---

## 🎯 Objetivo

Reestruturar o layout geral do sistema **Milhas Acker** para resolver problemas de quebra de layout e estouro horizontal em telas menores (notebooks), além de criar uma experiência excepcional em dispositivos móveis (smartphones).

---

## 🎨 Solução Proposta

### 1. Barra Lateral Inteligente (Desktop)
*   **Modo Contraído (Padrão):** Largura de `72px`. Exibe apenas os ícones centrais do menu e os avatares empilhados.
*   **Modo Expandido (Hover):** Largura de `260px`. Ocorre quando o usuário passa o mouse (`:hover`) sobre a barra lateral.
*   **Comportamento:** A barra se expande flutuando sobre o conteúdo principal (`.main-content`), que terá uma margem esquerda fixa de `72px`. Isso evita "solavancos" visuais e redimensionamento custoso dos componentes da página (como gráficos e tabelas).
*   **Ocultação de Textos:**
    *   Títulos do cabeçalho da sidebar (`.sidebar-title`, `.sidebar-subtitle`), labels de links (`.nav-item-label`) e divisores de seção (`.nav-section-label`) serão ocultados no modo contraído.
    *   Para os botões do usuário no rodapé, os textos "Jacson" e "Ana" serão ocultados, mantendo apenas os emojis/ícones visíveis.
*   **Dicas visuais (Tooltips):** Adição de tooltips nativos (`title="..."`) em cada item de menu para guiar o usuário no modo contraído.

### 2. Layout Adaptativo para Mobile
*   **Barra Lateral:** Em telas com largura menor ou igual a `768px`, a barra lateral ficará totalmente oculta (`transform: translateX(-100%)`).
*   **Drawer:** A abertura se dará por deslizamento lateral até `260px` de largura ao clicar no botão de menu `☰` no cabeçalho. Um overlay escuro e interativo cobrirá o restante da tela.
*   **Cabeçalho Otimizado:** Exibição simplificada com botão `☰`, o ícone e nome da view ativa e o usuário ativo no canto direito.

### 3. Fusão de Colunas nas Tabelas (Desktop)
*   **Fusão:** A coluna "Tipo" (`✈️ Aérea` / `🔄 Pontos`) será eliminada.
*   **Nova Exibição:** O tipo será integrado diretamente na coluna **Programa** através de um ícone descritivo ao lado do nome do programa.
    *   Exemplo: `✈️ Latam Pass` ou `🔄 Livelo`.
*   **Espaço Salvo:** Redução imediata de ~120px na largura horizontal das tabelas.
*   **Padding Dinâmico:** Reduzido de `16px` para `10px` em telas menores que `1200px`.

### 4. Tabelas em Cards no Mobile (Telas < 768px)
*   **Conversão CSS:** A estrutura da tabela (`table`, `tr`, `td`) será renderizada como blocos flexíveis no mobile:
    *   `thead` será ocultado (`display: none`).
    *   `tr` (linha) vira um card individual com margem inferior, bordas arredondadas e sombra suave.
    *   `td` (célula) vira uma linha interna (`display: flex; justify-content: space-between`) contendo um rótulo explicativo à esquerda (gerado dinamicamente via atributo `data-label`) e o valor formatado à direita.

---

## 🛠️ Arquivos Modificados

1.  **[index.html](file:///c:/Users/NATUBRAVA/Meu%20Drive%20%28jacsonsax@gmail.com%29/ANTIGRAVITY/MILHAS%20ACKER/index.html)** — Atualização de atributos `data-label` nas tabelas, melhorias estruturais na sidebar e cabeçalho.
2.  **[css/styles.css](file:///c:/Users/NATUBRAVA/Meu%20Drive%20%28jacsonsax@gmail.com%29/ANTIGRAVITY/MILHAS%20ACKER/css/styles.css)** — Regras CSS para sidebar contraída/hover, fusão de colunas, padding responsivo e tabelas em cards.
3.  **[js/prices.js](file:///c:/Users/NATUBRAVA/Meu%20Drive%20%28jacsonsax@gmail.com%29/ANTIGRAVITY/MILHAS%20ACKER/js/prices.js)** — Remoção da coluna Tipo, fusão do ícone de tipo na coluna Programa, inclusão dos atributos `data-label` nos `<td>`.
4.  **[js/balance.js](file:///c:/Users/NATUBRAVA/Meu%20Drive%20%28jacsonsax@gmail.com%29/ANTIGRAVITY/MILHAS%20ACKER/js/balance.js)** — Ajustes de layout da tabela de histórico de movimentações, inclusão dos atributos `data-label` nos `<td>`.
5.  **[js/plans.js](file:///c:/Users/NATUBRAVA/Meu%20Drive%20%28jacsonsax@gmail.com%29/ANTIGRAVITY/MILHAS%20ACKER/js/plans.js)** — Ajustes semelhantes na tabela de planos.
6.  **[js/settings.js](file:///c:/Users/NATUBRAVA/Meu%20Drive%20%28jacsonsax@gmail.com%29/ANTIGRAVITY/MILHAS%20ACKER/js/settings.js)** — Ajustes em tabelas secundárias, se necessário.
7.  **[js/shopping.js](file:///c:/Users/NATUBRAVA/Meu%20Drive%20%28jacsonsax@gmail.com%29/ANTIGRAVITY/MILHAS%20ACKER/js/shopping.js)** — Ajustes em tabelas de compre e pontue.

---

## ✅ Plano de Verificação

### Visual e Interação (Desktop)
1.  Verificar se a barra lateral inicia com `72px` e se expande suavemente para `260px` ao passar o mouse.
2.  Verificar se os títulos e textos desaparecem e reaparecem perfeitamente sem quebrar o alinhamento.
3.  Confirmar que o conteúdo principal (`.main-content`) não sofre deslocamento lateral durante o hover.
4.  Confirmar os tooltips nativos passando o mouse em cima de cada link do menu contraído.

### Visual e Interação (Mobile)
1.  Simular resolução mobile (< 768px) no navegador.
2.  Verificar se a sidebar some completamente e o botão `☰` aparece no topo.
3.  Clicar no botão `☰` e garantir que a barra lateral desliza corretamente por cima com o overlay escuro.
4.  Verificar a conversão das tabelas (Preços, Saldos, Histórico, Planos) para o formato de cards empilhados. Garantir que os dados continuem perfeitamente legíveis.
