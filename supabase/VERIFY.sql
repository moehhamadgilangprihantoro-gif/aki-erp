-- Run after migrations and seed.
select
  (select count(*) from public.branches) as branches,
  (select count(*) from public.products where is_active=true) as active_products,
  (select count(*) from public.product_serials where status='AVAILABLE') as available_serials,
  (select count(*) from public.orders) as ecommerce_orders;

select routine_name
from information_schema.routines
where routine_schema='public'
  and routine_name in (
    'list_store_products',
    'create_ecommerce_order',
    'staff_mark_order_paid',
    'staff_update_order_status',
    'expire_unpaid_orders'
  )
order by routine_name;

select tablename,rowsecurity
from pg_tables
where schemaname='public'
  and tablename in (
    'orders','order_items','order_item_serials','order_status_history',
    'payment_transactions','installation_jobs','product_warranties'
  )
order by tablename;
