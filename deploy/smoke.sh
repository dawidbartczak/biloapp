#!/usr/bin/env bash
set -euo pipefail

curl --fail --silent --show-error --retry 15 --retry-delay 2 --retry-all-errors \
  --connect-timeout 5 --max-time 10 https://biloapp.pl/healthz >/dev/null
curl --fail --silent --show-error --retry 5 --retry-delay 2 --retry-all-errors \
  --connect-timeout 5 --max-time 10 https://biloapp.pl/api/v1/auth/me >/dev/null
echo "Biloapp smoke test passed: https://biloapp.pl"
