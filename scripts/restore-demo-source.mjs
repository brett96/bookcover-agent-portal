import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "public", "agent-portal-demo.source.html");
const data = execFileSync(
  "git",
  ["show", "HEAD:public/agent-portal-demo.html"],
  { cwd: root, maxBuffer: 20 * 1024 * 1024 },
);
fs.writeFileSync(out, data);
console.log("Restored source:", data.length, "bytes");
