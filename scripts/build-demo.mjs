/**
 * Splits screen data from public/agent-portal-demo.source.html into modular assets.
 * Preserves public/demo/demo.js (logic) — only regenerates data + index shell + CSS.
 *
 * Source: restore from git history or maintain agent-portal-demo.source.html
 * Run: npm run build:demo
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const srcPath = path.join(root, "public", "agent-portal-demo.source.html");
const outDir = path.join(root, "public", "demo");
const htmlDir = path.join(outDir, "data", "html");

const src = fs.readFileSync(srcPath, "utf8");

const styleMatch = src.match(/<style>([\s\S]*?)<\/style>/);
if (!styleMatch) throw new Error("Could not find <style> block");
fs.mkdirSync(htmlDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "demo.css"), styleMatch[1].trim() + "\n");
console.log("Note: merge demo.css changes manually if you customized mobile styles.");

const screensMatch = src.match(/const SCREENS\s*=\s*(\[[\s\S]*?\]);/);
const htmlMatch = src.match(/const HTML\s*=\s*(\[[\s\S]*?\]);/);
const flowsMatch = src.match(/const FLOWS\s*=\s*(\[[\s\S]*?\]);/);
if (!screensMatch || !htmlMatch || !flowsMatch) {
  throw new Error("Could not parse SCREENS, HTML, or FLOWS");
}

const SCREENS = eval(screensMatch[1]);
const HTML = eval(htmlMatch[1]);
const FLOWS = eval(flowsMatch[1]);

fs.writeFileSync(
  path.join(outDir, "data", "screens.json"),
  JSON.stringify(SCREENS, null, 2) + "\n",
);
fs.writeFileSync(
  path.join(outDir, "data", "flows.json"),
  JSON.stringify(FLOWS, null, 2) + "\n",
);

for (const flow of FLOWS) {
  const chunk = HTML.slice(flow.start, flow.start + flow.count);
  fs.writeFileSync(
    path.join(htmlDir, `${flow.id}.json`),
    JSON.stringify(chunk) + "\n",
  );
}

const bodyStart = src.indexOf("<body>") + "<body>".length;
const scriptStart = src.indexOf("<script>", bodyStart);
const bodyInner = src.slice(bodyStart, scriptStart).trim();

const shell = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>BookCover · Agent Portal Demo · v59</title>
<link rel="stylesheet" href="demo.css">
</head>
<body>
${bodyInner}
<script src="demo.js" defer></script>
</body>
</html>
`;

fs.writeFileSync(path.join(outDir, "index.html"), shell);

console.log(
  `Built demo: ${SCREENS.length} screens, ${FLOWS.length} flows → public/demo/`,
);
