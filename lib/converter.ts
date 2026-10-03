import temml from "temml";
import katex from "katex";

export type Engine = "temml" | "katex";
export type ConversionOptions = { engine: Engine; display: boolean; annotate: boolean; pretty: boolean };
export type ConversionResult = { mathml: string; error: string | null; duration: number };
const NS = "http://www.w3.org/1998/Math/MathML";

function prettyPrint(xml: string): string {
  // Whitespace is only inserted between tags, never inside text nodes.
  const spaced = xml.replace(/>\s*</g, "><").replace(/></g, ">\n<");
  let level = 0;
  return spaced.split("\n").map((line) => {
    if (/^<\//.test(line)) level = Math.max(0, level - 1);
    const current = "  ".repeat(level) + line;
    if (/^<(?!\/|\?|!)[^>]+>$/.test(line) && !/\/\s*>$/.test(line)) level++;
    return current;
  }).join("\n");
}

export function convert(source: string, options: ConversionOptions): ConversionResult {
  const start = performance.now();
  if (!source.trim()) return { mathml: "", error: null, duration: 0 };
  try {
    let xml: string;
    if (options.engine === "temml") {
      xml = temml.renderToString(source, {
        displayMode: options.display, annotate: options.annotate, xml: true,
        throwOnError: true, trust: false, strict: true, maxExpand: 500, maxSize: [100, 1000],
      });
    } else {
      const html = katex.renderToString(source, {
        displayMode: options.display, output: "mathml", throwOnError: true,
        trust: false, strict: "warn", maxExpand: 500, maxSize: 100,
      });
      const parsed = new DOMParser().parseFromString(html, "text/html");
      const math = parsed.querySelector("math");
      if (!math) throw new Error("KaTeX did not return a MathML element.");
      xml = new XMLSerializer().serializeToString(math);
    }
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    if (doc.querySelector("parsererror") || doc.documentElement.localName !== "math" || doc.documentElement.namespaceURI !== NS) {
      throw new Error("The converter produced invalid MathML. Try the other engine.");
    }
    if (!options.annotate) {
      for (const annotation of Array.from(doc.getElementsByTagNameNS(NS, "annotation"))) annotation.remove();
      for (const semantics of Array.from(doc.getElementsByTagNameNS(NS, "semantics"))) {
        if (semantics.children.length === 1) semantics.replaceWith(semantics.firstElementChild!);
      }
    }
    xml = new XMLSerializer().serializeToString(doc.documentElement);
    return { mathml: options.pretty ? prettyPrint(xml) : xml, error: null, duration: Math.round(performance.now() - start) };
  } catch (error) {
    return { mathml: "", error: error instanceof Error ? error.message : "Conversion failed. Check your LaTeX input.", duration: Math.round(performance.now() - start) };
  }
}

export function standaloneHtml(mathml: string): string {
  return `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>MathML equation</title>\n<style>body{min-height:100vh;display:grid;place-items:center;margin:0;padding:2rem;box-sizing:border-box;background:#fcfbf7;color:#252520;font-family:system-ui,sans-serif}math{font-size:2rem;max-width:100%;overflow-x:auto}</style>\n</head>\n<body>\n${mathml}\n</body>\n</html>\n`;
}
