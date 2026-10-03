"use client";

import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { isDesktop, openExternal } from "@/lib/native";

function followLink(event: React.MouseEvent<HTMLAnchorElement>, url: string) {
  if (isDesktop()) { event.preventDefault(); void openExternal(url).catch(() => { window.open(url, "_blank", "noopener,noreferrer"); }); }
}

const projectLinks = [
  { label: "Website", url: "https://prasadm.vercel.app/" },
  { label: "GitHub", url: "https://github.com/prasad-kmd" },
  { label: "LinkedIn", url: "https://www.linkedin.com/in/prasad-madhuranga/" },
];
const dependencies = [
  { name: "TeMMl", license: "MIT", url: "https://github.com/ronkok/Temml" },
  { name: "KaTeX", license: "MIT", url: "https://github.com/KaTeX/KaTeX" },
  { name: "Neutralinojs", license: "MIT", url: "https://github.com/neutralinojs/neutralinojs" },
  { name: "Next.js", license: "MIT", url: "https://github.com/vercel/next.js" },
  { name: "React", license: "MIT", url: "https://github.com/facebook/react" },
  { name: "Tailwind CSS", license: "MIT", url: "https://github.com/tailwindlabs/tailwindcss" },
  { name: "Radix UI", license: "MIT", url: "https://www.radix-ui.com/" },
  { name: "Base UI", license: "MIT", url: "https://base-ui.com/" },
  { name: "shadcn/ui", license: "MIT", url: "https://ui.shadcn.com/" },
  { name: "coss UI", license: "MIT", url: "https://coss.com/ui" },
  { name: "Lucide", license: "ISC", url: "https://lucide.dev/" },
  { name: "Montserrat", license: "OFL 1.1", url: "https://github.com/JulietaUla/Montserrat" },
  { name: "JetBrains Mono", license: "OFL 1.1", url: "https://github.com/JetBrains/JetBrainsMono" },
  { name: "Google Sans", license: "OFL 1.1", url: "https://github.com/googlefonts/googlesans" },
];

export function AboutPanel({ desktop, onNotices }: { desktop: boolean; onNotices: () => void }) {
  return <><DialogHeader><DialogTitle>About this app</DialogTitle><DialogDescription>LaTeX to MathML Converter · version 2.2.0</DialogDescription></DialogHeader>
    <div className="about-content"><p>A focused workspace for writing mathematical expressions. Type LaTeX or insert from 301 categorized symbols, see native MathML beside your source, then copy or export clean, validated markup. TeMMl and KaTeX run entirely on your device; no account or conversion server is required.</p>
      <p>Resize the symbol tray to suit your work. On a narrow desktop window, the editor stacks above the live preview so you can work alongside another app. Save named equations locally, and export a JSON backup to move your library between computers.</p>
      <p>Created by Prasad M. Copyright © 2026 Prasad M. All rights reserved.</p>
      <div className="about-links">{projectLinks.map(({label,url}) => <a key={label} href={url} target="_blank" rel="noopener noreferrer" onClick={(event) => followLink(event, url)}>{label}<ArrowUpRight size={14} aria-hidden="true"/></a>)}</div>
      <div className="about-facts"><span>Converters</span><strong>TeMMl and KaTeX</strong><span>Platform</span><strong>{desktop ? "Neutralino desktop" : "Local web app"}</strong><span>Storage</span><strong>Local to this device</strong></div>
      <button type="button" className="about-notices-link" onClick={onNotices}>Third-party notices <ArrowUpRight size={14} aria-hidden="true"/></button>
    </div>
  </>;
}

export function NoticesPanel({ onBack }: { onBack: () => void }) {
  return <><DialogHeader><DialogTitle>Third-party notices</DialogTitle><DialogDescription>Open-source tools and fonts used by this application. The full license texts are also included with the downloads.</DialogDescription></DialogHeader>
    <button type="button" className="notices-back" onClick={onBack}><ArrowLeft size={15} aria-hidden="true"/> Back to About</button>
    <div className="notice-list">{dependencies.map(({name, license, url}) => <a key={name} href={url} target="_blank" rel="noopener noreferrer" onClick={(event) => followLink(event, url)}><span>{name}</span><small>{license}</small><ArrowUpRight size={15} aria-hidden="true"/></a>)}</div>
    <p className="notices-footnote">Fonts are self-hosted. App copyright does not replace the licenses of these third-party components.</p>
  </>;
}
