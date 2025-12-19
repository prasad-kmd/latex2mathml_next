"use client"

import temml from "temml"

interface EquationProps {
  latex: string
}

export default function Equation({ latex }: EquationProps) {
  const mathml = temml.renderToString(latex, { displayMode: true, xml: true })
  return <span dangerouslySetInnerHTML={{ __html: mathml }} />
}
