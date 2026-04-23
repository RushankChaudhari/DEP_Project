"use client"

import { useRef, useState, useTransition } from "react"
import { FileCsv, UploadSimple, CheckCircle, WarningCircle } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { LocalResponse } from "@/types/dashboard"

type UploadBoxProps = {
  onUpload: (file: File) => Promise<LocalResponse | undefined>
}

export function UploadBox({ onUpload }: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [status, setStatus] = useState("Upload a CSV with sales, revenue, date, and category columns.")
  const [progress, setProgress] = useState(0)
  const [mapping, setMapping] = useState<Record<string, string | null> | null>(null)
  const [errorObj, setErrorObj] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleFile(file: File | null) {
    if (!file) {
      return
    }

    startTransition(async () => {
      setProgress(25)
      setStatus(`Uploading ${file.name}...`)
      setMapping(null)
      setErrorObj(null)

      try {
        const result = await onUpload(file)
        setProgress(100)
        
        if (result?.meta?.mapping) {
          setMapping(result.meta.mapping)
          const mappedCount = Object.values(result.meta.mapping).filter(v => v !== null).length
          setStatus(`${file.name} processed successfully! Mapped ${mappedCount} system columns.`)
        } else {
          setStatus(`${file.name} processed successfully.`)
        }
      } catch (error) {
        setProgress(0)
        const msg = error instanceof Error ? error.message : "Upload failed."
        setStatus("Upload failed.")
        setErrorObj(msg)
      }
    })
  }

  return (
    <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/75 p-6 shadow-[0_20px_55px_-35px_rgba(15,23,42,0.55)] backdrop-blur">
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
      />
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-slate-950">
            <span className="flex size-11 items-center justify-center rounded-full bg-slate-950 text-white">
              <FileCsv className="size-5" weight="fill" />
            </span>
            <div>
              <p className="text-lg font-semibold">Local Store Upload</p>
              <p className="text-sm text-slate-500">Flexible schema detection with automatic mapping.</p>
            </div>
          </div>
          <p className="text-sm leading-6 text-slate-600">{status}</p>
          {errorObj && (
            <div className="mt-2 flex items-center gap-2 text-sm text-rose-600">
              <WarningCircle className="size-4" />
              <span>{errorObj}</span>
            </div>
          )}
        </div>
        <Button
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
          className="h-11 rounded-full bg-slate-950 px-5 text-white hover:bg-slate-800"
        >
          <UploadSimple className="size-4" />
          {isPending ? "Processing..." : "Choose CSV"}
        </Button>
      </div>
      <Progress value={progress} className="mt-5 h-2 rounded-full bg-slate-100" />
      
      {mapping && (
        <div className="mt-6 border-t border-slate-200 pt-5">
          <p className="text-sm font-medium text-slate-700 mb-3">Detected Schema Mapping</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(mapping).map(([target, source]) => (
              source ? (
                <Badge key={target} variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200">
                  <CheckCircle className="mr-1 size-3.5" weight="fill" />
                  {source} &rarr; {target}
                </Badge>
              ) : (
                <Badge key={target} variant="outline" className="text-slate-400 border-dashed">
                  missing &rarr; {target}
                </Badge>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
