# API contract

`openapi.yaml` is the canonical transport contract. The frontend owns its generated DTO/client output and must not import backend implementation modules or Prisma types.

Every versioned endpoint is served below `/api/v1`; server-side frontend calls prepend `/api/v1` to `INTERNAL_API_URL`, while browser calls use the same-origin `/api/v1` path.
