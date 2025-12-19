"use client"

import { useState, useCallback } from "react"
import temml from "temml"
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
    if (!latexCode.trim()) {
      setMathml("")
      return
    }
    try {
      const mml = temml.renderToString(latexCode, { displayMode: true, xml: true })
      setMathml(mml)
    } catch (error) {
      console.error("Temml rendering error:", error)
      setMathml("error")
    }
  }

  return (
    <main className="min-h-[calc(100vh-113px)] bg-background">
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
        {/* Predefined Equations Section */}
        <PredefinedEquations onSelectEquation={handleEquationSelect} />

        {/* Editor Section */}
        <EquationEditor latex={latex} mathml={mathml} onLatexChange={handleLatexChange} />

        {/* Action Buttons */}
        <ActionButtons
          mathml={mathml}
          latex={latex}
          onViewMathML={() => setIsModalOpen(true)}
        />

        {/* MathML Modal */}
        <MathMLModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} mathml={mathml} />
      </div>
    </main>
  )
}

