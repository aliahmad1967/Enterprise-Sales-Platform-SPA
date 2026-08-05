import { useEffect, useState } from "react";

export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const QUERIES: Record<Breakpoint, string> = {
  xs: "(min-width: 0px)",
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  "2xl": "(min-width: 1536px)",
};

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

export function useBreakpoint(bp: Breakpoint): boolean {
  return useMediaQuery(QUERIES[bp]);
}

/** True once a given breakpoint is matched and stays true for larger sizes. */
export function useIsAtLeast(bp: Exclude<Breakpoint, "xs">): boolean {
  return useBreakpoint(bp);
}
