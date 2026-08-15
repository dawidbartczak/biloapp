#!/usr/bin/env bash
set -euo pipefail

CONTEXT_NAME="${BILO_DOCKER_CONTEXT:-biloapp-vps}"
PROJECT_NAME="${BILO_COMPOSE_PROJECT:-biloapp}"
ENV_FILE="${BILO_PRODUCTION_ENV_FILE:-.env.production}"
BASE_URL="${BILO_BASE_URL:-https://biloapp.pl}"

docker --context "$CONTEXT_NAME" compose \
  --project-name "$PROJECT_NAME" \
  --env-file "$ENV_FILE" \
  -f compose.yml \
  -f compose.prod.yml ps

BILO_BASE_URL="$BASE_URL" "$(dirname "$0")/smoke.sh"
