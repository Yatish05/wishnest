# Supabase Migration Guide (ap-south-1 to us-east-1)

Follow these steps to migrate your database with minimal downtime and no data loss.

## 1. Export Data from Mumbai (Source)
Run this command from your terminal. Replace `[PROJECT_REF]` or Use your connection string.

```bash
# Export the entire database (schema + data)
pg_dump --clean --if-exists --quote-all-identifiers \
 -h db.[PROJECT_REF].supabase.co -p 5432 -d postgres \
 -U postgres > wishnest_backup.sql
```
*Note: You will be prompted for your database password.*

## 2. Prepare US East (Target)
1. Go to [Supabase Dashboard](https://supabase.com/dashboard).
2. Create a **New Project**.
3. Select Region: **US East (N. Virginia) [us-east-1]**.
4. Save the new **Project URL** and **Service Role Key**.

## 3. Import Data to US East (Target)
Run the following command to restore the backup to your new project:

```bash
psql -h db.[NEW_PROJECT_REF].supabase.co -p 5432 -d postgres \
 -U postgres -f wishnest_backup.sql
```
*Note: This will recreate all tables, triggers, and data exactly as they were.*

## 4. Update Environment Variables
In your Vercel Dashboard, update the following variables for the production environment:

| Variable | Old (Mumbai) | New (US East) |
| :--- | :--- | :--- |
| `SUPABASE_URL` | `https://...` | `https://[NEW_REF].supabase.co` |
| `SUPABASE_SECRET_KEY` | `[OLD_KEY]` | `[NEW_KEY]` |

## 5. (Optional) Migrate Auth Users
If you use Supabase Auth, you may need to manually export/import the `auth.users` table or use the [Supabase Migration Tool](https://github.com/supabase/migrations) if you have many users. Since you have <500 records, the `pg_dump` on the `postgres` database (which includes the `auth` schema if run as superuser) should cover it.

> [!WARNING]
> Ensure you have no active connections while running the `pg_dump` to ensure data consistency.
