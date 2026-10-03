# LaTeX to MathML Converter

**An offline-first workspace for writing math-mode LaTeX and producing native MathML.** Edit source and inspect the rendered equation side by side, insert mathematical components without memorizing commands, then copy or export the result. Available as a local web app and as portable Linux and Windows desktop downloads.

**Current version:** 2.3.0 · **Project license:** [MIT](LICENSE) · **Author:** Prasad Madhuranga ([prasad-kmd](https://github.com/prasad-kmd))

[Download the latest release](https://github.com/prasad-kmd/latex2mathml_next/releases/latest) · [Build from source](#build-from-source) · [Third-party notices](THIRD_PARTY_NOTICES.md)

> **Scope:** This is a mathematical-expression editor, not a full LaTeX compiler. It uses [TeMMl](https://github.com/ronkok/Temml) and [KaTeX](https://github.com/KaTeX/KaTeX), **not MathJax**. Conversion runs locally; no account or conversion service is required.

## Contents

- [Features](#features)
- [Download and run](#download-and-run)
- [Using the editor](#using-the-editor)
  - [Insert symbols and complete templates](#insert-symbols-and-complete-templates)
  - [Conversion and outputs](#conversion-and-outputs)
  - [Saved equations and backups](#saved-equations-and-backups)
  - [Resize the workspace](#resize-the-workspace)
- [Keyboard controls](#keyboard-controls)
- [Data, privacy and backup compatibility](#data-privacy-and-backup-compatibility)
- [Build from source](#build-from-source)
- [Test and package](#test-and-package)
- [Project structure](#project-structure)
- [Troubleshooting and limitations](#troubleshooting-and-limitations)
- [License and credits](#license-and-credits)

## Features

| Area | What you can do |
| --- | --- |
| **Source and preview** | Write math-mode LaTeX in the input pane and inspect native MathML next to it. On a narrow window, the input stacks above the preview. |
| **301 insertion tools** | Browse 15 categories or search by name, command or keyword. Insert at the caret or replace a selection; templates can wrap selected source. |
| **Editable templates** | Start typing in the first field, move through remaining fields with Tab/Shift+Tab, and undo or redo insertion and edits. Fraction, root, matrix, cases and other multi-field structures are included. |
| **Two conversion engines** | Use TeMMl for direct MathML by default, or switch to KaTeX for alternate supported TeX coverage. Invalid expressions display diagnostics instead of silently yielding bad markup. |
| **Copy and export** | Copy LaTeX or validated MathML; open `.tex`/`.txt`; export MathML (`.mml`), standalone HTML (`.html`) or LaTeX (`.tex`). Inspect markup in a dialog rather than a permanent third pane. |
| **Local equation library** | Name and save up to 50 equations with their conversion options. Search titles or LaTeX, rename, reopen, delete, and import/export portable JSON backups. |
| **Adjustable layout** | Resize the input/preview split and the symbol palette with a pointer or keyboard. Pane proportions, palette height, draft and preferences persist locally. |
| **Preferences** | Change display/inline mode, source annotation, readable XML, live/manual conversion, light/dark appearance and forest/ocean/plum/coral accents. |

The desktop app packages the statically exported Next.js interface in [Neutralinojs](https://neutralino.js.org/). The browser build uses the same editor and converters without a desktop installation. Fonts are self-hosted: Google Sans for UI, Montserrat for headings and JetBrains Mono for source/code.

## Download and run

Get the platform ZIP from the [v2.3.0 release](https://github.com/prasad-kmd/latex2mathml_next/releases/tag/v2.3.0):

| Platform | Download | Run after extracting |
| --- | --- | --- |
| Linux x64 | [LaTeX-to-MathML-2.3.0-Linux-x64.zip](https://github.com/prasad-kmd/latex2mathml_next/releases/download/v2.3.0/LaTeX-to-MathML-2.3.0-Linux-x64.zip) | `./latex-mathml-linux_x64` |
| Windows x64 | [LaTeX-to-MathML-2.3.0-Windows-x64.zip](https://github.com/prasad-kmd/latex2mathml_next/releases/download/v2.3.0/LaTeX-to-MathML-2.3.0-Windows-x64.zip) | `latex-mathml-win_x64.exe` |
| Source | [LaTeX-to-MathML-2.3.0-source.zip](https://github.com/prasad-kmd/latex2mathml_next/releases/download/v2.3.0/LaTeX-to-MathML-2.3.0-source.zip) | Follow [Build from source](#build-from-source) |

**Linux:** The app needs GTK 3 and WebKit2GTK **4.1** installed by the operating system. Package names vary by distribution; on compatible Debian/Ubuntu versions, look for `libwebkit2gtk-4.1-0` and `libgtk-3-0t64` or `libgtk-3-0`. If extraction removed executable permissions, run `chmod +x latex-mathml-linux_x64` first.

**Windows:** The app needs Microsoft Edge WebView2 Runtime. The release executable is **not Authenticode-signed**, so Windows may show a publisher or SmartScreen warning. Signing/metadata and runtime compatibility are different things: test the download in your target Windows environment.

**macOS:** No macOS download is supplied with this release.

The desktop archives contain an executable plus optional license and notice files. App resources are **embedded in the executable**: you do not need a separate `resources.neu`, Node.js, or an internet connection to use an extracted desktop download. You *do* need Node.js and a first-time framework download when building it yourself. SHA-256 values for release assets are in the [release notes](https://github.com/prasad-kmd/latex2mathml_next/releases/tag/v2.3.0); verify an archive before running it if you obtained it through another channel.

## Using the editor

1. Start with the sample quadratic formula, replace it with your own **math-mode** expression, or open a `.tex`/`.txt` file.
2. Watch the rendered MathML update beside the source. If live conversion is off, choose **Convert** or press `Ctrl/Cmd+Enter`.
3. Open **Preferences** to change the conversion engine or output options if needed.
4. Use **Copy MathML** or **Export equation** to take the result elsewhere. Use **View MathML code** when you need to inspect the XML.

For example, enter `\\frac{a+b}{c}` in the LaTeX input to render a fraction. Enter a mathematical expression rather than a complete `.tex` document with a preamble or `\\begin{document}`.

### Insert symbols and complete templates

The **Insert symbols** palette contains 301 tools in categories such as Essentials, Structures, Greek, Calculus, Matrices, Brackets and Accents. Search the palette with `Ctrl/Cmd+K` or select a category and click a tile.

- A symbol is inserted at the caret; selected source is replaced or wrapped when the chosen template has a field for it. For example, selecting `x+1` before choosing **Fraction** places it in the numerator.
- After inserting a multi-field template, type in the first blank. Press **Tab** to select the next editable field; **Shift+Tab** moves back. After the last field, Tab exits the template. **Escape** ends template navigation.
- Default field labels such as `b` or `n` are selected when reached, so typing replaces them. Template-navigation markers are never included in the source, stored equations or exported MathML.
- Outside an active template, Tab inserts two spaces in the source editor. Undo/Redo also works on insertion and subsequent edits when the editor has focus.

Some components, such as matrices and cases, require filling in multiple cells or conditions before the expression has the meaning you intend. The palette helps construct source; it does not change which TeX commands the chosen converter supports.

### Conversion and outputs

**TeMMl** is the default engine and produces MathML directly. **KaTeX**, selected in Preferences, provides an alternative set of supported commands and is configured to output MathML. The app parses and validates the generated MathML before showing it or making it available for copying/exporting. If the source or conversion settings change, the old result is not offered as though it were current.

| Output or action | Where to find it | Notes |
| --- | --- | --- |
| Copy LaTeX | Input-pane copy control | Copies the source text, not MathML. |
| Copy MathML | Main **Copy MathML** button or output pane | Available for the current, successfully converted equation. |
| Inspect MathML | **View MathML code** | Opens a dialog; there is no permanently visible XML pane. |
| Export `.mml` | **Export equation → MathML file** | Saves validated MathML. |
| Export `.html` | **Export equation → HTML document** | Saves a standalone page containing the MathML and local CSS; no remote asset fetch is required. |
| Export `.tex` | **Export equation → LaTeX source** | Saves the current source. |
| Open source | **Open** or `Ctrl/Cmd+O` | Accepts `.tex` and `.txt` files. |

In **Preferences**, display mode chooses block versus inline layout, source annotation includes the original TeX in MathML, and readable XML formats the exported markup. Disabling live conversion means you explicitly run conversion after edits. Desktop file actions use system dialogs; browser actions use the browser's picker/download mechanisms. Browser clipboard access may require a secure context or permission.

### Saved equations and backups

Open **Saved equations** from the icon in the toolbar. Give the current expression a name to save its source and conversion options; the library allows **50 entries**, with names up to **80 characters**. Search case-insensitively by title or LaTeX text. Rename an entry inline without changing its ID or equation, or open it to replace the current editor draft. Delete is a two-step action to reduce accidental removal.

Use **Export backup** before switching devices, clearing browser data or removing application storage. It saves `latex-mathml-equations.json`; **Import backup** reads a version-1 JSON backup, validates it and merges entries by ID. Existing IDs are skipped, **not overwritten**. If the additions would exceed the 50-entry limit, remove entries before importing. Renaming in v2.3.0 does not break older version-1 backups.

> A library backup includes **saved equations and their conversion options**, not your unsaved draft, theme, accent or divider settings. Save/export those separately when moving to another device. Opening a saved equation replaces the editor draft.

### Resize the workspace

At ordinary desktop sizes, the input and rendered output remain visible side by side without whole-page scrolling. Drag the **vertical divider** between them to change their relative widths. Focus the divider and use **Left/Right** to adjust it, **Home/End** to move to its limits, or **double-click** to restore an even split. Pane widths are constrained so the workspace remains usable; the chosen ratio persists.

Drag the **horizontal divider** above the symbol palette to give its scrollable tray more or less room. When focused, **Up/Down** and **Home/End** resize that tray; its height persists too. At widths of **760 px or less**, the input stacks directly above the preview, the input/preview divider is hidden, and you can scroll down to the full palette. The desktop window's configured minimum size is **380 × 620 px**.

## Keyboard controls

| Shortcut / control | Effect |
| --- | --- |
| `Ctrl/Cmd+Enter` | Convert the current expression now. |
| `Ctrl/Cmd+S` | Save the current MathML as `.mml` when the result is valid. |
| `Ctrl/Cmd+O` | Open a `.tex` or `.txt` file. |
| `Ctrl/Cmd+K` | Focus and select the symbol search field. |
| `Tab` / `Shift+Tab` in an active template | Next / previous editable field; Tab after the last field exits. |
| `Escape` in an active template | Leave template navigation. |
| `Tab` in the source editor outside a template | Insert two spaces. |
| `Ctrl/Cmd+Z`, `Ctrl/Cmd+Shift+Z` (or `Ctrl/Cmd+Y`) in the source editor | Undo / redo source edits. |
| Focused input/preview divider: `←` / `→`, `Home` / `End` | Adjust source/preview width; jump to minimum/maximum. Double-click resets it. |
| Focused palette divider: `↑` / `↓`, `Home` / `End` | Adjust palette height; jump to minimum/maximum. |

Toolbar buttons and dialogs have accessible names; the dividers are keyboard-focusable separators. The result is rendered as an actual MathML element, though display quality and assistive-technology behavior depend on the browser or operating-system WebView.

## Data, privacy and backup compatibility

Conversion is performed in the running browser/WebView; the app does not send equations to a conversion API. The static browser build uses **localStorage**. The desktop build uses **Neutralino system storage** in the user's application data area, with a same-origin localStorage fallback when a native key is absent. Draft, conversion settings, appearance, palette height, pane ratio and the saved-equation library are local to the device/browser profile; there is no cloud synchronization.

The saved-equation storage key is `mathml-studio:library:v1`. Exported backups use `format: "latex-mathml-library"` and `version: 1`; they contain an export timestamp and an array of entries with ID, title, LaTeX, update time and conversion options. The v2.3.0 rename feature preserves that schema. The importer rejects invalid/unsupported backups, duplicates within a backup, more than 50 entries, or backup text larger than **6 MB**. Avoid manually editing a backup unless you preserve the schema.

Back up the library before uninstalling, resetting application data or clearing browser storage. Local persistence is convenient, **not a substitute for a separate backup**. Clicking external links in About/Notices opens upstream websites; that is separate from the offline equation-conversion workflow.

## Build from source

**Prerequisites:** Node.js **20.9+**, npm, and Git. Python 3 is needed for the optional release-packaging script. For desktop builds, install the operating system's WebView requirements listed in [Download and run](#download-and-run). `neu update` needs network access the first time to fetch the pinned official Neutralino framework binaries.

```sh
git clone https://github.com/prasad-kmd/latex2mathml_next.git
cd latex2mathml_next
npm ci
npm run dev
```

Open the URL printed by Next.js (typically `http://localhost:3000`). To build a production **static** web version instead:

```sh
npm run lint
npm run build
python3 -m http.server 3000 --bind 127.0.0.1 --directory out
```

Then visit `http://127.0.0.1:3000/`. The exported site is meant to be served over HTTP at the site root; opening `out/index.html` directly with `file://` will not resolve its root-relative assets. `next.config.ts` configures static export and unoptimized images, so the web build does not require a running Next.js server after compilation.

To build **desktop** distributions:

```sh
npx neu update
npm run build:desktop
```

`build:desktop` builds the static site, copies it into `resources/`, injects Neutralino's globals script into its HTML entry, and builds executables with `--embed-resources --release`. The `npm run desktop:dev` script rebuilds the static site, prepares its resources and starts Neutralino for local desktop development. The `dist/` directory contains the generated desktop output. The platform-specific ZIPs made by the packaging script use an embedded executable; no external `resources.neu` is needed to launch those downloads.

## Test and package

For a browser regression run, build the static site first, install Playwright's Chromium browser if necessary, and serve `out/` in one terminal:

```sh
npm ci
npx playwright install chromium
mkdir -p .cache
npm run build
python3 -m http.server 3000 --bind 127.0.0.1 --directory out
```

In another terminal, from the repository root:

```sh
npm run lint
npm run test:smoke
```

The smoke script exercises conversion, downloads/dialogs, symbol insertion and template navigation, Undo/Redo, library backup/import/search/rename, persisted layout adjustments, and desktop/narrow browser layouts. It defaults to `http://127.0.0.1:3000/`; set `SMOKE_URL` to test a different served URL. Screenshots and downloaded test fixtures go into `.cache/`. This repository does not currently ignore that directory, so remove it or add it to your local `.git/info/exclude` before committing if you run the smoke test.

To reproduce the versioned release ZIPs **after** a desktop build:

```sh
npm run package:release
```

`scripts/package_release.py` packages Linux x64, Windows x64 and source ZIPs, adds notices and licenses to the platform archives, and writes `SHA256SUMS.txt`. It writes those files to the **parent directory of the repository**, not into `dist/`. It expects built embedded executables in `dist/latex-mathml/`. A Linux cross-build producing a Windows executable does **not** sign it or prove it works on Windows; verify on the target platform before distributing new builds. If you later sign or alter an executable, regenerate the corresponding archive and checksum.

## Project structure

| Path | Purpose |
| --- | --- |
| `app/page.tsx` | Editor state, conversion workflow, keyboard controls, template history, library actions and resizing. |
| `app/globals.css`, `app/temml.css` | Responsive visual system and local math-font styling. |
| `components/symbol-palette.tsx`, `lib/symbols.ts`, `lib/snippet.ts` | Searchable 301-tool palette and insertion/template field logic. |
| `components/equation-library.tsx`, `lib/library.ts` | Search, rename, saved entries and versioned backup validation. |
| `components/about-panels.tsx`, `components/ui/` | About/notices and reusable interface primitives. |
| `lib/converter.ts` | TeMMl/KaTeX conversion, XML validation, formatting and standalone HTML output. |
| `lib/native.ts` | Browser/Neutralino storage, dialogs, file I/O, clipboard and external links. |
| `public/fonts/`, `licenses/`, `THIRD_PARTY_NOTICES.md` | Self-hosted fonts and dependency/font attributions. |
| `neutralino.config.json`, `scripts/prepare-resources.mjs` | Desktop metadata, native permissions and embedded resource preparation. |
| `scripts/smoke.mjs`, `scripts/package_release.py` | Browser regression tests and repeatable ZIP packaging. |

The native API allowlist in `neutralino.config.json` limits integration to storage, file dialogs/read/write, clipboard write and opening external links. The project is intentionally a single focused editor rather than a general-purpose LaTeX IDE.

## Troubleshooting and limitations

- **An expression does not convert:** Check math-mode syntax and the displayed diagnostic. Try the other engine in Preferences; TeMMl and KaTeX support overlapping but not identical command sets. Arbitrary LaTeX packages, document preambles and some environments are outside scope.
- **Preview looks different across devices:** Native MathML appearance depends on the browser/WebView and available math-font support. Exports contain semantic MathML, not a screenshot of the preview.
- **Copy is unavailable or output appears stale:** Correct conversion errors or run conversion after editing in manual mode. Browsers can also require clipboard permission or a secure context.
- **Desktop app will not start on Linux:** Check that the executable bit is set and the system has GTK 3 and WebKit2GTK 4.1. Do not expect the binary to carry those system libraries.
- **Windows displays an unknown-publisher warning:** Release binaries are unsigned; an archive checksum verifies download integrity but is **not** a code signature or a SmartScreen bypass.
- **Saved work has disappeared:** Browser profiles and desktop application storage are separate. Reopen the same profile/app installation or import a previously exported library JSON. The backup does not include an unsaved draft or appearance settings.
- **Build output does not open via `file://`:** Serve `out/` over HTTP at the root path. Desktop builds instead embed a prepared copy in the executable.

## License and credits

This repository's application code is licensed under the [MIT License](LICENSE), copyright © 2026 Prasad Madhuranga. Its dependencies and fonts retain **their own licenses**; see [Third-party notices](THIRD_PARTY_NOTICES.md) and the texts in [`licenses/`](licenses/). Montserrat and JetBrains Mono are sourced from the pinned [PM-Web_V2 font directory](https://github.com/prasad-kmd/PM-Web_V2/tree/c1c5fe62e7c37bc435507683e8996375d4bd623a/public/fonts); Google Sans is included with documented provenance in the notices. 

For background on the move from the earlier reference interface to this workspace, see [Project review and redesign notes](PROJECT_REVIEW.md). Issues and focused pull requests are welcome: please describe the reproduction steps, affected platform/browser, and, for converter issues, a minimal LaTeX expression. Run `npm run lint` and `npm run test:smoke` before submitting changes.

> AI Tools were used to create/generate some content.