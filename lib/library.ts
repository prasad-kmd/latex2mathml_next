import type { ConversionOptions } from "./converter";

export const LIBRARY_KEY = "mathml-studio:library:v1";
export const MAX_EQUATIONS = 50;
export type SavedEquation = {
  id: string;
  title: string;
  latex: string;
  updatedAt: string;
  options: ConversionOptions;
};

function validOptions(input: unknown): input is ConversionOptions {
  if (!input || typeof input !== "object") return false;
  const value = input as Record<string, unknown>;
  return (value.engine === "temml" || value.engine === "katex") &&
    typeof value.display === "boolean" && typeof value.annotate === "boolean" && typeof value.pretty === "boolean";
}
function validEntry(input: unknown): input is SavedEquation {
  if (!input || typeof input !== "object") return false;
  const value = input as Record<string, unknown>;
  return typeof value.id === "string" && value.id.length > 0 && value.id.length <= 100 &&
    typeof value.title === "string" && value.title.trim().length > 0 && value.title.length <= 80 &&
    typeof value.latex === "string" && value.latex.trim().length > 0 && value.latex.length <= 50000 &&
    typeof value.updatedAt === "string" && value.updatedAt.length <= 40 && !Number.isNaN(Date.parse(value.updatedAt)) &&
    validOptions(value.options);
}

export function loadLibrary(raw: string | null): SavedEquation[] {
  if (!raw) return [];
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data) || data.length > MAX_EQUATIONS || !data.every(validEntry))
    throw new Error("Saved library data is invalid.");
  return data;
}

export function makeBackup(equations: SavedEquation[]): string {
  return JSON.stringify({ format: "latex-mathml-library", version: 1,
    exportedAt: new Date().toISOString(), equations }, null, 2) + "\n";
}

export function parseBackup(raw: string): SavedEquation[] {
  if (raw.length > 6_000_000) throw new Error("Backup is too large (6 MB maximum).");
  let data: unknown;
  try { data = JSON.parse(raw); } catch { throw new Error("This is not a valid JSON backup."); }
  if (!data || typeof data !== "object") throw new Error("This is not an equation-library backup.");
  const payload = data as Record<string, unknown>;
  if (payload.format !== "latex-mathml-library" || payload.version !== 1 ||
      !Array.isArray(payload.equations) || payload.equations.length > MAX_EQUATIONS ||
      !payload.equations.every(validEntry) ||
      new Set(payload.equations.map((item: SavedEquation) => item.id)).size !== payload.equations.length) {
    throw new Error("Invalid or unsupported equation-library backup.");
  }
  return payload.equations;
}
