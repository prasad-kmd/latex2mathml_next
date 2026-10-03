# Reference application review and redesign notes

Reference: [`prasad-kmd/latex2mathml_next`](https://github.com/prasad-kmd/latex2mathml_next), commit `430b84a`, examined before building this separate replacement. Only its favicon assets were reused.

## Original app

The reference converted LaTeX with TeMMl `renderToString` synchronously on every edit. It displayed the result by injecting an HTML string into the preview, offered categorized example equations (appended rather than caret-inserted), source/MathML copy, a code modal, and theme switching. Failures became the literal `"error"`, without parser details. It had no desktop packaging, file import/export, conversion settings or persistent source.

## What changed in the new app

| Issue or request | Implementation in 2.2.0 |
| --- | --- |
| No offline desktop distribution | New statically exported Next.js app packaged with Neutralinojs; embedded resources verified to run from a standalone Linux x64 executable. Windows x64 cross-packaged with correct PE metadata, not run-tested. |
| Synchronous rendering and generic error | Debounced TeMMl/KaTeX conversion with diagnostic errors, XML/namespace validation, stale-output safeguards and manual option. |
| Source insertion at the wrong location | 301 searchable mathematical components in 15 categories; caret/selection-aware insertion and wrapping templates. |
| Large workspace chrome | No sidebar or traditional header; slim command toolbar, input and preview side by side on desktop without page scrolling; palette scrolls inside its own region. |
| Always-visible code/settings | MathML code and preferences are accessible from compact controls and open in dialogs. |
| Limited output and no file workflow | Copy/import/export through native desktop dialogs and browser fallbacks; `.mml`, `.html`, `.tex`; display mode, annotation and XML formatting. |
| No persistent draft | Local source and preferences survive restart; Neutralino system storage on desktop and browser localStorage on web, no cloud services. |
| Generic styling and iconography | Original favicon retained; self-hosted Inter, Mozilla Headline and JetBrains Mono from the specified pinned collection; icon-only secondary actions have accessible labels/tooltips. |

The first new build (2.0.0) was functional but too expansive; its sidebar, header, always-visible markup and equation library were superseded by the focused 2.1.0 workspace. The new UI is an equation authoring surface, not a copy of the reference's interface. Version 2.2.0 adds a pointer/keyboard-resizable symbol tray, a narrow desktop window with stacked source and immediately visible preview, creator and upstream links, four accent palettes, and a local equation library with versioned JSON backup import/export. The user selected Montserrat instead of Anthropic Serif; Google Sans and JetBrains Mono round out the typography.

## Boundaries and verification

These engines are math-mode TeX converters, not complete LaTeX compilers. MathML fidelity depends on browser/WebView support and installed math fonts. At 1280×800 and 840×620, automated browser tests confirmed that the two panes remain visible without page scrolling. A 380×620 narrow test keeps input above the visible preview. Palette resize, insertion/search, dialogs, accent persistence, equation saving and JSON backup/restore, file download, error handling and draft persistence were exercised. Linux x64 was launched separately without `resources.neu` under a virtual display; Windows x64 was not runtime-tested and neither binary is signed. The CLI-generated all-platform release archive still lists an unnecessary `resources.neu`; the downloadable platform archives omit it.
