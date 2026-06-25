#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SQL_FILE="${1:-$ROOT_DIR/scripts/leave-report-may.import.sql}"
POSTGRES_ID="${RENDER_POSTGRES_ID:-dpg-d8u4r6uq1p3s73cakobg-a}"
BATCH_SIZE="${BATCH_SIZE:-25}"
BATCH_DIR="$ROOT_DIR/scripts/.leave-import-batches"

if [[ ! -f "$SQL_FILE" ]]; then
  echo "SQL file not found: $SQL_FILE" >&2
  exit 1
fi

BATCH_COUNT="$(python3 - "$SQL_FILE" "$BATCH_SIZE" "$BATCH_DIR" <<'PY'
import pathlib, sys
sql = pathlib.Path(sys.argv[1]).read_text()
batch_size = int(sys.argv[2])
out_dir = pathlib.Path(sys.argv[3])
out_dir.mkdir(exist_ok=True)
for old in out_dir.glob("batch_*.sql"):
    old.unlink()
blocks = [part.strip() for part in sql.split("DO $$") if part.strip()]
prefix = blocks[0]
batches = []
current = prefix + "\n"
count = 0
for block in blocks[1:]:
    chunk = "DO $$" + block
    if not chunk.rstrip("END $$;"):
        chunk += "\nEND $$;"
    current += chunk + "\n\n"
    count += 1
    if count >= batch_size:
        batches.append(current + "COMMIT;")
        current = "BEGIN;\n"
        count = 0
if count:
    batches.append(current + "COMMIT;")
for index, batch in enumerate(batches):
    (out_dir / f"batch_{index:03d}.sql").write_text(batch)
print(len(batches))
PY
)"

echo "Applying $BATCH_COUNT batch(es) to $POSTGRES_ID..."
for batch_file in "$BATCH_DIR"/batch_*.sql; do
  echo "Running $(basename "$batch_file")..."
  render psql "$POSTGRES_ID" --confirm -c "$(cat "$batch_file")" -o json >/dev/null
done

render psql "$POSTGRES_ID" --confirm -c 'SELECT COUNT(*) AS leave_requests FROM "LeaveRequest"; SELECT status, COUNT(*) FROM "LeaveRequest" GROUP BY status ORDER BY status;' -o json
