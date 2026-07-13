-- AKI Store & ERP v4: marketplace UI support, customer account separation, and missing policies.
-- Safe to run after 202607130001 and 202607130002.

create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  label text not null default 'Rumah',
  recipient_name text not null,
  phone text not null,
  address_line text not null,
  city text not null,
  postal_code text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_customer_addresses_customer
  on public.customer_addresses(customer_id, is_default desc, created_at desc);

alter table public.customer_addresses enable row level security;
grant select, insert, update, delete on public.customer_addresses to authenticated;

drop policy if exists customer_addresses_owner on public.customer_addresses;
create policy customer_addresses_owner
on public.customer_addresses
for all
to authenticated
using (
  exists (
    select 1 from public.customers c
    where c.id = customer_id
      and (c.user_id = auth.uid() or private.is_staff())
  )
)
with check (
  exists (
    select 1 from public.customers c
    where c.id = customer_id
      and (c.user_id = auth.uid() or private.is_staff())
  )
);

-- Customer can safely change only the fields exposed by this RPC.
create or replace function public.update_my_customer_profile(
  p_full_name text,
  p_phone text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  if coalesce(trim(p_full_name), '') = '' then
    raise exception 'Full name is required';
  end if;
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'CUSTOMER' and is_active = true
  ) then
    raise exception 'Customer account required';
  end if;

  update public.profiles
  set full_name = trim(p_full_name), updated_at = now()
  where id = auth.uid();

  update public.customers
  set name = trim(p_full_name), phone = nullif(trim(p_phone), ''), updated_at = now()
  where user_id = auth.uid();
end;
$$;
revoke all on function public.update_my_customer_profile(text,text) from public, anon;
grant execute on function public.update_my_customer_profile(text,text) to authenticated;

-- Missing write policies for purchase orders created from the ERP UI.
drop policy if exists po_staff_insert on public.purchase_orders;
create policy po_staff_insert on public.purchase_orders
for insert to authenticated
with check (
  private.current_user_role() in ('SUPER_ADMIN','OWNER','BRANCH_MANAGER','PURCHASING')
  and private.can_access_branch(branch_id)
  and created_by = auth.uid()
);

drop policy if exists po_staff_update on public.purchase_orders;
create policy po_staff_update on public.purchase_orders
for update to authenticated
using (
  private.current_user_role() in ('SUPER_ADMIN','OWNER','BRANCH_MANAGER','PURCHASING')
  and private.can_access_branch(branch_id)
)
with check (
  private.current_user_role() in ('SUPER_ADMIN','OWNER','BRANCH_MANAGER','PURCHASING')
  and private.can_access_branch(branch_id)
);

drop policy if exists po_items_staff_insert on public.purchase_order_items;
create policy po_items_staff_insert on public.purchase_order_items
for insert to authenticated
with check (
  private.current_user_role() in ('SUPER_ADMIN','OWNER','BRANCH_MANAGER','PURCHASING')
  and exists (
    select 1 from public.purchase_orders po
    where po.id = purchase_order_id
      and private.can_access_branch(po.branch_id)
  )
);

-- Recommended marketplace fields for richer catalog presentation.
alter table public.products add column if not exists compatible_vehicles text;
alter table public.products add column if not exists terminal_layout text;
alter table public.products add column if not exists sold_count int not null default 0;
alter table public.products add column if not exists rating numeric(3,2) not null default 4.90;

-- Ensure all public storefront RPCs remain available after an upgrade.
grant execute on function public.list_store_products(text,uuid,text) to anon, authenticated;
grant execute on function public.list_store_branches() to anon, authenticated;
