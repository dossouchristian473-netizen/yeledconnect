#!/usr/bin/env node
// Bloque le build si un fichier sans "use client" contient un event handler
// JSX (onClick={...}, onChange={...}, etc.) : c'est illégal côté Server
// Component et Next.js ne le détecte qu'à l'exécution en prod (digest error),
// jamais à la compilation. Ce script fait ce que tsc/next build ne font pas.
// Historique : a cassé /accueil en prod deux fois (nav icons passées en props,
// puis onClick inline dans ResourcesSection.tsx).

const fs = require("fs");
const path = require("path");

const SRC_DIR = path.join(__dirname, "..", "src");
const HANDLER_PROP = /\bon[A-Z]\w*\s*=\s*\{/;
const USE_CLIENT = /^\s*["']use client["'];?/;

/** @type {{file: string, line: number, text: string}[]} */
const violations = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (/\.(tsx|jsx)$/.test(entry.name)) {
      checkFile(full);
    }
  }
}

function checkFile(file) {
  const content = fs.readFileSync(file, "utf8");
  const lines = content.split("\n");

  const firstCodeLine = lines.find((l) => l.trim().length > 0) ?? "";
  if (USE_CLIENT.test(firstCodeLine)) return; // Client Component: autorisé

  lines.forEach((line, i) => {
    if (HANDLER_PROP.test(line)) {
      violations.push({ file: path.relative(process.cwd(), file), line: i + 1, text: line.trim() });
    }
  });
}

walk(SRC_DIR);

if (violations.length > 0) {
  console.error("\n❌ Event handler(s) JSX trouvé(s) dans un Server Component (pas de \"use client\").");
  console.error("   Next.js ne peut pas rendre ça — ça plante en prod avec une erreur générique.\n");
  for (const v of violations) {
    console.error(`   ${v.file}:${v.line}`);
    console.error(`     ${v.text}`);
  }
  console.error("\n   Corrige en ajoutant \"use client\" en haut du fichier, ou en déplaçant");
  console.error("   l'élément interactif dans un composant client séparé.\n");
  process.exit(1);
} else {
  console.log("✓ Vérification des frontières Server/Client Component : OK");
}
