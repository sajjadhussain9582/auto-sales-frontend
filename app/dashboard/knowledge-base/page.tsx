"use client"

import { useEffect, useState, useMemo } from "react"
import { 
  BookOpen, 
  Loader2, 
  FileText, 
  HelpCircle, 
  ChevronDown, 
  ChevronRight,
  Database,
  PlusCircle,
  MoreVertical,
  Trash2,
  RefreshCcw,
  ExternalLink,
  Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { knowledgeBaseService } from "@/services/knowledge-base.service"
import type { KnowledgeBaseRow } from "@/types/knowledge"
import { KnowledgeBaseUpload } from "@/components/dashboard/knowledge-base-upload"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

type Tab = "library" | "train" | "sources"

export default function KnowledgeBasePage() {
  const [rows, setRows] = useState<KnowledgeBaseRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>("library")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({})

  const load = () => {
    setLoading(true)
    setError(null)
    knowledgeBaseService
      .list()
      .then(setRows)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const filteredRows = useMemo(() => {
    if (!searchQuery) return rows
    const q = searchQuery.toLowerCase()
    return rows.filter(r => 
      r.question?.toLowerCase().includes(q) || 
      r.answer?.toLowerCase().includes(q) || 
      r.source_name?.toLowerCase().includes(q)
    )
  }, [rows, searchQuery])

  const groupedRows = useMemo(() => {
    const groups: Record<string, KnowledgeBaseRow[]> = {}
    const standalone: KnowledgeBaseRow[] = []

    filteredRows.forEach((row) => {
      if (row.source_name) {
        if (!groups[row.source_name]) {
          groups[row.source_name] = []
        }
        groups[row.source_name].push(row)
      } else {
        standalone.push(row)
      }
    })

    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => (a.chunk_index ?? 0) - (b.chunk_index ?? 0))
    })

    return { groups, standalone }
  }, [filteredRows])

  const sources = useMemo(() => {
    const allGroups: Record<string, { name: string, chunks: number, embedded: number, type: string }> = {}
    
    rows.forEach(row => {
      if (row.source_name) {
        if (!allGroups[row.source_name]) {
          allGroups[row.source_name] = { 
            name: row.source_name, 
            chunks: 0, 
            embedded: 0,
            type: row.source_type || 'document'
          }
        }
        allGroups[row.source_name].chunks++
        if (row.has_embedding) allGroups[row.source_name].embedded++
      }
    })
    
    return Object.values(allGroups)
  }, [rows])

  const toggleSource = (sourceName: string) => {
    setExpandedSources((prev) => ({
      ...prev,
      [sourceName]: !prev[sourceName],
    }))
  }

  const handleDeleteSource = async (sourceName: string) => {
    if (!confirm(`Are you sure you want to delete all chunks for "${sourceName}"?`)) return
    try {
      await knowledgeBaseService.deleteSource(sourceName)
      toast.success(`Source "${sourceName}" deleted`)
      load()
    } catch (e: any) {
      toast.error(e.message || "Failed to delete source")
    }
  }

  const handleDeleteEntry = async (id: string | number) => {
    if (!confirm("Delete this entry?")) return
    try {
      await knowledgeBaseService.deleteEntry(id)
      toast.success("Entry deleted")
      load()
    } catch (e: any) {
      toast.error(e.message || "Failed to delete entry")
    }
  }

  return (
    <div className="mx-auto space-y-8 pb-10">
      {/* Header Area */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Knowledge Engine
          </h2>
          <p className="text-muted-foreground">
            The neural center of your AI. Manage data, train models, and verify sources.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={load}
            disabled={loading}
            className="hidden md:flex"
          >
            <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Sync Data
          </Button>
          <Button
            onClick={() => setActiveTab("train")}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Knowledge
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-border overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("library")}
          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-[2px] whitespace-nowrap ${
            activeTab === "library" 
            ? "border-primary text-primary" 
            : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookOpen className="inline-block mr-2 h-4 w-4" />
          Knowledge Library
        </button>
        <button
          onClick={() => setActiveTab("train")}
          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-[2px] whitespace-nowrap ${
            activeTab === "train" 
            ? "border-primary text-primary" 
            : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Database className="inline-block mr-2 h-4 w-4" />
          Training Lab
        </button>
        <button
          onClick={() => setActiveTab("sources")}
          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-[2px] whitespace-nowrap ${
            activeTab === "sources" 
            ? "border-primary text-primary" 
            : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="inline-block mr-2 h-4 w-4" />
          Source Management
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "library" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/30 p-2 rounded-lg border border-border">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions, answers, or sources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background/50"
                />
              </div>
              <div className="text-xs text-muted-foreground px-2">
                Showing {filteredRows.length} entries in total
              </div>
            </div>

            {loading && rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 bg-card/10 rounded-2xl border border-dashed border-border">
                <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                <p className="text-sm text-muted-foreground">Initializing Knowledge Base...</p>
              </div>
            ) : filteredRows.length === 0 ? (
              <Card className="border-dashed bg-card/20 py-20 text-center">
                <CardContent className="flex flex-col items-center gap-4">
                  <div className="bg-muted p-4 rounded-full">
                    <Search className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">No results found</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
                      {searchQuery 
                        ? `We couldn't find anything matching "${searchQuery}". Try a different term or clear the search.`
                        : "Start by adding some data to your knowledge base in the Training Lab."}
                    </p>
                    {searchQuery && (
                      <Button variant="link" onClick={() => setSearchQuery("")} className="mt-2 text-primary">
                        Clear Search
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {/* Documents / Chunked Data */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Document Chunks
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(groupedRows.groups).map(([sourceName, chunks]) => {
                      const isExpanded = expandedSources[sourceName]
                      const allEmbedded = chunks.every(c => c.has_embedding)
                      return (
                        <div key={sourceName} className="border border-border rounded-xl bg-card/40 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                          <div 
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/20 transition-colors"
                            onClick={() => toggleSource(sourceName)}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-lg bg-primary/10 text-primary transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                                <ChevronRight className="h-4 w-4" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-sm">{sourceName}</span>
                                <span className="text-[10px] text-muted-foreground font-mono">{chunks.length} total chunks</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant={allEmbedded ? "success" : "secondary"} className="h-6">
                                {allEmbedded ? "Standardized" : "Processing"}
                              </Badge>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={(e) => { e.stopPropagation(); handleDeleteSource(sourceName); }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {isExpanded && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 pt-0 bg-muted/5 border-t border-border/50">
                              {chunks.map((chunk) => (
                                <div key={String(chunk.id)} className="group relative bg-muted/10 rounded-lg p-4 border border-border/40 hover:border-primary/30 transition-colors">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Chunk #{chunk.chunk_index || 0}</span>
                                    <div className="flex items-center gap-2">
                                      {chunk.has_embedding && <Badge variant="success" className="h-4 px-1 text-[8px] animate-pulse">Live</Badge>}
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleDeleteEntry(chunk.id)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  <p className="text-xs text-foreground/70 line-clamp-4 leading-relaxed font-serif italic">
                                    "{chunk.answer}"
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Standalone Entries / FAQs */}
                {groupedRows.standalone.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      Manual Knowledge / FAQs
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {groupedRows.standalone.map((row) => (
                        <Card key={String(row.id)} className="group flex flex-col h-full border-border bg-card/60 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                          <CardHeader className="pb-3 border-b border-border/50">
                            <div className="flex items-start justify-between gap-4">
                              <CardTitle className="text-sm font-bold leading-tight">
                                {row.question}
                              </CardTitle>
                              <div className="flex items-center gap-1 group-hover:opacity-100 transition-opacity">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  onClick={() => handleDeleteEntry(row.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {row.category && (
                                <Badge variant="outline" className="text-[9px] uppercase font-bold text-primary/70">
                                  {row.category}
                                </Badge>
                              )}
                              <Badge variant={row.has_embedding ? "success" : "secondary"} className="text-[9px]">
                                {row.has_embedding ? "Embedded" : "Pending"}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-4 flex-grow">
                            <p className="text-sm text-muted-foreground line-clamp-5 leading-relaxed">
                              {row.answer}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "train" && (
          <div className="max-w-4xl mx-auto py-4">
            <KnowledgeBaseUpload onSuccess={() => { load(); setActiveTab("library"); }} />
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-70">
               <div className="p-4 bg-muted/20 rounded-xl border border-border">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                    <FileText className="h-4 w-4" />
                  </div>
                  <h4 className="text-sm font-semibold mb-1">Upload Documents</h4>
                  <p className="text-xs text-muted-foreground">PDF and CSV files are parsed and automatically chunked for the AI.</p>
               </div>
               <div className="p-4 bg-muted/20 rounded-xl border border-border">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                    <PlusCircle className="h-4 w-4" />
                  </div>
                  <h4 className="text-sm font-semibold mb-1">Paste Text</h4>
                  <p className="text-xs text-muted-foreground">Quickly add snippets, emails, or FAQs without creating full files.</p>
               </div>
               <div className="p-4 bg-muted/20 rounded-xl border border-border">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                    <Database className="h-4 w-4" />
                  </div>
                  <h4 className="text-sm font-semibold mb-1">AI Ingestion</h4>
                  <p className="text-xs text-muted-foreground">All data is converted into vector embeddings for accurate RAG retrieval.</p>
               </div>
            </div>
          </div>
        )}

        {activeTab === "sources" && (
          <div className="space-y-6">
            <Card className="border-border bg-card/40">
              <CardHeader>
                <CardTitle>Knowledge Sources</CardTitle>
                <CardDescription>
                  Manage the original files and text sources used to train your AI.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium border-y border-border">
                      <tr>
                        <th className="px-6 py-4">Source Name</th>
                        <th className="px-6 py-4">Typology</th>
                        <th className="px-6 py-4">Scale</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {sources.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                            No external sources detected in the neural library.
                          </td>
                        </tr>
                      ) : (
                        sources.map((source) => (
                          <tr key={source.name} className="hover:bg-muted/30 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded bg-primary/5 text-primary">
                                  {source.type === 'faq' ? <HelpCircle className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                                </div>
                                <span className="font-semibold text-foreground">{source.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                               <Badge variant="outline" className="uppercase text-[9px] font-bold">
                                 {source.type}
                               </Badge>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                              {source.chunks} units
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${source.embedded === source.chunks ? 'bg-success animate-pulse' : 'bg-warning'}`} />
                                <span className="text-xs">
                                  {source.embedded === source.chunks ? 'Optimal' : `In-Progress (${Math.round((source.embedded/source.chunks)*100)}%)`}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 hover:text-destructive"
                                  onClick={() => handleDeleteSource(source.name)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
