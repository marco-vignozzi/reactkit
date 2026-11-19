/**
 * Destructive operations confirmed on the server's terms.
 *
 * The backend (djkit.errors.require_confirmation) answers 428 until the
 * request carries enough confirmations, with what would be lost:
 *   {detail, impact: {key: value}, required, given}; a value is usually a
 *   count, sometimes a date or an amount (string), a row described by a
 *   flat object (e.g. {id, date, amount}) or null (nothing of that kind).
 * useConfirmedAction runs the operation with 0 confirmations, shows the
 * 428 to the user (ConfirmationDialog in reactkit/ui), and repeats it with
 * one confirmation more each time the user confirms, until it succeeds.
 * The impact and the number of confirmations always come from the server.
 */
import { useCallback, useRef, useState } from "react";

import { ApiError } from "./http.ts";

/** A flat value inside an impact row. */
export type ImpactScalar = number | string | boolean | null;

/**
 * One value of a 428 impact: a count, a string such as a date or an
 * amount, a row described by a flat object (e.g. the payment that is kept:
 * {id, date, amount}), or null (nothing of that kind).
 */
export type ImpactValue = number | string | null | Record<string, ImpactScalar>;

/**
 * Whether a decoded JSON value is an ImpactValue.
 *
 * @param value one value of the impact.
 * @returns true for a number, a string, null or a flat object of scalars.
 */
function isImpactValue(value: unknown): value is ImpactValue {
  if (value === null || typeof value === "number" || typeof value === "string") return true;
  if (typeof value !== "object" || Array.isArray(value)) return false;
  return Object.values(value).every((inner) => inner === null || ["number", "string", "boolean"].includes(typeof inner));
}

/** A 428 waiting for the user. */
export interface PendingConfirmation {
  /** The server's message (e.g. why two confirmations are needed). */
  detail: string;
  /** What would be lost: {key: value}; keys are the server's codes, values counts, strings (dates, amounts), flat objects or null. */
  impact: Record<string, ImpactValue>;
  /** Confirmations needed. */
  required: number;
  /** Confirmations already given (the next request sends given + 1). */
  given: number;
}

/** Outcome of a confirmed action. */
export type ConfirmedResult<T> = { status: "done"; value: T } | { status: "cancelled" };

/** What useConfirmedAction returns. */
export interface ConfirmationFlow {
  /** The 428 shown to the user, or null. */
  pending: PendingConfirmation | null;
  /** A request is running. */
  busy: boolean;
  /** The user confirmed: repeat with one confirmation more. */
  confirm: () => void;
  /** The user gave up: the action ends as "cancelled". */
  cancel: () => void;
}

/**
 * Reads a 428 body.
 *
 * @param error what the request threw.
 * @returns the pending confirmation, or null when it is not a valid 428.
 */
export function pendingFrom(error: unknown): PendingConfirmation | null {
  if (!(error instanceof ApiError) || error.status !== 428 || error.body === null) return null;
  const { impact, required, given } = error.body;
  if (typeof required !== "number" || typeof given !== "number" || typeof impact !== "object" || impact === null) return null;
  for (const [key, value] of Object.entries(impact)) {
    // Fail loudly: a value the dialog cannot show is a bug of the server or of this kit.
    if (!isImpactValue(value)) throw new Error(`pendingFrom: impact "${key}" is not a number, a string, null or a flat object`);
  }
  return { detail: error.detail, impact: impact as Record<string, ImpactValue>, required, given };
}

/**
 * Runs destructive actions that the server may ask to confirm.
 *
 * @returns [start, flow]: `start(action)` runs `action(0)`; on 428 it waits
 *   for the user (flow.pending), then runs `action(given + 1)`, and so on.
 *   It resolves to {status: "done", value} or {status: "cancelled"}, and
 *   rejects with any other error (shown by the caller).
 *
 * @example
 *   const [start, flow] = useConfirmedAction();
 *   const result = await start((n) => api.del(`/orders/${id}`, { confirmations: n }));
 *   if (result.status === "done") toast.success("Deleted.");
 *   ...
 *   <ConfirmationDialog flow={flow} title="Delete the order?" ... />
 */
export function useConfirmedAction(): [<T>(action: (confirmations: number) => Promise<T>) => Promise<ConfirmedResult<T>>, ConfirmationFlow] {
  const [pending, setPending] = useState<PendingConfirmation | null>(null);
  const [busy, setBusy] = useState(false);
  // The running action and how to settle its promise.
  const current = useRef<{
    action: (confirmations: number) => Promise<unknown>;
    resolve: (result: ConfirmedResult<unknown>) => void;
    reject: (error: unknown) => void;
  } | null>(null);

  /** Sends the action with `confirmations`; on 428 waits for the user. */
  const attempt = useCallback(async (confirmations: number) => {
    const running = current.current;
    if (running === null) return;
    setBusy(true);
    try {
      const value = await running.action(confirmations);
      current.current = null;
      setPending(null);
      running.resolve({ status: "done", value });
    } catch (error) {
      const next = pendingFrom(error);
      if (next !== null) {
        setPending(next);
      } else {
        current.current = null;
        setPending(null);
        running.reject(error);
      }
    } finally {
      setBusy(false);
    }
  }, []);

  const start = useCallback(
    <T,>(action: (confirmations: number) => Promise<T>) =>
      new Promise<ConfirmedResult<T>>((resolve, reject) => {
        current.current?.resolve({ status: "cancelled" });
        current.current = {
          action,
          resolve: resolve as (result: ConfirmedResult<unknown>) => void,
          reject,
        };
        void attempt(0);
      }),
    [attempt],
  );

  const confirm = useCallback(() => {
    if (pending !== null) void attempt(pending.given + 1);
  }, [attempt, pending]);

  const cancel = useCallback(() => {
    current.current?.resolve({ status: "cancelled" });
    current.current = null;
    setPending(null);
  }, []);

  return [start, { pending, busy, confirm, cancel }];
}
