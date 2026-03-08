import fs from "node:fs/promises";
import path from "node:path";

export async function ensureDirectories(config) {
  await fs.mkdir(config.outputDir, { recursive: true });
  await fs.mkdir(config.dataDir, { recursive: true });
  await fs.mkdir(path.join(config.outputDir, "editions"), { recursive: true });
}

export async function saveEditionFiles(edition, config) {
  const jsonPath = path.join(config.dataDir, `${edition.slug}.json`);
  const htmlPath = path.join(config.outputDir, "editions", `${edition.slug}.html`);

  await fs.writeFile(jsonPath, JSON.stringify(edition, null, 2));
  await fs.writeFile(htmlPath, edition.siteHtml);

  return {
    jsonPath,
    htmlPath
  };
}

export async function loadArchive(config) {
  try {
    const entries = await fs.readdir(config.dataDir);
    const jsonFiles = entries.filter((entry) => entry.endsWith(".json")).sort().reverse();
    const editions = [];

    for (const file of jsonFiles) {
      const content = await fs.readFile(path.join(config.dataDir, file), "utf8");
      editions.push(JSON.parse(content));
    }

    return editions;
  } catch {
    return [];
  }
}

export async function writeIndexHtml(indexHtml, config) {
  await fs.writeFile(path.join(config.outputDir, "index.html"), indexHtml);
}
