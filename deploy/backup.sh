#!/usr/bin/env bash
set -euo pipefail

CONTEXT_NAME="${BILO_DOCKER_CONTEXT:-biloapp-vps}"
PROJECT_NAME="${BILO_COMPOSE_PROJECT:-biloapp}"
ENV_FILE="${BILO_PRODUCTION_ENV_FILE:-.env.production}"
OUTPUT_DIR="${BILO_BACKUP_DIR:-./backups}"
mkdir -p "$OUTPUT_DIR"

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
docker --context "$CONTEXT_NAME" compose \
  --project-name "$PROJECT_NAME" \
  --env-file "$ENV_FILE" \
  -f compose.yml \
  -f compose.prod.yml exec -T db \
  sh -c 'exec pg_dump --clean --if-exists --no-owner --no-privileges -U "$POSTGRES_USER" "$POSTGRES_DB"' \
  | gzip > "$OUTPUT_DIR/biloapp-$STAMP.sql.gz"
echo "Created $OUTPUT_DIR/biloapp-$STAMP.sql.gz"
