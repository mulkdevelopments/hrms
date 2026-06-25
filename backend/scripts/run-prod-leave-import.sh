#!/usr/bin/env bash
set -euo pipefail
SERVICE_ID="${RENDER_SERVICE_ID:-srv-d8u4vsnlk1mc73fc464g}"
echo "Creating Render one-off leave import job on $SERVICE_ID..."
render jobs create "$SERVICE_ID" --confirm \
  --start-command "cd /app && npm run import-leave-prod" \
  -o json
echo "Monitor: render logs -r $SERVICE_ID --text --tail 200"
