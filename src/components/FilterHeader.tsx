import React, { useEffect, useState } from 'react';
import { Filter } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { findEmployeeDetails } from '@/lib/helperFunction';
import logger from '@/lib/logger';

const FilterHeader = ({ column, tasks, employeeList, mode }) => {
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [uniqueOptions, setUniqueOptions] = useState([]);

  useEffect(() => {
    if (mode === 'filterOnCreatedBy') {
      setUniqueOptions([]);
      setUniqueOptions(
        [...new Set(tasks?.map((task) => task.createdBy))]
          ?.map((creatorId) => ({
            id: creatorId,
            name: findEmployeeDetails(employeeList, creatorId.toString())?.employee?.empName,
          }))
          ?.filter((creator) => creator.name)
          ?.sort((a, b) => a.name.localeCompare(b.name))
      );
    } else {
      setUniqueOptions([]);
      const listofAssignedTo = tasks?.map((task) => task?.assignTaskUsers);
      var finalOptionsArray = [];
      for (var item of listofAssignedTo) {
        finalOptionsArray = [...finalOptionsArray, ...item];
      }
      setUniqueOptions(
        [...new Set(finalOptionsArray?.map((option) => option?.userId))]
          ?.map((creatorId) => ({
            id: creatorId,
            name: findEmployeeDetails(employeeList, creatorId.toString())?.employee?.empName,
          }))
          ?.filter((creator) => creator.name)
          ?.sort((a, b) => a.name.localeCompare(b.name))
      );
    }
  }, [tasks]);
  useEffect(() => {});
  const handleFilterChange = (creatorId) => {
    setSelectedFilters((prev) => {
      const newFilters = prev.includes(creatorId) ? prev.filter((id) => id !== creatorId) : [...prev, creatorId];

      // Apply the filter
      column?.setFilterValue(newFilters.length ? newFilters : undefined);
      return newFilters;
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedFilters([]);
    column?.setFilterValue(undefined);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-6  w-6 p-2 hover:bg-accent/50 transition-colors relative"
          aria-label="Filter by creator"
        >
          <Filter className="h-4 w-4 text-muted-foreground" />
          {selectedFilters.length > 0 && (
            <span className="absolute -top-1 -right-1 h-[6px] w-[6px] rounded-full bg-primary/80 ring-2 ring-background" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-0 rounded-lg mr-10 shadow-lg border border-muted/50 bg-background"
        align="start"
        sideOffset={8}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold text-foreground">
            {mode === 'filterOnCreatedBy' ? 'Filter By Creator' : 'Filter by Asignee'}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 px-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/20"
            disabled={selectedFilters.length === 0}
          >
            Clear
          </Button>
        </div>

        <Separator className="bg-muted/50" />

        <ScrollArea className="h-[280px] ">
          <div className="p-2 space-y-1">
            {uniqueOptions.map((creator) => (
              <label
                key={creator.id}
                htmlFor={`creator-${creator.id}`}
                className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer hover:bg-accent/20 group"
              >
                <Checkbox
                  id={`creator-${creator.id}`}
                  checked={selectedFilters.includes(creator.id)}
                  onCheckedChange={() => handleFilterChange(creator.id)}
                  className="border-muted-foreground/50 data-[state=checked]:border-primary group-hover:border-muted-foreground"
                />
                <span className="text-sm font-medium text-foreground truncate">{creator.name}</span>
              </label>
            ))}
          </div>
        </ScrollArea>

        {uniqueOptions.length === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground">No creators available</div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default FilterHeader;
