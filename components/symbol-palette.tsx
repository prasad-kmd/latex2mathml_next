"use client";

import { memo, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { symbolGroups, totalSymbols, type SymbolItem } from "@/lib/symbols";

type Props = { onInsert: (item: SymbolItem) => void; onRegisterSearch?: (element: HTMLInputElement | null) => void };

function SymbolPaletteInner({ onInsert, onRegisterSearch }: Props) {
  const [category, setCategory] = useState(symbolGroups[0].name);
  const [query, setQuery] = useState("");
  const localRef = useRef<HTMLInputElement>(null);
  const group = symbolGroups.find((item) => item.name === category) ?? symbolGroups[0];
  const matches = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return group.items;
    return symbolGroups.flatMap((current) => current.items).filter((item) =>
      `${item.name} ${item.latex} ${item.search ?? ""}`.toLowerCase().includes(search),
    );
  }, [group, query]);

  return <section className="palette" aria-labelledby="palette-heading">
    <div className="palette-head">
      <div className="palette-title"><h2 id="palette-heading">Insert symbols</h2><span>Pick a symbol to insert it at the cursor</span><span className="symbol-total">{totalSymbols} tools</span></div>
      <div className="palette-search"><Search aria-hidden="true" size={16} strokeWidth={1.8}/><input ref={(node) => { localRef.current = node; onRegisterSearch?.(node); }} value={query} aria-label="Search mathematical symbols" onChange={(event) => setQuery(event.target.value)} placeholder="Search symbols or LaTeX…"/>{query && <button type="button" aria-label="Clear search" onClick={() => {setQuery("");localRef.current?.focus();}}><X size={14}/></button>}<kbd>⌘ K</kbd></div>
    </div>
    <Tabs value={category} onValueChange={(value) => {setCategory(value);setQuery("");}} className="palette-tabs-root">
      <TabsList variant="line" className="palette-tabs" aria-label="Symbol categories">{symbolGroups.map((current) => <TabsTrigger key={current.name} value={current.name} className="palette-tab">{current.name}</TabsTrigger>)}</TabsList>
    </Tabs>
    <div className="palette-results" role="group" aria-label={query ? `Search results for ${query}` : `${category} symbols`}>
      {matches.map((item, index) => <button type="button" key={`${item.name}-${item.latex}-${index}`} className="symbol-tile" title={`${item.name} · ${item.latex.replaceAll("|", "□")}`} aria-label={`Insert ${item.name}`} onMouseDown={(event) => event.preventDefault()} onClick={() => onInsert(item)}><span className="symbol-glyph" aria-hidden="true">{item.glyph}</span><span className="symbol-name">{item.name}</span></button>)}
      {matches.length === 0 && <p className="no-symbols">No matches. Try a name such as “fraction” or a LaTeX command.</p>}
    </div>
  </section>;
}
export const SymbolPalette = memo(SymbolPaletteInner);
