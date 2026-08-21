#!/usr/bin/env bash
set -euo pipefail

./deploy/compose-context.sh ps

for service in db backend frontend proxy; do
  container_id="$(./deploy/compose-context.sh ps -q "$service")"
  test -n "$container_id" || {
    echo "Service $service is not running." >&2
    exit 1
  }

  health="$(docker --context bilo container inspect --format '{{.State.Health.Status}}' "$container_id")"
  test "$health" = healthy || {
    echo "Service $service is $health, not healthy." >&2
    exit 1
  }
done

./deploy/smoke.sh
