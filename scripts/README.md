# 📜 Scripts de Maintenance - Sablia Vox

Ce dossier contient des scripts utilitaires pour la maintenance de la base de données Supabase.

---

## 🔒 Backup Scripts

### `backup-prod.sh` (Linux/Mac/Git Bash)

Script shell pour créer des backups automatisés de la base de données de production.

**Prérequis** :
- Supabase CLI installé : `npm install -g supabase`
- Projet lié à Supabase : `supabase link --project-ref YOUR_REF`

**Utilisation** :

```bash
# Backup complet (défaut)
./scripts/backup-prod.sh

# Backup du schéma uniquement
./scripts/backup-prod.sh --schema-only

# Backup des données uniquement
./scripts/backup-prod.sh --data-only

# Lister les backups existants
./scripts/backup-prod.sh --list

# Nettoyer les backups de plus de 30 jours
./scripts/backup-prod.sh --cleanup

# Afficher l'aide
./scripts/backup-prod.sh --help
```

---

### `backup-prod.ps1` (Windows PowerShell)

Script PowerShell pour créer des backups automatisés de la base de données de production.

**Prérequis** :
- Supabase CLI installé : `npm install -g supabase`
- Projet lié à Supabase : `supabase link --project-ref YOUR_REF`
- PowerShell 5.1 ou supérieur

**Utilisation** :

```powershell
# Backup complet (défaut)
.\scripts\backup-prod.ps1

# Backup du schéma uniquement
.\scripts\backup-prod.ps1 -SchemaOnly

# Backup des données uniquement
.\scripts\backup-prod.ps1 -DataOnly

# Lister les backups existants
.\scripts\backup-prod.ps1 -List

# Nettoyer les backups de plus de 30 jours
.\scripts\backup-prod.ps1 -Cleanup

# Afficher l'aide
.\scripts\backup-prod.ps1 -Help
```

**Note Windows** : Si vous obtenez une erreur de stratégie d'exécution, lancez :
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📂 Structure des Backups

Les backups sont sauvegardés dans le dossier `dbDump/` avec la nomenclature suivante :

```
backup_prod_YYYYMMDD_HHMMSS.sql    # Backup complet
schema_prod_YYYYMMDD_HHMMSS.sql    # Schéma uniquement
data_prod_YYYYMMDD_HHMMSS.sql      # Données uniquement
```

**Exemple** :
- `backup_prod_20251120_160530.sql` - Backup complet du 20 nov 2025 à 16h05
- `schema_prod_20251120_160530.sql` - Schéma du 20 nov 2025 à 16h05

---

## 🔄 Fonctionnalités des Scripts

### ✅ Vérification automatique
- Vérification de l'installation de Supabase CLI
- Création automatique du dossier de backup si inexistant
- Validation du backup après création

### 📊 Vérification du backup
- Taille du fichier
- Nombre de tables (devrait être 11)
- Détection d'erreurs dans le dump SQL

### 🧹 Nettoyage automatique
- Suppression des backups de plus de 30 jours
- Liste des fichiers supprimés

### 🎨 Interface colorée
- Messages de succès en vert
- Erreurs en rouge
- Avertissements en jaune
- Informations en bleu/cyan

---

## 📖 Documentation Complète

Pour plus d'informations sur les backups, la restauration et les bonnes pratiques, consultez :

**[docs/DATABASE_BACKUP_GUIDE.md](../docs/DATABASE_BACKUP_GUIDE.md)**

Ce guide contient :
- Méthodes de backup détaillées
- Procédures de restauration
- Checklist pré-migration
- Résolution de problèmes
- Planification des backups

---

## 🚀 Recommandations

### Avant toute migration
```bash
# 1. Créer un backup complet
./scripts/backup-prod.sh

# 2. Vérifier le backup
./scripts/backup-prod.sh --list

# 3. Nettoyer les vieux backups (optionnel)
./scripts/backup-prod.sh --cleanup
```

### Automatisation quotidienne

**Linux/Mac** (cron) :
```bash
# Ajouter au crontab (crontab -e)
0 2 * * * cd /path/to/sablia-vox && ./scripts/backup-prod.sh
```

**Windows** (Task Scheduler) :
1. Ouvrir le Planificateur de tâches
2. Créer une tâche de base
3. Déclencheur : Quotidien à 2h00
4. Action : Démarrer un programme
5. Programme : `powershell.exe`
6. Arguments : `-File "C:\path\to\scripts\backup-prod.ps1"`

---

## ⚠️ Sécurité

- ❌ **NE JAMAIS** commiter les fichiers `.sql` contenant des données
- ✅ Les fichiers `.sql` dans `dbDump/` sont ignorés par `.gitignore`
- ✅ Sauvegarder les backups critiques en dehors du projet
- ✅ Chiffrer les backups contenant des données sensibles

---

## 🆘 Support

En cas de problème avec les scripts :

1. Vérifier que Supabase CLI est installé : `supabase --version`
2. Vérifier que le projet est lié : `supabase projects list`
3. Consulter le guide : `docs/DATABASE_BACKUP_GUIDE.md`
4. Vérifier les logs d'erreur du script

---

**Créé par** : Claude Code
**Dernière mise à jour** : 2025-11-20
