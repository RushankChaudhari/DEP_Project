"use client"

import { useEffect, useState } from "react"
import { WarningCircle } from "@phosphor-icons/react"
import { format } from "date-fns"

import { Comparison } from "@/app/dashboard/comparison"
import { GlobalInsights } from "@/app/dashboard/global-insights"
import { LocalAnalysis } from "@/app/dashboard/local-analysis"
import { StrategicSuggestions } from "@/app/dashboard/strategic-suggestions"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { FilterBar, type FilterState } from "@/components/filter-bar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  fetchComparison,
  fetchGlobalInsights,
  fetchLocalInsights,
  fetchSuggestions,
  uploadLocalCsv,
  type DashboardFilters,
} from "@/lib/api"
import type {
  CompareResponse,
  GlobalResponse,
  LocalResponse,
  SuggestionsResponse,
} from "@/types/dashboard"

type SectionKey = "global" | "local" | "compare" | "suggestions"

function LoadingState() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-40 rounded-[1.75rem]" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-96 rounded-[1.75rem]" />
        <Skeleton className="h-96 rounded-[1.75rem]" />
      </div>
    </div>
  )
}

export default function Home() {
  const [activeSection, setActiveSection] = useState<SectionKey>("global")
  
  // Dashboard Data State
  const [globalData, setGlobalData] = useState<GlobalResponse | null>(null)
  const [suggestionsData, setSuggestionsData] = useState<SuggestionsResponse | null>(null)
  const [localData, setLocalData] = useState<LocalResponse | null>(null)
  const [compareData, setCompareData] = useState<CompareResponse | null>(null)
  
  // UI State
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    date: undefined,
    category: "all",
    state: "all",
  })
  const [filterOptions, setFilterOptions] = useState({ categories: [] as string[], states: [] as string[] })

  async function loadOptionalLocalViews(apiFilters?: DashboardFilters) {
    try {
      const [local, compare] = await Promise.all([
        fetchLocalInsights(apiFilters), 
        fetchComparison(apiFilters)
      ])
      setLocalData(local)
      setCompareData(compare)
    } catch {
      setLocalData(null)
      setCompareData(null)
    }
  }

  async function loadDashboard() {
    setIsLoading(true)
    setError(null)

    // Convert UI FilterState to API DashboardFilters
    const apiFilters: DashboardFilters = {}
    if (filters.date?.from) apiFilters.start_date = format(filters.date.from, "yyyy-MM-dd")
    if (filters.date?.to) apiFilters.end_date = format(filters.date.to, "yyyy-MM-dd")
    if (filters.category && filters.category !== "all") apiFilters.category = filters.category
    if (filters.state && filters.state !== "all") apiFilters.state = filters.state

    try {
      const [global] = await Promise.all([
        fetchGlobalInsights(apiFilters),
      ])

      setGlobalData(global)
      
      // Update available filter options based on the global meta payload
      if (global?.meta?.filter_options) {
        setFilterOptions(global.meta.filter_options)
      }
      
      // Only refetch local-dependent data if the user has explicitly uploaded a file in this session
      if (localData !== null) {
        await loadOptionalLocalViews(apiFilters)
        const suggestions = await fetchSuggestions(apiFilters).catch(() => null)
        setSuggestionsData(suggestions)
      } else {
        // Without an active upload, set suggestions to empty so it triggers the blocking UI logic
        setSuggestionsData(null)
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load dashboard data.")
    } finally {
      setIsLoading(false)
    }
  }

  // Reload dashboard when filters change
  useEffect(() => {
    loadDashboard()
  }, [filters])

  async function handleUpload(file: File) {
    const response = await uploadLocalCsv(file)
    setLocalData(response.local)
    
    // Convert UI FilterState to API DashboardFilters for the comparison fetch
    const apiFilters: DashboardFilters = {}
    if (filters.date?.from) apiFilters.start_date = format(filters.date.from, "yyyy-MM-dd")
    if (filters.date?.to) apiFilters.end_date = format(filters.date.to, "yyyy-MM-dd")
    if (filters.category && filters.category !== "all") apiFilters.category = filters.category
    if (filters.state && filters.state !== "all") apiFilters.state = filters.state
    
    fetchComparison(apiFilters).then(setCompareData).catch(() => setCompareData(null))
    fetchSuggestions(apiFilters).then(setSuggestionsData).catch(() => setSuggestionsData(null))
    setActiveSection("local")
    return response.local
  }

  const content = (() => {
    if (error) {
      return null
    }

    if (isLoading || !globalData) {
      return <LoadingState />
    }

    switch (activeSection) {
      case "global":
        return <GlobalInsights data={globalData} />
      case "local":
        return <LocalAnalysis data={localData} onUpload={handleUpload} />
      case "compare":
        return <Comparison data={compareData} />
      case "suggestions":
        return <StrategicSuggestions data={suggestionsData} hasLocalData={!!localData} />
      default:
        return null
    }
  })()

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.96),_rgba(232,241,255,0.92),_rgba(248,221,183,0.65))] p-8 shadow-[0_35px_90px_-45px_rgba(15,23,42,0.65)] lg:p-10">
          <div className="absolute right-0 top-0 size-56 rounded-full bg-[radial-gradient(circle,_rgba(15,23,42,0.18),_transparent_70%)]" />
          <div className="absolute bottom-0 left-1/3 h-36 w-36 rounded-full bg-[radial-gradient(circle,_rgba(194,65,12,0.16),_transparent_70%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                E-commerce performance, forecasts, and strategy in one operational dashboard.
              </h1>
            </div>

          </div>
        </header>

        <DashboardNavbar activeSection={activeSection} onSelect={setActiveSection} hasLocalData={!!localData} />
        
        <FilterBar 
          categories={filterOptions.categories} 
          states={[
            "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
            "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu & Kashmir",
            "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
            "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
            "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
          ]} 
          filters={filters} 
          onFilterChange={setFilters}
          disabled={isLoading}
        />

        {error ? (
          <div className="flex items-start gap-3 rounded-[1.5rem] border border-rose-200 bg-rose-50 px-5 py-4 text-rose-800 shadow-[0_20px_55px_-35px_rgba(15,23,42,0.55)]">
            <WarningCircle className="mt-0.5 size-5 shrink-0" weight="fill" />
            <div>
              <p className="font-semibold">Dashboard data could not be loaded</p>
              <p className="mt-1 text-sm leading-6">{error}</p>
            </div>
          </div>
        ) : null}

        {content}
      </div>
    </main>
  )
}
