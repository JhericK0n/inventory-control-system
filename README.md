# Nexo Estoque V4 — GitHub Pages + Supabase Auth

Painel com **consulta pública** e **administração por login**. Mantém a V3 (lotes, validade, promoções, código de barras, categorias, atacado/varejo, PDF com papel timbrado).

## Antes de atualizar

1. **Faça backup do banco Supabase**, em especial das tabelas `inventory_products`, `inventory_batches` e `inventory_movements`.
2. **Guarde seu arquivo `supabase-config.js` atual.** O ZIP contém um exemplo em branco; **não substitua** a configuração que já funciona por valores vazios. Reutilize a URL do projeto e a chave pública do projeto atual.
3. No Supabase, no projeto que você já sincronizou, abra **SQL Editor** e execute somente **`sql/03_login_administrativo.sql`**. As migrações `01` e `02` já devem estar instaladas na sua V3. Evite reexecutar scripts de dados de exemplo.

## Criar o primeiro administrador

1. Vá em **Supabase → Authentication → Users**. Crie um usuário de e-mail e senha (ação **Add user** / **Invite user**, conforme a interface) ou use uma conta já existente. Confirme o e-mail se seu projeto exigir confirmação.
2. Copie o **User UID** (UUID) desse usuário. O e-mail, por si só, NÃO atribui permissões de administrador.
3. No **SQL Editor**, execute o comando abaixo substituindo o UUID de exemplo pelo **User UID real**. O UUID não é uma senha.

```sql
insert into public.inventory_admins (user_id)
values ('00000000-0000-0000-0000-000000000000')
on conflict (user_id) do nothing;
```

> **Atenção:** o UUID `0000...` acima é apenas exemplo e não deve ser usado literalmente. Não compartilhe senhas e não coloque esse comando no JavaScript público.

Para revogar o acesso a uma conta, execute (com o UID real):

```sql
delete from public.inventory_admins
where user_id = '00000000-0000-0000-0000-000000000000';
```

Sugestão: em **Authentication → Settings / General**, desative **Allow new users to sign up** se você só pretende cadastrar administradores manualmente. A criação espontânea de contas não gera acesso administrativo, mas desabilitá-la reduz a superfície de gerenciamento.

## GitHub Pages

1. Envie `index.html`, `styles.css`, `app.js`, `supabase-config.js`, `.nojekyll` e a pasta `sql/` para a raiz do repositório, fazendo commit da V4.
2. No `supabase-config.js`, informe a **mesma URL e chave publicável** que você já utilizou:

```js
window.NEXO_CONFIG = {
  supabaseUrl: 'https://SEU-PROJETO.supabase.co',
  supabasePublishableKey: 'sb_publishable_SUA_CHAVE_PUBLICA'
};
```

Projetos antigos podem ter uma chave pública legada (`anon`). Ela também funciona com o cliente Supabase JS v2; **NUNCA** use `service_role`, `sb_secret_...`, chave privada ou senha em arquivos HTML/JS ou commits.

3. Mantenha a hospedagem do **Settings → Pages → Deploy from a branch → main / (root)**.
4. Aguarde a publicação do commit e abra seu endereço `https://usuario.github.io/repositorio/`. Navegue pelo painel como visitante.
5. Clique em **Entrar como administrador**, informe e-mail e senha do usuário autorizado e teste uma edição simples.

A identidade visual do relatório em PDF permanece configurada **por navegador**; não é salva no Supabase. Relatórios e CSVs ainda são gerados localmente a partir dos dados exibidos.

## Recuperação de senha

Em **Supabase → Authentication → URL Configuration**:

- Defina **Site URL** como a URL exata publicada no GitHub Pages.
- Acrescente essa mesma URL à lista de **Redirect URLs**, inclusive o caminho do repositório e a barra final, quando aplicável.

O botão **Esqueci minha senha** envia o e-mail de recuperação. O link retorna ao site, que apresenta o formulário de nova senha. Verifique também o provedor de e-mail do Auth para entrega dos e-mails.

## O que muda no sistema

| Recurso | Visitante | Administrador autorizado |
|---|---|---|
| Consultar dashboard, produtos, lotes e relatórios | Sim | Sim |
| Exportar CSV e PDF | Sim, com dados públicos | Sim |
| Cadastro e edição de produtos, promoções e preços | Não | Sim |
| Criar/editar lotes e datas de validade | Não | Sim |
| Entradas/saídas de estoque e histórico | Não | Sim |
| Excluir produtos | Não | Sim (histórico preservado) |
| Importar backup JSON diretamente para o banco | Não | Não — ainda não implementado |
| Apagar todo o banco pela interface | Não | Não — por segurança |

O cliente utiliza `signInWithPassword`, `getUser` e uma chamada à função `nexo_is_admin()` para validar a sessão e a autorização. O banco protege INSERT, UPDATE e DELETE com **Row Level Security (RLS)**. Os visitantes continuam com SELECT público. A criação com lote inicial e as entradas/saídas são executadas por **funções PostgreSQL atômicas** (`nexo_create_product` e `nexo_record_movement`). Não há senha administrativa nem chave secreta no site.

### Verificação rápida após publicar

- Abra uma aba anônima: os dados aparecem, mas os botões de editar, cadastrar e movimentar não.
- Entre com uma conta **não incluída** em `inventory_admins`: ela deve continuar sem poder editar (o login administrativo será negado).
- Entre como administrador: aparecem **Novo produto**, ações de edição e entrada/saída.
- Cadastre um produto com lote inicial e teste uma entrada seguida de uma saída: saldos e histórico devem atualizar no Supabase.
- Atualize a página e abra uma janela anônima: os dados já alterados devem aparecer, porém somente leitura.
- Saia da conta: os controles de edição devem desaparecer.
- Gere um relatório PDF e confira o papel timbrado configurado na seção Configurações.

## Segurança e limitações

- As tabelas de produtos, lotes e movimentações têm **leitura pública** conforme a escolha original de um site de demonstração. Se essas informações passarem a ser privadas, **revise as políticas SELECT** antes de inserir dados reais confidenciais.
- `inventory_admins` é uma tabela protegida: não tem autorização de leitura/escrita para visitantes nem de edição para usuários comuns. A função `nexo_is_admin()` consulta a tabela com segurança e retorna apenas verdadeiro/falso.
- Outras políticas permissivas criadas manualmente no projeto, além das V1/V3, podem ampliar os direitos. Revise **Database → Policies** após a migração.
- Desative contas suspeitas pelo Supabase Auth e remova o UID de `inventory_admins`. Sessões já emitidas podem existir até expirar; o site verifica o acesso a cada carregamento e as funções de gravação verificam a autorização em cada chamada.
- Para alto volume de escrita/concorrência, considere evoluir este protótipo com auditoria e operações administrativas mais restritas. A versão é apropriada para demonstração/pequenos testes.
- CDN é necessário para Supabase JS e para os relatórios PDF. Sem internet, o modo local continua disponível se `supabase-config.js` estiver vazio; no modo cloud, precisa de acesso à API.

## Ajuda se algo não funcionar

- **"Sem permissão"**: confirme execução de `03_login_administrativo.sql` e UID na `inventory_admins`.
- **Login funciona, mas não habilita edição**: o e-mail existe, mas o UID pode não ter sido adicionado ou a migração pode não ter sido executada.
- **Dados sumiram e há produtos fictícios**: o `supabase-config.js` pode ter sido substituído pelo modelo vazio.
- **Erro `permission denied` nas leituras**: confira se `sql/01` e `sql/02` foram executados no projeto correto.
- **E-mail de recuperação não abre o site**: confira URL Configuration/Redirect URLs do Supabase.
- **Alterações não aparecem**: clique em **Atualizar dados**; o site recarrega as tabelas sem cache.

Documentação: https://supabase.com/docs/guides/auth • https://supabase.com/docs/guides/database/postgres/row-level-security • https://docs.github.com/pages
