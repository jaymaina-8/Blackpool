import fs from "node:fs";

const files = [
  "react-portfolio-template-main/index.html",
  "react-portfolio-template-main/public/website-design-nairobi/index.html",
  "react-portfolio-template-main/public/small-business-websites-nairobi/index.html",
  "react-portfolio-template-main/public/restaurant-website-design-nairobi/index.html",
];

const scriptRe =
  /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;

let failed = false;

for (const file of files) {
  const html = fs.readFileSync(new URL(file, import.meta.url), "utf8");
  const matches = [...html.matchAll(scriptRe)];

  if (!matches.length) {
    console.log(`${file}: no JSON-LD`);
    continue;
  }

  for (let i = 0; i < matches.length; i++) {
    const raw = matches[i][1].trim();
    try {
      JSON.parse(raw);
      console.log(`${file}: JSON-LD #${i + 1} OK`);
    } catch (e) {
      failed = true;
      console.log(`${file}: JSON-LD #${i + 1} FAIL: ${e.message}`);
    }
  }
}

process.exit(failed ? 1 : 0);

