"use client";

import { useState } from "react";
import { ArrowDownToLine, BookmarkPlus, FolderOpen, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MAX_EQUATIONS, type SavedEquation } from "@/lib/library";

type Props = {
  equations: SavedEquation[];
  canSave: boolean;
  busy: boolean;
  available: boolean;
  onSave: (title: string) => Promise<boolean>;
  onOpen: (item: SavedEquation) => void;
  onDelete: (id: string) => Promise<void>;
  onExport: () => void;
  onImport: () => void;
};

export function EquationLibrary({ equations, canSave, busy, available, onSave, onOpen, onDelete, onExport, onImport }: Props) {
  const [title, setTitle] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  return <>
    <DialogHeader><DialogTitle>Saved equations</DialogTitle><DialogDescription>Keep up to {MAX_EQUATIONS} equations on this device. Export a JSON backup to move or protect your library.</DialogDescription></DialogHeader>
    <form className="library-save" onSubmit={(event) => { event.preventDefault(); void onSave(title).then((saved) => { if (saved) setTitle(""); }); }}>
      <label htmlFor="equation-title">Save the current equation</label>
      <div className="library-save-row"><input id="equation-title" type="text" maxLength={80} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Give this equation a name" autoComplete="off"/><Button type="submit" disabled={busy || !canSave || !title.trim() || equations.length >= MAX_EQUATIONS}><BookmarkPlus data-icon="inline-start"/> Save</Button></div>
      {!available && <small>The stored library could not be read. Import a valid backup to restore it.</small>}
      {available && !canSave && <small>Enter a LaTeX expression to save it.</small>}
      {equations.length >= MAX_EQUATIONS && <small>Library full. Remove an equation before saving another.</small>}
    </form>
    <div className="library-list-heading"><strong>On this device</strong><span>{equations.length} / {MAX_EQUATIONS}</span></div>
    <div className="library-list" aria-label="Saved equations">
      {equations.length === 0 ? <div className="library-empty"><BookmarkPlus size={22} strokeWidth={1.5}/><strong>No saved equations yet</strong><span>Give the current equation a name and save it here.</span></div> : equations.map((item) => <div className="library-item" key={item.id}>
        <div className="library-item-main"><strong title={item.title}>{item.title}</strong><code title={item.latex}>{item.latex}</code><time dateTime={item.updatedAt}>{new Date(item.updatedAt).toLocaleDateString()}</time></div>
        <div className="library-item-actions"><button type="button" onClick={() => { onOpen(item); setConfirmDelete(null); }} aria-label={`Open ${item.title}`} title="Open equation (replaces current draft)"><FolderOpen size={16}/></button>{confirmDelete === item.id ? <button type="button" className="danger-action" onClick={() => { void onDelete(item.id); setConfirmDelete(null); }} aria-label={`Confirm delete ${item.title}`} title="Confirm delete">Delete?</button> : <button type="button" onClick={() => setConfirmDelete(item.id)} disabled={busy || !available} aria-label={`Delete ${item.title}`} title="Delete equation"><Trash2 size={16}/></button>}</div>
      </div>)}
    </div>
    <p className="library-note">Opening an equation replaces the editor draft. Export a backup before clearing app data or moving computers.</p>
    <div className="library-footer"><Button type="button" variant="outline" onClick={onImport} disabled={busy}><Upload data-icon="inline-start"/> Import backup</Button><Button type="button" variant="outline" onClick={onExport} disabled={busy || !equations.length}><ArrowDownToLine data-icon="inline-start"/> Export backup</Button></div>
  </>;
}
