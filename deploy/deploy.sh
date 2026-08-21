#!/usr/bin/env bash
set -euo pipefail

if [[ "${BILO_SKIP_VERIFY:-}" == "1" ]]; then
  echo "Skipping pre-deployment checks because BILO_SKIP_VERIFY=1." >&2
else
  ./deploy/verify.sh
fi

release_id="$(date -u +%Y%m%dT%H%M%SZ)"
containers=(bilo-proxy-1 bilo-frontend-1 bilo-backend-1)
rollback_images=(biloapp-caddy:rollback biloapp-frontend:rollback biloapp-backend:rollback)
existing_containers=0

if ! docker --context bilo info >/dev/null 2>&1; then
  echo "Cannot reach the production Docker context 'bilo'. No deployment action was taken." >&2
  exit 1
fi

for container in "${containers[@]}"; do
  if docker --context bilo container inspect "$container" >/dev/null 2>&1; then
    existing_containers=$((existing_containers + 1))
  fi
done

if (( existing_containers == ${#containers[@]} )); then
  echo "Saving the current release as rollback..."
  for index in "${!containers[@]}"; do
    image_id="$(docker --context bilo container inspect --format '{{.Image}}' "${containers[$index]}")"
    docker --context bilo image tag "$image_id" "${rollback_images[$index]}"
  done
  rollback_available=true
elif (( existing_containers == 0 )); then
  echo "First deployment: there is no previous release to save."
  rollback_available=false
else
  echo "Cannot create a complete rollback: only $existing_containers of ${#containers[@]} application containers exist." >&2
  exit 1
fi

echo "Building release $release_id..."
if ! BILO_IMAGE_TAG="$release_id" BILO_RELEASE_ID="$release_id" \
  ./deploy/compose-context.sh build 2>&1 | tee /tmp/bilo-build.log; then
  echo "Release build failed. The running containers were not changed." >&2
  exit 1
fi

echo "Applying database migrations for release $release_id..."
if ! BILO_IMAGE_TAG="$release_id" BILO_RELEASE_ID="$release_id" \
  ./deploy/compose-context.sh \
  run --rm backend ./node_modules/.bin/prisma migrate deploy 2>&1 | tee /tmp/bilo-migrate.log; then
  echo "Database migration failed. The running containers were not changed." >&2
  exit 1
fi

echo "Deploying release $release_id..."
if ! BILO_IMAGE_TAG="$release_id" BILO_RELEASE_ID="$release_id" \
  ./deploy/compose-context.sh \
  up -d --no-build --wait --wait-timeout 180 2>&1 | tee /tmp/bilo-deploy.log; then
  echo "Deployment failed." >&2
  if [[ "$rollback_available" == true ]]; then
    echo "Restoring the previous release..." >&2
    ./deploy/rollback.sh || echo "Automatic rollback also failed. Check the containers manually." >&2
  fi
  exit 1
fi

if ! BILO_IMAGE_TAG="$release_id" BILO_RELEASE_ID="$release_id" ./deploy/health.sh || \
  ! curl --fail --silent --show-error --retry 5 --retry-delay 2 --retry-all-errors \
    --connect-timeout 5 --max-time 10 \
    "${BILO_BASE_URL:-https://biloapp.pl}/api/v1/events?page=1" >/dev/null; then
  echo "Health check failed." >&2
  if [[ "$rollback_available" == true ]]; then
    echo "Restoring the previous release..." >&2
    ./deploy/rollback.sh || echo "Automatic rollback also failed. Check the containers manually." >&2
  fi
  exit 1
fi

for repository in biloapp-caddy biloapp-frontend biloapp-backend; do
  while IFS= read -r tag; do
    if [[ "$tag" != "$release_id" && "$tag" != rollback && "$tag" != "<none>" ]]; then
      docker --context bilo image rm "$repository:$tag" >/dev/null 2>&1 || true
    fi
  done < <(docker --context bilo image ls "$repository" --format '{{.Tag}}')
done

echo "Release $release_id deployed successfully."
