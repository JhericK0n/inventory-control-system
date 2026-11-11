-- Nexo Estoque V3: lotes e vencimentos, promoções, códigos de barras e preços de atacado.
-- Execute DEPOIS de 01_criar_banco.sql, no SQL Editor do MESMO projeto.
-- Pode ser reexecutado. Não concede nenhuma permissão de escrita para visitantes.
-- Faça backup antes de executar em um projeto com dados próprios.

begin;

alter table public.inventory_products
  add column if not exists barcode text,
  add column if not exists is_perishable boolean not null default false,
  add column if not exists wholesale_enabled boolean not null default false,
  add column if not exists wholesale_price numeric(12,2) not null default 0,
  add column if not exists wholesale_min_qty integer not null default 10,
  add column if not exists promotion_enabled boolean not null default false,
  add column if not exists promotion_price numeric(12,2) not null default 0,
  add column if not exists promotion_starts_on date,
  add column if not exists promotion_ends_on date;

create table if not exists public.inventory_batches (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.inventory_products(id) on delete cascade,
  lot_code text not null check(length(trim(lot_code)) > 0),
  quantity integer not null default 0 check (quantity >= 0),
  expires_on date,
  created_at timestamptz not null default now(),
  unique (product_id, lot_code)
);

alter table public.inventory_movements
  add column if not exists batch_id uuid references public.inventory_batches(id) on delete set null,
  add column if not exists lot_code text not null default '';

-- Cada produto já existente recebe um lote de saldo inicial.
-- Movimentações antigas não são alteradas e permanecem históricas.
insert into public.inventory_batches(product_id,lot_code,quantity)
select p.id,'LOTE-INICIAL',p.qty
from public.inventory_products p
where p.qty > 0
  and not exists(select 1 from public.inventory_batches b where b.product_id=p.id)
on conflict (product_id,lot_code) do nothing;

-- Exemplos adicionais aparecem apenas quando as amostras da versão anterior estão presentes.
insert into public.inventory_products
  (id,name,sku,category,qty,minimum_qty,unit_price,supplier,is_perishable,wholesale_enabled,wholesale_price,wholesale_min_qty,promotion_enabled,promotion_price,promotion_starts_on,promotion_ends_on)
select * from (values
 ('11111111-1111-4111-8111-111111111111'::uuid,'Iogurte natural 170g','ALI-011','Laticínios',24,6,5.90::numeric,'Laticínios Exemplo',true,true,4.50::numeric,12,true,4.20::numeric,current_date-2,current_date+9),
 ('11111111-1111-4111-8111-111111111112'::uuid,'Café gourmet 500g','ALI-012','Mercearia',35,8,39.90::numeric,'Torrefação Exemplo',true,true,30.90::numeric,12,false,0::numeric,null::date,null::date),
 ('11111111-1111-4111-8111-111111111113'::uuid,'Suco de laranja 1L','BEB-013','Bebidas',12,5,12.50::numeric,'Bebidas Exemplo',true,true,9.70::numeric,12,false,0::numeric,null::date,null::date)
) AS data (id,name,sku,category,qty,minimum_qty,unit_price,supplier,is_perishable,wholesale_enabled,wholesale_price,wholesale_min_qty,promotion_enabled,promotion_price,promotion_starts_on,promotion_ends_on)
where exists(select 1 from public.inventory_products where id='11111111-1111-4111-8111-111111111101'::uuid)
on conflict (id) do nothing;

-- Demos com datas RELATIVAS À EXECUÇÃO para os alertas ficarem visíveis inicialmente.
insert into public.inventory_batches(product_id,lot_code,quantity,expires_on)
select p.id,d.lot,p.qty,current_date+d.days
from (values ('ALI-011','DEMO-IOG-01',7),('ALI-012','DEMO-CAF-02',65),('BEB-013','DEMO-SUC-03',-3)) AS d(sku,lot,days)
join public.inventory_products p on p.sku=d.sku
where p.id in ('11111111-1111-4111-8111-111111111111'::uuid,'11111111-1111-4111-8111-111111111112'::uuid,'11111111-1111-4111-8111-111111111113'::uuid)
  and not exists(select 1 from public.inventory_batches b where b.product_id=p.id)
on conflict (product_id,lot_code) do nothing;

-- Garante que a vitrine pública leia somente tabelas permitidas.
revoke all on public.inventory_batches from public, anon, authenticated;
grant usage on schema public to anon;
grant select on public.inventory_batches to anon;
alter table public.inventory_batches enable row level security;
drop policy if exists "public_read_batches" on public.inventory_batches;
create policy "public_read_batches" on public.inventory_batches for select to anon using (true);

-- O projeto mantém as políticas anteriores de leitura para produtos e movimentações.
commit;
