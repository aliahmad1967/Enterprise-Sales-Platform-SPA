import { Package } from "lucide-react";
import { cn } from "@esp/utils";

export function ProductImage({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt?: string;
  className?: string;
}) {
  if (!src) {
    return (
      <span
        className={cn(
          "flex items-center justify-center rounded-lg bg-primary-soft text-primary",
          className,
        )}
      >
        <Package className="size-4" />
      </span>
    );
  }
  return (
    <img
      src={src}
      alt={alt ?? ""}
      className={cn("rounded-lg border border-border bg-surface object-cover", className)}
    />
  );
}
