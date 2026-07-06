"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import {
  categoryGradient,
  gradientStyle,
  SUCCESS_GRADIENT,
  ERROR_GRADIENT,
} from "./gradients";
import type { LiftResponse } from "@/lib/api-types";

type State =
  | { kind: "default" }
  | { kind: "submitting" }
  | { kind: "success"; fading: boolean }
  | { kind: "already-prayed" }
  | { kind: "inactive" }
  | { kind: "retry"; message: string };

type Props = {
  prayerId: number;
  category: string | null;
  onLifted?: (breakdown: NonNullable<LiftResponse["participant_breakdown"]>) => void;
};

export default function LiftPrayerButton({ prayerId, category, onLifted }: Props) {
  const [state, setState] = useState<State>({ kind: "default" });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  async function lift() {
    if (state.kind !== "default" && state.kind !== "retry") return;
    setState({ kind: "submitting" });

    try {
      const res = await fetch("/bff/public/prayer-lift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prayerId }),
      });
      const data: LiftResponse = await res.json();

      if (res.ok && data.success) {
        setState({ kind: "success", fading: false });
        if (data.participant_breakdown) onLifted?.(data.participant_breakdown);
        timers.current.push(
          setTimeout(() => setState({ kind: "success", fading: true }), 2000),
        );
        return;
      }

      if (data.code === "DUPLICATE_PARTICIPATION") {
        setState({ kind: "already-prayed" });
        return;
      }

      if (data.code === "PRAYER_INACTIVE") {
        setState({ kind: "inactive" });
        return;
      }

      setState({ kind: "retry", message: "Could not record — try again" });
    } catch {
      setState({ kind: "retry", message: "Network error — try again" });
    }
  }

  const disabled =
    state.kind === "submitting" ||
    state.kind === "success" ||
    state.kind === "already-prayed" ||
    state.kind === "inactive";

  const style =
    state.kind === "success"
      ? gradientStyle(SUCCESS_GRADIENT)
      : state.kind === "retry"
        ? gradientStyle(ERROR_GRADIENT)
        : state.kind === "already-prayed" || state.kind === "inactive"
          ? { background: "#9CA3AF" }
          : gradientStyle(categoryGradient(category));

  const label =
    state.kind === "default"
      ? "🙏 Lift Prayer"
      : state.kind === "submitting"
        ? "Submitting…"
        : state.kind === "success"
          ? "✓ Thank you for Praying"
          : state.kind === "already-prayed"
            ? "You've already prayed"
            : state.kind === "inactive"
              ? "No longer active"
              : "🔄 Try Again";

  return (
    <div className="w-full sm:w-auto">
      <button
        type="button"
        onClick={lift}
        disabled={disabled}
        aria-label={`Lift prayer${category ? ` for ${category}` : ""}`}
        aria-disabled={disabled}
        aria-busy={state.kind === "submitting"}
        style={style}
        className={clsx(
          "w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-all duration-200",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          state.kind === "default" &&
            "hover:scale-105 hover:-translate-y-px hover:shadow-lg cursor-pointer",
          state.kind === "retry" && "cursor-pointer",
          state.kind === "submitting" && "opacity-75 cursor-not-allowed",
          (state.kind === "already-prayed" || state.kind === "inactive") &&
            "cursor-not-allowed",
          state.kind === "success" && "cursor-default",
          state.kind === "success" && state.fading
            ? "opacity-0 transition-opacity duration-1000"
            : "opacity-100",
        )}
      >
        {state.kind === "submitting" && (
          <span
            className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin"
            aria-hidden
          />
        )}
        {label}
      </button>

      <p aria-live="polite" role="status" className="sr-only">
        {state.kind === "success" && "Prayer recorded. Thank you for praying."}
        {state.kind === "already-prayed" && "You have already prayed for this."}
        {state.kind === "inactive" && "This prayer is no longer active."}
        {state.kind === "retry" && state.message}
      </p>

      {state.kind === "retry" && (
        <p className="mt-2 text-xs text-red-700">{state.message}</p>
      )}
    </div>
  );
}
