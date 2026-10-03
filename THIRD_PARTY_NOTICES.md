# Third-party components and fonts

This application includes open-source software and fonts. Full license texts are in `licenses/`, included with the desktop downloads and source package. The app also has an **About → Third-party notices** view linking to upstream websites and repositories.

| Component | License | Upstream |
| --- | --- | --- |
| Next.js | MIT | https://github.com/vercel/next.js |
| React and React DOM | MIT | https://github.com/facebook/react |
| Tailwind CSS | MIT | https://github.com/tailwindlabs/tailwindcss |
| TeMMl (including local Temml font and CSS) | MIT | https://github.com/ronkok/Temml |
| KaTeX | MIT | https://github.com/KaTeX/KaTeX |
| Neutralinojs framework and @neutralinojs/lib | MIT | https://github.com/neutralinojs/neutralinojs |
| shadcn/ui | MIT | https://ui.shadcn.com/ |
| Radix UI | MIT | https://www.radix-ui.com/ |
| Base UI | MIT | https://base-ui.com/ |
| coss UI | MIT | https://coss.com/ui |
| lucide-react | ISC | https://lucide.dev/ |
| Montserrat | SIL Open Font License 1.1 | https://github.com/JulietaUla/Montserrat |
| JetBrains Mono | SIL Open Font License 1.1 | https://github.com/JetBrains/JetBrainsMono |
| Google Sans | SIL Open Font License 1.1 | https://github.com/googlefonts/googlesans |

**Font sources and copyright.** `Montserrat-Regular.woff2` and `JetBrainsMono-Regular.woff2` come from the pinned [PM-Web_V2 font directory](https://github.com/prasad-kmd/PM-Web_V2/tree/c1c5fe62e7c37bc435507683e8996375d4bd623a/public/fonts); their license texts are `licenses/Montserrat-OFL.txt` (Copyright 2024 The Montserrat.Git Project Authors) and `licenses/JetBrainsMono-OFL.txt` (Copyright 2020 The JetBrains Mono Project Authors). `GoogleSans-Variable.woff2` was converted from the officially published [Google Sans variable font](https://github.com/google/fonts/tree/main/ofl/googlesans), version 14.000, Copyright 2025 The Google Sans Project Authors; its [OFL](https://github.com/google/fonts/blob/main/ofl/googlesans/OFL.txt) is `licenses/GoogleSans-OFL.txt`. The older Google Sans file in PM-Web_V2 was not used because its licensing provenance could not be confirmed. No Anthropic Serif is included; the requested substitute is Montserrat.

The official Neutralino framework binary is embedded in each desktop executable. Font files are self-hosted and are not fetched when the app runs. Source packages include lockfile versions and upstream package distributions provide their respective licenses.

Copyright © 2026 Prasad M. All rights reserved. The app copyright does not replace these third-party licenses.
