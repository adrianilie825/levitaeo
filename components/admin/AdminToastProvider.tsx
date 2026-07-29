"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AdminToast = {
  id: string;
  type: "success" | "error";
  message: string;
};

type AdminToastContextValue = {
  toasts: AdminToast[];
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  dismissToast: (id: string) => void;
};

const AdminToastContext = createContext<AdminToastContextValue | null>(null);

const TOAST_DURATION_MS = 4500;

function createToastId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<AdminToast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (type: AdminToast["type"], message: string) => {
      const id = createToastId();
      setToasts((current) => [...current, { id, type, message }]);

      window.setTimeout(() => {
        dismissToast(id);
      }, TOAST_DURATION_MS);
    },
    [dismissToast],
  );

  const showSuccess = useCallback(
    (message: string) => pushToast("success", message),
    [pushToast],
  );

  const showError = useCallback(
    (message: string) => pushToast("error", message),
    [pushToast],
  );

  const value = useMemo(
    () => ({ toasts, showSuccess, showError, dismissToast }),
    [toasts, showSuccess, showError, dismissToast],
  );

  return (
    <AdminToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-relevant="additions"
        className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-3 px-4"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto w-full max-w-md border px-4 py-3 text-[14px] leading-6 shadow-sm ${
              toast.type === "success"
                ? "border-[#111111] bg-[#111111] text-white"
                : "border-[#ECE8E2] bg-white text-[#111111]"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <p>{toast.message}</p>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className={`shrink-0 text-[11px] uppercase tracking-[0.18em] ${
                  toast.type === "success"
                    ? "text-white/80 hover:text-white"
                    : "text-neutral-500 hover:text-[#111111]"
                }`}
              >
                Close
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminToastContext.Provider>
  );
}

export function useAdminToast() {
  const context = useContext(AdminToastContext);

  if (!context) {
    throw new Error("useAdminToast must be used within AdminToastProvider.");
  }

  return context;
}
