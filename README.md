# Nexo Estoque V3 — lotes, validades, promoções, preços e relatório PDF

**Compatível com GitHub Pages** (HTML/CSS/JS estáticos) e com a demonstração pública do **Supabase em somente leitura**.

## Novidades

- **Lotes por produto:** número do lote, saldo independente, vencimento e histórico de entradas/saídas associado ao lote. A soma das quantidades dos lotes determina o saldo do produto.
- **Perecíveis e validade:** ative *Produto perecível* ao cadastrar. Cada lote com saldo exige validade no novo cadastro/entrada. Nova seção **Lotes e validades**, banner e badge de alertas: vencido, vencendo no prazo configurado, sem validade (para lote antigo) e dentro do prazo. O prazo padrão é **30 dias** (alterável de 1 a 365 nas Configurações). Alertas são calculados quando a página é aberta ou atualizada, **não são notificações por e-mail ou push**.
- **Promoções:** preço especial, início e término opcionais, indicação de promoção ativa ou agendada. Promoção aplica-se ao **varejo**, sem alterar o atacado.
- **Código de barras:** digite o EAN/UPC/GTIN de 8 a 14 dígitos ou leia com leitor USB (que age como teclado); clique **Buscar online** para consultar o **Open Food Facts**, uma base colaborativa de produtos alimentícios. Preenche nome e categoria sugerida quando disponíveis. Não busca preço, saldo, lote ou data de validade — esses dados são comerciais/por remessa e devem ser cadastrados manualmente. Se não encontrar, faça o cadastro normalmente. O catálogo cobre **alimentos**, não todos os tipos de mercadoria.
- **Câmera:** há um botão opcional que usa `BarcodeDetector` + `getUserMedia` em navegadores que suportam a API, exigindo HTTPS e permissão de câmera. Se não houver suporte, use um leitor USB ou digite o código.
- **Categorias:** 26 sugestões mais categorias personalizadas adicionadas pelo usuário.
- **Atacado/varejo:** preço de varejo obrigatório; opcionalmente, ative preço de atacado e quantidade mínima. O atacado deve ser inferior ao varejo.
- **Relatório PDF A4 paisagem:** um botão na tela Relatórios gera PDF com indicadores, produtos, lotes e movimentações, cabeçalho e rodapé em todas as páginas. Edite o papel timbrado em Configurações: empresa, linha de apoio, identificação, contato, endereço, cor e logotipo; há um botão para PDF de exemplo. A exportação usa **jsPDF 2.5.2** e **jsPDF-AutoTable 3.8.4** carregadas pelo CDN jsDelivr, portanto requer internet na hora de gerar o arquivo.
- **CSV e backup JSON:** os CSVs agora têm informações novas; backups JSON V3 incluem os lotes, promoções e papel timbrado. Backups da versão anterior continuam importáveis.

## Dois modos de funcionamento

**Demonstração local, sem Supabase (edição permitida):** deixe `supabaseUrl` e `supabasePublishableKey` vazias em `supabase-config.js`. Ao abrir o site, é possível cadastrar, editar, registrar movimentações e testar promoções/lotes. Tudo é salvo em `localStorage`, **apenas no navegador/dispositivo utilizado**. São exibidos produtos e lotes fictícios inicialmente.

**Vitrine pública com Supabase (somente leitura):** preencha a URL do projeto e a **publishable key** do Supabase em `supabase-config.js`. O painel carrega produtos, lotes, vencimentos, preços e movimentações do banco. O público pode filtrar dados e exportar relatórios, mas **não pode alterar o estoque**. O papel timbrado e prazo de aviso podem ser personalizados localmente por visitante. Para atualizar os produtos públicos, edite os registros pelo **Table Editor/SQL Editor** na conta do Supabase, preservando a consistência de quantidades entre `inventory_products.qty` e `inventory_batches.quantity`.

**Atenção:** não há login ou escrita remota nesta versão. Para permitir cadastro compartilhado por usuários autenticados, será necessária uma próxima etapa com autenticação, autorização por perfis e operações transacionais (controle de concorrência/atualização de lotes). Nunca habilite `INSERT`, `UPDATE` ou `DELETE` para anônimos.

## Atualização para quem já tem o banco da versão anterior

1. Faça um backup antes de modificar o banco.
2. No **Supabase > SQL Editor**, execute **somente** `sql/02_atualizar_banco.sql`. Ele adiciona colunas de preços e perecibilidade, a tabela `inventory_batches`, os vínculos de movimentação e os registros demonstrativos quando aplicável. Não apaga seus dados atuais.
3. Envie os arquivos atualizados do site ao repositório, mantendo seu `supabase-config.js` com a **URL e a chave pública corretas**.
4. Abra o site e clique **Atualizar dados**.

Se estiver criando o projeto Supabase do zero, execute `sql/01_criar_banco.sql` e **depois** `sql/02_atualizar_banco.sql`.

O SQL dá acesso anônimo apenas a **SELECT** de três tabelas. Isso significa que **todos os dados nessas tabelas serão públicos** para quem conhecer a API ou o site; não use informações confidenciais. O código não contém segredos: nunca publique a `sb_secret_...`, a chave `service_role`, a senha PostgreSQL ou outras credenciais.

## GitHub Pages

Envie os arquivos de dentro de `estoque-github-supabase/` para a raiz de um repositório público GitHub. Em **Settings > Pages > Build and deployment > Deploy from a branch > main / (root)**, habilite Pages. O endereço será parecido com:

`https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`

Usa caminhos relativos e `.nojekyll`, funcionando em subdiretórios do GitHub Pages.

## Observações importantes

- A base Open Food Facts é colaborativa e pode não conhecer todos os códigos. O `fetch` depende de internet e das políticas da API; navegadores não permitem definir livremente o cabeçalho HTTP `User-Agent` recomendado pelo serviço. Para uso comercial com volume elevado, implemente backend/proxy próprio com identificação e limites.
- Alerta é **visual no painel** e só cobre lotes com quantidade positiva de produtos marcados como perecíveis.
- O banco já usado no Supabase recebe lotes `LOTE-INICIAL` para saldos antigos, sem data. Se forem perecíveis, complete a data no SQL/Table Editor.
- A data de vencimento é específica de cada **lote**, nunca recuperada de uma consulta por código de barras.
- O relatório calcula *valor referencial* com **preço de varejo cadastrado × saldo**, não custo de aquisição nem faturamento realizado.
- Promoção e preço de atacado são recursos **cadastrais/informativos**: o sistema não é um checkout ou PDV.
- Para a vitrine de demonstração, os registros são fictícios, inclusive validades vencidas. Não utilize como inventário real sem validar a implementação com operações transacionais e autenticação.
- O papel timbrado fica salvo localmente no navegador. O arquivo PDF exportado **não é um modelo editável**; para alterar os próximos PDFs, edite as configurações do site e exporte novamente. O logotipo deve ser PNG/JPG/WebP de até 2 MB e é rasterizado para evitar scripts embutidos.
- A leitura de dados públicos do Supabase utiliza até 10.000 linhas por tabela e acesso em somente leitura. É um modelo para apresentação, não um ERP de produção.

## Arquivos

- `index.html` — páginas, campos e modais
- `styles.css` — identidade visual responsiva
- `app.js` — cadastros e consultas, lotes, validade, PDF, leitura de código, estatísticas
- `supabase-config.js` — URL e chave **pública** (sem segredos)
- `sql/01_criar_banco.sql` — banco inicial da versão anterior
- `sql/02_atualizar_banco.sql` — migração para a V3
- `.nojekyll` — GitHub Pages

Bibliotecas de PDF: [jsPDF](https://github.com/parallax/jsPDF) e [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) (MIT). Consulta de código de barras: [Open Food Facts](https://world.openfoodfacts.org/) (dados colaborativos; consulte licença e condições de uso).
