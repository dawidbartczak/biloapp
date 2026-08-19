# VPS deployment

All commands are run locally from the repository root. Docker reaches the VPS through the `bilo` SSH context.

Deploy:

```bash
./deploy/deploy.sh
```

The script first runs `deploy/verify.sh`, which typechecks the backend and runs the frontend token, typecheck, lint and contract-test suites against the submodules that are about to be built. A failing check aborts before anything is built. Set `BILO_SKIP_VERIFY=1` only to ship an emergency fix, and set `BILO_FRONTEND_DIR` and `BILO_BACKEND_DIR` when verifying sibling working copies instead of the submodules.

The script then generates one UTC release ID, builds the frontend, backend and Caddy images with that tag, waits for healthy containers and runs public smoke tests. Before replacing an existing release, it saves all three running images under the `rollback` tag. If deployment or health checks fail, the previous images are restored automatically. After success, obsolete tags for these three images are removed; the current version, rollback slot and reusable build cache remain.

Manual rollback:

```bash
./deploy/rollback.sh
```

`.env.production` contains production configuration and secrets, but no release numbers. `deploy/compose-context.sh` supplies the Docker context, project name and Compose files shared by the scripts.

Useful checks:

```bash
./deploy/health.sh
./deploy/smoke.sh
./deploy/backup.sh
./deploy/migrate.sh
./deploy/maintenance.sh
```

The VPS user `bilo` has a five-minute cron that runs the same maintenance endpoint inside `bilo-backend-1`. That sweep is the backstop for delayed Stripe settlement (P24): if `charge.updated` is lost, a paid `PENDING` order is fulfilled from the deferral audit trail instead of being left ticketless.

The rollback slot appears only after a successful application stack already exists. It restores application images, not PostgreSQL data or schema. Run a tested database backup before an incompatible migration; `deploy.sh` intentionally does not run migrations automatically.
