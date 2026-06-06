import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "focus-ring inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium leading-none transition-[background-color,box-shadow,color,opacity,transform] duration-200 ease-out disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#171717] text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-[#ededed]",
        secondary: "bg-white text-[#171717] shadow-[0_0_0_1px_rgb(235,235,235)] hover:bg-[#fafafa] dark:bg-black dark:text-white dark:shadow-[0_0_0_1px_rgba(255,255,255,0.18)] dark:hover:bg-[#0a0a0a]",
        ghost: "bg-transparent text-[#171717] hover:bg-[#fafafa] dark:text-white dark:hover:bg-[#0a0a0a]",
        link: "bg-transparent px-0 text-[#0072f5] hover:underline dark:text-white"
      },
      size: {
        default: "h-10 px-4",
        sm: "h-9 px-3",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";

export { Button, buttonVariants };
