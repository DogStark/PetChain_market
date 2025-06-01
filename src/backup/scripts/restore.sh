#!/bin/bash

set -e

if [ $# -lt 1 ]; then
    echo "Usage: $0 <backup_file> [target_database]"
    exit 1
fi

BACKUP_FILE="$1"
TARGET_DB="${2:-petchain_restored}"

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-postgres}

echo "Starting restore at $(date)"
echo "Backup file: $BACKUP_FILE"
echo "Target database: $TARGET_DB"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

if [ -f "$BACKUP_FILE.checksum" ]; then
    echo "Verifying backup integrity..."
    EXPECTED_CHECKSUM=$(cat "$BACKUP_FILE.checksum")
    ACTUAL_CHECKSUM=$(sha256sum "$BACKUP_FILE" | cut -d' ' -f1)
    
    if [ "$EXPECTED_CHECKSUM" != "$ACTUAL_CHECKSUM" ]; then
        echo "Error: Backup integrity check failed!"
        echo "Expected: $EXPECTED_CHECKSUM"
        echo "Actual: $ACTUAL_CHECKSUM"
        exit 1
    fi
    echo "Backup integrity verified"
fi

PGPASSWORD="$DB_PASSWORD" createdb \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  "$TARGET_DB" 2>/dev/null || echo "Database already exists"

echo "Restoring backup..."
gunzip -c "$BACKUP_FILE" | PGPASSWORD="$DB_PASSWORD" psql \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$TARGET_DB"

echo "Restore completed at $(date)"