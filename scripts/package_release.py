#!/usr/bin/env python3
"""Package the already-built embedded executables and source as 2.3.0 downloads."""
from pathlib import Path
import hashlib
import json
import zipfile

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT.parent
VERSION = json.loads((ROOT / "package.json").read_text())["version"]
CONFIG = json.loads((ROOT / "neutralino.config.json").read_text())
assert VERSION == CONFIG["version"], "package and desktop versions must agree"
assert VERSION != "2.0.0", "do not overwrite earlier downloads"

LICENSES = sorted((ROOT / "licenses").glob("*.txt"))
assert all((ROOT / "licenses" / name).is_file() for name in [
    "Montserrat-OFL.txt", "JetBrainsMono-OFL.txt", "GoogleSans-OFL.txt"
])


def write_member(archive, data: bytes, name: str, executable=False):
    info = zipfile.ZipInfo(name, (2026, 10, 3, 0, 0, 0))
    info.create_system = 3
    info.external_attr = ((0o100755 if executable else 0o100644) << 16)
    info.compress_type = zipfile.ZIP_DEFLATED
    archive.writestr(info, data, compresslevel=9)


quickstart = {
    "Linux-x64": """LaTeX to MathML Converter 2.3.0 — Linux x64

Run: ./latex-mathml-linux_x64
If necessary: chmod +x latex-mathml-linux_x64
Requires GTK 3 and WebKit2GTK 4.1. The app works offline.
Only the executable is needed to run; resources.neu is embedded in it.
Other files are optional notices and licenses. No Node.js installation required.
Copyright © 2026 Prasad M. All rights reserved.
""",
    "Windows-x64": """LaTeX to MathML Converter 2.3.0 — Windows x64

Run: latex-mathml-win_x64.exe
Requires Microsoft Edge WebView2 Runtime. The app works offline.
Only the executable is needed to run; resources.neu is embedded in it.
Other files are optional notices and licenses. No Node.js installation required.
Unsigned executable: Windows SmartScreen may warn. Built on Linux, not tested on Windows.
Copyright © 2026 Prasad M. All rights reserved.
""",
}

artifacts = []
for platform, executable in [
    ("Linux-x64", "latex-mathml-linux_x64"),
    ("Windows-x64", "latex-mathml-win_x64.exe"),
]:
    binary = ROOT / "dist" / "latex-mathml" / executable
    assert binary.is_file(), f"Missing embedded build: {binary}"
    output = DEST / f"LaTeX-to-MathML-{VERSION}-{platform}.zip"
    with zipfile.ZipFile(output, "w") as archive:
        write_member(archive, binary.read_bytes(), executable, platform.startswith("Linux"))
        write_member(archive, quickstart[platform].encode(), "README.txt")
        write_member(archive, (ROOT / "THIRD_PARTY_NOTICES.md").read_bytes(), "THIRD_PARTY_NOTICES.md")
        for license_file in LICENSES:
            write_member(archive, license_file.read_bytes(), "licenses/" + license_file.name)
    with zipfile.ZipFile(output) as archive:
        assert "resources.neu" not in archive.namelist()
        assert len([name for name in archive.namelist() if name.startswith("latex-mathml-")]) == 1
        assert archive.testzip() is None
    artifacts.append(output)

source_dirs = ["app", "components", "lib", "public", "scripts", "licenses"]
source_files = [".gitignore", "README.md", "PROJECT_REVIEW.md", "THIRD_PARTY_NOTICES.md",
    "components.json", "eslint.config.mjs", "neutralino.config.json", "next.config.ts",
    "package.json", "package-lock.json", "postcss.config.mjs", "tsconfig.json"]
source = sorted((path for folder in source_dirs for path in (ROOT / folder).rglob("*")
                 if path.is_file() and "__pycache__" not in path.parts), key=lambda path: str(path))
source += [ROOT / file for file in source_files]
assert all(path.is_file() for path in source)
assert any(path.name == "symbol-palette.tsx" for path in source)
output = DEST / f"LaTeX-to-MathML-{VERSION}-source.zip"
with zipfile.ZipFile(output, "w") as archive:
    for path in source:
        write_member(archive, path.read_bytes(), str(path.relative_to(ROOT)))
with zipfile.ZipFile(output) as archive:
    assert archive.testzip() is None
artifacts.append(output)

checksums = "".join(f"{hashlib.sha256(path.read_bytes()).hexdigest()}  {path.name}\n" for path in artifacts)
(DEST / "SHA256SUMS.txt").write_text(checksums)
print(checksums, end="")
