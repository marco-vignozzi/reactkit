/**
 * Toast notifications: short, non-blocking messages about the outcome of
 * an operation. Successes and infos disappear after a few seconds; errors
 * stay until closed (they may need to be read carefully).
 */
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

import { useUiLabels } from "./labels.tsx";

/** Kind of a toast. */
export type ToastKind = "success" | "error" | "info";

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

/** Functions given by useToast. */
export interface ToastApi {
  success(message: string): void;
  error(message: string): void;
  info(message: string): void;
}

const ToastContext = createContext<ToastApi | null>(null);

/** Props of ToastProvider. */
export interface ToastProviderProps {
  /** Milliseconds a success / info toast stays. Default 4000. */
  duration?: number;
  children: ReactNode;
}

/** Holds the toasts and renders them in a live region (bottom of the screen). */
export function ToastProvider({ duration = 4000, children }: ToastProviderProps) {
  const labels = useUiLabels();
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setItems((current) => current.filter((item) => item.id !== id)), []);

  const push = useCallback(
    (kind: ToastKind, message: string) => {
      const id = nextId.current++;
      setItems((current) => [...current, { id, kind, message }]);
      if (kind !== "error") window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss, duration],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => push("success", message),
      error: (message) => push("error", message),
      info: (message) => push("info", message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="rk-toasts" aria-live="polite">
        {items.map((item) => (
          <div key={item.id} className={`rk-toast rk-toast-${item.kind}`} role={item.kind === "error" ? "alert" : "status"}>
            <span>{item.message}</span>
            <button type="button" aria-label={labels.close} onClick={() => dismiss(item.id)}>×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * The toast functions of the nearest ToastProvider.
 *
 * @throws Error when used outside a ToastProvider.
 */
export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (api === null) throw new Error("useToast must be used inside a ToastProvider");
  return api;
}
