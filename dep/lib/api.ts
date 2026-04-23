import axios from "axios"

import type {
  AdvancedResponse,
  CompareResponse,
  GlobalResponse,
  LocalResponse,
  SuggestionsResponse,
  UploadResponse,
} from "@/types/dashboard"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:5000",
  timeout: 120000,
})

function handleApiError(route: string, error: unknown): never {
  if (axios.isAxiosError(error)) {
    const errorMsg = error.response?.data?.error || error.message
    throw new Error(`Failed to load ${route}: ${errorMsg}`)
  }
  throw error
}

export interface DashboardFilters {
  start_date?: string
  end_date?: string
  category?: string
  state?: string
}

export async function fetchGlobalInsights(filters?: DashboardFilters) {
  try {
    const { data } = await api.get<GlobalResponse>("/api/global", { params: filters })
    return data
  } catch (error) {
    return handleApiError("Global Insights", error)
  }
}

export async function fetchAdvancedAnalytics(filters?: DashboardFilters) {
  try {
    const { data } = await api.get<AdvancedResponse>("/api/advanced", { params: filters })
    return data
  } catch (error) {
    return handleApiError("Advanced Analytics", error)
  }
}

export async function fetchSuggestions(filters?: DashboardFilters) {
  try {
    const { data } = await api.get<SuggestionsResponse>("/api/suggestions", { params: filters })
    return data
  } catch (error) {
    return handleApiError("Strategic Suggestions", error)
  }
}

export async function fetchLocalInsights(filters?: DashboardFilters) {
  try {
    const { data } = await api.get<LocalResponse>("/api/local", { params: filters })
    return data
  } catch (error) {
    return handleApiError("Local Insights", error)
  }
}

export async function fetchComparison(filters?: DashboardFilters) {
  try {
    const { data } = await api.get<CompareResponse>("/api/compare", { params: filters })
    return data
  } catch (error) {
    return handleApiError("Comparison", error)
  }
}

export async function uploadLocalCsv(file: File) {
  const formData = new FormData()
  formData.append("file", file)

  try {
    const { data } = await api.post<UploadResponse>("/api/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return data
  } catch (error) {
    return handleApiError("File Upload", error)
  }
}
