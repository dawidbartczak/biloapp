#!/usr/bin/env bash
set -euo pipefail

mkdir -p ./backups

./deploy/compose-context.sh \
  exec -T db \
  pg_dump --clean --if-exists --no-owner --no-privileges -U bilo biloapp \
  | gzip > "./backups/biloapp-$(date -u +%Y%m%dT%H%M%SZ).sql.gz"
echo "Created latest database backup in ./backups"
