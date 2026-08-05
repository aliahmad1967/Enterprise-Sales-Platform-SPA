import { useEffect, useRef } from "react";

/** Run a callback on an interval, but only while the tab is visible. */
export function usePolling(callback: () => void, intervalMs: number, enabled = true): void {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    if (!enabled || intervalMs <= 0) return;
    let timer: ReturnType<typeof setInterval>;
    const schedule = () => {
      timer = setInterval(() => {
        if (document.visibilityState === "visible") cbRef.current();
      }, intervalMs);
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") cbRef.current();
    };
    schedule();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [intervalMs, enabled]);
}
