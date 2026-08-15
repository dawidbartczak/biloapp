# Biloapp integration repository

This repository owns Docker Compose, the reverse proxy, API contract and deployment tooling. Application code lives in the `frontend` and `backend` submodules.

## Initialisation

```bash
git clone --recurse-submodules https://github.com/dawidbartczak/biloapp.git
git submodule update --init --recursive
```

Update application code by committing and pushing in `biloapp-frontend` or `biloapp-backend`, then update the corresponding submodule pointer here and commit that pointer. Never commit application implementation directly only in the integration repository.

## Local runtime

```bash
cp .env.example .env
docker compose up --build
```

Only the proxy is exposed. Browser requests use `/api/v1`; server-side frontend requests use `http://backend:3001`.

## Production

Production uses `compose.prod.yml` and a Docker context over SSH. Secrets remain on the VPS and are never copied into images.

```bash
cp .env.production.example .env.production
docker context create biloapp-vps --docker "host=ssh://deploy@HOST"
docker --context biloapp-vps compose --project-name biloapp \
  --env-file .env.production \
  -f compose.yml -f compose.prod.yml up -d --build
```

The release workflow is: test and push each application repository, update and commit both submodule pointers in this repository, tag images with the corresponding commit SHA, back up PostgreSQL, run `deploy/migrate.sh`, start the new containers, then run `deploy/smoke.sh`. See `deploy/README.md` for rollback and operational commands.
