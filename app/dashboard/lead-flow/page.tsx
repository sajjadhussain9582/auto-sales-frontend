"use client"

import { useState, useEffect } from "react"
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd"
import { leadsService } from "@/services/leads.service"
import { PipelineStage, KanbanLead } from "@/types/lead-flow"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, MoreVertical, Clock, User } from "lucide-react"
import { cn } from "@/lib/utils"

// Helper to format date as "X ago"
function formatTimeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "just now"
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays}d ago`
}

export default function LeadFlowPage() {
  const [stages, setStages] = useState<PipelineStage[]>([])
  const [leadsByStage, setLeadsByStage] = useState<
    Record<string, KanbanLead[]>
  >({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const [fetchedStages, fetchedKanban] = await Promise.all([
          leadsService.listStages(),
          leadsService.getKanban(),
        ])
        setStages(fetchedStages)
        setLeadsByStage(fetchedKanban)
      } catch (error) {
        console.error("Failed to load lead flow data", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result

    if (!destination) return

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return
    }

    const sourceStageKey = source.droppableId
    const destStageKey = destination.droppableId

    // Optimistic UI update
    const newLeadsByStage = { ...leadsByStage }
    const sourceLeads = Array.from(newLeadsByStage[sourceStageKey] || [])
    const [movedLead] = sourceLeads.splice(source.index, 1)

    if (movedLead) {
      movedLead.stage = destStageKey
      const destLeads = Array.from(newLeadsByStage[destStageKey] || [])
      destLeads.splice(destination.index, 0, movedLead)

      newLeadsByStage[sourceStageKey] = sourceLeads
      newLeadsByStage[destStageKey] = destLeads
      setLeadsByStage(newLeadsByStage)

      try {
        await leadsService.updateLeadStage(draggableId, { stage: destStageKey })
      } catch (error) {
        console.error("Failed to update lead stage", error)
        // Revert on error if necessary - for now we just log
        // In a real app, we'd probably re-fetch or revert the local state
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="space-y-2 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading Lead Flow...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lead Flow</h1>
          <p className="text-muted-foreground">
            Manage and track your leads through the sales pipeline.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Lead
        </Button>
      </div>

      <div className="flex-1 overflow-x-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex h-full min-w-max space-x-4 pb-4">
            {stages.map((column) => (
              <div
                key={column.key}
             
  className="flex h-[70vh] w-80 flex-col rounded-lg border border-border bg-muted/50"  >
                <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-lg border-b bg-background/50 p-4">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold">{column.pipelinestage}</h3>
                    <Badge variant="secondary">
                      {(leadsByStage[column.key] || []).length}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>

                <Droppable droppableId={column.key}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={cn(
                        "min-h-[500px] flex-1 space-y-3 overflow-y-auto p-3 transition-colors",
                        snapshot.isDraggingOver ? "bg-muted/80" : ""
                      )}
                    >
                      {(leadsByStage[column.key] || []).map((lead, index) => (
                        <Draggable
                          key={lead.uuid}
                          draggableId={lead.uuid}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={cn(
                                "cursor-grab shadow-sm transition-colors hover:border-primary/50 active:cursor-grabbing",
                                snapshot.isDragging
                                  ? "border-primary shadow-lg ring-2 ring-primary/20"
                                  : ""
                              )}
                            >
                              <CardContent className="space-y-3 p-4">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-1">
                                    <h4 className="text-sm font-medium">
                                      {lead.username || lead.email}
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                      {lead.company || "No Company"}
                                    </p>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="px-1.5 py-0 text-[10px]"
                                  >
                                    Score: {Math.round(lead.lead_score)}
                                  </Badge>
                                </div>

                                <div className="flex items-center justify-between border-t border-border/50 pt-2">
                                  <div className="flex items-center text-[10px] text-muted-foreground">
                                    <Clock className="mr-1 h-3 w-3" />
                                    {formatTimeAgo(lead.updated_at)}
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                                      <User className="h-3 w-3 text-primary" />
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  )
}
