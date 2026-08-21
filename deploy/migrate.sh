#!/usr/bin/env bash
set -euo pipefail

./deploy/compose-context.sh \
  run --rm backend ./node_modules/.bin/prisma migrate deploy
