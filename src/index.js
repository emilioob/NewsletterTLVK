import { config } from "./config.js";
import { sourceFeeds } from "./lib/sources.js";
import { fetchFeed } from "./lib/rss.js";
import { curateArticles, buildSections } from "./lib/analysis.js";
import { ensureDirectories, loadArchive, saveEditionFiles, writeIndexHtml } from "./lib/storage.js";
import { renderEmailHtml, renderEmailText, renderIndexHtml, renderSiteHtml } from "./lib/render.js";
import { enhanceEditionWithOpenAi } from "./lib/summarize.js";
import { deliverEmail } from "./lib/email.js";
import { formatEditionDate, isoDateSlug } from "./lib/utils.js";
import { travelokaContext } from "./lib/traveloka.js";

async function collectRawArticles() {
  const settled = await Promise.allSettled(sourceFeeds.map((source) => fetchFeed(source)));
  const articles = [];

  for (const result of settled) {
    if (result.status === "fulfilled") {
      articles.push(...result.value);
    }
  }

  return articles;
}

function buildEditionSkeleton(sections) {
  const today = new Date();
  const slug = isoDateSlug(today, config.timezone);

  return {
    slug,
    dateLabel: formatEditionDate(today, config.timezone),
    headline: "Daily Southeast Asia Travel Market Brief",
    topLine:
      "Signals across route demand, travel disruption, and competitor behavior curated for Traveloka strategy monitoring.",
    strategyContext: travelokaContext,
    sections
  };
}

async function main() {
  await ensureDirectories(config);

  const rawArticles = await collectRawArticles();
  const curatedArticles = curateArticles(rawArticles, config.maxRawArticles);
  const sections = buildSections(curatedArticles, config.maxItemsPerSection);

  if (!sections.length) {
    throw new Error("No relevant articles were curated from the configured sources.");
  }

  let edition = buildEditionSkeleton(sections);
  edition = await enhanceEditionWithOpenAi(edition, config);
  edition.siteHtml = renderSiteHtml(edition, config);
  edition.emailHtml = renderEmailHtml(edition, config);
  edition.emailText = renderEmailText(edition, config);

  await saveEditionFiles(edition, config);

  const archive = await loadArchive(config);
  await writeIndexHtml(renderIndexHtml(archive, config), config);

  const subject = `${edition.headline} | ${edition.dateLabel}`;
  const delivery = await deliverEmail(subject, edition.emailHtml, edition.emailText, config);

  console.log(
    JSON.stringify(
      {
        edition: edition.slug,
        sections: edition.sections.map((section) => ({
          title: section.title,
          items: section.items.length
        })),
        delivery
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
