import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function Calendar({ className, classNames, showOutsideDays = true, ...props }) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        root: "rdp",
        months: "flex flex-col sm:flex-row gap-4",
        month: "space-y-4",
        month_caption: "flex h-9 items-center justify-center px-9",
        caption_label: "text-sm font-medium text-[#171717] dark:text-white",
        nav: "absolute inset-x-3 top-3 flex items-center justify-between",
        button_previous: cn(buttonVariants({ variant: "secondary", size: "icon" }), "h-8 w-8 p-0"),
        button_next: cn(buttonVariants({ variant: "secondary", size: "icon" }), "h-8 w-8 p-0"),
        chevron: "h-4 w-4",
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday: "w-9 rounded-md text-center text-xs font-medium text-[#666]",
        week: "mt-2 flex w-full",
        day: "h-9 w-9 p-0 text-center text-sm",
        day_button: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "h-9 w-9 rounded-md p-0 font-normal aria-selected:opacity-100"
        ),
        selected: "[&>button]:bg-[#171717] [&>button]:text-white [&>button]:hover:bg-[#171717] dark:[&>button]:bg-white dark:[&>button]:text-black dark:[&>button]:hover:bg-white",
        today: "[&>button]:shadow-[inset_0_0_0_1px_#171717] dark:[&>button]:shadow-[inset_0_0_0_1px_#ffffff]",
        outside: "text-[#888] opacity-45",
        disabled: "text-[#888] opacity-40",
        hidden: "invisible",
        ...classNames
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName }) => (
          orientation === "left"
            ? <ChevronLeft className={cn("h-4 w-4", chevronClassName)} />
            : <ChevronRight className={cn("h-4 w-4", chevronClassName)} />
        )
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
