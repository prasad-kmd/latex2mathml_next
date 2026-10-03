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

if (errors.length) throw new Error("Browser errors: " + errors.join("; "));
console.log("PASS: desktop/narrow layout, resizable tray, library backup/restore, accents, About/third-party links, conversion and persistence.");
await browser.close();
