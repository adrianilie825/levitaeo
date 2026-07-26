import "server-only";

import { logAdminUploadOperation } from "@/lib/admin/upload-audit";

export function logAdminUploadWarning(input: {
  productId: string;
  operation: "upload" | "replace" | "remove";
  detail: string;
}) {
  logAdminUploadOperation({
    productId: input.productId,
    operation: input.operation,
    outcome: "cleanup_warning",
    detail: input.detail,
  });
}
