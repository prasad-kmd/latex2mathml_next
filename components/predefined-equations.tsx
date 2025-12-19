"use client"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Equation from "./Equation"
import MoreEquationsModal from "./MoreEquationsModal"

interface PredefinedEquationsProps {
  onSelectEquation: (equation: string) => void
}

export default function PredefinedEquations({ onSelectEquation }: PredefinedEquationsProps) {
  const equations = {
    basic: [
      { label: "Fraction", value: "\\frac{a}{b}" },
      { label: "Square Root", value: "\\sqrt{x}" },
      { label: "Power", value: "x^n" },
      { label: "Subscript", value: "x_i" },
      { label: "Pi", value: "\\pi" },
      { label: "Plus-Minus", value: "\\pm" },
    ],
    greek: [
      { label: "α", value: "\\alpha" },
      { label: "β", value: "\\beta" },
      { label: "γ", value: "\\gamma" },
      { label: "δ", value: "\\delta" },
      { label: "θ", value: "\\theta" },
      { label: "π", value: "\\pi" },
    ],
    calculus: [
      { label: "Integral", value: "\\int_a^b f(x) \\, dx" },
      { label: "Sum", value: "\\sum_{i=1}^{n}" },
      { label: "Limit", value: "\\lim_{x \\to \\infty}" },
      { label: "Derivative", value: "\\frac{d}{dx}" },
      { label: "Partial", value: "\\frac{\\partial f}{\\partial x}" },
      { label: "Infinity", value: "\\infty" },
    ],
    operators: [
      { label: "±", value: "\\pm" },
      { label: "×", value: "\\times" },
      { label: "÷", value: "\\div" },
      { label: "≤", value: "\\leq" },
      { label: "≥", value: "\\geq" },
      { label: "≠", value: "\\neq" },
    ],
    relations: [
      { label: "≈", value: "\\approx" },
      { label: "≡", value: "\\equiv" },
      { label: "∝", value: "\\propto" },
      { label: "∼", value: "\\sim" },
      { label: "cong", value: "\\cong" },
      { label: "parallel", value: "\\parallel" },
    ],
    logic: [
      { label: "∧", value: "\\land" },
      { label: "∨", value: "\\lor" },
      { label: "¬", value: "\\lnot" },
      { label: "→", value: "\\to" },
      { label: "∀", value: "\\forall" },
      { label: "∃", value: "\\exists" },
    ],
    arrows: [
      { label: "→", value: "\\to" },
      { label: "←", value: "\\leftarrow" },
      { label: "↔", value: "\\leftrightarrow" },
      { label: "⇒", value: "\\Rightarrow" },
      { label: "⇐", value: "\\Leftarrow" },
      { label: "⇔", value: "\\Leftrightarrow" },
    ],
    trigonometry: [
      { label: "sin", value: "\\sin" },
      { label: "cos", value: "\\cos" },
      { label: "tan", value: "\\tan" },
      { label: "csc", value: "\\csc" },
      { label: "sec", value: "\\sec" },
      { label: "cot", value: "\\cot" },
    ],
  }

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-foreground">Predefined Equations & Symbols</h2>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-8">
          <TabsTrigger value="basic" className="text-xs">
            Basic
          </TabsTrigger>
          <TabsTrigger value="greek" className="text-xs">
            Greek
          </TabsTrigger>
          <TabsTrigger value="calculus" className="text-xs">
            Calculus
          </TabsTrigger>
          <TabsTrigger value="operators" className="text-xs">
            Operators
          </TabsTrigger>
        </TabsList>

        {Object.entries(equations)
          .slice(0, 4)
          .map(([category, items]) => (
            <TabsContent key={category} value={category} className="space-y-2 mt-2">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-1">
                {items.map((item) => (
                  <Button
                    key={item.value}
                    onClick={() => onSelectEquation(item.value)}
                    variant="outline"
                    className="text-xl font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Equation latex={item.value} />
                  </Button>
                ))}
              </div>
            </TabsContent>
          ))}
        <MoreEquationsModal
          equations={Object.fromEntries(Object.entries(equations).slice(4))}
          onSelectEquation={onSelectEquation}
        />
      </Tabs>
    </div>
  )
}
