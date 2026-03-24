"use client";

import { useEffect, useMemo, useRef } from "react";
import "quill/dist/quill.snow.css";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type RichTextComposerValue = {
  /** HTML content from the editor (for preview only) */
  html: string;
  /** Plain text used for storage */
  text: string;
};

export function RichTextComposer({
  value,
  onChange,
  placeholder,
  className,
  disabled,
}: {
  value: RichTextComposerValue;
  onChange: (next: RichTextComposerValue) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<any>(null);
  const syncingRef = useRef(false);

  const modules = useMemo(
    () => ({
      toolbar: [
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"],
      ],
    }),
    []
  );

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!editorRef.current || quillRef.current) return;
      const { default: Quill } = await import("quill");
      if (!mounted) return;

      const q = new Quill(editorRef.current, {
        theme: "snow",
        readOnly: Boolean(disabled),
        modules,
        placeholder,
      });

      quillRef.current = q;

      // Seed from plain text (source of truth for storage)
      syncingRef.current = true;
      q.setText(value.text || "");
      syncingRef.current = false;

      q.on("text-change", () => {
        if (syncingRef.current) return;
        const html = q.root?.innerHTML ?? "";
        const text = String(q.getText?.() ?? "").replace(/\n+$/, "");
        onChange({ html, text });
      });
    };

    void init();

    return () => {
      mounted = false;
      quillRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const q = quillRef.current;
    if (!q) return;
    // Keep editor readOnly in sync
    q.enable(!disabled);
  }, [disabled]);

  useEffect(() => {
    const q = quillRef.current;
    if (!q) return;
    // If user edits plain text directly, reflect it in Quill without looping
    syncingRef.current = true;
    const current = String(q.getText?.() ?? "").replace(/\n+$/, "");
    if (current !== value.text) {
      q.setText(value.text || "");
    }
    syncingRef.current = false;
  }, [value.text]);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="border-input bg-background text-foreground overflow-hidden rounded-lg border">
        <div ref={editorRef} />
      </div>

      <div className="text-muted-foreground text-xs">
        Stored as plain text. Formatting is for composing only.
      </div>

      {/* Always keep a plain-text textarea visible for full compatibility */}
      <Textarea
        value={value.text}
        onChange={(e) => onChange({ html: value.html, text: e.target.value })}
        placeholder="Plain text (stored)"
        disabled={disabled}
        rows={4}
      />
    </div>
  );
}

