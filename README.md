# LaTeX to MathML Converter · Studio 2.2.0

A compact, offline-first equation-authoring app for Linux and Windows. Type math-mode LaTeX, insert symbols at the cursor, preview native MathML and copy or export validated markup. Built with Next.js (static export), TeMMl and KaTeX (no MathJax), Tailwind, shadcn/Radix/coss UI, and Neutralinojs. The original app's favicon is retained; the application itself is new.

App ID: `lk.prasadkmd.latex2mathml` · Name: LaTeX to MathML Converter · Author: Prasad M · Copyright © 2026 Prasad M. All rights reserved.

## Download and run

Get the **2.2.0** Linux x64, Windows x64 or source ZIP from GitHub Releases.

- **Linux x64:** Extract and run `./latex-mathml-linux_x64`. Requires GTK 3 and WebKit2GTK **4.1** (`libgtk-3-0t64`/`libgtk-3-0` and `libwebkit2gtk-4.1-0` on compatible Debian/Ubuntu releases).
- **Windows x64:** Extract and run `latex-mathml-win_x64.exe`. Requires Microsoft Edge WebView2 Runtime (often preinstalled on Windows 10/11). The executable is unsigned and SmartScreen may warn. Windows binaries are cross-packaged on Linux and **have not been run-tested on Windows**.

Application resources are embedded in each executable. The ZIPs include optional notices/licenses but **no separate `resources.neu`** is required. No internet or Node.js installation is needed to run the app. The standard Neutralino CLI all-platform release ZIP may still list an unnecessary `resources.neu`; the platform-specific downloads deliberately omit it. macOS downloads are not provided because a bundle and macOS runtime test were not feasible here.

## Workspace

- **Desktop:** Source and rendered MathML stay side by side without page scrolling. Drag the horizontal handle above **Insert symbols** to enlarge or shrink the palette; its height persists. Arrow Up/Down (or Home/End) on the focused handle also resizes it.
- **Narrow window:** Resize the desktop window to around 380 px wide to make room for another app. Source appears above the immediately visible preview. Scroll down to reach the full symbol palette. Window minimum width is 380 px; the narrow browser layout also works down to 320 px.
- **Tools:** 301 categorized, searchable insertions, with caret/selection-aware templates. `Ctrl/Cmd+K` searches the palette. TeMMl is the default converter; KaTeX provides alternate TeX coverage. Syntax errors show real diagnostics, and stale results cannot be copied/exported.
- **Outputs:** Copy LaTeX or MathML; open `.tex`/`.txt`; export `.mml`, standalone `.html`, or `.tex`. MathML code and preferences live in dialogs. Options include block/inline, TeX annotation, readable XML, live/manual conversion, light/dark theme, and four accent colors (forest, ocean, plum, coral).
- **Saved equations:** Use the library icon to name and save up to **50** source equations together with their conversion options. Open or delete them later. **Export backup** saves a portable JSON file; **Import backup** merges by ID (skipping duplicates), validates the file, and never overwrites existing items. On desktop, saved equations and settings use Neutralino system storage under your user profile; in a browser they use localStorage. Neither is a cloud account. Clearing browser data or deleting app storage can erase it, so export backups regularly. Backup import/export uses native file dialogs on desktop and file download/picker in a browser.
- **About and notices:** About includes website, GitHub and LinkedIn; a third-party notices view links upstream projects. Fonts: self-hosted **Google Sans** (UI), **Montserrat** (headings) and **JetBrains Mono** (LaTeX/code). See [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) for licenses and font provenance.

Shortcuts: `Ctrl/Cmd+Enter` convert; `Ctrl/Cmd+S` save MathML to a file; `Ctrl/Cmd+O` open LaTeX; `Ctrl/Cmd+K` search symbols; Tab indents in the editor. The current draft, preferences, accent and palette height also persist locally in the same respective storage.

## Build and test from source

Node.js 20.9+ and npm are required to build, not to use the downloads. `npx neu update` fetches pinned official framework binaries the first time; afterward the app runs offline.

```sh
npm ci
npx neu update
npm run lint
npm run build                     # exports to out/
node scripts/prepare-resources.mjs
npx neu build --embed-resources --release
npm run package:release           # produces platform ZIPs, source ZIP and SHA256SUMS.txt in /home/user/
```

`npm run build:desktop` combines the build, resource preparation and Neutralino packaging after `neu update`. For browser testing, serve `out/` over HTTP, e.g. `python3 -m http.server 3000 --bind 0.0.0.0 --directory out`, then run `npm run test:smoke` in another terminal. If needed, first run `npx playwright install chromium`. Do not load `out/index.html` from `file://`: Next asset URLs are root-relative.

### Source map

- `app/page.tsx`, `app/globals.css`: editor, layout, palette resize, preferences, persistence, accents.
- `components/symbol-palette.tsx`, `lib/symbols.ts`: 301 categorized insertions.
- `components/equation-library.tsx`, `lib/library.ts`: local collection and versioned JSON backup validation.
- `components/about-panels.tsx`: creator links and interactive third-party notices.
- `lib/converter.ts`, `lib/native.ts`: TeMMl/KaTeX conversion, MathML validation, HTML export and native/browser file/clipboard bridge.
- `neutralino.config.json`: desktop metadata, narrow minimum window and restricted native API permissions.
- `scripts/smoke.mjs`, `scripts/prepare-resources.mjs`, `scripts/package_release.py`: regression tests, resource embedding and repeatable packaging.

## Limitations

These are math-mode TeX converters, not full LaTeX compilers: arbitrary packages, preambles and some macros/environments may not work. MathML rendering depends on browser/WebView support and available math fonts. A standalone exported HTML document does not fetch remote resources. Local storage is capacity-limited and device-specific, so keep backup JSON files. The binaries are unsigned, and Windows was not run-tested in this Linux workspace.

See [`PROJECT_REVIEW.md`](PROJECT_REVIEW.md) for the reference-app assessment and redesign history.

> AI Tools were used to create/generate some content.