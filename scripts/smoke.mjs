import { chromium } from "playwright";
import assert from "node:assert/strict";

const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, acceptDownloads: true });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.goto(process.env.SMOKE_URL || "http://127.0.0.1:3000/", { waitUntil: "networkidle" });
await page.getByText("Ready", { exact: true }).waitFor();
assert.equal(await page.locator(".math-preview math").count(), 1);
assert.equal(await page.locator(".source-pane").isVisible(), true);
assert.equal(await page.locator(".render-pane").isVisible(), true);
assert.equal(await page.locator(".palette").isVisible(), true);
assert.equal(await page.locator("body").evaluate((el) => el.scrollHeight <= innerHeight), true);
await page.evaluate(() => document.fonts.ready);
assert.equal(await page.evaluate(() => document.fonts.check("13px PM Sans") && document.fonts.check("13px PM Mono") && document.fonts.check("16px PM Heading")), true);
await page.screenshot({ path: ".cache/new-desktop.png", fullPage: true });

await page.locator("#latex-source").fill("A+B");
await page.locator("#latex-source").focus();
await page.locator("#latex-source").evaluate((el) => el.setSelectionRange(1, 1));
await page.getByRole("tab", { name: "Greek" }).click();
await page.getByRole("button", { name: "Insert Alpha" }).click();
assert.equal(await page.locator("#latex-source").inputValue(), "A\\alpha+B");
await page.getByText("Ready", { exact: true }).waitFor();

await page.keyboard.press("Control+k");
assert.equal(await page.getByRole("textbox", { name: "Search mathematical symbols" }).evaluate((el) => el === document.activeElement), true);
await page.getByRole("textbox", { name: "Search mathematical symbols" }).fill("partial derivative");
assert.equal(await page.getByRole("button", { name: "Insert Partial derivative" }).count(), 1);
await page.getByRole("textbox", { name: "Search mathematical symbols" }).fill("");
await page.getByRole("tab", { name: "Matrices" }).click();
assert.equal(await page.getByRole("button", { name: "Insert Round matrix" }).isVisible(), true);

await page.getByRole("button", { name: "View MathML code" }).click();
assert.match(await page.getByRole("dialog").innerText(), /<math /);
await page.keyboard.press("Escape");
await page.getByRole("button", { name: "Preferences" }).click();
await page.getByRole("button", { name: "KaTeX Alternate TeX coverage" }).click();
await page.getByRole("switch", { name: "Source annotation" }).click();
await page.getByRole("switch", { name: "Live conversion" }).click();
await page.keyboard.press("Escape");
await page.locator("#latex-source").fill("x^2");
assert.equal(await page.getByRole("button", { name: "Copy MathML", exact: true }).first().isDisabled(), true);
await page.keyboard.press("Control+Enter");
assert.equal(await page.getByRole("button", { name: "Copy MathML", exact: true }).first().isEnabled(), true);
await page.getByRole("button", { name: "Export equation" }).click();
const downloadPromise = page.waitForEvent("download");
await page.getByRole("button", { name: /MathML file/ }).click();
assert.equal((await downloadPromise).suggestedFilename(), "equation.mml");
await page.locator("#latex-source").fill("\\unknowncommand{x}");
await page.getByRole("button", { name: "Preferences" }).click();
await page.getByRole("switch", { name: "Live conversion" }).click();
await page.keyboard.press("Escape");
await page.getByText("Could not render this equation").waitFor();
assert.equal(await page.getByRole("button", { name: "View MathML code" }).isDisabled(), true);
await page.getByRole("button", { name: "Use dark theme" }).click();
assert.equal(await page.locator("html").getAttribute("class"), "dark");
await page.getByRole("button", { name: "Use light theme" }).click();
await page.locator("#latex-source").fill("\\frac{1}{2}");
await page.getByText("Ready", { exact: true }).waitFor();
await page.waitForTimeout(550);
await page.reload({ waitUntil: "networkidle" });
assert.equal(await page.locator("#latex-source").inputValue(), "\\frac{1}{2}");

await page.setViewportSize({ width: 840, height: 620 });
await page.screenshot({ path: ".cache/new-min-window.png", fullPage: true });
assert.equal(await page.locator("body").evaluate((el) => el.scrollHeight <= innerHeight && el.scrollWidth <= innerWidth), true);
assert.equal(await page.locator(".source-pane").isVisible(), true);
assert.equal(await page.locator(".render-pane").isVisible(), true);
await page.setViewportSize({ width: 390, height: 840 });
await page.screenshot({ path: ".cache/new-mobile.png", fullPage: true });
assert.equal(await page.locator("body").evaluate((el) => el.scrollWidth <= innerWidth), true);

// Narrow desktop window: full-width editor immediately above live output, palette below.
await page.setViewportSize({ width: 380, height: 620 });
await page.getByText("Ready", { exact: true }).waitFor();
const mobileGeometry = await page.evaluate(() => ({
  input: document.querySelector(".source-pane").getBoundingClientRect().toJSON(),
  preview: document.querySelector(".render-pane").getBoundingClientRect().toJSON(),
  palette: document.querySelector(".palette").getBoundingClientRect().toJSON(),
  horizontalOverflow: document.body.scrollWidth > innerWidth,
}));
assert.equal(mobileGeometry.horizontalOverflow, false);
assert.ok(mobileGeometry.preview.top >= mobileGeometry.input.bottom);
assert.ok(mobileGeometry.palette.top >= mobileGeometry.preview.bottom);
assert.ok(mobileGeometry.preview.bottom <= 620, "Preview should be visible without scrolling in a narrow 380×620 window");
await page.screenshot({ path: ".cache/v2.2-narrow.png", fullPage: true });
await page.getByRole("button", { name: "About this app" }).click();
assert.ok((await page.getByRole("dialog").boundingBox()).width <= 380);
for (const href of ["https://prasadm.vercel.app/", "https://github.com/prasad-kmd", "https://www.linkedin.com/in/prasad-madhuranga/"]) {
  assert.equal(await page.getByRole("dialog").locator(`a[href="${href}"]`).count(), 1);
}
await page.getByRole("button", { name: "Third-party notices" }).click();
assert.equal(await page.getByRole("dialog").getByText("Google Sans").count(), 1);
await page.getByRole("button", { name: "Back to About" }).click();
await page.keyboard.press("Escape");

await page.getByRole("button", { name: "Preferences" }).click();
await page.getByRole("button", { name: "plum accent" }).click();
assert.equal(await page.locator("html").getAttribute("data-accent"), "plum");
await page.keyboard.press("Escape");
await page.waitForTimeout(550);
await page.reload({ waitUntil: "networkidle" });
assert.equal(await page.locator("html").getAttribute("data-accent"), "plum");

// Save, persist, back up, delete and restore a named equation.
await page.locator("#latex-source").fill("x^2+y^2=z^2");
await page.getByRole("button", { name: "Saved equations (0)" }).click();
await page.getByRole("textbox", { name: "Save the current equation" }).fill("Pythagorean identity");
await page.getByRole("button", { name: "Save", exact: true }).click();
await page.getByRole("button", { name: "Open Pythagorean identity" }).waitFor();
const backupEvent = page.waitForEvent("download");
await page.getByRole("button", { name: "Export backup" }).click();
const backup = await backupEvent;
assert.equal(backup.suggestedFilename(), "latex-mathml-equations.json");
const fs = await import("node:fs/promises");
const backupFile = ".cache/library-test-backup.json";
await backup.saveAs(backupFile);
const payload = JSON.parse(await fs.readFile(backupFile, "utf8"));
assert.equal(payload.equations[0].latex, "x^2+y^2=z^2");
assert.equal(payload.equations[0].title, "Pythagorean identity");
await page.getByRole("button", { name: "Delete Pythagorean identity" }).click();
await page.getByRole("button", { name: "Confirm delete Pythagorean identity" }).click();
const invalidChooser = page.waitForEvent("filechooser");
await page.getByRole("button", { name: "Import backup" }).click();
await (await invalidChooser).setFiles({ name: "invalid.json", mimeType: "application/json", buffer: Buffer.from("{}") });
await page.getByText("Invalid or unsupported equation-library backup.").waitFor();
const importChooser = page.waitForEvent("filechooser");
await page.getByRole("button", { name: "Import backup" }).click();
await (await importChooser).setFiles({ name: "backup.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(payload)) });
await page.getByRole("button", { name: "Open Pythagorean identity" }).waitFor();
await page.getByRole("button", { name: "Open Pythagorean identity" }).click();
assert.equal(await page.locator("#latex-source").inputValue(), "x^2+y^2=z^2");
await page.reload({ waitUntil: "networkidle" });
assert.equal(await page.getByRole("button", { name: "Saved equations (1)" }).count(), 1);

await page.setViewportSize({ width: 1280, height: 800 });
const divider = page.getByRole("separator", { name: "Resize symbol palette" });
const initialHeight = await page.locator(".palette").evaluate((el) => el.getBoundingClientRect().height);
const dividerBox = await divider.boundingBox();
await page.mouse.move(dividerBox.x + dividerBox.width / 2, dividerBox.y + dividerBox.height / 2);
await page.mouse.down();
await page.mouse.move(dividerBox.x + dividerBox.width / 2, dividerBox.y - 112, { steps: 7 });
await page.mouse.up();
const grownHeight = await page.locator(".palette").evaluate((el) => el.getBoundingClientRect().height);
assert.ok(grownHeight > initialHeight + 80, `Expected larger symbol tray: ${initialHeight} → ${grownHeight}`);
assert.equal(await page.locator("body").evaluate((el) => el.scrollHeight <= innerHeight), true);
await divider.focus();
await page.keyboard.press("ArrowDown");
const reducedHeight = await page.locator(".palette").evaluate((el) => el.getBoundingClientRect().height);
assert.ok(reducedHeight < grownHeight);
await page.reload({ waitUntil: "networkidle" });
const persistedHeight = await page.locator(".palette").evaluate((el) => el.getBoundingClientRect().height);
assert.ok(Math.abs(persistedHeight - reducedHeight) < 3, "Palette height should persist across reload");
await page.getByRole("button", { name: "Saved equations (1)" }).click();
assert.ok((await page.getByRole("dialog").boundingBox()).width >= 600, "Library dialog should use its wide layout on desktop");
await page.keyboard.press("Escape");
await page.screenshot({ path: ".cache/v2.2-desktop.png", fullPage: true });


// v2.3: undoable palette insertion and Tab through template fields.
const editor = page.locator("#latex-source");
await page.getByRole("tab", { name: "Essentials" }).click();
await editor.fill("z=");
await editor.evaluate((el) => { el.focus(); el.setSelectionRange(2, 2); });
await page.getByRole("button", { name: "Insert Fraction" }).first().click();
assert.equal(await editor.inputValue(), "z=\\frac{}{b}");
assert.equal(await editor.evaluate((el) => el.selectionStart), 8);
await page.keyboard.type("longnumerator");
await page.keyboard.press("Tab");
assert.equal(await editor.evaluate((el) => el.value.slice(el.selectionStart, el.selectionEnd)), "b");
await page.keyboard.press("Shift+Tab");
assert.equal(await editor.evaluate((el) => el.value.slice(el.selectionStart, el.selectionEnd)), "longnumerator");
await page.keyboard.press("Tab");
assert.equal(await editor.evaluate((el) => el.value.slice(el.selectionStart, el.selectionEnd)), "b");
await page.keyboard.type("7");
await page.keyboard.press("Tab");
assert.equal(await editor.inputValue(), "z=\\frac{longnumerator}{7}");
assert.equal(await editor.evaluate((el) => el.selectionStart), (await editor.inputValue()).length);
await page.keyboard.press("Control+z");
assert.equal(await editor.inputValue(), "z=\\frac{longnumerator}{b}");
await page.keyboard.press("Control+Shift+z");
assert.equal(await editor.inputValue(), "z=\\frac{longnumerator}{7}");
await editor.fill("q=");
await editor.evaluate((el) => { el.focus(); el.setSelectionRange(2, 2); });
await page.getByRole("button", { name: "Insert Fraction" }).first().click();
await page.keyboard.press("Control+z");
assert.equal(await editor.inputValue(), "q=");
await page.keyboard.press("Control+Shift+z");
assert.equal(await editor.inputValue(), "q=\\frac{}{b}");
await editor.fill("x+1");
await editor.evaluate((el) => { el.focus(); el.select(); });
await page.getByRole("button", { name: "Insert Fraction" }).first().click();
assert.equal(await editor.inputValue(), "\\frac{x+1}{b}");
await page.waitForFunction(() => {const el=document.querySelector("#latex-source");return el === document.activeElement && el.selectionStart === 9 && el.selectionEnd === 9;});
await page.keyboard.press("Tab");
assert.equal(await editor.evaluate((el) => el.value.slice(el.selectionStart, el.selectionEnd)), "b");
await editor.fill("");
await page.getByRole("tab", { name: "Matrices" }).click();
await page.getByRole("button", { name: "Insert Round matrix" }).click();
await page.waitForFunction(() => {const el=document.querySelector("#latex-source");return el === document.activeElement && el.selectionStart === el.value.indexOf(" & ") && el.selectionEnd === el.selectionStart;});
for (const field of ["b", "c", "d"]) {
  await page.keyboard.press("Tab");
  assert.equal(await editor.evaluate((el) => el.value.slice(el.selectionStart, el.selectionEnd)), field);
}
assert.equal((await editor.inputValue()).includes("⟦"), false);
await page.keyboard.press("Tab");
assert.equal(await editor.evaluate((el) => el.selectionStart), (await editor.inputValue()).length);
await editor.fill("\\frac{1}{2}");

// v2.3: search the library by source, rename without changing its stable backup ID.
await page.getByRole("button", { name: "Saved equations (1)" }).click();
await page.getByRole("searchbox", { name: "Search saved equations" }).fill("x^2+y^2");
assert.equal(await page.getByRole("button", { name: "Open Pythagorean identity" }).count(), 1);
await page.getByRole("searchbox", { name: "Search saved equations" }).fill("no result exists");
await page.getByText("No matching equations").waitFor();
await page.getByRole("searchbox", { name: "Search saved equations" }).fill("Pythagorean");
await page.getByRole("button", { name: "Rename Pythagorean identity" }).click();
await page.getByRole("textbox", { name: "New name for Pythagorean identity" }).fill("Right triangle identity");
await page.getByRole("button", { name: "Save name for Pythagorean identity" }).click();
await page.getByRole("searchbox", { name: "Search saved equations" }).fill("right triangle");
assert.equal(await page.getByRole("button", { name: "Open Right triangle identity" }).count(), 1);
const renamedBackupEvent = page.waitForEvent("download");
await page.getByRole("button", { name: "Export backup" }).click();
const renamedBackupFile = ".cache/renamed-library-backup.json";
await (await renamedBackupEvent).saveAs(renamedBackupFile);
const renamedPayload = JSON.parse(await fs.readFile(renamedBackupFile, "utf8"));
assert.equal(renamedPayload.version, 1);
assert.equal(renamedPayload.equations[0].id, payload.equations[0].id);
assert.equal(renamedPayload.equations[0].title, "Right triangle identity");
const oldBackupChooser = page.waitForEvent("filechooser");
await page.getByRole("button", { name: "Import backup" }).click();
await (await oldBackupChooser).setFiles({ name: "v2.2-backup.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(payload)) });
assert.equal(await page.getByRole("button", { name: "Open Right triangle identity" }).count(), 1);
await page.keyboard.press("Escape");
await page.reload({ waitUntil: "networkidle" });
await page.getByRole("button", { name: "Saved equations (1)" }).click();
assert.equal(await page.getByRole("button", { name: "Open Right triangle identity" }).count(), 1);
await page.keyboard.press("Escape");

// v2.3: drag, keyboard, persist the horizontal input/preview ratio; clamp on small desktop.
const paneDivider = page.getByRole("separator", { name: "Resize input and preview" });
const initialInputWidth = await page.locator(".source-pane").evaluate((el) => el.getBoundingClientRect().width);
const paneBox = await paneDivider.boundingBox();
await page.mouse.move(paneBox.x + paneBox.width / 2, paneBox.y + paneBox.height / 2);
await page.mouse.down();
await page.mouse.move(paneBox.x + paneBox.width / 2 + 130, paneBox.y + paneBox.height / 2, { steps: 8 });
await page.mouse.up();
const widerInput = await page.locator(".source-pane").evaluate((el) => el.getBoundingClientRect().width);
assert.ok(widerInput > initialInputWidth + 100);
await paneDivider.focus();
await page.keyboard.press("ArrowLeft");
const adjustedInput = await page.locator(".source-pane").evaluate((el) => el.getBoundingClientRect().width);
assert.ok(adjustedInput < widerInput);
assert.equal(await page.locator("body").evaluate((el) => el.scrollWidth <= innerWidth && el.scrollHeight <= innerHeight), true);
await page.reload({ waitUntil: "networkidle" });
assert.ok(Math.abs((await page.locator(".source-pane").evaluate((el) => el.getBoundingClientRect().width)) - adjustedInput) < 3);
await page.screenshot({ path: ".cache/v2.3-desktop.png", fullPage: true });
await page.setViewportSize({ width: 761, height: 620 });
assert.ok((await page.locator(".source-pane").boundingBox()).width >= 240);
assert.ok((await page.locator(".render-pane").boundingBox()).width >= 240);
await paneDivider.focus();
await page.keyboard.press("Home");
assert.ok((await page.locator(".source-pane").boundingBox()).width >= 240);
assert.ok((await page.locator(".source-pane").boundingBox()).width < 242);
await page.keyboard.press("End");
assert.ok((await page.locator(".render-pane").boundingBox()).width >= 240);
assert.ok((await page.locator(".render-pane").boundingBox()).width < 242);
await paneDivider.dblclick();
const resetWidths = [await page.locator(".source-pane").boundingBox(), await page.locator(".render-pane").boundingBox()];
assert.ok(Math.abs(resetWidths[0].width - resetWidths[1].width) < 3);
assert.equal(await page.locator("body").evaluate((el) => el.scrollWidth <= innerWidth && el.scrollHeight <= innerHeight), true);
await page.setViewportSize({ width: 380, height: 620 });
assert.equal(await paneDivider.isVisible(), false);
await page.waitForFunction(() => document.querySelector(".render-pane").getBoundingClientRect().bottom <= 620);
await page.screenshot({ path: ".cache/v2.3-narrow.png", fullPage: true });

if (errors.length) throw new Error("Browser errors: " + errors.join("; "));
console.log("PASS: 2.3 Tab-through templates and undo, library search/rename with v1 backups, resizable panes and palette, responsive layout, conversion and persistence.");
await browser.close();
