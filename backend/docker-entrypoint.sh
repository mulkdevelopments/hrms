#!/bin/sh
set -e

echo "Syncing database schema..."
attempt=1
max_attempts=15
until npx prisma db push --skip-generate --accept-data-loss; do
  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "Database schema sync failed after $max_attempts attempts"
    exit 1
  fi
  echo "Schema sync attempt $attempt failed, retrying in 5s..."
  attempt=$((attempt + 1))
  sleep 5
done

if [ "${RUN_SEED:-}" = "true" ]; then
  echo "Seeding database..."
  node --import tsx prisma/seed.ts
fi

echo "Starting API server..."
exec node dist/src/index.js
