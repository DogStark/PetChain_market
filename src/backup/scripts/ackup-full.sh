#!/bin/bash

set -e

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-petchain}
DB_USER=${DB_USER:-postgres}
BACKUP_PATH=${BACKUP_PATH:-./backups}

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_PATH/petchain_full_$TIMESTAMP.sql.gz"

echo "Starting full backup at $(date)"
echo "Database: $DB_NAME"
echo "Output: $BACKUP_FILE"

mkdir -p "$BACKUP_PATH"

PGPASSWORD="$DB_PASSWORD" pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --verbose \
  --clean \
  --no-owner \
  --no-privileges \
  | gzip -6 > "$BACKUP_FILE"

CHECKSUM=$(sha256sum "$BACKUP_FILE" | cut -d' ' -f1)
echo "$CHECKSUM" > "$BACKUP_FILE.checksum"

echo "Backup completed at $(date)"
echo "File: $BACKUP_FILE"
echo "Size: $(du -h "$BACKUP_FILE" | cut -f1)"
echo "Checksum: $CHECKSUM"