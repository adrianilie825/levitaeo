"use client";

export type UploadProgressResult<T extends Record<string, unknown>> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; message: string; data?: T };

export type JsonRequestResult<T extends Record<string, unknown>> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; message: string; data?: T };

export async function requestJson<T extends Record<string, unknown>>(
  url: string,
  options: {
    method?: "DELETE" | "GET" | "POST" | "PUT";
  } = {},
): Promise<JsonRequestResult<T>> {
  try {
    const response = await fetch(url, {
      method: options.method ?? "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    const data = (await response.json().catch(() => ({}))) as T;
    const message =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof data.error === "string"
        ? data.error
        : "Request failed.";

    if (response.ok) {
      return { ok: true, status: response.status, data };
    }

    return {
      ok: false,
      status: response.status,
      message,
      data,
    };
  } catch {
    return {
      ok: false,
      status: 0,
      message: "Network error. Please try again.",
    };
  }
}

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
