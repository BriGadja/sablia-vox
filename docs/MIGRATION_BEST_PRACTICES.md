# Migration Best Practices - Supabase

**Date**: 2025-11-20
**Purpose**: Keep the migration table synchronized with the actual schema

---

## The Problem

When you run SQL migrations manually via the Supabase Dashboard (SQL Editor), the schema is modified **BUT** the migration is not recorded in `supabase_migrations.schema_migrations`.

**Consequences**:
- The migration table does not reflect reality
- Team confusion about what has been applied
- Impossible to tell which migrations are missing

---

## Solution 1: Use `supabase db push` (RECOMMENDED)

### Why is this the best method?

- **Automatic**: Records migrations automatically
- **Safe**: Transactional, rollback on error
- **Auditable**: Keeps a complete history
- **Standard**: Official Supabase method

### How it works

#### Step 1: Create your migration file

Create a new file in `supabase/migrations/`:

**Name format**: `YYYYMMDDHHMMSS_description.sql`

Example: `20251120180000_add_user_preferences.sql`

```sql
-- Migration: Add user preferences table
-- Date: 2025-11-20

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  theme TEXT DEFAULT 'light',
  language TEXT DEFAULT 'fr',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id
  ON user_preferences(user_id);

-- RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
  ON user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);
```

#### Step 2: Link your project (if not already done)

```powershell
# For staging
supabase link --project-ref vmmohjvwtbrotygzjias

# For production
supabase link --project-ref tcpecjoeelbnnvdkvgvg
```

#### Step 3: Apply the migration

```powershell
# View pending migrations
supabase db diff

# Apply all pending migrations
supabase db push
```

**That's it!** The migration is executed AND recorded automatically.

#### Step 4: Verify

```powershell
# View applied migrations
supabase migration list
```

---

## Solution 2: Self-Registering SQL Script (FALLBACK)

If you absolutely must use the SQL Editor (emergency, no CLI access, etc.), use the template that self-registers.

### How to use the template

#### Step 1: Copy the template

The file `supabase/migrations/TEMPLATE_MIGRATION.sql` contains a complete template.

#### Step 2: Modify the variables

At the top of the file, modify:

```sql
\set migration_version '20251120180000'  -- Unique timestamp
\set migration_name 'add_user_preferences'  -- Description
```

**How to generate the timestamp**:
```powershell
# PowerShell
Get-Date -Format "yyyyMMddHHmmss"
# Returns: 20251120180530
```

#### Step 3: Add your SQL changes

Between the separator lines, add your SQL:

```sql
-- =====================================================
-- YOUR CHANGES HERE
-- =====================================================

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- END OF YOUR CHANGES
-- =====================================================
```

#### Step 4: Copy the ENTIRE file to SQL Editor

1. Open Supabase Dashboard > SQL Editor
2. Copy **ALL** the file contents (including the self-registration section)
3. Paste in SQL Editor
4. Click **Run**

**Result**:
- Your changes are applied
- The migration is automatically recorded in the table
- A confirmation message appears: `Migration 20251120180000 (add_user_preferences) registered successfully`

#### Step 5: Verify

In SQL Editor:

```sql
SELECT version, name, inserted_at
FROM supabase_migrations.schema_migrations
ORDER BY version DESC
LIMIT 5;
```

You should see your migration in the list.

---

## Comparison of Both Methods

| Aspect | `supabase db push` | Self-Registering Script |
|--------|-------------------|-------------------------|
| **Ease** | 5/5 | 3/5 |
| **Safety** | 5/5 | 4/5 |
| **Rollback** | Automatic | Manual |
| **History** | Complete | Version only |
| **Errors** | Auto-rollback | May be partial |
| **CI/CD** | Integrable | Difficult |
| **Team** | Standard | Requires template |

**Recommendation**: Use `supabase db push` unless impossible.

---

## Synchronizing Existing Migrations

If you already have unregistered migrations (as is currently the case), you can register them retroactively:

```sql
-- Register already-applied manual migrations
INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES
  ('20251113092934', 'import_from_prod'),
  ('20251113173945', 'create_agent_sms_table'),
  ('20251113174002', 'sms_rls_policies'),
  ('20251113174046', 'sms_analytics'),
  ('20251114115154', 'add_cost_per_email_to_deployments'),
  ('20251117101559', 'create_financial_timeseries_function'),
  ('20251120094954', 'add_latency_columns'),
  ('20251120095358', 'rename_justification_to_analysis')
ON CONFLICT (version) DO NOTHING;
```

**IMPORTANT**: This query does **NOT EXECUTE** the migrations, it only **REGISTERS** them. Use only if the migrations are already applied.

---

## Migration Checklist

Before each migration:

- [ ] **Backup created** (`supabase db dump`)
- [ ] **Migration tested on staging**
- [ ] **Correct file name** (`YYYYMMDDHHMMSS_description.sql`)
- [ ] **Using IF NOT EXISTS / IF EXISTS** (idempotence)
- [ ] **Transaction BEGIN/COMMIT** (atomicity)
- [ ] **Clear comments** (description, risk)
- [ ] **Post-migration verifications** included

During the migration:

- [ ] **Method chosen** (`supabase db push` or template)
- [ ] **Environment verified** (staging or production)
- [ ] **Execution without error**
- [ ] **Migration registered** (check the table)

After the migration:

- [ ] **Functional tests** (dashboard, API)
- [ ] **Data verification** (no loss)
- [ ] **Monitoring** (logs, performance)
- [ ] **Documentation** (update README if necessary)

---

## Recommended Full Workflow

### In Development (Staging)

```powershell
# 1. Create the migration
# Create the file: supabase/migrations/20251120180000_my_feature.sql

# 2. Link staging
supabase link --project-ref vmmohjvwtbrotygzjias

# 3. Apply
supabase db push

# 4. Test
# Verify the dashboard, functions, etc.

# 5. Commit
git add supabase/migrations/20251120180000_my_feature.sql
git commit -m "feat: add my_feature migration"
```

### In Production

```powershell
# 1. Backup
supabase db dump -f dbDump/backup_prod_$(Get-Date -Format "yyyyMMdd_HHmmss").sql

# 2. Link production
supabase link --project-ref tcpecjoeelbnnvdkvgvg

# 3. Apply
supabase db push

# 4. Verify
# Test the dashboard in production
# Check the logs

# 5. Monitor
# Watch for 24-48h
```

---

## Additional Tips

### 1. Migration Naming

**Good**:
- `20251120180000_add_user_preferences_table.sql`
- `20251120180100_add_latency_columns_to_calls.sql`
- `20251120180200_fix_financial_metrics_view.sql`

**Bad**:
- `migration.sql`
- `fix.sql`
- `update_2025.sql`

### 2. Migration Size

**One migration = One feature**

**Good**:
- Migration 1: Create user_preferences table
- Migration 2: Add theme column
- Migration 3: Create enriched_preferences view

**Bad**:
- Migration 1: Create 10 tables + 5 views + 3 functions

### 3. Idempotence

Always use:
- `CREATE TABLE IF NOT EXISTS`
- `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`
- `CREATE INDEX IF NOT EXISTS`
- `DROP ... IF EXISTS` before `CREATE OR REPLACE`

### 4. Documentation

Each migration should have:
```sql
-- Migration: [Short description]
-- Date: YYYY-MM-DD
-- Author: [Name]
-- Risk: LOW | MEDIUM | HIGH
-- Dependencies: [Migrations this one depends on]
--
-- Detailed description of what the migration does
-- and why it is necessary.
```

---

## Troubleshooting

### Problem: Migration fails with "already exists"

**Cause**: Migration already applied manually

**Solution**:
```sql
-- Register without executing
INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES ('20251120180000', 'my_migration')
ON CONFLICT (version) DO NOTHING;
```

### Problem: "Permission denied"

**Cause**: RLS permissions or incorrect role

**Solution**: Verify you are connected with the correct user:
```sql
SELECT current_user;
-- Should return 'postgres' or an admin account
```

### Problem: Partially applied migration

**Cause**: No BEGIN/COMMIT transaction

**Solution**: Always wrap in a transaction:
```sql
BEGIN;
  -- Your changes
COMMIT;
```

---

## Resources

- **Supabase Documentation**: https://supabase.com/docs/guides/cli/local-development#database-migrations
- **Migration template**: `supabase/migrations/TEMPLATE_MIGRATION.sql`
- **Backup guide**: `docs/DATABASE_BACKUP_GUIDE.md`

---

**Created by**: Claude Code
**Date**: 2025-11-20
**Version**: 1.0
