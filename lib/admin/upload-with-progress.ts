"use client";

export type UploadProgressResult<T extends Record<string, unknown>> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; message: string; data?: T };

export function uploadFileWithProgress<T extends Record<string, unknown>>(
  url: string,
  file: File,
  options: {
    method?: "POST" | "PUT";
    onProgress?: (percent: number) => void;
  } = {},
): Promise<UploadProgressResult<T>> {
  const { method = "POST", onProgress } = options;

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.withCredentials = true;
    xhr.responseType = "json";

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !onProgress) {
        return;
      }

      const percent = Math.min(
        100,
        Math.round((event.loaded / event.total) * 100),
      );
      onProgress(percent);
    };

    xhr.onload = () => {
      const data = (xhr.response ?? {}) as T;
      const message =
        typeof data === "object" &&
        data !== null &&
        "error" in data &&
        typeof data.error === "string"
          ? data.error
          : "Upload failed.";

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ ok: true, status: xhr.status, data });
        return;
      }

      resolve({
        ok: false,
        status: xhr.status,
        message,
        data,
      });
    };

    xhr.onerror = () => {
      resolve({
        ok: false,
        status: 0,
        message: "Network error during upload. Please try again.",
      });
    };

    const body = new FormData();
    body.append("file", file);
    xhr.send(body);
  });
}
