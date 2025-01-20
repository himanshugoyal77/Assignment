import { useState } from "react";
import { Input } from "@/components/ui/input"; // Adjust this import path as per your project structure

function FilterInput({ table }: { table: any }) {
  const [filterValue, setFilterValue] = useState("");

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFilterValue(value);

    // Apply a custom filter logic
    table.setGlobalFilter(value); // Update the global filter (depends on your table library)
  };

  return (
    <Input
      placeholder="Filter email or Search title"
      value={filterValue}
      onChange={handleFilterChange}
      className="w-[280px]"
    />
  );
}

export default FilterInput;
