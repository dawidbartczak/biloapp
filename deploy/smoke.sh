#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BILO_BASE_URL:-http://localhost}"

curl --fail --silent --show-error "$BASE_URL/healthz" >/dev/null
curl --fail --silent --show-error "$BASE_URL/api/v1/auth/me" >/dev/null
echo "Biloapp smoke test passed: $BASE_URL"
