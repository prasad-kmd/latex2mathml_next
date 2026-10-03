"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDownToLine, Check, CircleAlert, Clipboard, CodeXml, Copy, FileInput, FileText, Info, Keyboard, LibraryBig, Moon, Play, RotateCcw, Settings2, Sun } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverPopup, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipPopup, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SymbolPalette } from "@/components/symbol-palette";
import { EquationLibrary } from "@/components/equation-library";
import { AboutPanel, NoticesPanel } from "@/components/about-panels";
import { convert, standaloneHtml, type ConversionOptions, type ConversionResult } from "@/lib/converter";
import { copyText, native, openTex, openLibraryBackup, readAppStore, saveText, writeAppStore } from "@/lib/native";
import { LIBRARY_KEY, MAX_EQUATIONS, loadLibrary, makeBackup, parseBackup, type SavedEquation } from "@/lib/library";
import type { SymbolItem } from "@/lib/symbols";
import { adjustSnippet, prepareSnippet, type SnippetSession } from "@/lib/snippet";

const starter = String.raw`x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}`;
const defaultOptions: ConversionOptions = { engine: "temml", display: true, annotate: true, pretty: true };
type EditorSnapshot = { value: string; start: number; end: number };
type Panel = "markup" | "settings" | "shortcuts" | "about" | "notices" | "library" | null;
const PALETTE_KEY = "mathml-studio:palette-height";
const SPLIT_KEY = "mathml-studio:input-share";
const ACCENTS = ["forest", "ocean", "plum", "coral"] as const;
type Accent = typeof ACCENTS[number];

function MathPreview({ mathml }: { mathml: string }) {
  const target = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = target.current;
    if (!host) return;
    host.replaceChildren();
    if (!mathml) return;
    const xml = new DOMParser().parseFromString(mathml, "application/xml");
    if (!xml.querySelector("parsererror") && xml.documentElement.localName === "math") host.appendChild(document.importNode(xml.documentElement, true));
  }, [mathml]);
  return <div ref={target} className="math-preview" role="img" aria-label="Rendered math equation" />;
}

function IconAction({ label, children, onClick, disabled = false, className = "" }: {label:string; children:React.ReactNode; onClick:()=>void; disabled?:boolean; className?:string}) {
  return <Tooltip><TooltipTrigger render={<Button type="button" variant="ghost" size="icon" className={`icon-action ${className}`} aria-label={label} disabled={disabled} onClick={onClick} />}>{children}</TooltipTrigger><TooltipPopup>{label}</TooltipPopup></Tooltip>;
}

export default function Home() {
  const [latex, setLatex] = useState(starter);
  const [options, setOptions] = useState<ConversionOptions>(defaultOptions);
  const [compiledOptions, setCompiledOptions] = useState<ConversionOptions>(defaultOptions);
  const [result, setResult] = useState<ConversionResult>({ mathml: "", error: null, duration: 0 });
  const [compiledLatex, setCompiledLatex] = useState(starter);
  const [live, setLive] = useState(true);
  const [dark, setDark] = useState(false);
  const [accent, setAccent] = useState<Accent>("forest");
  const [paletteHeight, setPaletteHeight] = useState(240);
  const [inputShare, setInputShare] = useState(0.5);
  const [activeTemplate, setActiveTemplate] = useState(false);
  const [equations, setEquations] = useState<SavedEquation[]>([]);
  const [libraryBusy, setLibraryBusy] = useState(false);
  const [libraryAvailable, setLibraryAvailable] = useState(true);
  const [viewportHeight, setViewportHeight] = useState(800);
  const [viewportWidth, setViewportWidth] = useState(1280);
  const [ready, setReady] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [message, setMessage] = useState("");
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const editorValueRef = useRef(starter);
  const historyRef = useRef<{ undo: EditorSnapshot[]; redo: EditorSnapshot[] }>({ undo: [], redo: [] });
  const beforeInputRef = useRef<{ start: number; end: number } | null>(null);
  const snippetRef = useRef<SnippetSession | null>(null);
  const workAreaRef = useRef<HTMLDivElement>(null);
  const splitDragRef = useRef<{startX:number; startShare:number} | null>(null);
  const dragRef = useRef<{startY:number; startHeight:number} | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = useCallback((text: string) => {
    setMessage(text);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setMessage(""), 3200);
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const [draft, library, height, share] = await Promise.allSettled([
        readAppStore("mathml-studio:v2"), readAppStore(LIBRARY_KEY), readAppStore(PALETTE_KEY), readAppStore(SPLIT_KEY),
      ]);
      if (!active) return;
      if (draft.status === "fulfilled") {
        try {
          const stored = draft.value ? JSON.parse(draft.value) : null;
          if (stored && typeof stored === "object") {
            if (typeof stored.latex === "string") setLatex(stored.latex.slice(0, 50000));
            if (stored.options && ["temml", "katex"].includes(stored.options.engine))
              setOptions({ ...defaultOptions, ...stored.options });
            if (typeof stored.live === "boolean") setLive(stored.live);
            if (typeof stored.dark === "boolean") setDark(stored.dark);
            if (ACCENTS.includes(stored.accent)) setAccent(stored.accent);
          }
        } catch { notify("Draft settings could not be read."); }
      }
      try {
        if (library.status !== "fulfilled") throw new Error("Cannot read saved equations.");
        setEquations(loadLibrary(library.value));
      } catch { setLibraryAvailable(false); notify("Saved equations could not be read. Import a backup to restore them."); }
      if (height.status === "fulfilled") {
        const savedHeight = Number(height.value);
        if (height.value !== null && Number.isFinite(savedHeight) && savedHeight >= 170 && savedHeight <= 2000)
          setPaletteHeight(savedHeight);
      }
      if (share.status === "fulfilled" && share.value !== null) {
        const savedShare = Number(share.value);
        if (Number.isFinite(savedShare) && savedShare >= 0.2 && savedShare <= 0.8) setInputShare(savedShare);
      }
      if (active) { setDesktop(Boolean(await native().catch(() => null))); setReady(true); }
    };
    void load();
    return () => { active = false; };
  }, [notify]);
  useEffect(() => {
    const measure = () => { setViewportHeight(window.innerHeight); setViewportWidth(window.innerWidth); };
    measure(); window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  useEffect(() => { editorValueRef.current = latex; }, [latex]);
  useEffect(() => { document.documentElement.classList.toggle("dark", dark); document.documentElement.dataset.accent = accent; }, [dark, accent]);
  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => {
      void writeAppStore("mathml-studio:v2", JSON.stringify({ latex, options, live, dark, accent })).catch(() => notify("Could not persist your draft."));
    }, 400);
    return () => clearTimeout(timer);
  }, [latex, options, live, dark, accent, ready, notify]);
  useEffect(() => {
    if (!ready || !live) return;
    const timer = setTimeout(() => {
      setResult(convert(latex, options));
      setCompiledLatex(latex);
      setCompiledOptions(options);
    }, 150);
    return () => clearTimeout(timer);
  }, [latex, options, live, ready]);
  useEffect(() => () => { if (noticeTimer.current) clearTimeout(noticeTimer.current); }, []);

  const run = useCallback(() => {
    setResult(convert(latex, options));
    setCompiledLatex(latex);
    setCompiledOptions(options);
  }, [latex, options]);
  const pending = latex !== compiledLatex || JSON.stringify(options) !== JSON.stringify(compiledOptions);
  const valid = Boolean(result.mathml) && !pending;
  const preview = pending ? "pending" : result.error ? "error" : valid ? "valid" : "empty";
  const minSplitShare = Math.min(0.5, 240 / Math.max(480, viewportWidth - (viewportWidth <= 1060 ? 16 : 28) - 10));
  const effectiveSplitShare = Math.max(minSplitShare, Math.min(inputShare, 1 - minSplitShare));
  const updateOption = <K extends keyof ConversionOptions>(key: K, value: ConversionOptions[K]) => setOptions((old) => ({ ...old, [key]: value }));

  const changeLatex = useCallback((next: string) => {
    const previous = editorValueRef.current;
    if (previous !== next) {
      const editor = editorRef.current;
      const selection = beforeInputRef.current ?? { start: editor?.selectionStart ?? previous.length, end: editor?.selectionEnd ?? previous.length };
      const history = historyRef.current;
      history.undo.push({ value: previous, start: Math.min(selection.start, previous.length), end: Math.min(selection.end, previous.length) });
      if (history.undo.length > 200) history.undo.shift();
      history.redo = [];
    }
    beforeInputRef.current = null;
    if (snippetRef.current) {
      snippetRef.current = adjustSnippet(snippetRef.current, editorValueRef.current, next);
      if (!snippetRef.current) setActiveTemplate(false);
    }
    editorValueRef.current = next;
    setLatex(next);
  }, []);

  const insertSymbol = useCallback((item: SymbolItem) => {
    const editor = editorRef.current;
    if (!editor) return;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selected = editor.value.slice(start, end);
    const { text, session } = prepareSnippet(item, selected);
    if (editor.value.length - selected.length + text.length > editor.maxLength) {
      notify("Equation is too long to insert this symbol."); return;
    }
    snippetRef.current = null;
    setActiveTemplate(Boolean(session));
    editor.focus();
    editor.setSelectionRange(start, end);
    // Preserve a single template insertion as one edit, even in WebKit where
    // React-controlled textarea updates can discard the browser undo stack.
    const inserted = document.execCommand("insertText", false, text);
    if (!inserted) {
      const next = editor.value.slice(0, start) + text + editor.value.slice(end);
      changeLatex(next);
    }
    snippetRef.current = session ? { ...session,
      stops: session.stops.map((stop) => ({ start: start + stop.start, end: start + stop.end })),
      exit: start + session.exit } : null;
    const first = snippetRef.current?.stops[0];
    const caret = start + text.length;
    requestAnimationFrame(() => {
      editorRef.current?.focus();
      editorRef.current?.setSelectionRange(first?.start ?? caret, first?.end ?? caret);
    });
  }, [notify, changeLatex]);
  const clearSnippet = () => { snippetRef.current = null; setActiveTemplate(false); };

  const splitRange = () => {
    const work = workAreaRef.current;
    if (!work) return { width: 750, min: 0.32, max: 0.68 };
    const style = getComputedStyle(work);
    const width = work.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - 10;
    const min = Math.min(0.5, 240 / Math.max(480, width));
    return { width, min, max: 1 - min };
  };
  const resizeInputShare = (share: number, persist = true) => {
    const { min, max } = splitRange();
    const next = Math.round(Math.max(min, Math.min(share, max)) * 1000) / 1000;
    setInputShare(next);
    if (persist) void writeAppStore(SPLIT_KEY, String(next)).catch(() => notify("Could not persist pane sizes."));
  };
  const onSplitPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const actual = (workAreaRef.current?.querySelector(".source-pane")?.getBoundingClientRect().width ?? splitRange().width * inputShare) / splitRange().width;
    splitDragRef.current = { startX: event.clientX, startShare: actual };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };
  const onSplitPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (splitDragRef.current) resizeInputShare(splitDragRef.current.startShare + (event.clientX - splitDragRef.current.startX) / splitRange().width, false);
  };
  const onSplitPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (splitDragRef.current) resizeInputShare(splitDragRef.current.startShare + (event.clientX - splitDragRef.current.startX) / splitRange().width);
    splitDragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const resizePalette = useCallback((height: number, persist = true) => {
    const next = Math.round(Math.max(170, Math.min(height, window.innerHeight - 290)));
    setPaletteHeight(next);
    if (persist) void writeAppStore(PALETTE_KEY, String(next)).catch(() => notify("Could not persist palette size."));
  }, [notify]);
  const onDividerPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    dragRef.current = { startY: event.clientY, startHeight: paletteHeight };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };
  const onDividerPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current) resizePalette(dragRef.current.startHeight + dragRef.current.startY - event.clientY, false);
  };
  const onDividerPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current) resizePalette(dragRef.current.startHeight + dragRef.current.startY - event.clientY);
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const storeEquations = async (next: SavedEquation[]): Promise<boolean> => {
    if (libraryBusy) return false;
    setLibraryBusy(true);
    try {
      await writeAppStore(LIBRARY_KEY, JSON.stringify(next));
      setEquations(next);
      setLibraryAvailable(true);
      return true;
    } catch { notify("Could not save the library. Device storage may be full."); return false; }
    finally { setLibraryBusy(false); }
  };
  const addEquation = async (title: string): Promise<boolean> => {
    if (!ready || !libraryAvailable || libraryBusy || !latex.trim() || !title.trim() || equations.length >= MAX_EQUATIONS) return false;
    const entry: SavedEquation = { id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`, title: title.trim(), latex,
      updatedAt: new Date().toISOString(), options: { ...options } };
    const success = await storeEquations([entry, ...equations]);
    if (success) notify("Equation saved to your library");
    return success;
  };
  const renameEquation = async (id: string, title: string): Promise<boolean> => {
    const name = title.trim();
    const current = equations.find((item) => item.id === id);
    if (!current || !libraryAvailable || !name || name.length > 80) return false;
    if (current.title === name) return true;
    const next = equations.map((item) => item.id === id ? { ...item, title: name, updatedAt: new Date().toISOString() } : item);
    const saved = await storeEquations(next);
    if (saved) notify("Equation renamed");
    return saved;
  };
  const exportLibrary = async () => {
    try {
      if (await saveText(makeBackup(equations), "json", "latex-mathml-equations.json")) notify("Library backup exported");
    } catch { notify("Could not export the backup."); }
  };
  const importLibrary = async () => {
    try {
      const raw = await openLibraryBackup();
      if (raw === null) return;
      const imported = parseBackup(raw);
      const existing = new Set(equations.map((item) => item.id));
      const additions = imported.filter((item) => !existing.has(item.id));
      if (equations.length + additions.length > MAX_EQUATIONS) {
        notify(`Library limit is ${MAX_EQUATIONS}. Remove items before importing.`); return;
      }
      if (additions.length && !await storeEquations([...additions, ...equations])) return;
      notify(`${additions.length} equation${additions.length === 1 ? "" : "s"} imported${imported.length > additions.length ? " · duplicates skipped" : ""}`);
    } catch (error) { notify(error instanceof Error ? error.message : "Could not import the backup."); }
  };

  async function clipboard(text: string, label: string) {
    try { await copyText(text); notify(label + " copied"); }
    catch { notify("Clipboard access failed. Check permissions."); }
  }
  const save = useCallback(async (kind: "mml" | "html" | "tex") => {
    if (kind !== "tex" && !valid) return;
    setExportOpen(false);
    try {
      const text = kind === "tex" ? latex : kind === "html" ? standaloneHtml(result.mathml) : result.mathml;
      if (await saveText(text, kind, `equation.${kind}`)) notify(`Saved equation.${kind}`);
    } catch { notify("Could not save the file. Check permissions."); }
  }, [valid, latex, result.mathml, notify]);
  const openFile = useCallback(async () => {
    try { const content = await openTex(); if (content !== null) { clearSnippet(); changeLatex(content.slice(0, 50000)); editorRef.current?.focus(); notify("File opened"); } }
    catch { notify("Could not open the selected file."); }
  }, [notify, changeLatex]);
  const onEditorKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const editor = event.currentTarget;
    if ((event.ctrlKey || event.metaKey) && ["z", "y"].includes(event.key.toLowerCase())) {
      event.preventDefault();
      const redo = event.key.toLowerCase() === "y" || event.shiftKey;
      const history = historyRef.current;
      const source = redo ? history.redo : history.undo;
      const target = source.pop();
      if (!target) return;
      const destination = redo ? history.undo : history.redo;
      destination.push({ value: editorValueRef.current, start: editor.selectionStart, end: editor.selectionEnd });
      clearSnippet();
      beforeInputRef.current = null;
      editorValueRef.current = target.value;
      setLatex(target.value);
      requestAnimationFrame(() => editorRef.current?.setSelectionRange(target.start, target.end));
      return;
    }
    if (event.key === "Escape" && snippetRef.current) { clearSnippet(); return; }
    if (event.key === "Tab") {
      const snippet = snippetRef.current;
      if (snippet) {
        const active = snippet.stops[snippet.index];
        if (editor.selectionStart >= active.start && editor.selectionEnd <= active.end) {
          if (!event.shiftKey || snippet.index > 0) {
            event.preventDefault();
            const target = event.shiftKey ? snippet.stops[--snippet.index] : snippet.stops[++snippet.index];
            if (target) editor.setSelectionRange(target.start, target.end);
            else { editor.setSelectionRange(snippet.exit, snippet.exit); clearSnippet(); }
            return;
          }
        } else clearSnippet();
      }
      if (event.shiftKey) return;
      event.preventDefault();
      const start = editor.selectionStart;
      if (!document.execCommand("insertText", false, "  ")) {
        changeLatex(editor.value.slice(0, start) + "  " + editor.value.slice(editor.selectionEnd));
        requestAnimationFrame(() => editorRef.current?.setSelectionRange(start + 2, start + 2));
      }
    } else if (event.key === "{" && editor.selectionStart === editor.selectionEnd) {
      event.preventDefault();
      const start = editor.selectionStart;
      if (!document.execCommand("insertText", false, "{}")) {
        changeLatex(editor.value.slice(0, start) + "{}" + editor.value.slice(start));
      }
      requestAnimationFrame(() => editorRef.current?.setSelectionRange(start + 1, start + 1));
    }
  };
  // Stable native shortcut subscription; callbacks are synchronized without rebinding listeners on every keystroke.
  const actionsRef = useRef({ run, save, openFile, setPanel });
  useEffect(() => { actionsRef.current = { run, save, openFile, setPanel }; }, [run, save, openFile]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      const key = event.key.toLowerCase();
      if (key === "s") { event.preventDefault(); void actionsRef.current.save("mml"); }
      if (key === "o") { event.preventDefault(); void actionsRef.current.openFile(); }
      if (key === "enter") { event.preventDefault(); actionsRef.current.run(); }
      if (key === "k") { event.preventDefault(); searchRef.current?.focus(); searchRef.current?.select(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return <TooltipProvider>
    <main className="studio" aria-label="LaTeX to MathML converter" style={{ "--palette-height": `${paletteHeight}px` } as React.CSSProperties}>
      <div className="command-bar">
        <div className="identity"><Image src="/favicon.png" alt="" width={27} height={27} unoptimized/><span className="product-name">LaTeX <span>to</span> MathML</span><span className="product-detail">converter</span></div>
        <div className="command-actions"><Button type="button" variant="outline" size="sm" className="open-action" onClick={() => void openFile()}><FileInput aria-hidden="true" data-icon="inline-start"/> Open <span className="button-shortcut">⌘O</span></Button>
          <span className="toolbar-divider" aria-hidden="true" />
          <IconAction label="Clear equation" onClick={() => {clearSnippet();changeLatex("");editorRef.current?.focus();}} disabled={!latex}><RotateCcw aria-hidden="true" size={18} strokeWidth={1.8}/></IconAction>
          <Button type="button" size="sm" className="copy-primary" disabled={!valid} onClick={() => void clipboard(result.mathml, "MathML")}><Copy aria-hidden="true" data-icon="inline-start"/> Copy MathML</Button>
          <Popover open={exportOpen} onOpenChange={setExportOpen}><PopoverTrigger render={<Button type="button" size="icon-sm" variant="outline" aria-label="Export equation" className="export-trigger" />}><ArrowDownToLine aria-hidden="true" size={17}/></PopoverTrigger><PopoverPopup align="end" className="export-pop"><div className="export-label">Export as</div><button type="button" disabled={!valid} onClick={() => void save("mml")}><CodeXml size={17}/><span>MathML file <small>.mml</small></span></button><button type="button" disabled={!valid} onClick={() => void save("html")}><FileText size={17}/><span>HTML document <small>.html</small></span></button><button type="button" disabled={!latex.trim()} onClick={() => void save("tex")}><Clipboard size={17}/><span>LaTeX source <small>.tex</small></span></button></PopoverPopup></Popover>
        </div>
        <div className="utility-actions">
          <IconAction label={`Saved equations (${equations.length})`} disabled={!ready} onClick={() => setPanel("library")}><LibraryBig aria-hidden="true" size={19} strokeWidth={1.8}/></IconAction>
          <IconAction label="View MathML code" onClick={() => setPanel("markup")} disabled={!valid}><CodeXml aria-hidden="true" size={19} strokeWidth={1.8}/></IconAction>
          <IconAction label="Preferences" onClick={() => setPanel("settings")}><Settings2 aria-hidden="true" size={19} strokeWidth={1.8}/></IconAction>
          <IconAction label="Keyboard shortcuts" onClick={() => setPanel("shortcuts")}><Keyboard aria-hidden="true" size={19} strokeWidth={1.8}/></IconAction>
          <IconAction label={dark ? "Use light theme" : "Use dark theme"} onClick={() => setDark((value) => !value)}>{dark ? <Sun aria-hidden="true" size={19} strokeWidth={1.8}/> : <Moon aria-hidden="true" size={19} strokeWidth={1.8}/>}</IconAction>
          <IconAction label="About this app" onClick={() => setPanel("about")}><Info aria-hidden="true" size={19} strokeWidth={1.8}/></IconAction>
        </div>
      </div>

      <div className="work-area" ref={workAreaRef} style={{ "--input-share": inputShare } as React.CSSProperties}>
        <section className="work-pane source-pane" aria-labelledby="source-title">
          <div className="pane-top"><div className="pane-heading"><span className="pane-marker source-marker">↳</span><div><h1 id="source-title">LaTeX input</h1><p>Write or insert an expression</p></div></div><div className="pane-tools"><span className="count-text">{latex.length.toLocaleString()} chars</span><IconAction label="Copy LaTeX" onClick={() => void clipboard(latex, "LaTeX")} disabled={!latex}><Copy size={16} strokeWidth={1.8}/></IconAction></div></div>
          <div className="editor-surface"><div className="line-numbers" aria-hidden="true">{Array.from({length: Math.max(12, latex.split("\n").length)},(_,index)=><span key={index}>{index+1}</span>)}</div><textarea ref={editorRef} id="latex-source" aria-label="LaTeX source" spellCheck={false} autoCapitalize="off" autoComplete="off" maxLength={50000} value={latex} onBeforeInput={(event) => { beforeInputRef.current = { start: event.currentTarget.selectionStart, end: event.currentTarget.selectionEnd }; }} onChange={(event) => changeLatex(event.target.value)} onKeyDown={onEditorKeyDown} placeholder="Type LaTeX, or choose a symbol below…" /></div>
          <div className="pane-bottom"><span><span className="status-led"/> {live ? "Live conversion" : "Manual conversion"}</span><span>{activeTemplate ? "Tab to next field" : "Tab to indent"}</span></div>
        </section>
        <div className="pane-divider" role="separator" aria-label="Resize input and preview" aria-orientation="vertical" aria-valuemin={Math.round(minSplitShare*100)} aria-valuemax={Math.round((1-minSplitShare)*100)} aria-valuenow={Math.round(effectiveSplitShare*100)} tabIndex={0} onPointerDown={onSplitPointerDown} onPointerMove={onSplitPointerMove} onPointerUp={onSplitPointerUp} onLostPointerCapture={() => {splitDragRef.current = null;}} onDoubleClick={() => resizeInputShare(0.5)} onKeyDown={(event) => {if (event.key === "ArrowLeft" || event.key === "ArrowRight") {event.preventDefault();resizeInputShare(inputShare + (event.key === "ArrowRight" ? 0.04 : -0.04));} if (event.key === "Home" || event.key === "End") {event.preventDefault();const {min,max}=splitRange();resizeInputShare(event.key === "Home" ? min : max);}}}><span aria-hidden="true"/></div>
        <section className="work-pane render-pane" aria-labelledby="render-title">
          <div className="pane-top"><div className="pane-heading"><span className="pane-marker render-marker">ƒ</span><div><h2 id="render-title">Rendered output</h2><p>Native, accessible MathML</p></div></div><span className={`preview-status ${preview}`}><span className="status-led"/>{preview === "valid" ? "Ready" : preview === "error" ? "Check syntax" : preview === "pending" ? "Updating" : "Waiting"}</span></div>
          <div className="render-surface">{preview === "error" ? <div className="render-error" role="alert"><CircleAlert size={24} strokeWidth={1.6}/><strong>Could not render this equation</strong><p>{result.error}</p><span>Check your syntax, or try the other engine in Preferences.</span></div> : preview === "valid" ? <MathPreview mathml={result.mathml}/> : <div className="render-placeholder"><span className="placeholder-formula" aria-hidden="true">∑ f(x)</span><span>{preview === "pending" ? live ? "Updating the preview…" : "Press Convert to update the preview" : "Your equation appears here"}</span></div>}</div>
          <div className="pane-bottom"><span>{preview === "valid" ? `${options.engine === "temml" ? "TeMMl" : "KaTeX"} · ${result.duration} ms` : preview === "error" ? "Conversion failed" : "No output to copy yet"}</span><div className="render-actions"><button type="button" onClick={() => setPanel("markup")} disabled={!valid}><CodeXml size={15}/> View code</button>{!live && <Button type="button" size="sm" onClick={() => {run();notify("Converted");}}><Play aria-hidden="true" data-icon="inline-start"/> Convert</Button>}<button type="button" onClick={() => void clipboard(result.mathml, "MathML")} disabled={!valid}><Copy size={15}/> Copy</button></div></div>
        </section>
      </div>

      <div className="palette-divider" role="separator" aria-label="Resize symbol palette" aria-orientation="horizontal" aria-valuemin={170} aria-valuemax={Math.max(170, viewportHeight - 290)} aria-valuenow={Math.min(paletteHeight, Math.max(170, viewportHeight - 290))} tabIndex={0} onPointerDown={onDividerPointerDown} onPointerMove={onDividerPointerMove} onPointerUp={onDividerPointerUp} onLostPointerCapture={() => { dragRef.current = null; }} onKeyDown={(event) => { if (event.key === "ArrowUp" || event.key === "ArrowDown") {event.preventDefault();resizePalette(paletteHeight + (event.key === "ArrowUp" ? 30 : -30));} if (event.key === "Home" || event.key === "End") {event.preventDefault();resizePalette(event.key === "Home" ? 170 : window.innerHeight - 290);} }}><span aria-hidden="true"/></div>
      <SymbolPalette onInsert={insertSymbol} onRegisterSearch={(element) => { searchRef.current = element; }}/>

      <Dialog open={panel !== null} onOpenChange={(open) => {if (!open) setPanel(null);}}>
        <DialogContent className={`studio-dialog ${panel === "markup" ? "markup-dialog" : ""} ${panel === "library" ? "library-dialog" : ""}`}>
          {panel === "markup" && <><DialogHeader><DialogTitle>MathML code</DialogTitle><DialogDescription>Validated XML from the current equation. Copy it or save it as a file.</DialogDescription></DialogHeader><pre className="markup-code"><code>{valid ? result.mathml : "The equation needs a successful conversion first."}</code></pre><div className="dialog-actions"><Button type="button" variant="outline" onClick={() => void save("mml")} disabled={!valid}><ArrowDownToLine data-icon="inline-start"/> Save .mml</Button><Button type="button" onClick={() => void clipboard(result.mathml, "MathML")} disabled={!valid}><Copy data-icon="inline-start"/> Copy MathML</Button></div></>}
          {panel === "library" && <EquationLibrary equations={equations} busy={libraryBusy} available={libraryAvailable} canSave={ready && libraryAvailable && Boolean(latex.trim())} onSave={addEquation} onRename={renameEquation} onOpen={(item) => {clearSnippet();changeLatex(item.latex);setOptions(item.options);setPanel(null);notify(`Opened ${item.title}`);}} onDelete={async (id) => {if (await storeEquations(equations.filter((item) => item.id !== id))) notify("Equation deleted");}} onExport={() => void exportLibrary()} onImport={() => void importLibrary()}/>}
          {panel === "settings" && <><DialogHeader><DialogTitle>Preferences</DialogTitle><DialogDescription>Choose how LaTeX is converted and exported.</DialogDescription></DialogHeader><div className="prefs-body"><fieldset className="engine-set"><legend>Conversion engine</legend><div className="engine-grid"><button type="button" className={options.engine === "temml" ? "chosen" : ""} onClick={() => updateOption("engine","temml")} aria-pressed={options.engine === "temml"}><span className="radio-ring"/><span><strong>TeMMl</strong><small>Direct MathML · recommended</small></span></button><button type="button" className={options.engine === "katex" ? "chosen" : ""} onClick={() => updateOption("engine","katex")} aria-pressed={options.engine === "katex"}><span className="radio-ring"/><span><strong>KaTeX</strong><small>Alternate TeX coverage</small></span></button></div></fieldset><fieldset className="accent-set"><legend>Accent color</legend><div className="accent-choices">{ACCENTS.map((color) => <button type="button" key={color} className={`accent-choice ${color}`} aria-label={`${color} accent`} aria-pressed={accent === color} onClick={() => setAccent(color)}><span className="accent-swatch"/>{color}</button>)}</div></fieldset><div className="pref-list"><div className="pref-item"><label htmlFor="display-mode"><strong>Display mode</strong><span>Typeset as a block equation</span></label><Switch id="display-mode" checked={options.display} onCheckedChange={(value) => updateOption("display",value)}/></div><div className="pref-item"><label htmlFor="annotation-mode"><strong>Source annotation</strong><span>Include original TeX in MathML</span></label><Switch id="annotation-mode" checked={options.annotate} onCheckedChange={(value) => updateOption("annotate",value)}/></div><div className="pref-item"><label htmlFor="pretty-mode"><strong>Readable XML</strong><span>Indent the exported MathML</span></label><Switch id="pretty-mode" checked={options.pretty} onCheckedChange={(value) => updateOption("pretty",value)}/></div><div className="pref-item"><label htmlFor="live-mode"><strong>Live conversion</strong><span>Convert automatically as you type</span></label><Switch id="live-mode" checked={live} onCheckedChange={setLive}/></div></div></div></>}
          {panel === "shortcuts" && <><DialogHeader><DialogTitle>Keyboard shortcuts</DialogTitle><DialogDescription>Keep your hands on the keyboard while editing.</DialogDescription></DialogHeader><div className="shortcut-list"><span>Convert now</span><kbd>Ctrl / ⌘ + Enter</kbd><span>Save MathML</span><kbd>Ctrl / ⌘ + S</kbd><span>Open LaTeX file</span><kbd>Ctrl / ⌘ + O</kbd><span>Search symbols</span><kbd>Ctrl / ⌘ + K</kbd><span>Indent in editor</span><kbd>Tab</kbd></div></>}
          {panel === "about" && <AboutPanel desktop={desktop} onNotices={() => setPanel("notices")}/>}
          {panel === "notices" && <NoticesPanel onBack={() => setPanel("about")}/>}
        </DialogContent>
      </Dialog>
      <div className={`toast-message ${message ? "visible" : ""}`} role="status"><Check size={16}/>{message}</div>
    </main>
  </TooltipProvider>;
}
