import * as React from "react";
import { DayPicker, DayPickerProps } from "react-day-picker";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = DayPickerProps;

function CustomNav({
  previousMonth,
  nextMonth,
  onPreviousClick,
  onNextClick,
}: {
  previousMonth?: Date;
  nextMonth?: Date;
  onPreviousClick?: React.MouseEventHandler<HTMLButtonElement>;
  onNextClick?: React.MouseEventHandler<HTMLButtonElement>;
}) {
  const displayMonth = previousMonth
    ? new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1)
    : new Date();

  return (
    <div className="flex items-center justify-between px-2 py-1">
      <button
        type="button"
        onClick={onPreviousClick}
        className={cn(buttonVariants({ variant: "ghost" }), "h-8 w-8 p-0")}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex-1 text-center text-sm font-medium">
        {displayMonth.toLocaleString("pt-BR", { month: "long", year: "numeric" })}
      </div>

      <button
        type="button"
        onClick={onNextClick}
        className={cn(buttonVariants({ variant: "ghost" }), "h-8 w-8 p-0")}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={ptBR}
      className={cn("p-3 pointer-events-auto", className)}
      classNames={{
        months: "grid grid-cols-1 gap-4",
        table: "w-full border-collapse",
        head_row: "grid grid-cols-7",
        head_cell: "text-center text-[0.8rem] font-medium text-muted-foreground",
        row: "grid grid-cols-7",
        cell: "text-center h-10 w-10 p-0",
        day: "text-center h-10 w-10 rounded-full hover:bg-accent/20",
        day_selected: "bg-primary text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        caption: "pt-2 px-2",
        caption_label: "hidden", // esconde o caption padrão
        nav: "hidden", // esconde o nav padrão
        ...classNames,
      }}
      components={{
        Nav: CustomNav,
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
