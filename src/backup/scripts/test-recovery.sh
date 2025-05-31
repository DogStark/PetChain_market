#!/bin/bash

set -e

if [ $# -lt 1 ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

BACKUP_FILE="$1"
TEST_DB="petchain_test_$(date +%s)"

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-postgres}

echo "Starting recovery test at $(date)"
echo "Backup file: $BACKUP_FILE"
echo "Test database: $TEST_DB"

cleanup() {
    echo "Cleaning up test database..."
    PGPASSWORD="$DB_PASSWORD" dropdb \
      -h "$DB_HOST" \
      -p "$DB_PORT" \
      -U "$DB_USER" \
      "$TEST_DB" 2>/dev/null || echo "Test database already removed"
}

trap cleanup EXIT

PGPASSWORD="$DB_PASSWORD" createdb \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  "$TEST_DB"

gunzip -c "$BACKUP_FILE" | PGPASSWORD="$DB_PASSWORD" psql \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$TEST_DB" > /dev/null

echo "Running verification tests..."

TABLE_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$TEST_DB" \
  -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')

if [ "$TABLE_COUNT" -gt 0 ]; then
    echo "✓ Tables restored successfully ($TABLE_COUNT tables)"
else
    echo "✗ No tables found in restored database"
    exit 1
fi

PGPASSWORD="$DB_PASSWORD" psql \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$TEST_DB" \
  -c "SELECT 1;" > /dev/null

echo "✓ Basic queries working"

echo "Recovery test completed successfully at $(date)"