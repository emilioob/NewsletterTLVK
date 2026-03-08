import { sentenceSplit, stripHtml, takeUnique } from "./utils.js";

const competitorTerms = [
  "agoda",
  "booking.com",
  "booking holdings",
  "expedia",
  "airbnb",
  "trip.com",
  "tripadvisor",
  "tiket.com",
  "traveloka"
];

const marketTerms = [
  "demand",
  "route",
  "capacity",
  "advisory",
  "flood",
  "typhoon",
  "volcano",
  "earthquake",
  "war",
  "wildfire",
  "tourism tax",
  "visa",
  "airport closure",
  "travel warning",
  "suspension"
];

const seaTerms = [
  "indonesia",
  "singapore",
  "thailand",
  "vietnam",
  "philippines",
  "malaysia",
  "jakarta",
  "bali",
  "bangkok",
  "phuket",
  "ho chi minh",
  "hanoi",
  "kuala lumpur",
  "manila"
];

const cities = [
  "Jakarta",
  "Bali",
  "Bangkok",
  "Singapore",
  "Kuala Lumpur",
  "Manila",
  "Phuket",
  "Hanoi",
  "Ho Chi Minh City",
  "Ho Chi Minh",
  "Denpasar",
  "Surabaya",
  "Medan",
  "Tokyo",
  "Osaka",
  "Sydney",
  "Melbourne",
  "Perth",
  "Seoul",
  "Hong Kong",
  "Dubai"
];

const blockedPublishers = ["Travel And Tour World"];

const impactPatterns = [
  { label: "Demand risk", regex: /\b(drop|slump|decline|weaken|soften|reduc\w*)\b/i },
  { label: "Capacity shift", regex: /\b(route|capacity|frequency|suspend\w*|launch\w*|cut\w*)\b/i },
  { label: "Climate disruption", regex: /\b(typhoon|flood\w*|volcano|wildfire|earthquake|storm)\b/i },
  { label: "Geopolitical risk", regex: /\b(war|conflict|advisory|border|sanction\w*)\b/i },
  { label: "Competitive move", regex: /\b(acquisition|expand\w*|launch\w*|market entry|partnership|loyalty)\b/i }
];

function normalize(value) {
  return value.toLowerCase();
}

function countMatches(text, terms) {
  return terms.reduce((score, term) => score + (text.includes(term) ? 1 : 0), 0);
}

function extractRoute(text) {
  const lowered = text.toLowerCase();

  for (const origin of cities) {
    for (const destination of cities) {
      if (origin === destination) {
        continue;
      }

      const originLower = origin.toLowerCase();
      const destinationLower = destination.toLowerCase();
      const directPattern = `${originLower} to ${destinationLower}`;
      const reversePattern = `${originLower}-${destinationLower}`;
      const betweenPattern = `between ${originLower} and ${destinationLower}`;

      if (lowered.includes(directPattern) || lowered.includes(reversePattern) || lowered.includes(betweenPattern)) {
        return `${origin} - ${destination}`;
      }
    }
  }

  return "";
}

function inferSection(text, hint) {
  if (hint === "competitor" || countMatches(text, competitorTerms) >= 2) {
    return "Competitor Dynamics";
  }

  if (hint === "market" || countMatches(text, marketTerms) >= 1) {
    return "Market Situation";
  }

  return "Watchlist";
}

function inferImpact(text) {
  return impactPatterns.filter((pattern) => pattern.regex.test(text)).map((pattern) => pattern.label);
}

function buildHeuristicSummary(article) {
  const text = stripHtml(`${article.title}. ${article.description}`);
  const sentences = sentenceSplit(text).slice(0, 2);
  return sentences.length ? sentences.join(" ") : article.title;
}

function buildStrategicWhy(article) {
  const impacts = article.impacts;
  const route = article.route ? ` on ${article.route}` : "";

  if (impacts.includes("Climate disruption")) {
    return `Potential near-term booking softness${route} if disruption headlines persist.`;
  }

  if (impacts.includes("Geopolitical risk")) {
    return `Monitor conversion and cancellation risk${route} as traveler confidence may weaken.`;
  }

  if (article.section === "Competitor Dynamics") {
    return "Worth tracking for share-shift risk, supplier leverage, and customer acquisition pressure.";
  }

  if (impacts.includes("Capacity shift")) {
    return `Could reshape pricing and demand capture${route} over the next few weeks.`;
  }

  return "Relevant for short-term demand monitoring and commercial response planning.";
}

export function enrichArticle(rawArticle) {
  const text = normalize(`${rawArticle.title} ${rawArticle.description}`);
  const seaScore = countMatches(text, seaTerms);
  const competitorScore = countMatches(text, competitorTerms);
  const marketScore = countMatches(text, marketTerms);
  const section = inferSection(text, rawArticle.sectionHint);
  const route = extractRoute(`${rawArticle.title} ${rawArticle.description}`);
  const impacts = inferImpact(text);

  const relevanceScore =
    seaScore * 3 +
    competitorScore * 2 +
    marketScore * 2 +
    (route ? 3 : 0) +
    (section === "Competitor Dynamics" ? 2 : 1) +
    (rawArticle.publisher ? 1 : 0);

  return {
    ...rawArticle,
    section,
    route,
    impacts,
    relevanceScore,
    dedupeKey: `${normalize(rawArticle.title)}|${section}`,
    summary: buildHeuristicSummary(rawArticle),
    strategicWhy: buildStrategicWhy({ section, impacts, route }),
    keyPoints: takeUnique(
      sentenceSplit(stripHtml(rawArticle.description)).map((sentence) => ({
        text: sentence,
        dedupeKey: sentence.toLowerCase()
      })),
      3
    ).map((entry) => entry.text)
  };
}

export function curateArticles(rawArticles, maxRawArticles) {
  return rawArticles
    .map(enrichArticle)
    .filter((article) => article.relevanceScore >= 4)
    .filter((article) => !blockedPublishers.includes(article.publisher))
    .sort((left, right) => right.relevanceScore - left.relevanceScore)
    .slice(0, maxRawArticles);
}

export function buildSections(curatedArticles, maxItemsPerSection) {
  const groups = new Map([
    ["Market Situation", []],
    ["Competitor Dynamics", []],
    ["Watchlist", []]
  ]);

  for (const article of curatedArticles) {
    groups.get(article.section).push(article);
  }

  return [...groups.entries()]
    .map(([title, items]) => ({
      title,
      items: takeUnique(items, maxItemsPerSection)
    }))
    .filter((section) => section.items.length > 0);
}
