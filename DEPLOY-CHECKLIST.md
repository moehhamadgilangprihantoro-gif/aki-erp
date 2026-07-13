# Deploy Checklist

1. Create a Supabase project.
2. Run `supabase/migrations/202607130001_initial_schema.sql` in SQL Editor.
3. Run `supabase/seed.sql`.
4. Copy `.env.example` to `.env.local` and fill the Project URL + Publishable Key.
5. Run `npm install`, then `npm run dev`.
6. Create an Auth user and update its `profiles.role` + `branch_id` using the SQL example in README.
7. Push the project to GitHub and import it in Netlify.
8. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in Netlify environment variables.
9. Set the Supabase Auth Site URL to your Netlify production URL.
10. Test login, product list, and one POS transaction using a seeded serial.
