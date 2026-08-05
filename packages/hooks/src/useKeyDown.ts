import { useEffect } from "react";

/** Keydown hook; returns a cleanup. Use for keyboard shortcuts. */
export function useKeyDown(
  keys: string[],
  handler: (event: KeyboardEvent) => void,
  options: { disabled?: boolean; allowInInput?: boolean } = {},
): void {
  const { disabled = false, allowInInput = false } = options;
  useEffect(() => {
    if (disabled) return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const inInput =
        target !== null &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);
      if (inInput && !allowInInput) return;
      const pressed =
        event.key.toLowerCase() === keys[0]?.toLowerCase() ||
        keys.includes(event.key.toLowerCase()) ||
        keys.includes(event.key.toUpperCase());
      if (pressed) handler(event);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [keys.join(","), handler, disabled, allowInInput]);
}
