import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/50 dark:bg-black/50", className)}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef(({ className, children, showClose = true, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 max-h-[88vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl bg-white text-[#171717] shadow-[0_1px_1px_rgba(0,0,0,0.02),0_8px_16px_-4px_rgba(0,0,0,0.04),0_24px_32px_-8px_rgba(0,0,0,0.06),inset_0_0_0_1px_#ebebeb] focus:outline-none dark:bg-black dark:text-white dark:shadow-[0_1px_1px_rgba(0,0,0,0.25),0_24px_48px_rgba(0,0,0,0.45),inset_0_0_0_1px_rgba(255,255,255,0.16)]",
        className
      )}
      {...props}
    >
      {children}
      {showClose ? (
        <DialogPrimitive.Close className="focus-ring absolute right-5 top-5 inline-flex h-9 w-9 items-center justify-center rounded-md bg-white shadow-[0_0_0_1px_rgb(235,235,235)] transition hover:bg-[#fafafa] dark:bg-black dark:shadow-[0_0_0_1px_rgba(255,255,255,0.18)]" aria-label="Close">
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>
      ) : null}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col gap-1.5 text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }) => (
  <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn("text-2xl font-semibold leading-tight tracking-normal text-[#171717] dark:text-white", className)} {...props} />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn("text-sm leading-6 text-[#4d4d4d] dark:text-[#a3a3a3]", className)} {...props} />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger
};
