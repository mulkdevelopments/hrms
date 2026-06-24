#!/bin/sh
set -e

echo "Waiting for database..."
attempt=1
max_attempts=15
until npx prisma migrate deploy; do
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
