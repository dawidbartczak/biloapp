import { writeFile } from "node:fs/promises";

const operations = [
  ["get", "/health", "getHealth"],
  ["get", "/config/public", "getPublicConfig"],
  ["get", "/auth/me", "getCurrentUser"],
  ["get", "/auth/admin-2fa/challenge", "getAdminTwoFactorChallenge"],
  ["post", "/auth/register", "registerUser"],
  ["post", "/auth/login", "loginUser"],
  ["post", "/auth/admin-2fa/verify", "verifyAdminTwoFactor"],
  ["post", "/auth/logout", "logoutUser"],
  ["post", "/auth/password-reset/request", "requestPasswordReset"],
  ["post", "/auth/password-reset/confirm", "confirmPasswordReset"],
  ["post", "/auth/email-verification/confirm", "confirmEmailVerification"],
  ["post", "/auth/email-verification/resend", "resendEmailVerification"],
  ["get", "/events", "listPublicEvents"],
  ["get", "/events-sitemap", "listEventSitemapEntries"],
  ["get", "/events/{slug}", "getPublicEvent"],
  ["post", "/events/{slug}/reports", "reportPublicEvent"],
  ["get", "/events/change-decisions/{notificationId}", "getEventChangeDecision"],
  ["post", "/events/change-decisions/{notificationId}", "submitEventChangeDecision"],
  ["post", "/support", "createSupportRequest"],
  ["post", "/client-errors", "reportClientError"],
  ["get", "/cookie-consent", "getCookieConsent"],
  ["put", "/cookie-consent", "saveCookieConsent"],
  ["delete", "/cookie-consent", "resetCookieConsent"],
  ["post", "/privacy/requests", "createPrivacyRequest"],
  ["post", "/privacy/requests/verify", "verifyPrivacyRequest"],
  ["post", "/payments/checkout", "createCheckout"],
  ["post", "/payments/checkout-quote", "quoteCheckout"],
  ["get", "/payments/checkout-result", "getCheckoutResult"],
  ["post", "/payments/stripe/webhook", "handleStripeWebhook", "raw"],
  ["post", "/payments/stripe/connect/webhook", "handleStripeConnectWebhook", "raw"],
  ["post", "/payments/stripe/connect/account", "createStripeConnectAccount"],
  ["get", "/payments/stripe/connect/return", "returnFromStripeConnect"],
  ["get", "/tickets/{token}", "getPublicTicket"],
  ["get", "/tickets/{token}/qr", "downloadTicketQr", "binary"],
  ["get", "/tickets/{token}/pdf", "downloadTicketPdf", "binary"],
  ["post", "/check-in/scan", "scanTicket"],
  ["post", "/check-in/undo", "undoTicketCheckIn"],
  ["post", "/uploads/events", "uploadEventImage", "multipart"],
  ["get", "/uploads/events/{fileName}", "downloadEventImage", "binary"],

  ["get", "/organizer/dashboard", "getOrganizerDashboard"],
  ["get", "/organizer/start", "getOrganizerStart"],
  ["get", "/organizer/events", "listOrganizerEvents"],
  ["post", "/organizer/events", "createOrganizerEvent"],
  ["get", "/organizer/events/{id}", "getOrganizerEvent"],
  ["patch", "/organizer/events/{id}", "updateOrganizerEvent"],
  ["post", "/organizer/events/{id}/submit", "submitOrganizerEvent"],
  ["post", "/organizer/events/{id}/publish", "publishOrganizerEvent"],
  ["post", "/organizer/events/{id}/unpublish", "unpublishOrganizerEvent"],
  ["post", "/organizer/events/{id}/ticket-types", "createOrganizerTicketType"],
  ["get", "/organizer/events/{id}/attendees", "listOrganizerEventAttendees"],
  ["get", "/organizer/events/{id}/attendees.csv", "exportOrganizerEventAttendees", "binary"],
  ["get", "/organizer/orders/{id}", "getOrganizerOrder"],
  ["post", "/organizer/orders/{id}/resend-tickets", "resendOrganizerOrderTickets"],
  ["post", "/organizer/orders/{id}/refund", "refundOrganizerOrder"],
  ["get", "/organizer/settings", "getOrganizerSettings"],
  ["put", "/organizer/profile", "updateOrganizerProfile"],
  ["get", "/organizer/event-picker", "getOrganizerEventPicker"],
  ["get", "/organizer/scanner/events", "getOrganizerScannerEvents"],
  ["put", "/organizer/stripe/account", "saveOrganizerStripeAccount"],
  ["post", "/organizer/stripe/status/refresh", "refreshOrganizerStripeStatus"],

  ["get", "/admin/dashboard", "getAdminDashboard"],
  ["get", "/admin/organizers", "listAdminOrganizers"],
  ["get", "/admin/organizers/{id}", "getAdminOrganizer"],
  ["patch", "/admin/organizers/{id}/status", "updateAdminOrganizerStatus"],
  ["get", "/admin/events", "listAdminEvents"],
  ["get", "/admin/events/{id}", "getAdminEvent"],
  ["post", "/admin/events/{id}/review", "reviewAdminEvent"],
  ["patch", "/admin/events/{id}/status", "updateAdminEventStatus"],
  ["get", "/admin/event-reports", "listAdminEventReports"],
  ["get", "/admin/event-reports/{id}", "getAdminEventReport"],
  ["patch", "/admin/event-reports/{id}", "updateAdminEventReport"],
  ["get", "/admin/orders", "listAdminOrders"],
  ["get", "/admin/orders/{id}", "getAdminOrder"],
  ["patch", "/admin/orders/{id}/buyer-email", "updateAdminOrderBuyerEmail"],
  ["post", "/admin/orders/{id}/resend-tickets", "resendAdminOrderTickets"],
  ["get", "/admin/tickets", "listAdminTickets"],
  ["get", "/admin/tickets/{id}", "getAdminTicket"],
  ["post", "/admin/tickets/{id}/invalidate", "invalidateAdminTicket"],
  ["get", "/admin/refunds", "listAdminRefunds"],
  ["get", "/admin/refunds/{id}", "getAdminRefund"],
  ["post", "/admin/refunds/{id}/cancel", "cancelAdminRefund"],
  ["post", "/admin/refunds/{id}/platform-advance", "fundAdminRefundWithPlatformAdvance"],
  ["post", "/admin/refunds/{id}/alternative-settlement", "recordAdminRefundAlternativeSettlement"],
  ["post", "/admin/refunds/{id}/buyer-recovery", "recordAdminRefundBuyerRecovery"],
  ["get", "/admin/incidents", "getAdminIncidents"],
  ["get", "/admin/disputes/{id}", "getAdminDispute"],
  ["post", "/admin/disputes/{id}/recovery", "recoverAdminDispute"],
  ["get", "/admin/stripe-incidents/{id}", "getAdminStripeIncident"],
  ["get", "/admin/technical-refunds/{id}", "getAdminTechnicalRefund"],
  ["post", "/admin/technical-refunds/{id}/execute", "executeAdminTechnicalRefund"],
  ["post", "/admin/technical-refunds/{id}/alternative-settlement", "settleAdminTechnicalRefund"],
  ["get", "/admin/event-change-decisions/{id}", "getAdminEventChangeDecision"],
  ["get", "/admin/support", "listAdminSupportRequests"],
  ["get", "/admin/support/{id}", "getAdminSupportRequest"],
  ["patch", "/admin/support/{id}", "updateAdminSupportRequest"],
  ["post", "/admin/support/{id}/automated-refund", "refundAdminSupportRequest"],
  ["get", "/admin/operations", "getAdminOperations"],
  ["get", "/admin/operations/{queue}/{id}", "getAdminOperation"],
  ["post", "/admin/operations/emails/{id}/retry", "retryAdminEmail"],
  ["get", "/admin/privacy", "listAdminPrivacyRequests"],
  ["get", "/admin/privacy/{id}", "getAdminPrivacyRequest"],
  ["post", "/admin/privacy/{id}", "transitionAdminPrivacyRequest"],
  ["post", "/admin/privacy/{id}/execution-plan", "planAdminPrivacyExecution"],
  ["post", "/admin/privacy/operations/{id}/decision", "decideAdminPrivacyOperation"],
  ["post", "/admin/privacy/operations/{id}/execute", "executeAdminPrivacyOperation"],
  ["get", "/admin/privacy-retention", "getAdminPrivacyRetention"],
  ["get", "/admin/privacy-retention/{id}", "getAdminPrivacyRetentionRun"],
  ["post", "/admin/privacy-retention/defaults", "ensureAdminPrivacyRetentionDefaults"],
  ["post", "/admin/privacy-retention/runs", "createAdminPrivacyRetentionRun"],
  ["post", "/admin/privacy-retention/runs/{runId}/candidates/{candidateId}/review", "reviewAdminPrivacyRetentionCandidate"],
  ["post", "/admin/privacy-retention/runs/{id}/approve", "approveAdminPrivacyRetentionRun"],
  ["post", "/admin/privacy-retention/runs/{id}/claim", "claimAdminPrivacyRetentionRun"],
  ["post", "/admin/privacy-retention/runs/{runId}/candidates/{candidateId}/apply", "applyAdminPrivacyRetentionCandidate"],
  ["get", "/admin/security", "getAdminSecurity"],
  ["post", "/admin/sessions/revoke-all", "revokeAllAdminSessions"],
  ["post", "/admin/sessions/revoke-others", "revokeOtherAdminSessions"],
  ["get", "/admin/audit", "listAdminAuditEvents"],
  ["get", "/admin/financial-reconciliations", "listAdminFinancialReconciliations"],
  ["get", "/admin/financial-reconciliations/{id}", "getAdminFinancialReconciliation"],
  ["get", "/admin/financial-reconciliations/{id}/authority", "getAdminFinancialReconciliationAuthority"],
  ["put", "/admin/financial-reconciliations/{id}/classification", "classifyAdminFinancialReconciliation"],
  ["post", "/admin/setoff/impairments/{id}/resolve", "resolveAdminSetoffImpairment"],
  ["post", "/admin/setoff/orders/{id}/overlap-compensation", "resolveAdminSetoffOverlap"],
  ["post", "/admin/setoff/plans/organizers/{organizerId}/activate", "activateAdminSetoffPlan"],
  ["post", "/admin/setoff/plans/{id}/pause", "pauseAdminSetoffPlan"],
  ["post", "/admin/setoff/plans/{id}/resume", "resumeAdminSetoffPlan"],
  ["post", "/admin/setoff/plans/{id}/retire", "retireAdminSetoffPlan"],
  ["post", "/operations/maintenance", "runMaintenance"]
];

const pathParameters = (path) =>
  [...path.matchAll(/\{([^}]+)\}/g)].map(([, name]) => ({
    name,
    in: "path",
    required: true,
    schema: { type: "string", minLength: 1 }
  }));

const queryParameters = [
  "q", "query", "category", "status", "verificationStatus", "eventId", "token", "session_id"
].map((name) => ({ name, in: "query", required: false, schema: { type: "string" } }));
queryParameters.push(
  { name: "page", in: "query", required: false, schema: { type: "integer", minimum: 1 } },
  { name: "pageSize", in: "query", required: false, schema: { type: "integer", minimum: 1, maximum: 100 } }
);

const paths = {};
for (const [method, path, operationId, kind] of operations) {
  const parameters = [...pathParameters(path), ...(method === "get" ? queryParameters : [])];
  const operation = {
    operationId,
    ...(parameters.length ? { parameters } : {}),
    responses: {
      "200": {
        description: kind === "binary" ? "Binary resource" : "Successful operation",
        content: kind === "binary"
          ? { "application/octet-stream": { schema: { type: "string", format: "binary" } } }
          : { "application/json": { schema: { $ref: method === "get" ? "#/components/schemas/TransportObject" : "#/components/schemas/MutationResult" } } }
      },
      default: {
        description: "Error response",
        content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } }
      }
    }
  };
  if (["post", "put", "patch", "delete"].includes(method)) {
    const contentType = kind === "raw" ? "application/json" : kind === "multipart" ? "multipart/form-data" : "application/json";
    operation.requestBody = {
      required: !["logoutUser", "resetCookieConsent"].includes(operationId),
      content: {
        [contentType]: {
          schema: kind === "raw"
            ? { type: "string", format: "binary" }
            : kind === "multipart"
              ? { $ref: "#/components/schemas/EventImageUpload" }
              : { $ref: "#/components/schemas/TransportObject" }
        }
      }
    };
  }
  (paths[path] ??= {})[method] = operation;
}

const document = {
  openapi: "3.0.3",
  info: {
    title: "Biloapp API",
    version: "1.0.0",
    description: "Canonical, versioned transport contract between Biloapp frontend and Fastify backend. Dates use ISO 8601, monetary values are integer grosz values and identifiers are opaque strings."
  },
  servers: [{ url: "/api/v1" }],
  paths,
  components: {
    securitySchemes: {
      sessionCookie: { type: "apiKey", in: "cookie", name: "bilo_session" }
    },
    schemas: {
      ApiError: {
        type: "object",
        additionalProperties: false,
        required: ["error"],
        properties: {
          error: {
            type: "object",
            additionalProperties: false,
            required: ["code", "message", "requestId"],
            properties: {
              code: { type: "string" },
              message: { type: "string" },
              details: { type: "object", additionalProperties: true },
              requestId: { type: "string" }
            }
          }
        }
      },
      TransportObject: {
        type: "object",
        description: "Transport-only DTO. It must never expose Prisma models, secrets or frontend paths.",
        additionalProperties: true
      },
      MutationResult: {
        type: "object",
        required: ["ok", "outcome"],
        properties: {
          ok: { type: "boolean" },
          outcome: { type: "string" },
          resourceId: { type: "string" },
          revision: { type: "integer", minimum: 0 }
        },
        additionalProperties: true
      },
      PaginatedResponse: {
        type: "object",
        required: ["items", "page", "pageSize", "total", "pageCount"],
        properties: {
          items: { type: "array", items: { $ref: "#/components/schemas/TransportObject" } },
          page: { type: "integer", minimum: 1 },
          pageSize: { type: "integer", minimum: 1 },
          total: { type: "integer", minimum: 0 },
          pageCount: { type: "integer", minimum: 0 }
        }
      },
      EventImageUpload: {
        type: "object",
        required: ["file"],
        properties: { file: { type: "string", format: "binary" } }
      }
    }
  }
};

await writeFile(new URL("../contracts/openapi.yaml", import.meta.url), `${JSON.stringify(document, null, 2)}\n`);
