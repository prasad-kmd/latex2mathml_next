"use client"

import type React from "react"

import { EquationPreview } from "./equation-preview"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface EquationEditorProps {
  latex: string
  mathml: string
  onLatexChange: (value: string) => void
}

export default function EquationEditor({ latex, mathml, onLatexChange }: EquationEditorProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget
    const { selectionStart, selectionEnd, value } = target

    if (selectionStart === null || selectionEnd === null) return

    const bracketPairs: { [key: string]: string } = {
      "(": ")",
      "[": "]",
      "{": "}",
    }

    const char = e.key

    if (char in bracketPairs) {
      e.preventDefault()
      const closingBracket = bracketPairs[char]

      // Insert opening bracket and closing bracket
      const newValue = value.slice(0, selectionStart) + char + closingBracket + value.slice(selectionEnd)
      onLatexChange(newValue)

      // Move cursor between the brackets
      setTimeout(() => {
        target.selectionStart = selectionStart + 1
        target.selectionEnd = selectionStart + 1
      }, 0)
    }
  }

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-foreground">Equation Editor</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Input Section */}
        <div className="space-y-2">
          <Label htmlFor="latex-input" className="text-xs font-medium">
            LaTeX Input
          </Label>
          <Textarea
            id="latex-input"
            placeholder="Enter LaTeX or select symbols above..."
            value={latex}
            onChange={(e) => onLatexChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-32 font-mono text-xs resize-none border border-input rounded-md"
          />
        </div>

        {/* Preview Section */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Live Preview</Label>
          <div className="h-32 border border-border rounded-md bg-card p-4 flex items-center justify-center overflow-auto">
            <EquationPreview mathml={mathml} />
          </div>
        </div>
      </div>
    </div>
  )
}
