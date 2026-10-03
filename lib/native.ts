import type * as Neutralino from "@neutralinojs/lib";
let initialized = false;
export function isDesktop(): boolean {
  return typeof window !== "undefined" && typeof (window as Window & { NL_VERSION?: string }).NL_VERSION === "string";
}
export async function native(): Promise<typeof Neutralino | null> {
  if (!isDesktop()) return null;
  const api = await import("@neutralinojs/lib");
  if (!initialized) { api.init(); initialized = true; }
  return api;
}
const storageKeys: Record<string, string> = {
  "mathml-studio:v2": "mathml_studio_draft_v2",
  "mathml-studio:library:v1": "mathml_studio_library_v1",
  "mathml-studio:palette-height": "mathml_studio_palette_height",
  "mathml-studio:input-share": "mathml_studio_input_share",
};
export async function readAppStore(key: string): Promise<string | null> {
  const api = await native();
  if (!api) return localStorage.getItem(key);
  try { return await api.storage.getData(storageKeys[key]); }
  catch (error) {
    if (String(error).includes("NE_ST_NOSTKEX") ||
        (error && typeof error === "object" && "code" in error && error.code === "NE_ST_NOSTKEX")) {
      return localStorage.getItem(key); // Import a same-origin draft from older builds when available.
    }
    throw error;
  }
}
export async function writeAppStore(key: string, value: string): Promise<void> {
  const api = await native();
  if (api) await api.storage.setData(storageKeys[key], value);
  else localStorage.setItem(key, value);
}

export async function saveText(content: string, extension: "mml" | "html" | "tex" | "json", name: string): Promise<boolean> {
  const api = await native();
  if (api) {
    const path = await api.os.showSaveDialog("Save file", { defaultPath: name, filters: [{ name: extension.toUpperCase() + " file", extensions: [extension] }] });
    if (!path) return false;
    await api.filesystem.writeFile(path, content);
  } else {
    const blob = new Blob([content], { type: extension === "html" ? "text/html;charset=utf-8" : extension === "json" ? "application/json;charset=utf-8" : "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = name; document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }
  return true;
}
export async function openTex(): Promise<string | null> {
  const api = await native();
  if (api) {
    const paths = await api.os.showOpenDialog("Open LaTeX file", { filters: [{ name: "TeX and text files", extensions: ["tex", "txt"] }] });
    return paths.length ? await api.filesystem.readFile(paths[0]) : null;
  }
  return new Promise((resolve) => {
    const input = document.createElement("input"); input.type = "file"; input.accept = ".tex,.txt,text/plain";
    input.onchange = async () => resolve(input.files?.[0] ? await input.files[0].text() : null);
    input.addEventListener("cancel", () => resolve(null), { once: true });
    input.click();

  });
}
export async function openLibraryBackup(): Promise<string | null> {
  const api = await native();
  if (api) {
    const paths = await api.os.showOpenDialog("Import equation-library backup", { filters: [{ name: "JSON backup", extensions: ["json"] }] });
    return paths.length ? await api.filesystem.readFile(paths[0]) : null;
  }
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.onchange = async () => {
      try { resolve(input.files?.[0] ? await input.files[0].text() : null); }
      catch (error) { reject(error); }
    };
    input.addEventListener("cancel", () => resolve(null), { once: true });
    input.click();
  });
}

export async function openExternal(url: string): Promise<void> {
  if (!url.startsWith("https://")) throw new Error("Only HTTPS links can be opened.");
  const api = await native();
  if (api) await api.os.open(url);
  else window.open(url, "_blank", "noopener,noreferrer");
}

export async function copyText(content: string): Promise<void> {
  const api = await native();
  if (api) await api.clipboard.writeText(content);
  else await navigator.clipboard.writeText(content);
}
