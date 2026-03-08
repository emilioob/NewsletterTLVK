import test from "node:test";
import assert from "node:assert/strict";

import { enrichArticle, curateArticles } from "../src/lib/analysis.js";
import { parseRssItems } from "../src/lib/rss.js";

test("enrichArticle classifies competitor dynamics", () => {
  const article = enrichArticle({
    title: "Agoda expands in Indonesia with new loyalty partnership",
    description: "The OTA launched a new market push and partnership targeting Southeast Asia travelers.",
    link: "https://example.com/agoda",
    publisher: "Reuters",
    sectionHint: "competitor"
  });

  assert.equal(article.section, "Competitor Dynamics");
  assert.ok(article.impacts.includes("Competitive move"));
});

test("enrichArticle extracts route patterns conservatively", () => {
  const article = enrichArticle({
    title: "Airline cuts Jakarta to Bangkok flights after demand slows",
    description: "Capacity reduction follows weaker leisure demand.",
    link: "https://example.com/route",
    publisher: "Reuters",
    sectionHint: "market"
  });

  assert.equal(article.route, "Jakarta - Bangkok");
  assert.equal(article.section, "Market Situation");
});

test("parseRssItems splits publisher from title", () => {
  const xml = `<?xml version="1.0"?>
  <rss>
    <channel>
      <item>
        <title>Test item - Reuters</title>
        <link>https://example.com/story</link>
        <description><![CDATA[Some <b>description</b>.]]></description>
        <pubDate>Sun, 08 Mar 2026 10:00:00 GMT</pubDate>
      </item>
    </channel>
  </rss>`;

  const [item] = parseRssItems(xml, { name: "Test feed", sectionHint: "market" });

  assert.equal(item.title, "Test item");
  assert.equal(item.publisher, "Reuters");
  assert.equal(item.link, "https://example.com/story");
  assert.equal(item.description, "Some description .");
});

test("curateArticles filters blocked publishers", () => {
  const curated = curateArticles(
    [
      {
        title: "Travel demand in Thailand weakens",
        description: "Demand pressure in Thailand hits airlines.",
        link: "https://example.com/1",
        publisher: "Travel And Tour World",
        sectionHint: "market"
      },
      {
        title: "Agoda expands in Thailand",
        description: "Agoda expands with a partnership in Southeast Asia.",
        link: "https://example.com/2",
        publisher: "Reuters",
        sectionHint: "competitor"
      }
    ],
    10
  );

  assert.equal(curated.length, 1);
  assert.equal(curated[0].publisher, "Reuters");
});
