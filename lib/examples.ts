export const groups = [
  { name: "Algebra", items: [
    { name: "Quadratic formula", latex: String.raw`x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}` },
    { name: "Binomial theorem", latex: String.raw`(x+y)^n = \sum_{k=0}^{n} \binom{n}{k}x^{n-k}y^k` },
    { name: "Fraction", latex: String.raw`\frac{a^2+b^2}{c^2}` },
  ]},
  { name: "Calculus", items: [
    { name: "Definite integral", latex: String.raw`\int_{a}^{b} f(x)\,dx = F(b)-F(a)` },
    { name: "Euler’s identity", latex: String.raw`e^{i\pi}+1=0` },
    { name: "Limit definition", latex: String.raw`\lim_{h \to 0}\frac{f(x+h)-f(x)}{h}` },
  ]},
  { name: "Linear algebra", items: [
    { name: "Matrix", latex: String.raw`\begin{pmatrix} a & b \\ c & d \end{pmatrix}` },
    { name: "Summation", latex: String.raw`\sum_{i=1}^{n} i = \frac{n(n+1)}{2}` },
  ]},
];
export const snippets = [
  { label: "Fraction", value: String.raw`\frac{a}{b}` },
  { label: "Root", value: String.raw`\sqrt{x}` },
  { label: "Sum", value: String.raw`\sum_{i=1}^{n}` },
  { label: "Integral", value: String.raw`\int_{a}^{b}` },
  { label: "Alpha", value: String.raw`\alpha` },
  { label: "Theta", value: String.raw`\theta` },
  { label: "Infinity", value: String.raw`\infty` },
  { label: "Matrix", value: String.raw`\begin{pmatrix} a & b \\ c & d \end{pmatrix}` },
];
