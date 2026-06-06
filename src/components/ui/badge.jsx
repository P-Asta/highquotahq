import * as React from "react";
import { cn } from "@/lib/utils";

const Badge = React.forwardRef(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("inline-flex h-6 items-center rounded-full bg-[#ebf5ff] px-3 text-xs font-medium text-[#0068d6] dark:bg-white dark:text-black", className)}
    {...props}
  />
));
Badge.displayName = "Badge";

export { Badge };
