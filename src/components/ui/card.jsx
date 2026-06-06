import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef(({ as: Component = "div", className, ...props }, ref) => (
  <Component ref={ref} className={cn("rounded-lg bg-white text-[#171717] shadow-card transition-[background-color,box-shadow,color,opacity,transform] duration-200 ease-out dark:bg-black dark:text-white", className)} {...props} />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-2 p-5", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-2xl font-semibold leading-tight tracking-normal text-[#171717] dark:text-white", className)} {...props} />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-base leading-7 text-[#4d4d4d] dark:text-[#a3a3a3]", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-5 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

export { Card, CardContent, CardDescription, CardHeader, CardTitle };
