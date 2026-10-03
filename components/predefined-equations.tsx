"use client"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Equation from "./Equation"
import MoreEquationsModal from "./MoreEquationsModal"
import { equations } from "@/lib/equations"

interface PredefinedEquationsProps {
  onSelectEquation: (equation: string) => void
}

export default function PredefinedEquations({ onSelectEquation }: PredefinedEquationsProps) {

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-foreground">Predefined Equations & Symbols</h2>

      <Tabs defaultValue="basic-algebra" className="w-full">
        <TabsList className="grid w-full grid-cols-6 h-8">
          {Object.keys(equations)
            .slice(0, 6)
            .map((category) => (
              <TabsTrigger key={category} value={category} className="text-xs capitalize">
                {category.replace("-", " ")}
              </TabsTrigger>
            ))}
        </TabsList>

        {Object.entries(equations)
          .slice(0, 6)
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
          equations={Object.fromEntries(Object.entries(equations).slice(6))}
          onSelectEquation={onSelectEquation}
        />
      </Tabs>
    </div>
  )
}
