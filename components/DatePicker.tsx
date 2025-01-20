"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { start } from "repl";

export function DatePicker({
  table,
  filterDate,
  setFilterDate,
}: {
  table: any;
  filterDate: any;
  setFilterDate: any;
}) {
  // 26/04/2024
  const [startDate, setStartDate] = React.useState<Date>();
  const [endDate, setEndDate] = React.useState<Date>();

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    // Apply a custom filter logic
    // Update the global filter (depends on your table library)
  };

  React.useEffect(() => {
    if (startDate || endDate) {
      setFilterDate(startDate || endDate);
    }
  }, [startDate]);

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <DatePickerHelper date={startDate} setDate={setStartDate} />
      <DatePickerHelper date={endDate} setDate={setEndDate} />
    </div>
  );
}

const DatePickerHelper = ({ date, setDate }: { date?: Date; setDate: any }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal bg-transparent border border-gray-300",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};
