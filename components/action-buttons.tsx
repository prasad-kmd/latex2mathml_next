"use client"
import { Button } from "@/components/ui/button"
import { Copy, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ActionButtonsProps {
  mathml: string
  onViewMathML: () => void
}

export default function ActionButtons({ mathml, onViewMathML }: ActionButtonsProps) {
  const { toast } = useToast()

  const handleCopyMathML = async () => {
    try {
      await navigator.clipboard.writeText(mathml)
      toast({
        title: "Copied!",
        description: "MathML code copied to clipboard",
        duration: 2000,
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
        duration: 2000,
      })
    }
  }

  const handleCopyLatex = async () => {
    try {
      // Extract LaTeX from MathML display (stored in mathml for reference)
      const latexMatch = mathml.match(/LaTeX: ([^<]+)/)
      const latex = latexMatch ? latexMatch[1] : ""
      if (latex) {
        await navigator.clipboard.writeText(latex)
        toast({
          title: "Copied!",
          description: "LaTeX code copied to clipboard",
          duration: 2000,
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
        duration: 2000,
      })
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 justify-end">
      <Button
        onClick={handleCopyLatex}
        disabled={!mathml}
        variant="outline"
        size="sm"
        className="gap-2 bg-transparent text-xs"
      >
        <Copy className="w-3 h-3" />
        Copy LaTeX
      </Button>
      <Button
        onClick={handleCopyMathML}
        disabled={!mathml}
        variant="outline"
        size="sm"
        className="gap-2 bg-transparent text-xs"
      >
        <Copy className="w-3 h-3" />
        Copy MathML
      </Button>
      <Button onClick={onViewMathML} disabled={!mathml} size="sm" className="gap-2 text-xs">
        <Eye className="w-3 h-3" />
        View MathML
      </Button>
    </div>
  )
}
