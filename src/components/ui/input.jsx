import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type = "text", ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "focus-ring flex h-10 w-full rounded-md bg-white px-3 py-2 text-sm text-[#171717] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] transition-[background-color,box-shadow,color,opacity] duration-200 ease-out placeholder:text-[#808080] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-black dark:text-white dark:shadow-[0_0_0_1px_rgba(255,255,255,0.18)]",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
