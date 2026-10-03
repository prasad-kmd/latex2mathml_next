import type { SymbolItem } from "./symbols";

export type SnippetStop = { start: number; end: number };
export type SnippetSession = { stops: SnippetStop[]; index: number; exit: number };

// | is the first cursor stop. ⟦text⟧ marks editable defaults visited with Tab.
// Markers are removed before the source reaches the converter or storage.
export function prepareSnippet(item: SymbolItem, selected: string): { text: string; session: SnippetSession | null } {
  const template = item.latex;
  let text = "";
  let first: SnippetStop | null = null;
  const later: SnippetStop[] = [];
  for (let i = 0; i < template.length; i++) {
    if (template[i] === "|" && first === null) {
      text += selected;
      first = { start: text.length, end: text.length };
    } else if (template[i] === "⟦") {
      const end = template.indexOf("⟧", i + 1);
      if (end < 0) throw new Error(`Unclosed template field in ${item.name}`);
      const start = text.length;
      text += template.slice(i + 1, end);
      later.push({ start, end: text.length });
      i = end;
    } else text += template[i];
  }
  if (!first && !later.length) return { text, session: null };
  return { text, session: { stops: [...(first ? [first] : []), ...later], index: 0, exit: text.length } };
}

export function adjustSnippet(session: SnippetSession, previous: string, next: string): SnippetSession | null {
  if (previous === next) return session;
  let left = 0;
  while (left < previous.length && left < next.length && previous[left] === next[left]) left++;
  let right = 0;
  while (right < previous.length - left && right < next.length - left &&
         previous[previous.length - 1 - right] === next[next.length - 1 - right]) right++;
  const oldEnd = previous.length - right;
  const delta = next.length - previous.length;
  const active = session.stops[session.index];
  // Editing outside the active field ends the snippet; ordinary typing continues unaffected.
  if (left < active.start || oldEnd > active.end) return null;
  const stops = session.stops.map((stop, index) => index === session.index
    ? { start: stop.start, end: stop.end + delta }
    : index > session.index ? { start: stop.start + delta, end: stop.end + delta } : stop);
  return { ...session, stops, exit: session.exit + delta };
}
