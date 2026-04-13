import * as React from "react";
import { cn } from "@/lib/utils";

function Badge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md bg-brand-soft px-3 py-1 text-xs font-medium text-zinc-800",
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
