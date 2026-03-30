"use client"

import { useEffect, useState } from "react"
import { HelpCircle, Palette, PlusCircle } from "lucide-react"
import { leadsService } from "@/services/leads.service"
import { PipelineStage } from "@/types/lead-flow"
import { cn } from "@/lib/utils"

const STAGE_COLORS: Record<string, string> = {
  lead: "bg-[#f6c344]",
  contacted: "bg-[#f39c38]",
  pitched: "bg-[#94a3f8]",
  demo: "bg-[#4f68d1]",
  negotiating: "bg-[#3b4eb8]",
  closed_lost: "bg-[#1a1a70]",
  closed_won: "bg-[#3a98a0]",
  nurturing: "bg-[#5dc1a8]",
  discovery: "bg-[#f6c344]",
  qualified: "bg-[#f39c38]",
  proposal_ready: "bg-[#94a3f8]",
  negotiation: "bg-[#4f68d1]",
  won: "bg-[#3a98a0]",
  lost: "bg-[#1a1a70]",
}

const DEFAULT_COLOR = "bg-muted"

export default function SalesPage() {
  const [stages, setStages] = useState<PipelineStage[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    leadsService.listStages().then((data) => {
      setStages(data)
      setIsLoading(false)
    })
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
          aria-hidden
        />
      </div>
    )
  }

  return (
    <div className="mx-auto space-y-8 p-4 md:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Sales Pipeline
          </h2>
          <p className="mt-1 text-muted-foreground">
            Manage and monitor your lead progression across the pipeline.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="rounded-full p-2 text-muted-foreground/60 transition-colors duration-300 hover:bg-primary/5 hover:text-primary">
            <Palette className="size-6" />
          </button>
          <button className="rounded-full p-2 text-muted-foreground/60 transition-colors duration-300 hover:bg-primary/5 hover:text-primary">
            <PlusCircle className="size-6" />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-border/50 px-1 pb-4 text-muted-foreground/80">
          <span className="text-xs font-bold tracking-[0.2em] uppercase">
            Pipeline Stages
          </span>
          <HelpCircle className="size-4 opacity-50" />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {stages.map((stage) => (
            <div
              key={stage.key}
              className={cn(
                "group relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-white/20 p-8 text-center shadow-lg transition-all duration-500 hover:scale-[1.05] hover:brightness-110 active:scale-[0.98]",
                STAGE_COLORS[stage.key] || DEFAULT_COLOR
              )}
            >
              <div className="absolute top-4 right-4 opacity-20 transition-opacity group-hover:opacity-40">
                <span className="text-4xl font-black italic">
                  #{stage.order_index}
                </span>
              </div>

              <h3 className="mb-2 text-xl font-black tracking-tight text-white drop-shadow-sm">
                {stage.pipelinestage}
              </h3>

              <div className="mt-4 flex h-1 w-12 rounded-full bg-white/30 transition-all duration-500 group-hover:w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
