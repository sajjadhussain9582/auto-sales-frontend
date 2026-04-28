"use client"

import { useState, useEffect, useRef } from "react"
import { Upload, Type, Loader2, X, Plus, FileText, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { knowledgeBaseService } from "@/services/knowledge-base.service"
import { toast } from "sonner"

interface KnowledgeBaseUploadProps {
  onSuccess: () => void
}

export function KnowledgeBaseUpload({ onSuccess }: KnowledgeBaseUploadProps) {
  const [mode, setMode] = useState<"upload" | "paste">("upload")
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState("general")
  const [file, setFile] = useState<File | null>(null)
  const [sourceName, setSourceName] = useState("")

  const editorRef = useRef<HTMLDivElement>(null)
  const quillInstance = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && editorRef.current && mode === "paste") {
      import("quill/dist/quill.snow.css")

      const initQuill = async () => {
        const { default: Quill } = await import("quill")

        if (quillInstance.current) return

        quillInstance.current = new Quill(editorRef.current!, {
          theme: "snow",
          placeholder: "Input the raw data context here... (e.g. email snippets, internal memos)",
          modules: {
            toolbar: [
              [{ header: [1, 2, 3, false] }],
              ["bold", "italic", "underline", "strike"],
              [{ list: "ordered" }, { list: "bullet" }],
              ["link", "clean"],
            ],
          },
        })
      }

      initQuill()
    }

    return () => {
      if (mode !== "paste") {
        quillInstance.current = null
      }
    }
  }, [mode])

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    try {
      const res = await knowledgeBaseService.upload(file, category)
      if (res.ok) {
        toast.success(`Successfully added "${res.source_name}" to the library.`)
        setFile(null)
        onSuccess()
      }
    } catch (e: any) {
      toast.error(e.message || "Upload failed. Please check the file format.")
    } finally {
      setLoading(false)
    }
  }

  const handlePaste = async () => {
    const editorContent = quillInstance.current?.root.innerHTML || ""
    const textContent = quillInstance.current?.getText().trim() || ""

    if (!textContent || !sourceName) {
      toast.error("Please provide both content and a source handle.")
      return
    }

    setLoading(true)
    try {
      const res = await knowledgeBaseService.paste(editorContent, sourceName, category)
      if (res.ok) {
        toast.success("Text snippet indexed successfully.")
        quillInstance.current?.setContents([])
        setSourceName("")
        onSuccess()
      }
    } catch (e: any) {
      toast.error(e.message || "Handshake failed. Try again later.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border-border bg-card/40 backdrop-blur-sm overflow-hidden shadow-2xl">
        <div className="h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40 w-full" />
        <CardHeader className="pb-6 pt-8 px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight">Data Ingestion</CardTitle>
              <CardDescription className="text-md">
                Transfer your organizational knowledge into the AI's neural memory.
              </CardDescription>
            </div>
            <div className="flex bg-muted/50 p-1.5 rounded-xl border border-border/50">
              <Button
                variant={mode === "upload" ? "secondary" : "ghost"}
                size="sm"
                className={`h-9 px-4 rounded-lg transition-all ${mode === "upload" ? 'shadow-sm' : ''}`}
                onClick={() => setMode("upload")}
              >
                <Upload className="mr-2 h-4 w-4" />
                File Upload
              </Button>
              <Button
                variant={mode === "paste" ? "secondary" : "ghost"}
                size="sm"
                className={`h-9 px-4 rounded-lg transition-all ${mode === "paste" ? 'shadow-sm' : ''}`}
                onClick={() => setMode("paste")}
              >
                <Type className="mr-2 h-4 w-4" />
                Raw Text
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 px-8 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">
                Data Classification
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-12 w-full rounded-xl border border-border bg-background/50 px-4 py-2 text-sm ring-offset-background hover:border-primary/30 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer shadow-inner"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m19 9-7 7-7-7'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '1rem'
                }}
              >
                <option value="general">Global Intelligence (General)</option>
                <option value="pricing">Commercial / Pricing</option>
                <option value="technical">Technical Specification</option>
                <option value="policy">Governance / Policy</option>
              </select>
            </div>

            {mode === "paste" && (
              <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">
                  Source Identifier
                </label>
                <Input
                  placeholder="e.g. FAQ Snip v2"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  className="h-12 rounded-xl bg-background/50 px-4 border-border hover:border-primary/30 focus:ring-primary/20"
                />
              </div>
            )}
          </div>

          {mode === "upload" ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
              <div
                className={`group relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${file
                  ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(var(--primary),0.1)]"
                  : "border-border hover:border-primary/40 hover:bg-muted/30"
                  }`}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-primary', 'bg-primary/5'); }}
                onDragLeave={(e) => { e.preventDefault(); if (!file) e.currentTarget.classList.remove('border-primary', 'bg-primary/5'); }}
                onDrop={(e) => {
                  e.preventDefault()
                  if (!file) e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
                  const f = e.dataTransfer.files[0]
                  if (f && (f.type === "application/pdf" || f.type === "text/csv")) {
                    setFile(f)
                  } else {
                    toast.error("Format unsupported. Please use PDF or CSV.")
                  }
                }}
              >
                {file ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                      <div className="relative bg-primary/10 p-5 rounded-2xl">
                        <FileText className="h-10 w-10 text-primary" />
                      </div>
                      <div className="absolute -top-1 -right-1 bg-success rounded-full p-1 border-2 border-background">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-lg">{file.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB • READY
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-4 h-9 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive border border-transparent hover:border-destructive/20"
                      onClick={() => setFile(null)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel Upload
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-6 cursor-pointer">
                    <div className="bg-muted p-5 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                      <Upload className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-bold text-xl tracking-tight">Deploy Documentation</p>
                      <p className="text-sm text-muted-foreground">
                        Drag and drop your PDF or CSV files here
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60 font-mono">
                      <span>SECURE</span>
                      <span>•</span>
                      <span>MAX 10MB</span>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.csv"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                  </label>
                )}
              </div>
              <Button
                className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg transition-all hover:shadow-primary/20 active:scale-[0.98]"
                disabled={!file || loading}
                onClick={handleUpload}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    Ingesting Data...
                  </>
                ) : (
                  <>
                    <Plus className="mr-3 h-5 w-5" />
                    Initialize Neural Training
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">
                  Knowledge Payload
                </label>
                <div
                  className="relative group quill-premium-wrapper cursor-text"
                  onClick={() => quillInstance.current?.focus()}
                >
                  <div className="absolute inset-0 bg-primary/5 rounded-2xl transition-opacity group-hover:opacity-100 opacity-0 pointer-events-none" />
                  <style jsx global>{`
                     .quill-premium-wrapper .ql-toolbar.ql-snow {
                        border-top-left-radius: 1rem;
                        border-top-right-radius: 1rem;
                        background: oklch(0.97 0 0 / 50%) !important;
                        border-color: var(--border) !important;
                     }
                     .quill-premium-wrapper .ql-container.ql-snow {
                        border-bottom-left-radius: 1rem;
                        border-bottom-right-radius: 1rem;
                        background: oklch(1 0 0 / 100%) !important;
                        border-color: var(--border) !important;
                        font-family: serif !important;
                        font-size: 1rem !important;
                        min-height: 300px !important;
                     }
                     .dark .quill-premium-wrapper .ql-toolbar.ql-snow {
                        background: oklch(0.269 0 0 / 50%) !important;
                     }
                     .dark .quill-premium-wrapper .ql-container.ql-snow {
                        background: oklch(0.205 0 0 / 100%) !important;
                     }
                     .quill-premium-wrapper .ql-editor {
                        min-height: 300px !important;
                     }
                   `}</style>
                  <div ref={editorRef} />
                </div>
              </div>
              <Button
                className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg transition-all hover:shadow-primary/20 active:scale-[0.98]"
                disabled={loading || !sourceName}
                onClick={handlePaste}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    Processing Payload...
                  </>
                ) : (
                  <>
                    <Plus className="mr-3 h-5 w-5" />
                    Index to Neural Matrix
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 flex items-center justify-center gap-8 text-[10px] text-muted-foreground font-bold uppercase tracking-[0.1em] pointer-events-none opacity-40">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          ISO 27001 COMPLIANT
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          256-BIT ENCRYPTION
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          ZERO PERSISTENCE
        </div>
      </div>
    </div>
  )
}
