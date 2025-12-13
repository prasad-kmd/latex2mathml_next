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

  const convertLatexToMathML = async (latexCode: string) => {
    try {
      if (typeof window !== "undefined" && window.MathJax) {
        const mathJaxAny = window.MathJax as any
        // Prefer async API if available, otherwise fall back to sync tex2mml
        const mml =
          (typeof mathJaxAny.tex2mmlPromise === "function" && await mathJaxAny.tex2mmlPromise(latexCode)) ||
          (typeof mathJaxAny.tex2mml === "function" && mathJaxAny.tex2mml(latexCode)) ||
          ""
        setMathml(mml)
      }
    } catch (error) {
      setMathml("")
    }
  }

  // const convertLatexToMathML = async (latexCode: string) => {
  //   try {
  //     if (typeof window !== "undefined" && window.MathJax) {
  //       const mml = await window.MathJax.tex2mmlPromise(latexCode)
  //       setMathml(mml)
  //     }
  //   } catch (error) {
  //     setMathml("")
  //   }
  // }

  return (
    <main className="min-h-[calc(100vh-60px)] bg-background">
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

