import "server-only";

type AdminUploadLogEvent = {
  productId: string;
  operation: "upload" | "replace" | "remove";
  outcome: string;
  detail?: string;
};

export function logAdminUploadOperation(event: AdminUploadLogEvent): void {
  const payload = {
    scope: "admin-upload",
    productId: event.productId,
    operation: event.operation,
    outcome: event.outcome,
    detail: event.detail,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === "development") {
    console.info("[admin-upload]", JSON.stringify(payload));
  }
}
