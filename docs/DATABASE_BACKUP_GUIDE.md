# Database Backup Guide - Supabase Production

**Created**: 2025-11-20
**Context**: Backup before applying 16 critical migrations

---

## Objective

This guide covers creating full backups of your Supabase Production database before any critical operation (migrations, schema changes, etc.).

---

## Table of Contents

1. [Backup Methods](#backup-methods)
2. [Backup via Supabase CLI (Recommended)](#backup-via-supabase-cli-recommended)
3. [Backup via Supabase Dashboard](#backup-via-supabase-dashboard)
4. [Backup via pg_dump](#backup-via-pg_dump)
5. [Backup Verification](#backup-verification)
6. [Restoration](#restoration)
7. [Backup Scheduling](#backup-scheduling)

---

## Backup Methods

| Method | Advantages | Disadvantages | Recommendation |
|--------|-----------|---------------|----------------|
| **Supabase CLI** | Simple, fast, clean SQL file | Requires CLI installed | **RECOMMENDED** |
| **Supabase Dashboard** | Graphical interface, easy | Full project backup | Good alternative |
| **pg_dump** | Full control, automatable | Configuration needed | For advanced users |

---

## Backup via Supabase CLI (Recommended)

### Prerequisites

1. **Install Supabase CLI** (if not already done):
   ```bash
   npm install -g supabase
   ```

2. **Verify installation**:
   ```bash
   supabase --version
   ```

### Backup Steps

**1. Log in to your Supabase project**:
```bash
supabase login
```

**2. Link your local project to production**:
```bash
supabase link --project-ref <YOUR_PROJECT_REF>
```

To find your `project-ref`:
- Go to the Supabase dashboard
- Select your Production project
- The URL contains the ref: `https://supabase.com/dashboard/project/<project-ref>`

**3. Create the backup**:
```bash
# Full backup with timestamp
supabase db dump -f dbDump/backup_prod_$(date +%Y%m%d_%H%M%S).sql

# Or simple backup
supabase db dump -f dbDump/backup_prod.sql
```

**4. Verify the backup**:
```bash
ls -lh dbDump/
```

### Backup Variants

**Schema only** (no data):
```bash
supabase db dump --schema-only -f dbDump/schema_prod_$(date +%Y%m%d_%H%M%S).sql
```

**Data only**:
```bash
supabase db dump --data-only -f dbDump/data_prod_$(date +%Y%m%d_%H%M%S).sql
```

**Specific table**:
```bash
supabase db dump --table=agent_calls -f dbDump/agent_calls_backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## Backup via Supabase Dashboard

### Steps

1. **Access the Supabase Dashboard**:
   - URL: https://supabase.com/dashboard
   - Select your **Production** project

2. **Navigate to Database > Backups**:
   - Left menu > Database > Backups

3. **Create a manual backup**:
   - Click "Create backup"
   - Give a descriptive name: `pre_migration_20251120`
   - Click "Create"

4. **Download the backup**:
   - Once the backup is created, click the 3 dots > "Download"
   - Save to `dbDump/backup_dashboard_YYYYMMDD.sql`

### Advantages

- Full project backup (DB + Storage + Auth)
- Simple graphical interface
- Managed by Supabase (easy restoration)
- Automatic backup history

---

## Backup via pg_dump

### Prerequisites

1. **Install PostgreSQL** (for `pg_dump`):
   - Windows: https://www.postgresql.org/download/windows/
   - MacOS: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql-client`

2. **Get connection credentials**:
   - Supabase Dashboard > Project Settings > Database
   - Copy: Host, Database name, Port, User, Password

### Backup Command

```bash
# Full format
pg_dump "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" \
  --file=dbDump/backup_prod_$(date +%Y%m%d_%H%M%S).sql \
  --schema=public \
  --no-owner \
  --no-acl \
  --verbose

# Or simplified format
pg_dump -h db.[YOUR-PROJECT-REF].supabase.co \
  -U postgres \
  -d postgres \
  -p 5432 \
  -f dbDump/backup_prod_$(date +%Y%m%d_%H%M%S).sql \
  --schema=public \
  --no-owner \
  --no-acl
```

**Note**: Replace `[YOUR-PASSWORD]` and `[YOUR-PROJECT-REF]` with your actual values.

### Useful Options

- `--schema=public`: Backup only the public schema
- `--no-owner`: Do not include owners
- `--no-acl`: Do not include permissions
- `--verbose`: Show progress
- `--clean`: Add DROP commands before CREATE
- `--if-exists`: Use IF EXISTS in DROP commands

---

## Backup Verification

### Essential Checks

**1. File size**:
```bash
ls -lh dbDump/backup_prod_*.sql
```
A full backup should be **several MB** (currently ~3.4 MB).

**2. File contents**:
```bash
# Check the first lines
head -n 50 dbDump/backup_prod_YYYYMMDD_HHMMSS.sql

# Check the last lines
tail -n 50 dbDump/backup_prod_YYYYMMDD_HHMMSS.sql

# Count tables
grep "CREATE TABLE" dbDump/backup_prod_YYYYMMDD_HHMMSS.sql | wc -l
```
Should show **11 tables**.

**3. Search for errors**:
```bash
grep -i "error\|warning" dbDump/backup_prod_YYYYMMDD_HHMMSS.sql
```
Should return no results.

**4. Verify critical tables**:
```bash
grep "CREATE TABLE.*agent_calls" dbDump/backup_prod_YYYYMMDD_HHMMSS.sql
grep "CREATE TABLE.*clients" dbDump/backup_prod_YYYYMMDD_HHMMSS.sql
grep "CREATE TABLE.*agent_deployments" dbDump/backup_prod_YYYYMMDD_HHMMSS.sql
```

**5. Verify data**:
```bash
# Count INSERT statements
grep "INSERT INTO" dbDump/backup_prod_YYYYMMDD_HHMMSS.sql | wc -l
```

---

## Restoration

### WARNING - Before Any Restoration

1. **NEVER restore to Production without testing first**
2. **Always test on Staging first**
3. **Create a backup of the current state before restoring**

### Restoration via Supabase CLI

```bash
# Restore to STAGING for testing
supabase link --project-ref <STAGING_PROJECT_REF>
supabase db reset --db-url postgresql://postgres:[PASSWORD]@db.[STAGING_REF].supabase.co:5432/postgres
psql -h db.[STAGING_REF].supabase.co -U postgres -d postgres -f dbDump/backup_prod_YYYYMMDD_HHMMSS.sql

# If test is OK, restore to PRODUCTION (WITH EXTREME CAUTION)
supabase link --project-ref <PROD_PROJECT_REF>
psql -h db.[PROD_REF].supabase.co -U postgres -d postgres -f dbDump/backup_prod_YYYYMMDD_HHMMSS.sql
```

### Restoration via Dashboard

1. Supabase Dashboard > Database > Backups
2. Select the backup to restore
3. Click "..." > "Restore"
4. Confirm (WARNING: This action is IRREVERSIBLE)

---

## Backup Scheduling

### When to Back Up

**Critical situations requiring a backup**:

1. **Before any migration** (like today)
2. **Before schema changes**
3. **Before dropping columns/tables**
4. **Before batch data updates**
5. **Before changing RLS policies**

### Recommended Frequency

- **Automatic Supabase backups**: Enabled by default (7-day retention)
- **Manual backups before changes**: Systematic
- **Weekly backups**: Recommended for long-term archival

### Automated Backup Script

See `scripts/backup-prod.sh` for automating daily backups.

---

## Backup Organization

### Recommended Structure

```
dbDump/
├── backup_prod_20251120_160000.sql    # Pre-migration backup
├── backup_prod_20251113_143900.sql    # Previous backup
├── schema_prod_20251120_160000.sql    # Schema only
└── archives/
    ├── backup_prod_20251101.sql       # Monthly archives
    └── backup_prod_20251001.sql
```

### File Naming

**Recommended format**:
```
backup_[env]_[YYYYMMDD]_[HHMMSS]_[description].sql
```

**Examples**:
- `backup_prod_20251120_160000_pre_migration.sql`
- `backup_prod_20251115_120000_weekly.sql`
- `backup_staging_20251120_090000_test.sql`

---

## Pre-Migration Checklist

Before applying the 16 missing migrations:

- [ ] Full backup created
- [ ] Backup verified (size, contents, no errors)
- [ ] Backup downloaded locally
- [ ] Backup tested on staging (restoration)
- [ ] Team informed of maintenance
- [ ] Maintenance window scheduled
- [ ] Rollback plan prepared
- [ ] Change documentation ready

---

## Important Notes

1. **Password**: NEVER commit files containing credentials
2. **Git**: `.sql` files in `dbDump/` are ignored by `.gitignore`
3. **Size**: Backups with data can be large (compress if needed)
4. **Compression**: Use `gzip` to reduce size:
   ```bash
   gzip dbDump/backup_prod_20251120_160000.sql
   # Creates: backup_prod_20251120_160000.sql.gz
   ```

---

## Troubleshooting

### Backup Fails

1. Check connection credentials
2. Check internet connection
3. Check `dbDump/` directory permissions
4. Try a different backup method

### Incomplete Backup

1. Check available disk space
2. Check error logs
3. Retry with `--verbose` to see progress

### Restoration Fails

1. **DO NOT PANIC**
2. Contact Supabase support
3. Use the automatic Supabase backup (7-day retention)
4. Check backup file integrity

---

## Support

- **Supabase Documentation**: https://supabase.com/docs/guides/database/backups
- **Supabase Support**: support@supabase.io
- **Community Discord**: https://discord.supabase.com

---

**Created by**: Claude Code
**Last updated**: 2025-11-20
