# Nexo Estoque — GitHub Pages + Supabase (demonstração pública)

Versão estática do painel de estoque com duas modalidades:

- **Sem Supabase:** demonstração local interativa, com produtos fictícios e `localStorage` (cada visitante altera apenas os próprios dados).
- **Com Supabase:** consulta compartilhada de produtos, movimentações, gráficos e relatórios. **Somente leitura**; botões de cadastro, entrada, saída, exclusão e restauração ficam desativados. Exportação CSV continua disponível.

Não há login ou escrita remota nesta entrega. Para um estoque operacional real, precisa de autenticação, autorização por perfil, validação de negócio e operações transacionais no banco.

## 1. Criar o banco gratuito

1. Acesse https://supabase.com e crie um projeto no plano Free.
2. Abra **SQL Editor** e execute o conteúdo completo de `sql/01_criar_banco.sql`.
3. O script cria `inventory_products` e `inventory_movements`, habilita **Row Level Security (RLS)**, permite apenas `SELECT` pelo papel anônimo e inclui **dados fictícios**.
4. Em **Project Settings > API Keys** (ou na janela **Connect**), localize a **Project URL** e a chave **publishable** (`sb_publishable_...`).
5. Abra `supabase-config.js` e preencha `supabaseUrl` e `supabasePublishableKey`.

**Nunca** coloque no GitHub a chave `sb_secret_...`, antiga `service_role`, senha do banco nem credenciais pessoais. A chave publishable pode ser usada no navegador **somente com RLS corretamente configurada**. Tudo que o usuário anônimo conseguir consultar pelo site também estará disponível pela API; não use dados sigilosos.

## 2. Publicar no GitHub Pages

1. Crie um repositório **público** no GitHub (necessário no GitHub Free para Pages).
2. Envie os arquivos deste diretório **para a raiz** do repositório, incluindo `index.html`, `app.js`, `styles.css`, `supabase-config.js` e `.nojekyll`. O SQL pode permanecer no repositório, pois não contém segredos.
3. Vá a **Settings > Pages > Build and deployment**.
4. Em **Source**, selecione **Deploy from a branch**; em **Branch**, selecione `main` e `/(root)`; clique em **Save**.
5. Depois da publicação, acesse `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.

O link só ficará ativo após você publicar seu repositório. O projeto utiliza caminhos relativos, então funciona em subpastas do GitHub Pages.

## 3. Usar e atualizar

- Se a URL e a chave ficarem vazias em `supabase-config.js`, o site abrirá em modo local, com cadastro e movimentações que salvam no navegador.
- Se ambas forem preenchidas corretamente, o painel lê as tabelas do Supabase. Utilize **Atualizar dados** para buscar mudanças feitas no banco.
- Para atualizar os registros compartilhados, utilize o **Table Editor / SQL Editor** do Supabase (acesso apenas da sua conta). **Não altere quantidades de um estoque real manualmente sem manter histórico consistente.**
- O modo consulta limita as buscas a 10.000 linhas por tabela para evitar sobrecarga numa apresentação.
- Se o Supabase estiver indisponível, o painel indica erro na conexão e exibe tabelas vazias, sem apresentar dados fictícios como reais.

## 4. Cuidados e limites

- Esta implementação é uma **vitrine demonstrativa**, não um ERP com garantias de consistência, backups de servidor ou controle multiusuário.
- O Supabase Free oferece 500 MB de banco, até 2 projetos ativos e pode pausar projetos após aproximadamente uma semana de pouca atividade. Confira as condições atuais na página https://supabase.com/pricing.
- O GitHub Pages publica arquivos estáticos; não executa PHP, Node ou um servidor de banco de dados.
- Os dados no script SQL são 100% fictícios. Não envie um cadastro comercial real para esta configuração pública.
- Se já houver dados locais na versão anterior, faça primeiro um **backup JSON** no site antigo. Esta versão não sincroniza nem migra automaticamente o conteúdo do navegador.

## Estrutura

- `index.html` — interface
- `styles.css` — estilo responsivo e animações
- `app.js` — dashboard, filtros, exportação CSV, demonstração local e leitura do Supabase
- `supabase-config.js` — configuração pública (sem credenciais secretas)
- `sql/01_criar_banco.sql` — estrutura do banco + políticas RLS e registros fictícios
- `.nojekyll` — publicação estática no GitHub Pages
