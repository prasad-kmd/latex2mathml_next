"use client"

import { useState, useCallback } from "react"
import PredefinedEquations from "@/components/predefined-equations"
import EquationEditor from "@/components/equation-editor"
import ActionButtons from "@/components/action-buttons"
import MathMLModal from "@/components/mathml-modal"

export default function Home() {
  const [latex, setLatex] = useState("")
  const [mathml, setMathml] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleLatexChange = useCallback((value: string) => {
    setLatex(value)
    convertLatexToMathML(value)
  }, [])

  const handleEquationSelect = useCallback(
    (equation: string) => {
      const newLatex = latex + equation
      setLatex(newLatex)
      convertLatexToMathML(newLatex)
    },
    [latex],
  )

  const convertLatexToMathML = (latexCode: string) => {
    try {
      if (typeof window !== "undefined" && window.MathJax) {
        setMathml(generateSimpleMathML(latexCode))
      }
    } catch (error) {
      setMathml("")
    }
  }

  return (
    <main className="min-h-[calc(100vh-60px)] bg-background">
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
        {/* Predefined Equations Section */}
        <PredefinedEquations onSelectEquation={handleEquationSelect} />

        {/* Editor Section */}
        <EquationEditor latex={latex} mathml={mathml} onLatexChange={handleLatexChange} />

        {/* Action Buttons */}
        <ActionButtons mathml={mathml} onViewMathML={() => setIsModalOpen(true)} />

        {/* MathML Modal */}
        <MathMLModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} mathml={mathml} />
      </div>
    </main>
  )
}

// Simple MathML generator from LaTeX
function generateSimpleMathML(latex: string): string {
  if (!latex.trim()) return ""

  // Convert common LaTeX patterns to MathML
  let mathml = `<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow>`

  // Replace common LaTeX commands
  const converted = latex
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "<mfrac><mrow>$1</mrow><mrow>$2</mrow></mfrac>")
    .replace(/\\sqrt\{([^}]*)\}/g, "<msqrt><mrow>$1</mrow></msqrt>")
    .replace(/\^/g, "<msup>")
    .replace(/_/g, "<msub>")
    .replace(/\\alpha/g, "α")
    .replace(/\\beta/g, "β")
    .replace(/\\gamma/g, "γ")
    .replace(/\\delta/g, "δ")
    .replace(/\\pi/g, "π")
    .replace(/\\theta/g, "θ")
    .replace(/\\sum/g, "∑")
    .replace(/\\int/g, "∫")
    .replace(/\\pm/g, "±")
    .replace(/\\times/g, "×")
    .replace(/\\div/g, "÷")
    .replace(/\\leq/g, "≤")
    .replace(/\\geq/g, "≥")
    .replace(/\\neq/g, "≠")

  mathml += converted + "</mrow></math>"
  return mathml
}
