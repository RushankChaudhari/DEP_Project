"use client"

import { Calendar, Funnel, FunnelSimple, MapPin, Tag } from "@phosphor-icons/react"
import { format } from "date-fns"
import * as React from "react"
import { DateRange } from "react-day-picker"

import { Button, buttonVariants } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface FilterState {
  date: DateRange | undefined
  category: string
  state: string
}

interface FilterBarProps {
  categories: string[]
  states: string[]
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  disabled?: boolean
}

export function FilterBar({ categories, states, filters, onFilterChange, disabled }: FilterBarProps) {
  function updateFilter(key: keyof FilterState, value: any) {
    onFilterChange({ ...filters, [key]: value })
  }

  function clearFilters() {
    onFilterChange({
      date: undefined,
      category: "all",
      state: "all",
    })
  }

  const hasActiveFilters = filters.date || filters.category !== "all" || filters.state !== "all"

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between mb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center w-full">
        <div className="flex items-center gap-2 text-slate-500 mr-2">
          <Funnel className="size-5" />
          <span className="text-sm font-medium">Filters</span>
        </div>

        {/* Date Range Picker */}
        <Popover>
          <PopoverTrigger
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-9 w-full justify-start text-left font-normal sm:w-[260px] border-slate-200 hover:bg-slate-50",
              !filters.date && "text-slate-500",
              disabled && "opacity-50 pointer-events-none"
            )}
          >
            <Calendar className="mr-2 size-4" />
            {filters.date?.from ? (
              filters.date.to ? (
                <>
                  {format(filters.date.from, "LLL dd, y")} - {format(filters.date.to, "LLL dd, y")}
                </>
              ) : (
                format(filters.date.from, "LLL dd, y")
              )
            ) : (
              <span>Date Range</span>
            )}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              initialFocus
              mode="range"
              defaultMonth={filters.date?.from}
              selected={filters.date}
              onSelect={(range) => updateFilter("date", range)}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {/* Category Filter */}
        <Select
          value={filters.category}
          onValueChange={(val) => updateFilter("category", val)}
          disabled={disabled}
        >
          <SelectTrigger className="h-9 w-full sm:w-[180px] border-slate-200 hover:bg-slate-50">
            <Tag className="mr-2 size-4 text-slate-500" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* State Filter */}
        <Select
          value={filters.state}
          onValueChange={(val) => updateFilter("state", val)}
          disabled={disabled}
        >
          <SelectTrigger className="h-9 w-full sm:w-[180px] border-slate-200 hover:bg-slate-50">
            <MapPin className="mr-2 size-4 text-slate-500" />
            <SelectValue placeholder="State/Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {states.map((st) => (
              <SelectItem key={st} value={st}>
                {st}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          disabled={disabled}
          className="h-9 px-3 text-slate-500 hover:text-slate-900 border border-slate-200"
        >
          <FunnelSimple className="mr-2 size-4" />
          Clear
        </Button>
      )}
    </div>
  )
}
