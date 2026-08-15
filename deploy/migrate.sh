#!/usr/bin/env bash
set -euo pipefail

CONTEXT_NAME="${BILO_DOCKER_CONTEXT:-biloapp-vps}"
PROJECT_NAME="${BILO_COMPOSE_PROJECT:-biloapp}"
ENV_FILE="${BILO_PRODUCTION_ENV_FILE:-.env.production}"

docker --context "$CONTEXT_NAME" compose \
  --project-name "$PROJECT_NAME" \
  --env-file "$ENV_FILE" \
  -f compose.yml \
  -f compose.prod.yml run --rm backend ./node_modules/.bin/prisma migrate deploy
