import React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex w-full rounded-sm border bg-transparent px-3 py-2 text-sm outline-none",
      "placeholder:opacity-50 focus-visible:ring-1 focus-visible:ring-offset-0",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
