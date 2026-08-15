# VPS deployment

## Host preparation

Create an unprivileged `deploy` account, install Docker Engine with Compose V2, authorize only an SSH key for that account and allow inbound TCP ports `22`, `80` and `443`. Do not expose PostgreSQL or Docker TCP (`2375`). Point the domain A/AAAA records at the VPS and create `/srv/biloapp` owned by `deploy`.

Keep `.env.production`, release pointer files and encrypted database backups only on the VPS. Test restoring a backup before relying on it. A scheduled backup should run `deploy/backup.sh`, copy the resulting encrypted artifact off-host and enforce a documented retention period.

## Docker context

Create the remote Docker context over SSH:

```bash
docker context create biloapp-vps --docker "host=ssh://deploy@HOST"
docker --context biloapp-vps info
docker --context biloapp-vps ps
```

Deploy only pushed commits from a clean recursive checkout. Record the current release env as `.env.release.previous`, run `deploy/backup.sh`, execute `deploy/migrate.sh`, and then deploy:

```bash
./deploy/deploy.sh
```

Keep production env files and PostgreSQL backups on the VPS. Never expose PostgreSQL or Docker API port `2375` publicly.

Run `./deploy/backup.sh` before risky migrations, `./deploy/migrate.sh` for explicit Prisma deployment, `./deploy/smoke.sh` after rollout and `./deploy/rollback.sh` with a previously saved release env file when rollback is required.

`BILO_FRONTEND_REVISION` and `BILO_BACKEND_REVISION` must contain the deployed submodule SHAs. The Compose image names are tagged with those values. A database migration that is not backward-compatible requires its own restore-tested rollback procedure; switching images alone does not undo schema changes.
