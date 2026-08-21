#!/usr/bin/env bash
set -euo pipefail

rollback_images=(biloapp-caddy:rollback biloapp-frontend:rollback biloapp-backend:rollback)

for image in "${rollback_images[@]}"; do
  docker --context bilo image inspect "$image" >/dev/null 2>&1 || {
    echo "Missing rollback image: $image" >&2
    exit 1
  }
done

release_id="$(docker --context bilo image inspect \
  --format '{{index .Config.Labels "org.opencontainers.image.revision"}}' \
  biloapp-backend:rollback)"

if [[ -z "$release_id" || "$release_id" == "<no value>" || "$release_id" == unknown ]]; then
  release_id=rollback
fi

echo "Rolling back to release $release_id..."
BILO_IMAGE_TAG=rollback BILO_RELEASE_ID="$release_id" \
  ./deploy/compose-context.sh \
  up -d --no-build --wait --wait-timeout 180

BILO_IMAGE_TAG=rollback BILO_RELEASE_ID="$release_id" ./deploy/health.sh
echo "Rollback to release $release_id completed successfully."
