# AKI Store + ERP v4

Next.js application for Netlify with Supabase Auth/PostgreSQL.

## Main changes in v4

- Public storefront redesigned as a conventional Indonesian marketplace.
- Customer area separated under `/account` and never uses the ERP layout.
- ERP staff area separated under `/admin`.
- Customers opening `/admin` are redirected to `/account`.
- Staff opening `/account` are redirected to `/admin/dashboard`.
- All ERP sidebar links now have real pages.
- Responsive ERP sidebar becomes a drawer on tablet/mobile.
- Ecommerce checkout remains integrated with ERP inventory, invoices, payments, warranties, and installations.

## Routes

### Public ecommerce

- `/`
- `/catalog`
- `/product/[slug]`
- `/cart`
- `/checkout`
- `/login`

### Customer only

- `/account`
- `/account/orders`
- `/account/warranties`
- `/account/installations`
- `/account/vehicles`
- `/account/addresses`
- `/account/profile`

### ERP staff only

- `/admin/dashboard`
- `/admin/orders`
- `/admin/pos`
- `/admin/products`
- `/admin/inventory`
- `/admin/customers`
- `/admin/purchases`
- `/admin/installations`
- `/admin/warranties`
- `/admin/reports`
- `/admin/settings`

## Database setup

### Existing Supabase project from v2

Run only:

```text
supabase/migrations/202607130003_marketplace_separation.sql
```

This creates customer addresses, safe customer profile RPC, missing purchase-order policies, and marketplace product fields.

### Brand-new Supabase project

Run:

```text
supabase/DATABASE-FRESH-INSTALL.sql
supabase/seed.sql
```

## Netlify environment variables

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
PAYMENT_WEBHOOK_SECRET
CRON_SECRET
```

Never prefix secret values with `NEXT_PUBLIC_`.

## Browser-only deployment workflow

1. Upload this ZIP to GitHub Codespaces.
2. Extract it in the Codespaces terminal:

```bash
unzip -o aki-store-erp-v4.zip
rm aki-store-erp-v4.zip
git add .
git commit -m "Upgrade AKI Store and ERP to v4"
git push origin main
```

3. Netlify builds automatically from the repository root.
4. Keep Netlify base directory empty.
5. Build command: `npm run build`.
6. Publish directory: leave blank; Netlify detects Next.js.

## Supabase Auth

For registration without email confirmation:

```text
Supabase > Authentication > Providers > Email > Confirm email OFF
```

For production, CAPTCHA is recommended when email confirmation is disabled.

## Verified locally

```text
npm ci
npm run lint
npm run build
```
