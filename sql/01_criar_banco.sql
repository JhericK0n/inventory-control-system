-- Nexo Estoque | somente leitura para a vitrine do GitHub Pages
-- Execute no SQL Editor de um projeto novo no Supabase.
-- As tabelas são acessíveis publicamente para SELECT apenas.
-- NÃO use esta política para estoques confidenciais ou dados de clientes.

create extension if not exists pgcrypto;

create table if not exists public.inventory_products (
    id uuid primary key default gen_random_uuid(),
    name text not null check (length(trim(name)) > 0),
    sku text not null unique,
    category text not null,
    qty integer not null default 0 check (qty >= 0),
    minimum_qty integer not null default 0 check (minimum_qty >= 0),
    unit_price numeric(12,2) not null default 0 check (unit_price >= 0),
    supplier text not null default '',
    created_at timestamptz not null default now()
);

create table if not exists public.inventory_movements (
    id uuid primary key default gen_random_uuid(),
    product_id uuid references public.inventory_products(id) on delete set null,
    product_name text not null,
    sku text not null,
    movement_type text not null check (movement_type in ('entrada', 'saida')),
    quantity integer not null check (quantity > 0),
    note text not null default '',
    created_at timestamptz not null default now()
);

-- Negar escrita de visitantes, mesmo que conheçam o endpoint REST.
revoke all on table public.inventory_products, public.inventory_movements from anon, authenticated;
grant usage on schema public to anon;
grant select on table public.inventory_products, public.inventory_movements to anon;

alter table public.inventory_products enable row level security;
alter table public.inventory_movements enable row level security;

drop policy if exists "public_read_products" on public.inventory_products;
create policy "public_read_products"
    on public.inventory_products for select to anon using (true);

drop policy if exists "public_read_movements" on public.inventory_movements;
create policy "public_read_movements"
    on public.inventory_movements for select to anon using (true);

-- Exemplos fictícios: os mesmos do painel local.
-- Edite ou remova estes dados no Supabase quando quiser.
insert into public.inventory_products (id,name,sku,category,qty,minimum_qty,unit_price,supplier,created_at) values ('11111111-1111-4111-8111-111111111101','Notebook Business 14','ELE-001','Eletrônicos',18,5,3899.90,'Tech Distribuidora',now() - interval '30 days') on conflict (id) do nothing;
insert into public.inventory_products (id,name,sku,category,qty,minimum_qty,unit_price,supplier,created_at) values ('11111111-1111-4111-8111-111111111102','Mouse sem fio','ELE-002','Eletrônicos',4,8,89.90,'Tech Distribuidora',now() - interval '30 days') on conflict (id) do nothing;
insert into public.inventory_products (id,name,sku,category,qty,minimum_qty,unit_price,supplier,created_at) values ('11111111-1111-4111-8111-111111111103','Cadeira Ergonômica','MOV-003','Móveis',12,4,1269.00,'Office Center',now() - interval '30 days') on conflict (id) do nothing;
insert into public.inventory_products (id,name,sku,category,qty,minimum_qty,unit_price,supplier,created_at) values ('11111111-1111-4111-8111-111111111104','Teclado Mecânico','ELE-004','Eletrônicos',28,6,359.90,'Tech Distribuidora',now() - interval '30 days') on conflict (id) do nothing;
insert into public.inventory_products (id,name,sku,category,qty,minimum_qty,unit_price,supplier,created_at) values ('11111111-1111-4111-8111-111111111105','Caderno Executivo','PAP-005','Papelaria',68,15,29.90,'Papéis Ltda.',now() - interval '30 days') on conflict (id) do nothing;
insert into public.inventory_products (id,name,sku,category,qty,minimum_qty,unit_price,supplier,created_at) values ('11111111-1111-4111-8111-111111111106','Monitor 27 polegadas','ELE-006','Eletrônicos',3,5,1499.00,'Tech Distribuidora',now() - interval '30 days') on conflict (id) do nothing;
insert into public.inventory_products (id,name,sku,category,qty,minimum_qty,unit_price,supplier,created_at) values ('11111111-1111-4111-8111-111111111107','Mesa de Escritório','MOV-007','Móveis',9,3,899.00,'Office Center',now() - interval '30 days') on conflict (id) do nothing;
insert into public.inventory_products (id,name,sku,category,qty,minimum_qty,unit_price,supplier,created_at) values ('11111111-1111-4111-8111-111111111108','Caneta Premium','PAP-008','Papelaria',0,10,14.90,'Papéis Ltda.',now() - interval '30 days') on conflict (id) do nothing;
insert into public.inventory_products (id,name,sku,category,qty,minimum_qty,unit_price,supplier,created_at) values ('11111111-1111-4111-8111-111111111109','Fone Bluetooth','ACE-009','Acessórios',23,8,259.90,'Áudio Supply',now() - interval '30 days') on conflict (id) do nothing;
insert into public.inventory_products (id,name,sku,category,qty,minimum_qty,unit_price,supplier,created_at) values ('11111111-1111-4111-8111-111111111110','Hub USB-C','ACE-010','Acessórios',31,10,149.90,'Áudio Supply',now() - interval '30 days') on conflict (id) do nothing;

-- Movimentações históricas são ilustrativas; não recalculam o saldo inicial.
insert into public.inventory_movements (id,product_id,product_name,sku,movement_type,quantity,note,created_at) values ('22222222-2222-4222-8222-000000000001','11111111-1111-4111-8111-111111111101','Notebook Business 14','ELE-001','entrada',12,'Recebimento de fornecedor',now() - interval '0 days') on conflict (id) do nothing;
insert into public.inventory_movements (id,product_id,product_name,sku,movement_type,quantity,note,created_at) values ('22222222-2222-4222-8222-000000000002','11111111-1111-4111-8111-111111111102','Mouse sem fio','ELE-002','saida',3,'Venda balcão',now() - interval '0 days') on conflict (id) do nothing;
insert into public.inventory_movements (id,product_id,product_name,sku,movement_type,quantity,note,created_at) values ('22222222-2222-4222-8222-000000000003','11111111-1111-4111-8111-111111111103','Cadeira Ergonômica','MOV-003','entrada',8,'Reposição semanal',now() - interval '1 days') on conflict (id) do nothing;
insert into public.inventory_movements (id,product_id,product_name,sku,movement_type,quantity,note,created_at) values ('22222222-2222-4222-8222-000000000004','11111111-1111-4111-8111-111111111104','Teclado Mecânico','ELE-004','saida',4,'Pedido entregue',now() - interval '1 days') on conflict (id) do nothing;
insert into public.inventory_movements (id,product_id,product_name,sku,movement_type,quantity,note,created_at) values ('22222222-2222-4222-8222-000000000005','11111111-1111-4111-8111-111111111106','Monitor 27 polegadas','ELE-006','saida',2,'Venda online',now() - interval '2 days') on conflict (id) do nothing;
insert into public.inventory_movements (id,product_id,product_name,sku,movement_type,quantity,note,created_at) values ('22222222-2222-4222-8222-000000000006','11111111-1111-4111-8111-111111111109','Fone Bluetooth','ACE-009','entrada',15,'Novo lote',now() - interval '3 days') on conflict (id) do nothing;
insert into public.inventory_movements (id,product_id,product_name,sku,movement_type,quantity,note,created_at) values ('22222222-2222-4222-8222-000000000007','11111111-1111-4111-8111-111111111105','Caderno Executivo','PAP-005','saida',8,'Saída para consumo',now() - interval '3 days') on conflict (id) do nothing;
insert into public.inventory_movements (id,product_id,product_name,sku,movement_type,quantity,note,created_at) values ('22222222-2222-4222-8222-000000000008','11111111-1111-4111-8111-111111111107','Mesa de Escritório','MOV-007','entrada',5,'Recebimento',now() - interval '4 days') on conflict (id) do nothing;
insert into public.inventory_movements (id,product_id,product_name,sku,movement_type,quantity,note,created_at) values ('22222222-2222-4222-8222-000000000009','11111111-1111-4111-8111-111111111108','Caneta Premium','PAP-008','saida',2,'Requisição interna',now() - interval '5 days') on conflict (id) do nothing;
insert into public.inventory_movements (id,product_id,product_name,sku,movement_type,quantity,note,created_at) values ('22222222-2222-4222-8222-000000000010','11111111-1111-4111-8111-111111111110','Hub USB-C','ACE-010','entrada',12,'Reposição',now() - interval '6 days') on conflict (id) do nothing;
insert into public.inventory_movements (id,product_id,product_name,sku,movement_type,quantity,note,created_at) values ('22222222-2222-4222-8222-000000000011','11111111-1111-4111-8111-111111111101','Notebook Business 14','ELE-001','saida',2,'Pedido entregue',now() - interval '8 days') on conflict (id) do nothing;
insert into public.inventory_movements (id,product_id,product_name,sku,movement_type,quantity,note,created_at) values ('22222222-2222-4222-8222-000000000012','11111111-1111-4111-8111-111111111104','Teclado Mecânico','ELE-004','entrada',10,'Fornecedor',now() - interval '10 days') on conflict (id) do nothing;
insert into public.inventory_movements (id,product_id,product_name,sku,movement_type,quantity,note,created_at) values ('22222222-2222-4222-8222-000000000013','11111111-1111-4111-8111-111111111109','Fone Bluetooth','ACE-009','saida',5,'Venda',now() - interval '13 days') on conflict (id) do nothing;
insert into public.inventory_movements (id,product_id,product_name,sku,movement_type,quantity,note,created_at) values ('22222222-2222-4222-8222-000000000014','11111111-1111-4111-8111-111111111106','Monitor 27 polegadas','ELE-006','entrada',7,'Reposição',now() - interval '18 days') on conflict (id) do nothing;
insert into public.inventory_movements (id,product_id,product_name,sku,movement_type,quantity,note,created_at) values ('22222222-2222-4222-8222-000000000015','11111111-1111-4111-8111-111111111103','Cadeira Ergonômica','MOV-003','saida',3,'Entrega',now() - interval '24 days') on conflict (id) do nothing;
insert into public.inventory_movements (id,product_id,product_name,sku,movement_type,quantity,note,created_at) values ('22222222-2222-4222-8222-000000000016','11111111-1111-4111-8111-111111111110','Hub USB-C','ACE-010','entrada',20,'Recebimento',now() - interval '40 days') on conflict (id) do nothing;
insert into public.inventory_movements (id,product_id,product_name,sku,movement_type,quantity,note,created_at) values ('22222222-2222-4222-8222-000000000017','11111111-1111-4111-8111-111111111105','Caderno Executivo','PAP-005','entrada',30,'Lote novo',now() - interval '50 days') on conflict (id) do nothing;
insert into public.inventory_movements (id,product_id,product_name,sku,movement_type,quantity,note,created_at) values ('22222222-2222-4222-8222-000000000018','11111111-1111-4111-8111-111111111107','Mesa de Escritório','MOV-007','saida',4,'Venda',now() - interval '64 days') on conflict (id) do nothing;
