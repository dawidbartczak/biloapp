#!/usr/bin/env bash
set -euo pipefail

CONTEXT_NAME="${BILO_DOCKER_CONTEXT:-biloapp-vps}"
PROJECT_NAME="${BILO_COMPOSE_PROJECT:-biloapp}"
RELEASE_FILE="${BILO_RELEASE_FILE:-.env.release.previous}"

test -f "$RELEASE_FILE" || {
  echo "Missing rollback release file: $RELEASE_FILE" >&2
  exit 1
}

docker --context "$CONTEXT_NAME" compose \
  --project-name "$PROJECT_NAME" \
  --env-file "$RELEASE_FILE" \
  -f compose.yml \
  -f compose.prod.yml up -d
