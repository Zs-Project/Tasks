const fs = require("fs");
const path = require("path");

const root = __dirname;
const outDir = path.join(root, "native-web");
const dataSource = process.env.PLANBOARD_DATA_SOURCE || (process.env.PLANBOARD_FIREBASE_PROJECT_ID ? "firebase" : "rest");
const apiBaseUrl = process.env.PLANBOARD_API_BASE_URL || "";
const firebaseConfig = {
  FIREBASE_API_KEY: process.env.PLANBOARD_FIREBASE_API_KEY || "",
  FIREBASE_AUTH_DOMAIN: process.env.PLANBOARD_FIREBASE_AUTH_DOMAIN || "",
  FIREBASE_PROJECT_ID: process.env.PLANBOARD_FIREBASE_PROJECT_ID || "",
  FIREBASE_STORAGE_BUCKET: process.env.PLANBOARD_FIREBASE_STORAGE_BUCKET || "",
  FIREBASE_MESSAGING_SENDER_ID: process.env.PLANBOARD_FIREBASE_MESSAGING_SENDER_ID || "",
  FIREBASE_APP_ID: process.env.PLANBOARD_FIREBASE_APP_ID || "",
  FIREBASE_SDK_VERSION: process.env.PLANBOARD_FIREBASE_SDK_VERSION || "12.4.0",
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "config.js"),
  `window.__PLANBOARD_CONFIG__ = window.__PLANBOARD_CONFIG__ || ${JSON.stringify({
    DATA_SOURCE: dataSource,
    API_BASE_URL: apiBaseUrl,
    ...firebaseConfig,
  }, null, 2)};\n`
);

console.log(
  `Wrote native config with DATA_SOURCE=${dataSource}, API_BASE_URL=${apiBaseUrl || "(same-origin)"}`
);
