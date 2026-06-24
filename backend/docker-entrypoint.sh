#!/bin/sh
set -e

resolve_failed_migration() {
  if ! grep -q 'P3009' /tmp/migrate.log 2>/dev/null; then
    return 1
  fi

  failed=$(sed -n 's/.*`\([0-9][0-9]*_[^`]*\)`.*/\1/p' /tmp/migrate.log | head -1)
  if [ -z "$failed" ]; then
    return 1
  fi

  echo "Resolving failed migration as rolled back: $failed"
  npx prisma migrate resolve --rolled-back "$failed"
  return 0
}

run_migrate() {
  if npx prisma migrate deploy > /tmp/migrate.log 2>&1; then
    cat /tmp/migrate.log
    return 0
  fi

  cat /tmp/migrate.log

  if resolve_failed_migration; then
    echo "Retrying migrations after resolve..."
    npx prisma migrate deploy
    return $?
  fi

  return 1
}

echo "Waiting for database..."
attempt=1
max_attempts=15
until run_migrate; do
  if grep -q 'P3009' /tmp/migrate.log 2>/dev/null; then
    echo "Migration blocked by failed migration record"
    exit 1
  fi

  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "Database migration failed after $max_attempts attempts"
    exit 1
  fi

  echo "Migration attempt $attempt failed, retrying in 5s..."
  attempt=$((attempt + 1))
  sleep 5
done

echo "Starting API server..."
exec node dist/src/index.js
