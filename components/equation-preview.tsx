"use client"

import { useEffect, useRef } from "react"

interface EquationPreviewProps {
  latex: string
}

export function EquationPreview({ latex }: EquationPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current && typeof window !== "undefined") {
      // Load MathJax script
      if (!window.MathJax) {
        const script = document.createElement("script")
        script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
        script.async = true
        document.head.appendChild(script)
        script.onload = () => {
          if (window.MathJax && latex) {
            window.MathJax.contentDocument = document
            window.MathJax.typesetPromise([containerRef.current]).catch((err: Error) => {
              console.log("[v0] MathJax error:", err)
            })
          }
        }
      } else if (latex) {
        window.MathJax.typesetPromise([containerRef.current]).catch((err: Error) => {
          console.log("[v0] MathJax error:", err)
        })
      }
    }
  }, [latex])

  return (
    <div ref={containerRef} className="w-full text-center" style={{ minHeight: "100px" }}>
      {latex ? (
        <div className="text-lg md:text-xl lg:text-2xl">{"$$" + latex + "$$"}</div>
      ) : (
        <p className="text-muted-foreground italic">Your equation preview will appear here</p>
      )}
    </div>
  )
}

// Extend window type for MathJax
declare global {
  interface Window {
    MathJax?: {
      typesetPromise: (elements: (HTMLElement | null)[]) => Promise<void>
      contentDocument?: Document
    }
  }
}
