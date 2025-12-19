"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Copy } from "lucide-react"
// import { useToast } from "@/hooks/use-toast"
/* Local fallback for useToast hook when "@/hooks/use-toast" is not available */
// function useToast() {
//   type ToastOptions = {
//     title: string
//     description?: string
//     variant?: "default" | "destructive" | string
//     duration?: number
//   }

//   const toast = (_opts: ToastOptions) => {
//     // Simple fallback: log the toast payload; integrate with your app's toast system if available
//     if (typeof window !== "undefined") {
//       console.log("toast", _opts)
//     }
//   }

//   return { toast }
// }
import { toast } from "sonner"

interface MathMLModalProps {
  isOpen: boolean
  onClose: () => void
  mathml: string
}

export default function MathMLModal({ isOpen, onClose, mathml }: MathMLModalProps) {
  // const { toast } = useToast()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mathml)
      // toast({
      //   title: "Copied!",
      toast.success("Copied!", {
        description: "MathML code copied to clipboard",
        duration: 2000,
      })
    } catch {
      // toast({
      //   title: "Error",
      toast.error("Error", {
        description: "Failed to copy to clipboard",
        // variant: "destructive",
        duration: 2000,
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>MathML Code</DialogTitle>
          <DialogDescription>Raw MathML markup generated from your LaTeX equation</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg border border-border overflow-auto max-h-96">
            <code className="text-xs font-mono text-foreground whitespace-pre-wrap break-words">{mathml}</code>
          </div>

          <Button onClick={handleCopy} variant="outline" size="sm" className="w-full gap-2 bg-transparent">
            <Copy className="w-4 h-4" />
            Copy Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
