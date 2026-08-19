#!/usr/bin/env bash
set -euo pipefail

# Pre-deployment gate. deploy.sh used to build and ship without running a
# single check, so contract tests could stay red for releases at a time.

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
frontend_dir="${BILO_FRONTEND_DIR:-$repo_root/frontend}"
backend_dir="${BILO_BACKEND_DIR:-$repo_root/backend}"

run_check() {
  local name="$1" directory="$2"
  shift 2
  echo "--- $name"
  if ! (cd "$directory" && "$@"); then
    echo "Pre-deployment check failed: $name" >&2
    exit 1
  fi
}

if [[ ! -d "$frontend_dir" || ! -d "$backend_dir" ]]; then
  echo "Cannot verify: expected frontend at $frontend_dir and backend at $backend_dir." >&2
  echo "Set BILO_FRONTEND_DIR and BILO_BACKEND_DIR when using sibling working copies." >&2
  exit 1
fi

echo "Verifying the release before deployment..."
run_check "backend typecheck" "$backend_dir" pnpm typecheck
run_check "frontend tokens" "$frontend_dir" pnpm tokens:check
run_check "frontend typecheck" "$frontend_dir" pnpm typecheck
run_check "frontend lint" "$frontend_dir" pnpm lint
run_check "frontend contract tests" "$frontend_dir" pnpm test
echo "Pre-deployment checks passed."
