import React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-sm border bg-transparent px-3 py-2 text-sm outline-none",
      "placeholder:opacity-50 focus-visible:ring-1 focus-visible:ring-offset-0",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
