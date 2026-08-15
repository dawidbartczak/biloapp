#!/usr/bin/env bash
set -euo pipefail

CONTEXT_NAME="${BILO_DOCKER_CONTEXT:-biloapp-vps}"
PROJECT_NAME="${BILO_COMPOSE_PROJECT:-biloapp}"
ENV_FILE="${BILO_PRODUCTION_ENV_FILE:-.env.production}"

test -f "$ENV_FILE" || { echo "Missing production env file: $ENV_FILE" >&2; exit 1; }
test -z "$(git status --porcelain)" || { echo "Deployment requires a clean integration checkout" >&2; exit 1; }
git submodule foreach --quiet 'test -z "$(git status --porcelain)"' || {
  echo "Deployment requires clean frontend and backend submodules" >&2
  exit 1
}

docker --context "$CONTEXT_NAME" compose \
  --project-name "$PROJECT_NAME" \
  --env-file "$ENV_FILE" \
  -f compose.yml \
  -f compose.prod.yml up -d --build

"$(dirname "$0")/health.sh"
