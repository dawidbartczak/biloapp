#!/usr/bin/env bash
set -euo pipefail

ENV_FILE=".env.production"
if [[ "${1:-}" == "--env-file" ]]; then
  test -n "${2:-}" || { echo "Missing env file after --env-file" >&2; exit 1; }
  ENV_FILE="$2"
  shift 2
fi

docker --context bilo compose \
  --project-name bilo \
  --env-file "$ENV_FILE" \
  -f compose.yml \
  -f compose.prod.yml "$@"
