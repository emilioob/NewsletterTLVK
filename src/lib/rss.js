import { decodeXml, stripHtml } from "./utils.js";

function getTagValue(xml, tagName) {
  const match = xml.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return match ? decodeXml(stripHtml(match[1])) : "";
}

function splitPublisher(title) {
  const match = title.match(/^(.*)\s-\s([^|-][^-]+)$/);
  if (!match) {
    return { cleanedTitle: title, publisher: "" };
  }

  return {
    cleanedTitle: match[1].trim(),
    publisher: match[2].trim()
  };
}

export function parseRssItems(xml, source) {
  const itemMatches = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];

  return itemMatches.map((itemXml) => {
    const rawTitle = getTagValue(itemXml, "title");
    const link = getTagValue(itemXml, "link");
    const description = getTagValue(itemXml, "description");
    const pubDate = getTagValue(itemXml, "pubDate");
    const { cleanedTitle, publisher } = splitPublisher(rawTitle);

    return {
      title: cleanedTitle,
      publisher,
      link,
      description,
      pubDate,
      sourceName: source.name,
      sectionHint: source.sectionHint
    };
  });
}

export async function fetchFeed(source) {
  const response = await fetch(source.url, {
    headers: {
      "user-agent": "TravelPulseSEA/0.1"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${source.name}: ${response.status}`);
  }

  const xml = await response.text();
  return parseRssItems(xml, source);
}
