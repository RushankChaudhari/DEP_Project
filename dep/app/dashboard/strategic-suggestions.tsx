import { SuggestionCard } from "@/components/suggestion-card"
import type { SuggestionsResponse } from "@/types/dashboard"

type StrategicSuggestionsProps = {
  data: SuggestionsResponse | null
  hasLocalData: boolean
}

export function StrategicSuggestions({ data, hasLocalData }: StrategicSuggestionsProps) {
  if (!hasLocalData || !data || data.suggestions.length === 0) {
    return (
      <p className="rounded-[1.4rem] bg-white/75 p-6 text-sm text-slate-600 shadow-[0_20px_55px_-35px_rgba(15,23,42,0.55)]">
        Upload a local dataset in the Local Analysis tab first to generate highly tailored, data-driven strategic recommendations.
      </p>
    )
  }

  return (
    <section className="grid gap-5 lg:grid-cols-2">
      {data.suggestions.map((suggestion, index) => (
        <SuggestionCard key={`${suggestion.title}-${index}`} suggestion={suggestion} />
      ))}
    </section>
  )
}
