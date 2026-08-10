import React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export const TabsList = React.forwardRef(({ className, style, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    style={style}
    className={cn("inline-flex items-center gap-1 rounded-md border p-1 flex-wrap", className)}
    {...props}
  />
));
TabsList.displayName = "TabsList";

export const TabsTrigger = React.forwardRef(({ className, style, icon: Icon, children, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    style={style}
    className={cn(
      "font-display font-semibold text-sm tracking-wide rounded-sm px-4 py-2 flex items-center gap-2",
      "transition-colors data-[state=inactive]:hover:brightness-125",
      "data-[state=active]:bg-[#E3A857] data-[state=active]:text-[#241C0F]",
      "data-[state=inactive]:bg-transparent data-[state=inactive]:text-[#A79C86]",
      className
    )}
    {...props}
  >
    {Icon && <Icon size={15} />}
    {children}
  </TabsPrimitive.Trigger>
));
TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content ref={ref} className={cn("mt-2", className)} {...props} />
));
TabsContent.displayName = "TabsContent";
