import * as React from "react";
import { cn } from "@/lib/utils";

const Label = React.forwardRef(({ className, ...props }, ref) => (
  <label ref={ref} className={cn("text-sm font-medium leading-none text-[#4d4d4d] dark:text-[#a1a1aa]", className)} {...props} />
));
Label.displayName = "Label";

export { Label };
