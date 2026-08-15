#!/usr/bin/env bash
set -euo pipefail

CONTEXT_NAME="${BILO_DOCKER_CONTEXT:-biloapp-vps}"
PROJECT_NAME="${BILO_COMPOSE_PROJECT:-biloapp}"

docker --context "$CONTEXT_NAME" compose \
  --project-name "$PROJECT_NAME" \
  -f compose.yml \
  -f compose.prod.yml "$@"
