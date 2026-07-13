# Deploy checklist

## Supabase

- [ ] Run `202607130003_marketplace_separation.sql` on an existing v2 database.
- [ ] Or run `DATABASE-FRESH-INSTALL.sql` and `seed.sql` for a new database.
- [ ] Confirm the table `customer_addresses` exists.
- [ ] Confirm RPC `update_my_customer_profile` exists.
- [ ] Obtain Project URL and Publishable Key.
- [ ] Create a Supabase secret key for server-only use.
- [ ] Set the Netlify production URL in Auth URL Configuration.
- [ ] Disable Confirm Email only if immediate registration is desired.

## Netlify

- [ ] Repository root contains `app`, `components`, `lib`, and `package.json`.
- [ ] Base directory is empty.
- [ ] Build command is `npm run build`.
- [ ] Publish directory is empty.
- [ ] Add all five environment variables.
- [ ] Trigger `Clear cache and deploy site` after changing variables.

## Access test

- [ ] Anonymous visitor can open `/` and `/catalog`.
- [ ] Customer login goes to `/account`.
- [ ] Customer opening `/admin/dashboard` is redirected to `/account`.
- [ ] Staff login goes to `/admin/dashboard`.
- [ ] Staff opening `/account` is redirected to `/admin/dashboard`.
- [ ] All admin sidebar pages open.
- [ ] Mobile admin menu opens using the hamburger button.
- [ ] Customer checkout creates an order in `/admin/orders`.
