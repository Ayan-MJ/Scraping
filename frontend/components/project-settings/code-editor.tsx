"use client"

import type React from "react"

import { useRef } from "react"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
}

export function CodeEditor({ value, onChange, language = "javascript" }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)

  // This is a simplified code editor for the demo
  // In a real application, you would integrate a proper code editor like Monaco or CodeMirror

  return (
    <div className="relative w-full h-full border rounded-md overflow-hidden">
      <div className="absolute top-0 left-0 right-0 bg-muted/50 px-3 py-1 text-xs font-medium border-b">
        {language.charAt(0).toUpperCase() + language.slice(1)}
      </div>
      <div className="pt-7 h-full">
        <textarea
          ref={editorRef as React.RefObject<HTMLTextAreaElement>}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full resize-none font-mono text-sm p-3 focus:outline-none focus:ring-0 border-0"
          spellCheck="false"
        />
      </div>
    </div>
  )
}
