"use client"

import temml from "temml"

interface EquationProps {
  latex: string
}

export default function Equation({ latex }: EquationProps) {
  const mathml = temml.renderToString(latex, { displayMode: false, xml: true })
  return <span className="flex items-center justify-center" dangerouslySetInnerHTML={{ __html: mathml }} />
}
