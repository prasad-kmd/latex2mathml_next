"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Trash2 } from "lucide-react"

interface InputControlsProps {
  onClear: () => void
  onMoveLeft: () => void
  onMoveRight: () => void
}

export default function InputControls({ onClear, onMoveLeft, onMoveRight }: InputControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={onClear} aria-label="Clear input">
        <Trash2 className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={onMoveLeft} aria-label="Move cursor left">
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={onMoveRight} aria-label="Move cursor right">
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
