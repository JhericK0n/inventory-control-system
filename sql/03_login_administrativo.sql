-- Nexo Estoque V4 | acesso público e administração autenticada
-- Requer a execução prévia de 01_criar_banco.sql e 02_atualizar_banco.sql.
-- Backup recomendado. Executar no SQL Editor do MESMO projeto Supabase.
-- A publicação continua pública: não armazene informações confidenciais nessas tabelas.
begin;

-- O cadastro de administradores só pode ser modificado via SQL Editor/service_role.
create table if not exists public.inventory_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.inventory_admins enable row level security;
revoke all on public.inventory_admins from public, anon, authenticated;

-- SECURITY DEFINER com caminho de busca fixo. Não há leitura pública da tabela de admins.
create or replace function public.nexo_is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.inventory_admins a
    where a.user_id = (select auth.uid())
  );
$$;
revoke all on function public.nexo_is_admin() from public, anon, authenticated;
grant execute on function public.nexo_is_admin() to authenticated;

-- A vitrine permanece acessível sem conta; usuários autenticados também podem ler.
grant usage on schema public to anon, authenticated;
grant select on public.inventory_products, public.inventory_batches, public.inventory_movements to anon, authenticated;
grant insert, update, delete on public.inventory_products, public.inventory_batches, public.inventory_movements to authenticated;

alter table public.inventory_products enable row level security;
alter table public.inventory_batches enable row level security;
alter table public.inventory_movements enable row level security;

-- Mantém as permissões de leitura anônima de V1/V3.
drop policy if exists "public_read_products" on public.inventory_products;
create policy "public_read_products" on public.inventory_products for select to anon using (true);
drop policy if exists "public_read_batches" on public.inventory_batches;
create policy "public_read_batches" on public.inventory_batches for select to anon using (true);
drop policy if exists "public_read_movements" on public.inventory_movements;
create policy "public_read_movements" on public.inventory_movements for select to anon using (true);

-- RLS é aplicado a TODAS as alterações, inclusive se alguém chamar a REST API.
do $$
declare t text;
begin
  foreach t in array array['inventory_products','inventory_batches','inventory_movements'] loop
    execute format('drop policy if exists "nexo_authenticated_read" on public.%I',t);
    execute format('create policy "nexo_authenticated_read" on public.%I for select to authenticated using (true)',t);
    execute format('drop policy if exists "nexo_admin_insert" on public.%I',t);
    execute format('create policy "nexo_admin_insert" on public.%I for insert to authenticated with check ((select public.nexo_is_admin()))',t);
    execute format('drop policy if exists "nexo_admin_update" on public.%I',t);
    execute format('create policy "nexo_admin_update" on public.%I for update to authenticated using ((select public.nexo_is_admin())) with check ((select public.nexo_is_admin()))',t);
    execute format('drop policy if exists "nexo_admin_delete" on public.%I',t);
    execute format('create policy "nexo_admin_delete" on public.%I for delete to authenticated using ((select public.nexo_is_admin()))',t);
  end loop;
end $$;

-- Criação atômica de produto, lote inicial e movimento (ou nenhum deles).
create or replace function public.nexo_create_product(
  p_data jsonb,
  p_initial_qty integer default 0,
  p_lot_code text default null,
  p_expiry date default null
)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid;
  v_batch_id uuid;
  v_perishable boolean := coalesce((p_data->>'is_perishable')::boolean,false);
  v_name text := btrim(coalesce(p_data->>'name',''));
  v_sku text := upper(btrim(coalesce(p_data->>'sku','')));
  v_category text := btrim(coalesce(p_data->>'category',''));
  v_lot text := btrim(coalesce(p_lot_code,''));
begin
  if not (select public.nexo_is_admin()) then
    raise exception 'Acesso negado: somente administradores.' using errcode = '42501';
  end if;
  if v_name = '' or v_sku = '' or v_category = '' or
     length(v_name) > 90 or length(v_sku) > 36 or length(v_category) > 45 then
    raise exception 'Informe nome, SKU e categoria válidos.';
  end if;
  if p_initial_qty is null or p_initial_qty < 0 or p_initial_qty > 99999999 then
    raise exception 'Quantidade inicial inválida.';
  end if;
  if p_initial_qty > 0 and (v_lot = '' or length(v_lot) > 45) then
    raise exception 'Informe um lote inicial válido.';
  end if;
  if v_perishable and p_initial_qty > 0 and p_expiry is null then
    raise exception 'Produto perecível exige data de validade no lote inicial.';
  end if;

  insert into public.inventory_products (
    name,sku,category,qty,minimum_qty,unit_price,supplier,barcode,
    is_perishable,wholesale_enabled,wholesale_price,wholesale_min_qty,
    promotion_enabled,promotion_price,promotion_starts_on,promotion_ends_on
  ) values (
    v_name,v_sku,v_category,p_initial_qty,
    coalesce((p_data->>'minimum_qty')::integer,0),
    coalesce((p_data->>'unit_price')::numeric,0),
    coalesce(p_data->>'supplier',''),
    nullif(p_data->>'barcode',''),
    v_perishable,
    coalesce((p_data->>'wholesale_enabled')::boolean,false),
    coalesce((p_data->>'wholesale_price')::numeric,0),
    coalesce((p_data->>'wholesale_min_qty')::integer,10),
    coalesce((p_data->>'promotion_enabled')::boolean,false),
    coalesce((p_data->>'promotion_price')::numeric,0),
    nullif(p_data->>'promotion_starts_on','')::date,
    nullif(p_data->>'promotion_ends_on','')::date
  ) returning id into v_id;

  if p_initial_qty > 0 then
    insert into public.inventory_batches(product_id,lot_code,quantity,expires_on)
    values(v_id,v_lot,p_initial_qty,p_expiry)
    returning id into v_batch_id;
    insert into public.inventory_movements (
      product_id,product_name,sku,movement_type,quantity,note,batch_id,lot_code
    ) values(v_id,v_name,v_sku,'entrada',p_initial_qty,'Estoque inicial',v_batch_id,v_lot);
  end if;
  return v_id;
end;
$$;
revoke all on function public.nexo_create_product(jsonb,integer,text,date) from public, anon, authenticated;
grant execute on function public.nexo_create_product(jsonb,integer,text,date) to authenticated;

-- Movimento de estoque atômico, protegido contra saldos negativos e operações concorrentes.
create or replace function public.nexo_record_movement(
  p_product_id uuid,
  p_movement_type text,
  p_quantity integer,
  p_lot_code text default null,
  p_batch_id uuid default null,
  p_expires_on date default null,
  p_note text default ''
)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_product public.inventory_products%rowtype;
  v_batch public.inventory_batches%rowtype;
  v_batch_id uuid;
  v_movement_id uuid;
  v_lot text := btrim(coalesce(p_lot_code,''));
begin
  if not (select public.nexo_is_admin()) then
    raise exception 'Acesso negado: somente administradores.' using errcode = '42501';
  end if;
  if p_quantity is null or p_quantity <= 0 or p_quantity > 99999999 then
    raise exception 'Quantidade inválida.';
  end if;
  if p_movement_type not in ('entrada','saida') then
    raise exception 'Tipo de movimentação inválido.';
  end if;
  if length(coalesce(p_note,'')) > 180 then
    raise exception 'Observação muito longa.';
  end if;

  select * into v_product from public.inventory_products
  where id=p_product_id for update;
  if not found then raise exception 'Produto não encontrado.'; end if;

  if p_movement_type = 'entrada' then
    if v_lot = '' or length(v_lot) > 45 then
      raise exception 'Informe um lote válido.';
    end if;
    if v_product.is_perishable and p_expires_on is null then
      raise exception 'Informe a validade deste lote perecível.';
    end if;
    select * into v_batch from public.inventory_batches
     where product_id=p_product_id and lower(lot_code)=lower(v_lot)
     for update;
    if found then
      if v_batch.expires_on is not null and p_expires_on is not null
         and v_batch.expires_on <> p_expires_on then
        raise exception 'Este lote já possui outra data de validade.';
      end if;
      update public.inventory_batches
      set quantity=quantity+p_quantity, expires_on=coalesce(expires_on,p_expires_on)
      where id=v_batch.id returning id into v_batch_id;
      v_lot := v_batch.lot_code;
    else
      insert into public.inventory_batches (product_id,lot_code,quantity,expires_on)
      values(p_product_id,v_lot,p_quantity,p_expires_on) returning id into v_batch_id;
    end if;
    update public.inventory_products set qty=qty+p_quantity where id=p_product_id;
  else
    select * into v_batch from public.inventory_batches
    where id=p_batch_id and product_id=p_product_id for update;
    if not found then raise exception 'Lote não encontrado.'; end if;
    if v_batch.quantity < p_quantity then
      raise exception 'Saldo insuficiente neste lote.';
    end if;
    update public.inventory_batches set quantity=quantity-p_quantity where id=v_batch.id;
    update public.inventory_products set qty=qty-p_quantity where id=p_product_id;
    v_batch_id := v_batch.id;
    v_lot := v_batch.lot_code;
  end if;

  insert into public.inventory_movements (
    product_id,product_name,sku,movement_type,quantity,note,batch_id,lot_code
  ) values(p_product_id,v_product.name,v_product.sku,p_movement_type,p_quantity,coalesce(p_note,''),v_batch_id,v_lot)
  returning id into v_movement_id;
  return v_movement_id;
end;
$$;
revoke all on function public.nexo_record_movement(uuid,text,integer,text,uuid,date,text) from public, anon, authenticated;
grant execute on function public.nexo_record_movement(uuid,text,integer,text,uuid,date,text) to authenticated;

commit;

-- PASSO MANUAL SEPARADO (depois de criar o usuário em Authentication > Users):
-- Substitua o UUID abaixo pelo User UID REAL do administrador e execute sozinho:
-- insert into public.inventory_admins(user_id) values('COLE-UUID-DO-USUARIO-AQUI') on conflict do nothing;
-- NUNCA coloque chaves secretas ou senhas nos arquivos públicos do GitHub.
