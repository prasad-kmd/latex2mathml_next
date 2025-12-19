"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Equation from "./Equation"

interface MoreEquationsModalProps {
  equations: Record<string, { label: string; value: string }[]>
  onSelectEquation: (equation: string) => void
}

export default function MoreEquationsModal({
  equations,
  onSelectEquation,
}: MoreEquationsModalProps) {
  const categories = Object.keys(equations)
  const defaultValue = categories[0]

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex justify-end">
          <Button variant="link" size="sm" className="text-xs">
            More...
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>More Equations & Symbols</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue={defaultValue} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-8">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="text-xs capitalize">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          {Object.entries(equations).map(([category, items]) => (
            <TabsContent key={category} value={category} className="space-y-2 mt-2">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-1">
                {items.map((item) => (
                  <Button
                    key={item.value}
                    onClick={() => onSelectEquation(item.value)}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Equation latex={item.value} />
                  </Button>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
