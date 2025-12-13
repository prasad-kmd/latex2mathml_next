"use client"

interface EquationPreviewProps {
  mathml: string
}

export function EquationPreview({ mathml }: EquationPreviewProps) {
  if (mathml === "error") {
    return <p className="text-red-500">Error rendering LaTeX</p>
  }

  if (!mathml) {
    return <p className="text-muted-foreground italic">Your equation preview will appear here</p>
  }

  return (
    <div
      className="text-lg md:text-xl lg:text-2xl"
      dangerouslySetInnerHTML={{ __html: mathml }}
    />
  )
}
