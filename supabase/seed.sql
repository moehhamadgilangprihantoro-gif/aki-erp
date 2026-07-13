-- AKI Store + ERP sample master data.
-- Run after migrations 001 and 002. This script is idempotent.

insert into public.branches(id,code,name,address,phone) values
('11111111-1111-1111-1111-111111111111','BKS','Cabang Bekasi','Jl. Raya Bekasi No. 88','0811-1234-5678'),
('11111111-1111-1111-1111-111111111112','JKT','Cabang Jakarta','Jl. Pemuda No. 21, Jakarta','0811-5678-1234')
on conflict(code) do update set name=excluded.name,address=excluded.address,phone=excluded.phone,is_active=true;

insert into public.warehouses(id,branch_id,code,name) values
('22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111','BKS-WH','Gudang Bekasi'),
('22222222-2222-2222-2222-222222222223','11111111-1111-1111-1111-111111111112','JKT-WH','Gudang Jakarta')
on conflict(code) do update set name=excluded.name,branch_id=excluded.branch_id,is_active=true;

insert into public.product_brands(id,name) values
('33333333-3333-3333-3333-333333333331','GS Astra'),
('33333333-3333-3333-3333-333333333332','Yuasa'),
('33333333-3333-3333-3333-333333333333','Incoe'),
('33333333-3333-3333-3333-333333333334','Bosch')
on conflict(name) do nothing;

insert into public.product_categories(id,name) values
('44444444-4444-4444-4444-444444444441','Aki Mobil'),
('44444444-4444-4444-4444-444444444442','Aki Motor'),
('44444444-4444-4444-4444-444444444443','Aki Truk')
on conflict(name) do nothing;

insert into public.products(
  id,sku,brand_id,category_id,name,voltage,capacity_ah,cca,warranty_months,
  minimum_stock,purchase_price,selling_price,slug,description,image_url,is_featured
) values
('55555555-5555-5555-5555-555555555551','GS-NS60','33333333-3333-3333-3333-333333333331','44444444-4444-4444-4444-444444444441','GS Astra NS60',12,45,430,12,5,850000,1050000,'gs-astra-ns60','Aki maintenance free untuk kendaraan keluarga. Daya starter stabil dan garansi tercatat berdasarkan serial.','/battery.svg',true),
('55555555-5555-5555-5555-555555555552','YUA-YTZ5S','33333333-3333-3333-3333-333333333332','44444444-4444-4444-4444-444444444442','Yuasa YTZ5S',12,4,80,6,5,650000,850000,'yuasa-ytz5s','Aki motor ringkas dengan performa starter yang konsisten untuk penggunaan harian.','/battery.svg',true),
('55555555-5555-5555-5555-555555555553','INC-80D26L','33333333-3333-3333-3333-333333333333','44444444-4444-4444-4444-444444444441','Incoe 80D26L',12,65,550,12,4,950000,1250000,'incoe-80d26l','Kapasitas besar untuk MPV, SUV, dan kendaraan dengan kebutuhan kelistrikan lebih tinggi.','/battery.svg',false),
('55555555-5555-5555-5555-555555555554','BOS-S4-55D23L','33333333-3333-3333-3333-333333333334','44444444-4444-4444-4444-444444444441','Bosch S4 55D23L',12,60,500,18,4,1100000,1450000,'bosch-s4-55d23l','Aki premium dengan masa garansi panjang dan performa cold cranking tinggi.','/battery.svg',true),
('55555555-5555-5555-5555-555555555555','GS-N70','33333333-3333-3333-3333-333333333331','44444444-4444-4444-4444-444444444443','GS Astra N70',12,70,600,12,3,1250000,1590000,'gs-astra-n70','Aki heavy duty untuk kendaraan niaga dan truk ringan.','/battery.svg',false)
on conflict(sku) do update set
  name=excluded.name,voltage=excluded.voltage,capacity_ah=excluded.capacity_ah,cca=excluded.cca,
  warranty_months=excluded.warranty_months,minimum_stock=excluded.minimum_stock,
  purchase_price=excluded.purchase_price,selling_price=excluded.selling_price,
  slug=excluded.slug,description=excluded.description,image_url=excluded.image_url,
  is_featured=excluded.is_featured,is_active=true;

insert into public.product_serials(product_id,current_warehouse_id,serial_number,purchase_price,status) values
('55555555-5555-5555-5555-555555555551','22222222-2222-2222-2222-222222222222','GS260700125',850000,'AVAILABLE'),
('55555555-5555-5555-5555-555555555551','22222222-2222-2222-2222-222222222222','GS260700126',850000,'AVAILABLE'),
('55555555-5555-5555-5555-555555555551','22222222-2222-2222-2222-222222222223','GS260700127',850000,'AVAILABLE'),
('55555555-5555-5555-5555-555555555551','22222222-2222-2222-2222-222222222223','GS260700128',850000,'AVAILABLE'),
('55555555-5555-5555-5555-555555555552','22222222-2222-2222-2222-222222222222','YU25050078',650000,'AVAILABLE'),
('55555555-5555-5555-5555-555555555552','22222222-2222-2222-2222-222222222222','YU25050079',650000,'AVAILABLE'),
('55555555-5555-5555-5555-555555555553','22222222-2222-2222-2222-222222222222','IN24090156',950000,'AVAILABLE'),
('55555555-5555-5555-5555-555555555553','22222222-2222-2222-2222-222222222223','IN24090157',950000,'AVAILABLE'),
('55555555-5555-5555-5555-555555555554','22222222-2222-2222-2222-222222222223','BOS26070001',1100000,'AVAILABLE'),
('55555555-5555-5555-5555-555555555554','22222222-2222-2222-2222-222222222223','BOS26070002',1100000,'AVAILABLE'),
('55555555-5555-5555-5555-555555555555','22222222-2222-2222-2222-222222222222','GSN702607001',1250000,'AVAILABLE')
on conflict(serial_number) do nothing;

update public.commerce_settings
set delivery_fee=40000,installation_fee=50000,reservation_minutes=30,updated_at=now()
where id=true;
