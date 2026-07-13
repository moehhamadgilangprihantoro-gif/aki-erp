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
