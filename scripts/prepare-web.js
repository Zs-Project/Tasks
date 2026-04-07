const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "native-web");
const files = ["index.html", "styles.css", "app.js", "firebase-adapter.js", "config.js", "sw.js", "manifest.webmanifest"];
const folders = ["icons"];

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const file of files) {
  fs.copyFileSync(path.join(root, file), path.join(outDir, file));
}

for (const folder of folders) {
  fs.cpSync(path.join(root, folder), path.join(outDir, folder), { recursive: true });
}

console.log(`Prepared native web assets in ${outDir}`);
