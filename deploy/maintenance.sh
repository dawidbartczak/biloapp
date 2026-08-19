#!/usr/bin/env bash
set -euo pipefail

# Runs the in-container maintenance endpoint. The secret stays inside the
# backend container; it is never written to disk or to the cron table.
# On the VPS this is invoked every five minutes by:
#   */5 * * * * /usr/bin/flock -n /tmp/bilo-maintenance.lock /home/bilo/bilo-maintenance.sh

if [[ -n "${BILO_DOCKER_CONTEXT:-}" || ! -S /var/run/docker.sock ]]; then
  docker_cmd=(docker --context "${BILO_DOCKER_CONTEXT:-bilo}")
else
  docker_cmd=(docker)
fi

"${docker_cmd[@]}" exec bilo-backend-1 node -e "
fetch('http://127.0.0.1:3001/api/internal/maintenance', {
  method: 'POST',
  headers: { authorization: 'Bearer ' + process.env.MAINTENANCE_SECRET }
}).then(async (response) => {
  const parsed = JSON.parse(await response.text());
  const failing = Object.entries(parsed.jobs || {})
    .filter(([, job]) => job.ok === false)
    .map(([name]) => name);
  console.log(
    new Date().toISOString(),
    response.status,
    parsed.outcome,
    failing.length ? 'failed: ' + failing.join(', ') : 'all jobs ok'
  );
  if (!parsed.ok) process.exit(1);
}).catch((error) => {
  console.error(new Date().toISOString(), 'maintenance request failed:', error.message);
  process.exit(1);
});
"
