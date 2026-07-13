-- AKI ERP initial schema for Supabase
-- Run this once in Supabase SQL Editor, or use Supabase CLI migrations.

create extension if not exists pgcrypto;
create schema if not exists private;

do $$ begin create type public.user_role as enum ('SUPER_ADMIN','OWNER','BRANCH_MANAGER','PURCHASING','WAREHOUSE','CASHIER','SALES','TECHNICIAN','FINANCE','AUDITOR','CUSTOMER'); exception when duplicate_object then null; end $$;
do $$ begin create type public.serial_status as enum ('AVAILABLE','RESERVED','SOLD','INSTALLED','WARRANTY_CLAIM','RETURNED','DAMAGED','EXPIRED','TRANSFERRED'); exception when duplicate_object then null; end $$;
do $$ begin create type public.payment_status as enum ('UNPAID','PARTIAL','PAID','REFUNDED'); exception when duplicate_object then null; end $$;
do $$ begin create type public.payment_method as enum ('CASH','BANK_TRANSFER','QRIS','CREDIT_CARD','DEBIT_CARD','CREDIT','OTHER'); exception when duplicate_object then null; end $$;
do $$ begin create type public.warranty_status as enum ('SUBMITTED','INSPECTION','APPROVED','REJECTED','REPLACED','CLAIMED_TO_SUPPLIER','COMPLETED'); exception when duplicate_object then null; end $$;

create table if not exists public.branches (id uuid primary key default gen_random_uuid(),code text not null unique,name text not null,address text,phone text,is_active boolean not null default true,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.warehouses (id uuid primary key default gen_random_uuid(),branch_id uuid not null references public.branches(id),code text not null unique,name text not null,is_active boolean not null default true,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.profiles (id uuid primary key references auth.users(id) on delete cascade,branch_id uuid references public.branches(id),full_name text not null,role public.user_role not null default 'CUSTOMER',is_active boolean not null default true,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.customers (id uuid primary key default gen_random_uuid(),user_id uuid unique references auth.users(id) on delete set null,branch_id uuid references public.branches(id),customer_number text not null unique default ('CUS-'||upper(substr(gen_random_uuid()::text,1,8))),name text not null,phone text,email text,address text,is_corporate boolean not null default false,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.customer_vehicles (id uuid primary key default gen_random_uuid(),customer_id uuid not null references public.customers(id) on delete cascade,plate_number text,brand text not null,model text not null,production_year int,engine text,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.product_brands (id uuid primary key default gen_random_uuid(),name text not null unique,is_active boolean not null default true,created_at timestamptz not null default now());
create table if not exists public.product_categories (id uuid primary key default gen_random_uuid(),name text not null unique,is_active boolean not null default true,created_at timestamptz not null default now());
create table if not exists public.products (id uuid primary key default gen_random_uuid(),sku text not null unique,brand_id uuid not null references public.product_brands(id),category_id uuid not null references public.product_categories(id),name text not null,voltage numeric(8,2),capacity_ah numeric(8,2),cca int,warranty_months int not null default 12,minimum_stock int not null default 5,purchase_price numeric(18,2) not null default 0,selling_price numeric(18,2) not null default 0,is_active boolean not null default true,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.product_serials (id uuid primary key default gen_random_uuid(),product_id uuid not null references public.products(id),current_warehouse_id uuid references public.warehouses(id),serial_number text not null unique,status public.serial_status not null default 'AVAILABLE',received_at timestamptz default now(),sold_at timestamptz,purchase_price numeric(18,2) not null default 0,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.suppliers (id uuid primary key default gen_random_uuid(),supplier_number text not null unique,name text not null,phone text,email text,address text,created_at timestamptz not null default now());
create table if not exists public.purchase_orders (id uuid primary key default gen_random_uuid(),po_number text not null unique,supplier_id uuid not null references public.suppliers(id),branch_id uuid not null references public.branches(id),created_by uuid not null references auth.users(id),status text not null default 'DRAFT',order_date timestamptz not null default now(),total numeric(18,2) not null default 0,created_at timestamptz not null default now());
create table if not exists public.purchase_order_items (id uuid primary key default gen_random_uuid(),purchase_order_id uuid not null references public.purchase_orders(id) on delete cascade,product_id uuid not null references public.products(id),quantity int not null check(quantity>0),unit_price numeric(18,2) not null,subtotal numeric(18,2) not null);
create table if not exists public.sales_invoices (id uuid primary key default gen_random_uuid(),invoice_number text not null unique,branch_id uuid not null references public.branches(id),customer_id uuid references public.customers(id),created_by uuid not null references auth.users(id),invoice_date timestamptz not null default now(),subtotal numeric(18,2) not null default 0,trade_in_discount numeric(18,2) not null default 0,installation_fee numeric(18,2) not null default 0,total numeric(18,2) not null default 0,paid_amount numeric(18,2) not null default 0,payment_status public.payment_status not null default 'UNPAID',created_at timestamptz not null default now());
create table if not exists public.sales_invoice_items (id uuid primary key default gen_random_uuid(),sales_invoice_id uuid not null references public.sales_invoices(id) on delete cascade,product_id uuid not null references public.products(id),serial_id uuid not null unique references public.product_serials(id),quantity int not null default 1,unit_price numeric(18,2) not null,subtotal numeric(18,2) not null);
create table if not exists public.sales_payments (id uuid primary key default gen_random_uuid(),sales_invoice_id uuid not null references public.sales_invoices(id) on delete cascade,payment_method public.payment_method not null,amount numeric(18,2) not null check(amount>=0),payment_date timestamptz not null default now());
create table if not exists public.stock_movements (id uuid primary key default gen_random_uuid(),product_serial_id uuid not null references public.product_serials(id),from_warehouse_id uuid references public.warehouses(id),to_warehouse_id uuid references public.warehouses(id),created_by uuid not null references auth.users(id),movement_type text not null,reference_type text,reference_id uuid,movement_at timestamptz not null default now());
create table if not exists public.used_batteries (id uuid primary key default gen_random_uuid(),sales_invoice_id uuid references public.sales_invoices(id),customer_id uuid references public.customers(id),branch_id uuid not null references public.branches(id),trade_in_value numeric(18,2) not null default 0,status text not null default 'COLLECTED',created_at timestamptz not null default now());
create table if not exists public.installations (id uuid primary key default gen_random_uuid(),sales_invoice_id uuid not null references public.sales_invoices(id),customer_id uuid references public.customers(id),vehicle_id uuid references public.customer_vehicles(id),serial_id uuid not null references public.product_serials(id),technician_id uuid references auth.users(id),installed_at timestamptz not null default now(),voltage_before numeric(8,2),voltage_after numeric(8,2),charging_voltage numeric(8,2),notes text);
create table if not exists public.warranty_claims (id uuid primary key default gen_random_uuid(),claim_number text not null unique default ('CLM-'||upper(substr(gen_random_uuid()::text,1,8))),customer_id uuid not null references public.customers(id),serial_id uuid not null references public.product_serials(id),status public.warranty_status not null default 'SUBMITTED',complaint text not null,test_result text,submitted_at timestamptz not null default now(),completed_at timestamptz);

create index if not exists idx_profiles_branch on public.profiles(branch_id);
create index if not exists idx_customers_user on public.customers(user_id);
create index if not exists idx_serial_status_warehouse on public.product_serials(status,current_warehouse_id);
create index if not exists idx_invoice_branch_date on public.sales_invoices(branch_id,invoice_date desc);

create or replace function private.current_user_role() returns public.user_role language sql stable security definer set search_path=public,auth,pg_temp as $$ select role from public.profiles where id=auth.uid() and is_active=true $$;
create or replace function private.current_branch_id() returns uuid language sql stable security definer set search_path=public,auth,pg_temp as $$ select branch_id from public.profiles where id=auth.uid() and is_active=true $$;
create or replace function private.is_staff() returns boolean language sql stable security definer set search_path=public,auth,pg_temp as $$ select coalesce(private.current_user_role() <> 'CUSTOMER',false) $$;
create or replace function private.can_access_branch(target uuid) returns boolean language sql stable security definer set search_path=public,auth,pg_temp as $$ select case when private.current_user_role() in ('SUPER_ADMIN','OWNER') then true else target=private.current_branch_id() end $$;

revoke all on schema private from public,anon;
grant usage on schema private to authenticated;
revoke all on function private.current_user_role() from public,anon;
revoke all on function private.current_branch_id() from public,anon;
revoke all on function private.is_staff() from public,anon;
revoke all on function private.can_access_branch(uuid) from public,anon;
grant execute on function private.current_user_role() to authenticated;
grant execute on function private.current_branch_id() to authenticated;
grant execute on function private.is_staff() to authenticated;
grant execute on function private.can_access_branch(uuid) to authenticated;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public,auth,pg_temp as $$ begin insert into public.profiles(id,full_name,role) values(new.id,coalesce(nullif(new.raw_user_meta_data->>'full_name',''),split_part(new.email,'@',1)),'CUSTOMER') on conflict(id) do nothing; insert into public.customers(user_id,name,email) values(new.id,coalesce(nullif(new.raw_user_meta_data->>'full_name',''),split_part(new.email,'@',1)),new.email) on conflict(user_id) do nothing; return new; end $$;
revoke all on function public.handle_new_user() from public,anon,authenticated;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.create_battery_sale(p_customer_id uuid,p_serial_id uuid,p_payment_method public.payment_method,p_paid_amount numeric,p_installation_fee numeric default 0,p_trade_in_value numeric default 0) returns uuid language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare v_serial public.product_serials%rowtype;v_product public.products%rowtype;v_branch uuid;v_invoice uuid;v_total numeric;v_status public.payment_status;v_number text;begin
 if auth.uid() is null or private.current_user_role() not in ('SUPER_ADMIN','OWNER','BRANCH_MANAGER','CASHIER','SALES') then raise exception 'Not authorized to create sales'; end if;
 select * into v_serial from public.product_serials where id=p_serial_id for update;
 if not found then raise exception 'Serial not found'; end if;
 if v_serial.status<>'AVAILABLE' then raise exception 'Serial % is not available',v_serial.serial_number; end if;
 select * into v_product from public.products where id=v_serial.product_id;
 select branch_id into v_branch from public.warehouses where id=v_serial.current_warehouse_id;
 if not private.can_access_branch(v_branch) then raise exception 'Serial belongs to another branch'; end if;
 if p_customer_id is not null and not exists(select 1 from public.customers c where c.id=p_customer_id and (c.branch_id is null or private.can_access_branch(c.branch_id))) then raise exception 'Customer not accessible'; end if;
 v_total:=greatest(v_product.selling_price+coalesce(p_installation_fee,0)-coalesce(p_trade_in_value,0),0);
 v_status:=case when coalesce(p_paid_amount,0)>=v_total then 'PAID'::public.payment_status when coalesce(p_paid_amount,0)>0 then 'PARTIAL'::public.payment_status else 'UNPAID'::public.payment_status end;
 v_number:='INV-'||to_char(clock_timestamp(),'YYYYMMDD-HH24MISS')||'-'||upper(substr(gen_random_uuid()::text,1,4));
 insert into public.sales_invoices(invoice_number,branch_id,customer_id,created_by,subtotal,trade_in_discount,installation_fee,total,paid_amount,payment_status) values(v_number,v_branch,p_customer_id,auth.uid(),v_product.selling_price,coalesce(p_trade_in_value,0),coalesce(p_installation_fee,0),v_total,coalesce(p_paid_amount,0),v_status) returning id into v_invoice;
 insert into public.sales_invoice_items(sales_invoice_id,product_id,serial_id,unit_price,subtotal) values(v_invoice,v_product.id,v_serial.id,v_product.selling_price,v_product.selling_price);
 if coalesce(p_paid_amount,0)>0 then insert into public.sales_payments(sales_invoice_id,payment_method,amount) values(v_invoice,p_payment_method,p_paid_amount); end if;
 if coalesce(p_trade_in_value,0)>0 then insert into public.used_batteries(sales_invoice_id,customer_id,branch_id,trade_in_value) values(v_invoice,p_customer_id,v_branch,p_trade_in_value); end if;
 update public.product_serials set status='SOLD',sold_at=now(),current_warehouse_id=null,updated_at=now() where id=v_serial.id;
 insert into public.stock_movements(product_serial_id,from_warehouse_id,created_by,movement_type,reference_type,reference_id) values(v_serial.id,v_serial.current_warehouse_id,auth.uid(),'SALE_OUT','SALES_INVOICE',v_invoice);
 return v_invoice;
end $$;
revoke all on function public.create_battery_sale(uuid,uuid,public.payment_method,numeric,numeric,numeric) from public,anon;
grant execute on function public.create_battery_sale(uuid,uuid,public.payment_method,numeric,numeric,numeric) to authenticated;

alter table public.branches enable row level security;alter table public.warehouses enable row level security;alter table public.profiles enable row level security;alter table public.customers enable row level security;alter table public.customer_vehicles enable row level security;alter table public.product_brands enable row level security;alter table public.product_categories enable row level security;alter table public.products enable row level security;alter table public.product_serials enable row level security;alter table public.suppliers enable row level security;alter table public.purchase_orders enable row level security;alter table public.purchase_order_items enable row level security;alter table public.sales_invoices enable row level security;alter table public.sales_invoice_items enable row level security;alter table public.sales_payments enable row level security;alter table public.stock_movements enable row level security;alter table public.used_batteries enable row level security;alter table public.installations enable row level security;alter table public.warranty_claims enable row level security;

grant select,insert,update,delete on all tables in schema public to authenticated;

create policy branches_read on public.branches for select to authenticated using(is_active=true);
create policy warehouses_read on public.warehouses for select to authenticated using(is_active=true and (private.is_staff() is false or private.can_access_branch(branch_id)));
create policy profiles_self_read on public.profiles for select to authenticated using(id=auth.uid() or (private.is_staff() and (private.current_user_role() in ('SUPER_ADMIN','OWNER') or branch_id=private.current_branch_id())));
create policy profiles_staff_update on public.profiles for update to authenticated using(private.current_user_role() in ('SUPER_ADMIN','OWNER','BRANCH_MANAGER')) with check(private.current_user_role() in ('SUPER_ADMIN','OWNER','BRANCH_MANAGER'));
create policy products_read on public.products for select to authenticated using(is_active=true);
create policy brands_read on public.product_brands for select to authenticated using(is_active=true);
create policy categories_read on public.product_categories for select to authenticated using(is_active=true);
create policy products_staff_write on public.products for all to authenticated using(private.current_user_role() in ('SUPER_ADMIN','OWNER','BRANCH_MANAGER','PURCHASING','WAREHOUSE')) with check(private.current_user_role() in ('SUPER_ADMIN','OWNER','BRANCH_MANAGER','PURCHASING','WAREHOUSE'));
create policy customers_access on public.customers for select to authenticated using(user_id=auth.uid() or (private.is_staff() and (branch_id is null or private.can_access_branch(branch_id))));
create policy customers_self_update on public.customers for update to authenticated using(user_id=auth.uid() or private.is_staff()) with check(user_id=auth.uid() or private.is_staff());
create policy customers_staff_insert on public.customers for insert to authenticated with check(private.is_staff() and (branch_id is null or private.can_access_branch(branch_id)));
create policy vehicles_access on public.customer_vehicles for select to authenticated using(exists(select 1 from public.customers c where c.id=customer_id and (c.user_id=auth.uid() or private.is_staff())));
create policy vehicles_write on public.customer_vehicles for all to authenticated using(exists(select 1 from public.customers c where c.id=customer_id and (c.user_id=auth.uid() or private.is_staff()))) with check(exists(select 1 from public.customers c where c.id=customer_id and (c.user_id=auth.uid() or private.is_staff())));
create policy serials_staff_read on public.product_serials for select to authenticated using(private.is_staff() and exists(select 1 from public.warehouses w where w.id=current_warehouse_id and private.can_access_branch(w.branch_id)) or exists(select 1 from public.sales_invoice_items i join public.sales_invoices si on si.id=i.sales_invoice_id join public.customers c on c.id=si.customer_id where i.serial_id=product_serials.id and c.user_id=auth.uid()));
create policy suppliers_staff on public.suppliers for select to authenticated using(private.is_staff());
create policy po_staff on public.purchase_orders for select to authenticated using(private.is_staff() and private.can_access_branch(branch_id));
create policy po_items_staff on public.purchase_order_items for select to authenticated using(private.is_staff() and exists(select 1 from public.purchase_orders po where po.id=purchase_order_id and private.can_access_branch(po.branch_id)));
create policy invoices_access on public.sales_invoices for select to authenticated using(private.can_access_branch(branch_id) and private.is_staff() or exists(select 1 from public.customers c where c.id=customer_id and c.user_id=auth.uid()));
create policy invoice_items_access on public.sales_invoice_items for select to authenticated using(exists(select 1 from public.sales_invoices si where si.id=sales_invoice_id and (private.is_staff() and private.can_access_branch(si.branch_id) or exists(select 1 from public.customers c where c.id=si.customer_id and c.user_id=auth.uid()))));
create policy payments_access on public.sales_payments for select to authenticated using(exists(select 1 from public.sales_invoices si where si.id=sales_invoice_id and (private.is_staff() and private.can_access_branch(si.branch_id) or exists(select 1 from public.customers c where c.id=si.customer_id and c.user_id=auth.uid()))));
create policy movements_staff on public.stock_movements for select to authenticated using(private.is_staff());
create policy used_battery_access on public.used_batteries for select to authenticated using(private.is_staff() and private.can_access_branch(branch_id) or exists(select 1 from public.customers c where c.id=customer_id and c.user_id=auth.uid()));
create policy installations_access on public.installations for select to authenticated using(private.is_staff() or customer_id in(select id from public.customers where user_id=auth.uid()));
create policy warranty_access on public.warranty_claims for select to authenticated using(private.is_staff() or customer_id in(select id from public.customers where user_id=auth.uid()));
-- AKI ERP ecommerce integration
-- Safe to run after 202607130001_initial_schema.sql.
-- Existing ERP tables remain the source of truth for inventory and invoices.

create extension if not exists pgcrypto;
create schema if not exists private;

do $$ begin
  create type public.order_status as enum (
    'PENDING_PAYMENT','PAID','PROCESSING','READY_FOR_PICKUP',
    'OUT_FOR_DELIVERY','INSTALLATION_SCHEDULED','INSTALLED',
    'COMPLETED','CANCELLED','EXPIRED','REFUNDED'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.fulfillment_type as enum ('PICKUP','DELIVERY','DELIVERY_INSTALLATION');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.online_payment_method as enum ('BANK_TRANSFER','QRIS','COD','PAY_AT_STORE');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.installation_job_status as enum ('SCHEDULED','ASSIGNED','ON_THE_WAY','IN_PROGRESS','COMPLETED','CANCELLED');
exception when duplicate_object then null; end $$;

alter table public.products add column if not exists slug text;
alter table public.products add column if not exists description text;
alter table public.products add column if not exists image_url text;
alter table public.products add column if not exists is_featured boolean not null default false;
alter table public.sales_invoices add column if not exists shipping_fee numeric(18,2) not null default 0;
alter table public.sales_invoice_items add column if not exists product_name text;
alter table public.sales_invoice_items add column if not exists sku text;
alter table public.sales_invoice_items add column if not exists serial_number text;

update public.sales_invoice_items sii
set product_name = coalesce(sii.product_name,p.name),
    sku = coalesce(sii.sku,p.sku),
    serial_number = coalesce(sii.serial_number,ps.serial_number)
from public.products p, public.product_serials ps
where p.id=sii.product_id and ps.id=sii.serial_id
  and (sii.product_name is null or sii.sku is null or sii.serial_number is null);

create or replace function public.fill_sales_invoice_item_snapshot()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select p.name,p.sku into new.product_name,new.sku from public.products p where p.id=new.product_id;
  select ps.serial_number into new.serial_number from public.product_serials ps where ps.id=new.serial_id;
  return new;
end;
$$;
revoke all on function public.fill_sales_invoice_item_snapshot() from public,anon,authenticated;
drop trigger if exists before_sales_invoice_item_snapshot on public.sales_invoice_items;
create trigger before_sales_invoice_item_snapshot
before insert or update of product_id,serial_id on public.sales_invoice_items
for each row execute function public.fill_sales_invoice_item_snapshot();

update public.products
set slug = lower(regexp_replace(trim(name || '-' || sku), '[^a-zA-Z0-9]+', '-', 'g'))
where slug is null;

create unique index if not exists idx_products_slug on public.products(slug) where slug is not null;

create table if not exists public.commerce_settings (
  id boolean primary key default true check (id),
  delivery_fee numeric(18,2) not null default 40000,
  installation_fee numeric(18,2) not null default 50000,
  reservation_minutes int not null default 30 check (reservation_minutes between 5 and 1440),
  updated_at timestamptz not null default now()
);

insert into public.commerce_settings(id) values(true) on conflict(id) do nothing;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid not null references public.customers(id),
  branch_id uuid not null references public.branches(id),
  vehicle_id uuid references public.customer_vehicles(id),
  status public.order_status not null default 'PENDING_PAYMENT',
  payment_status public.payment_status not null default 'UNPAID',
  payment_method public.online_payment_method not null,
  fulfillment_type public.fulfillment_type not null,
  contact_name text not null,
  phone text not null,
  delivery_address text,
  scheduled_at timestamptz,
  subtotal numeric(18,2) not null default 0,
  shipping_fee numeric(18,2) not null default 0,
  installation_fee numeric(18,2) not null default 0,
  trade_in_requested boolean not null default false,
  trade_in_value numeric(18,2) not null default 0,
  total numeric(18,2) not null default 0,
  payment_reference text,
  payment_proof_url text,
  expires_at timestamptz,
  sales_invoice_id uuid unique references public.sales_invoices(id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  product_name text not null,
  sku text not null,
  quantity int not null check(quantity > 0 and quantity <= 20),
  unit_price numeric(18,2) not null check(unit_price >= 0),
  subtotal numeric(18,2) not null check(subtotal >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.order_item_serials (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  serial_id uuid not null unique references public.product_serials(id),
  source_warehouse_id uuid references public.warehouses(id),
  assigned_at timestamptz not null default now()
);

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status public.order_status not null,
  note text,
  changed_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null default 'MANUAL',
  provider_reference text,
  amount numeric(18,2) not null check(amount >= 0),
  status public.payment_status not null default 'UNPAID',
  payload jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.installation_jobs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  order_item_serial_id uuid not null references public.order_item_serials(id),
  customer_id uuid not null references public.customers(id),
  vehicle_id uuid references public.customer_vehicles(id),
  technician_id uuid references auth.users(id),
  status public.installation_job_status not null default 'SCHEDULED',
  scheduled_at timestamptz,
  completed_at timestamptz,
  delivery_address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(order_item_serial_id)
);

create table if not exists public.product_warranties (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id),
  sales_invoice_id uuid not null references public.sales_invoices(id),
  customer_id uuid not null references public.customers(id),
  serial_id uuid not null unique references public.product_serials(id),
  start_date date not null,
  end_date date not null,
  status text not null default 'ACTIVE',
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_customer_created on public.orders(customer_id, created_at desc);
create index if not exists idx_orders_branch_status on public.orders(branch_id, status, created_at desc);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_order_serials_item on public.order_item_serials(order_item_id);
create index if not exists idx_order_history_order on public.order_status_history(order_id, created_at);
create index if not exists idx_payment_order on public.payment_transactions(order_id, created_at desc);
create index if not exists idx_install_jobs_status on public.installation_jobs(status, scheduled_at);
create index if not exists idx_warranties_customer on public.product_warranties(customer_id, end_date desc);

-- Public-safe storefront data. Purchase price and serial numbers are never returned.
create or replace function public.list_store_products(
  p_search text default null,
  p_product_id uuid default null,
  p_slug text default null
)
returns table (
  id uuid,
  slug text,
  sku text,
  name text,
  description text,
  image_url text,
  brand_name text,
  category_name text,
  voltage numeric,
  capacity_ah numeric,
  cca int,
  warranty_months int,
  selling_price numeric,
  is_featured boolean,
  stock_available bigint,
  branch_stock jsonb
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    p.id,
    p.slug,
    p.sku,
    p.name,
    p.description,
    p.image_url,
    b.name as brand_name,
    c.name as category_name,
    p.voltage,
    p.capacity_ah,
    p.cca,
    p.warranty_months,
    p.selling_price,
    p.is_featured,
    (select count(*)
       from public.product_serials ps
      where ps.product_id = p.id and ps.status = 'AVAILABLE') as stock_available,
    coalesce((
      select jsonb_agg(jsonb_build_object(
        'branch_id', stock.branch_id,
        'branch_name', stock.branch_name,
        'stock', stock.stock
      ) order by stock.branch_name)
      from (
        select br.id as branch_id, br.name as branch_name, count(ps.id)::int as stock
          from public.branches br
          join public.warehouses w on w.branch_id = br.id and w.is_active = true
          left join public.product_serials ps
            on ps.current_warehouse_id = w.id
           and ps.product_id = p.id
           and ps.status = 'AVAILABLE'
         where br.is_active = true
         group by br.id, br.name
        having count(ps.id) > 0
      ) stock
    ), '[]'::jsonb) as branch_stock
  from public.products p
  join public.product_brands b on b.id = p.brand_id
  join public.product_categories c on c.id = p.category_id
  where p.is_active = true
    and (p_product_id is null or p.id = p_product_id)
    and (p_slug is null or p.slug = p_slug)
    and (
      p_search is null or trim(p_search) = '' or
      p.name ilike '%' || p_search || '%' or
      p.sku ilike '%' || p_search || '%' or
      b.name ilike '%' || p_search || '%' or
      c.name ilike '%' || p_search || '%'
    )
  order by p.is_featured desc, p.name;
$$;

revoke all on function public.list_store_products(text,uuid,text) from public;
grant execute on function public.list_store_products(text,uuid,text) to anon, authenticated;

create or replace function public.list_store_branches()
returns table(id uuid, code text, name text, address text, phone text)
language sql
stable
security definer
set search_path = ''
as $$
  select b.id, b.code, b.name, b.address, b.phone
    from public.branches b
   where b.is_active = true
   order by b.name;
$$;

revoke all on function public.list_store_branches() from public;
grant execute on function public.list_store_branches() to anon, authenticated;

-- Reserve inventory and create an ecommerce order atomically.
create or replace function public.create_ecommerce_order(
  p_branch_id uuid,
  p_items jsonb,
  p_fulfillment_type public.fulfillment_type,
  p_payment_method public.online_payment_method,
  p_contact_name text,
  p_phone text,
  p_delivery_address text default null,
  p_vehicle_id uuid default null,
  p_scheduled_at timestamptz default null,
  p_trade_in_requested boolean default false,
  p_notes text default null
)
returns table(order_id uuid, order_number text, total numeric)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_customer public.customers%rowtype;
  v_settings public.commerce_settings%rowtype;
  v_order_id uuid;
  v_order_number text;
  v_item record;
  v_product public.products%rowtype;
  v_order_item_id uuid;
  v_serial record;
  v_reserved int;
  v_subtotal numeric := 0;
  v_shipping_fee numeric := 0;
  v_installation_fee numeric := 0;
  v_total numeric := 0;
  v_status public.order_status := 'PENDING_PAYMENT';
begin
  if v_user_id is null then
    raise exception 'Login is required before checkout';
  end if;

  select * into v_customer
    from public.customers
   where user_id = v_user_id;

  if not found then
    raise exception 'Customer profile not found';
  end if;

  if not exists(select 1 from public.branches where id = p_branch_id and is_active = true) then
    raise exception 'Selected branch is not available';
  end if;

  if coalesce(trim(p_contact_name),'') = '' or coalesce(trim(p_phone),'') = '' then
    raise exception 'Contact name and phone are required';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Cart is empty';
  end if;

  if p_fulfillment_type <> 'PICKUP' and coalesce(trim(p_delivery_address),'') = '' then
    raise exception 'Delivery address is required';
  end if;

  if p_vehicle_id is not null and not exists(
    select 1 from public.customer_vehicles
     where id = p_vehicle_id and customer_id = v_customer.id
  ) then
    raise exception 'Vehicle is not owned by this customer';
  end if;

  select * into v_settings from public.commerce_settings where id = true;
  v_shipping_fee := case when p_fulfillment_type = 'PICKUP' then 0 else v_settings.delivery_fee end;
  v_installation_fee := case when p_fulfillment_type = 'DELIVERY_INSTALLATION' then v_settings.installation_fee else 0 end;
  v_status := case when p_payment_method in ('COD','PAY_AT_STORE') then 'PROCESSING'::public.order_status else 'PENDING_PAYMENT'::public.order_status end;
  v_order_number := 'ORD-' || to_char(clock_timestamp(),'YYYYMMDD-HH24MISS') || '-' || upper(substr(gen_random_uuid()::text,1,4));

  insert into public.orders(
    order_number, customer_id, branch_id, vehicle_id, status,
    payment_status, payment_method, fulfillment_type,
    contact_name, phone, delivery_address, scheduled_at,
    trade_in_requested, notes, expires_at
  ) values (
    v_order_number, v_customer.id, p_branch_id, p_vehicle_id, v_status,
    'UNPAID', p_payment_method, p_fulfillment_type,
    trim(p_contact_name), trim(p_phone), nullif(trim(p_delivery_address),''), p_scheduled_at,
    coalesce(p_trade_in_requested,false), p_notes,
    case when p_payment_method in ('BANK_TRANSFER','QRIS')
      then now() + make_interval(mins => v_settings.reservation_minutes)
      else null end
  ) returning id into v_order_id;

  for v_item in
    select * from jsonb_to_recordset(p_items) as x(product_id uuid, quantity int)
  loop
    if v_item.quantity is null or v_item.quantity < 1 or v_item.quantity > 5 then
      raise exception 'Quantity must be between 1 and 5';
    end if;

    select * into v_product
      from public.products
     where id = v_item.product_id and is_active = true;

    if not found then
      raise exception 'Product % is not available', v_item.product_id;
    end if;

    insert into public.order_items(order_id, product_id, product_name, sku, quantity, unit_price, subtotal)
    values(v_order_id, v_product.id, v_product.name, v_product.sku, v_item.quantity, v_product.selling_price, v_product.selling_price * v_item.quantity)
    returning id into v_order_item_id;

    v_reserved := 0;
    for v_serial in
      select ps.id, ps.current_warehouse_id
        from public.product_serials ps
        join public.warehouses w on w.id = ps.current_warehouse_id
       where ps.product_id = v_product.id
         and ps.status = 'AVAILABLE'
         and w.branch_id = p_branch_id
         and w.is_active = true
       order by ps.received_at nulls last, ps.created_at
       for update of ps skip locked
       limit v_item.quantity
    loop
      update public.product_serials
         set status = 'RESERVED', updated_at = now()
       where id = v_serial.id and status = 'AVAILABLE';

      if found then
        insert into public.order_item_serials(order_item_id, serial_id, source_warehouse_id)
        values(v_order_item_id, v_serial.id, v_serial.current_warehouse_id);
        v_reserved := v_reserved + 1;
      end if;
    end loop;

    if v_reserved <> v_item.quantity then
      raise exception 'Insufficient stock for product % at selected branch', v_product.name;
    end if;

    v_subtotal := v_subtotal + (v_product.selling_price * v_item.quantity);
  end loop;

  v_total := greatest(v_subtotal + v_shipping_fee + v_installation_fee, 0);

  update public.orders
     set subtotal = v_subtotal,
         shipping_fee = v_shipping_fee,
         installation_fee = v_installation_fee,
         total = v_total,
         updated_at = now()
   where id = v_order_id;

  insert into public.order_status_history(order_id, status, note, changed_by)
  values(v_order_id, v_status, 'Order dibuat dan stok berhasil direservasi', v_user_id);

  return query select v_order_id, v_order_number, v_total;
end;
$$;

revoke all on function public.create_ecommerce_order(uuid,jsonb,public.fulfillment_type,public.online_payment_method,text,text,text,uuid,timestamptz,boolean,text) from public, anon;
grant execute on function public.create_ecommerce_order(uuid,jsonb,public.fulfillment_type,public.online_payment_method,text,text,text,uuid,timestamptz,boolean,text) to authenticated;

create or replace function private.release_order_reservations(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.product_serials ps
     set status = 'AVAILABLE', updated_at = now()
   where ps.id in (
     select ois.serial_id
       from public.order_item_serials ois
       join public.order_items oi on oi.id = ois.order_item_id
      where oi.order_id = p_order_id
   ) and ps.status = 'RESERVED';
end;
$$;

revoke all on function private.release_order_reservations(uuid) from public, anon, authenticated;

create or replace function public.cancel_my_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
begin
  select o.* into v_order
    from public.orders o
    join public.customers c on c.id = o.customer_id
   where o.id = p_order_id and c.user_id = auth.uid()
   for update of o;

  if not found then raise exception 'Order not found'; end if;
  if v_order.payment_status = 'PAID' then raise exception 'Paid order cannot be cancelled from customer portal'; end if;
  if v_order.status in ('CANCELLED','EXPIRED') then return; end if;
  if v_order.status not in ('PENDING_PAYMENT','PROCESSING') then raise exception 'Order is already being fulfilled and cannot be cancelled'; end if;

  perform private.release_order_reservations(p_order_id);
  update public.orders set status = 'CANCELLED', updated_at = now() where id = p_order_id;
  insert into public.order_status_history(order_id,status,note,changed_by)
  values(p_order_id,'CANCELLED','Dibatalkan oleh pelanggan',auth.uid());
end;
$$;

revoke all on function public.cancel_my_order(uuid) from public, anon;
grant execute on function public.cancel_my_order(uuid) to authenticated;

-- Internal finalizer used by staff approval and payment webhooks.
create or replace function private.finalize_ecommerce_order(
  p_order_id uuid,
  p_actor_id uuid,
  p_provider text,
  p_provider_reference text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_customer public.customers%rowtype;
  v_invoice_id uuid;
  v_invoice_number text;
  v_created_by uuid;
  v_line record;
  v_warranty_months int;
  v_payment_method public.payment_method;
  v_new_status public.order_status;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'Order not found'; end if;

  if v_order.payment_status = 'PAID' and v_order.sales_invoice_id is not null then
    return v_order.sales_invoice_id;
  end if;

  if v_order.status in ('CANCELLED','EXPIRED','REFUNDED') then
    raise exception 'Order cannot be paid in status %', v_order.status;
  end if;

  select * into v_customer from public.customers where id = v_order.customer_id;
  v_created_by := coalesce(p_actor_id, v_customer.user_id);
  if v_created_by is null then raise exception 'Unable to determine invoice creator'; end if;

  v_payment_method := case v_order.payment_method
    when 'BANK_TRANSFER' then 'BANK_TRANSFER'::public.payment_method
    when 'QRIS' then 'QRIS'::public.payment_method
    else 'CASH'::public.payment_method
  end;

  v_invoice_number := 'INV-ONL-' || to_char(clock_timestamp(),'YYYYMMDD-HH24MISS') || '-' || upper(substr(gen_random_uuid()::text,1,4));

  insert into public.sales_invoices(
    invoice_number, branch_id, customer_id, created_by,
    subtotal, trade_in_discount, installation_fee, shipping_fee,
    total, paid_amount, payment_status
  ) values (
    v_invoice_number, v_order.branch_id, v_order.customer_id, v_created_by,
    v_order.subtotal, v_order.trade_in_value, v_order.installation_fee, v_order.shipping_fee,
    v_order.total, v_order.total, 'PAID'
  ) returning id into v_invoice_id;

  for v_line in
    select
      oi.product_id,
      oi.unit_price,
      oi.id as order_item_id,
      ois.id as order_item_serial_id,
      ois.serial_id,
      ois.source_warehouse_id,
      p.warranty_months
    from public.order_items oi
    join public.order_item_serials ois on ois.order_item_id = oi.id
    join public.products p on p.id = oi.product_id
    where oi.order_id = p_order_id
    order by oi.created_at, ois.assigned_at
  loop
    insert into public.sales_invoice_items(
      sales_invoice_id, product_id, serial_id, product_name, sku, serial_number, quantity, unit_price, subtotal
    ) values (
      v_invoice_id, v_line.product_id, v_line.serial_id,
      (select name from public.products where id=v_line.product_id),
      (select sku from public.products where id=v_line.product_id),
      (select serial_number from public.product_serials where id=v_line.serial_id),
      1, v_line.unit_price, v_line.unit_price
    );

    update public.product_serials
       set status = 'SOLD', sold_at = now(), current_warehouse_id = null, updated_at = now()
     where id = v_line.serial_id and status = 'RESERVED';

    if not found then
      raise exception 'Reserved serial is no longer available';
    end if;

    insert into public.stock_movements(
      product_serial_id, from_warehouse_id, created_by,
      movement_type, reference_type, reference_id
    ) values (
      v_line.serial_id, v_line.source_warehouse_id, v_created_by,
      'SALE_OUT', 'ECOMMERCE_ORDER', p_order_id
    );

    insert into public.product_warranties(
      order_id, sales_invoice_id, customer_id, serial_id, start_date, end_date
    ) values (
      p_order_id, v_invoice_id, v_order.customer_id, v_line.serial_id,
      current_date, (current_date + make_interval(months => v_line.warranty_months))::date
    ) on conflict(serial_id) do nothing;

    if v_order.fulfillment_type = 'DELIVERY_INSTALLATION' then
      insert into public.installation_jobs(
        order_id, order_item_serial_id, customer_id, vehicle_id,
        status, scheduled_at, delivery_address
      ) values (
        p_order_id, v_line.order_item_serial_id, v_order.customer_id, v_order.vehicle_id,
        'SCHEDULED', v_order.scheduled_at, v_order.delivery_address
      ) on conflict(order_item_serial_id) do nothing;
    end if;
  end loop;

  insert into public.sales_payments(sales_invoice_id,payment_method,amount)
  values(v_invoice_id,v_payment_method,v_order.total);

  insert into public.payment_transactions(
    order_id, provider, provider_reference, amount, status, paid_at
  ) values (
    p_order_id, coalesce(nullif(p_provider,''),'MANUAL'), p_provider_reference,
    v_order.total, 'PAID', now()
  );

  if v_order.trade_in_requested then
    insert into public.used_batteries(
      sales_invoice_id, customer_id, branch_id, trade_in_value, status
    ) values (
      v_invoice_id, v_order.customer_id, v_order.branch_id, v_order.trade_in_value, 'PENDING_ASSESSMENT'
    );
  end if;

  v_new_status := case
    when v_order.status in ('READY_FOR_PICKUP','OUT_FOR_DELIVERY','INSTALLATION_SCHEDULED','INSTALLED','COMPLETED') then v_order.status
    else 'PROCESSING'::public.order_status
  end;

  update public.orders
     set status = v_new_status,
         payment_status = 'PAID',
         payment_reference = p_provider_reference,
         sales_invoice_id = v_invoice_id,
         updated_at = now()
   where id = p_order_id;

  insert into public.order_status_history(order_id,status,note,changed_by)
  values(p_order_id,v_new_status,'Pembayaran diterima; invoice dan pengeluaran stok dibuat otomatis',p_actor_id);

  return v_invoice_id;
end;
$$;

revoke all on function private.finalize_ecommerce_order(uuid,uuid,text,text) from public, anon, authenticated;

create or replace function public.staff_mark_order_paid(
  p_order_id uuid,
  p_provider_reference text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_branch_id uuid;
begin
  if auth.uid() is null or private.current_user_role() not in ('SUPER_ADMIN','OWNER','BRANCH_MANAGER','CASHIER','FINANCE') then
    raise exception 'Not authorized to approve payments';
  end if;

  select branch_id into v_branch_id from public.orders where id = p_order_id;
  if v_branch_id is null or not private.can_access_branch(v_branch_id) then
    raise exception 'Order is outside your branch access';
  end if;

  return private.finalize_ecommerce_order(p_order_id, auth.uid(), 'MANUAL', p_provider_reference);
end;
$$;

revoke all on function public.staff_mark_order_paid(uuid,text) from public, anon;
grant execute on function public.staff_mark_order_paid(uuid,text) to authenticated;

-- Server-only RPC. Call this from a verified payment webhook using Supabase secret/service key.
create or replace function public.finalize_ecommerce_order_service(
  p_order_id uuid,
  p_provider text,
  p_provider_reference text
)
returns uuid
language sql
security definer
set search_path = ''
as $$
  select private.finalize_ecommerce_order(p_order_id, null, p_provider, p_provider_reference);
$$;

revoke all on function public.finalize_ecommerce_order_service(uuid,text,text) from public, anon, authenticated;
grant execute on function public.finalize_ecommerce_order_service(uuid,text,text) to service_role;

create or replace function public.staff_update_order_status(
  p_order_id uuid,
  p_status public.order_status,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
begin
  if auth.uid() is null or private.current_user_role() not in ('SUPER_ADMIN','OWNER','BRANCH_MANAGER','WAREHOUSE','CASHIER','SALES','TECHNICIAN') then
    raise exception 'Not authorized to update orders';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'Order not found'; end if;
  if not private.can_access_branch(v_order.branch_id) then raise exception 'Order is outside your branch access'; end if;

  if p_status = 'CANCELLED' then
    if v_order.payment_status = 'PAID' then raise exception 'Use refund flow for paid orders'; end if;
    perform private.release_order_reservations(p_order_id);
  end if;

  if v_order.payment_status <> 'PAID' then
    if v_order.payment_method = 'PAY_AT_STORE' and p_status not in ('PROCESSING','READY_FOR_PICKUP','CANCELLED') then
      raise exception 'Pay-at-store order must be paid before this status';
    elsif v_order.payment_method = 'COD' and p_status not in ('PROCESSING','OUT_FOR_DELIVERY','INSTALLATION_SCHEDULED','CANCELLED') then
      raise exception 'COD order must be paid before this status';
    elsif v_order.payment_method not in ('COD','PAY_AT_STORE') and p_status not in ('PROCESSING','CANCELLED') then
      raise exception 'Payment must be confirmed before this status';
    end if;
  end if;

  update public.orders set status = p_status, updated_at = now() where id = p_order_id;

  if p_status = 'INSTALLATION_SCHEDULED' then
    update public.installation_jobs set status='SCHEDULED',updated_at=now() where order_id=p_order_id;
  elsif p_status = 'INSTALLED' then
    update public.installation_jobs set status='COMPLETED',completed_at=now(),updated_at=now() where order_id=p_order_id;
    update public.product_serials ps set status='INSTALLED',updated_at=now()
     where ps.id in (
       select ois.serial_id from public.order_item_serials ois
       join public.order_items oi on oi.id=ois.order_item_id
       where oi.order_id=p_order_id
     ) and ps.status='SOLD';
  end if;

  insert into public.order_status_history(order_id,status,note,changed_by)
  values(p_order_id,p_status,coalesce(p_note,'Status diperbarui oleh staff'),auth.uid());
end;
$$;

revoke all on function public.staff_update_order_status(uuid,public.order_status,text) from public, anon;
grant execute on function public.staff_update_order_status(uuid,public.order_status,text) to authenticated;

create or replace function public.expire_unpaid_orders()
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order record;
  v_count int := 0;
begin
  for v_order in
    select id from public.orders
     where payment_status='UNPAID'
       and status='PENDING_PAYMENT'
       and expires_at is not null
       and expires_at < now()
     for update skip locked
  loop
    perform private.release_order_reservations(v_order.id);
    update public.orders set status='EXPIRED',updated_at=now() where id=v_order.id;
    insert into public.order_status_history(order_id,status,note)
    values(v_order.id,'EXPIRED','Waktu pembayaran habis; reservasi stok dilepas otomatis');
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

revoke all on function public.expire_unpaid_orders() from public, anon, authenticated;
grant execute on function public.expire_unpaid_orders() to service_role;

-- Harden sensitive inventory columns for customer accounts.
-- Customers use safe storefront RPCs and invoice snapshots instead of direct product/serial tables.
drop policy if exists products_read on public.products;
drop policy if exists products_staff_read on public.products;
create policy products_staff_read on public.products for select to authenticated using(private.is_staff());

drop policy if exists serials_staff_read on public.product_serials;
create policy serials_staff_read on public.product_serials for select to authenticated
using(private.is_staff() and exists(
  select 1 from public.warehouses w
  where w.id=current_warehouse_id and private.can_access_branch(w.branch_id)
) or private.current_user_role() in ('SUPER_ADMIN','OWNER'));

alter table public.commerce_settings enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_item_serials enable row level security;
alter table public.order_status_history enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.installation_jobs enable row level security;
alter table public.product_warranties enable row level security;

grant select on public.orders, public.order_items, public.order_item_serials,
  public.order_status_history, public.payment_transactions,
  public.installation_jobs, public.product_warranties to authenticated;

grant select on public.commerce_settings to authenticated;

drop policy if exists commerce_settings_staff_read on public.commerce_settings;

create policy commerce_settings_staff_read on public.commerce_settings
for select to authenticated using(private.is_staff());

drop policy if exists orders_access on public.orders;

create policy orders_access on public.orders
for select to authenticated
using(
  (private.is_staff() and private.can_access_branch(branch_id))
  or exists(select 1 from public.customers c where c.id=customer_id and c.user_id=auth.uid())
);

drop policy if exists order_items_access on public.order_items;

create policy order_items_access on public.order_items
for select to authenticated
using(exists(
  select 1 from public.orders o
   where o.id=order_id and (
     (private.is_staff() and private.can_access_branch(o.branch_id))
     or exists(select 1 from public.customers c where c.id=o.customer_id and c.user_id=auth.uid())
   )
));

drop policy if exists order_serials_access on public.order_item_serials;

create policy order_serials_access on public.order_item_serials
for select to authenticated
using(exists(
  select 1 from public.order_items oi
  join public.orders o on o.id=oi.order_id
  where oi.id=order_item_id and (
    (private.is_staff() and private.can_access_branch(o.branch_id))
    or exists(select 1 from public.customers c where c.id=o.customer_id and c.user_id=auth.uid())
  )
));

drop policy if exists order_history_access on public.order_status_history;

create policy order_history_access on public.order_status_history
for select to authenticated
using(exists(
  select 1 from public.orders o
   where o.id=order_id and (
     (private.is_staff() and private.can_access_branch(o.branch_id))
     or exists(select 1 from public.customers c where c.id=o.customer_id and c.user_id=auth.uid())
   )
));

drop policy if exists payment_transactions_access on public.payment_transactions;

create policy payment_transactions_access on public.payment_transactions
for select to authenticated
using(exists(
  select 1 from public.orders o
   where o.id=order_id and (
     (private.is_staff() and private.can_access_branch(o.branch_id))
     or exists(select 1 from public.customers c where c.id=o.customer_id and c.user_id=auth.uid())
   )
));

drop policy if exists installation_jobs_access on public.installation_jobs;

create policy installation_jobs_access on public.installation_jobs
for select to authenticated
using(
  private.is_staff()
  or exists(select 1 from public.customers c where c.id=customer_id and c.user_id=auth.uid())
);

drop policy if exists product_warranties_access on public.product_warranties;

create policy product_warranties_access on public.product_warranties
for select to authenticated
using(
  private.is_staff()
  or exists(select 1 from public.customers c where c.id=customer_id and c.user_id=auth.uid())
);
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
