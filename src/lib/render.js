function escapeHtml(value = "") {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function editionUrl(edition, config) {
  return config.baseUrl ? `${config.baseUrl.replace(/\/$/, "")}/editions/${edition.slug}.html` : "";
}

function sourceLabel(item) {
  if (item.publisher) {
    return item.publisher;
  }

  try {
    return new URL(item.link).hostname.replace(/^www\./, "");
  } catch {
    return "source";
  }
}

function renderCard(item) {
  const impactChips = item.impacts.map((impact) => `<span class="chip">${escapeHtml(impact)}</span>`).join("");
  const route = item.route ? `<div class="route">${escapeHtml(item.route)}</div>` : "";
  const points = item.keyPoints
    .slice(0, 3)
    .map((point) => `<li>${escapeHtml(point)}</li>`)
    .join("");

  return `
    <article class="card">
      <div class="card-top">
        ${route}
        <a class="source" href="${escapeHtml(item.link)}" target="_blank" rel="noreferrer">${escapeHtml(sourceLabel(item))}</a>
      </div>
      <h3>${escapeHtml(item.title)}</h3>
      <p class="summary">${escapeHtml(item.summary)}</p>
      <ul class="points">${points}</ul>
      <div class="why">${escapeHtml(item.strategicWhy)}</div>
      <div class="chips">${impactChips}</div>
    </article>
  `;
}

function renderSection(section) {
  return `
    <section class="section">
      <div class="section-heading">
        <p class="eyebrow">${escapeHtml(section.title)}</p>
      </div>
      <div class="grid">
        ${section.items.map(renderCard).join("")}
      </div>
    </section>
  `;
}

export function renderSiteHtml(edition, config) {
  const editionLink = editionUrl(edition, config);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(edition.headline)} | ${escapeHtml(config.siteTitle)}</title>
    <style>
      :root {
        --bg: #f4efe6;
        --ink: #10211b;
        --muted: #4d6059;
        --card: rgba(255,255,255,0.78);
        --line: rgba(16,33,27,0.12);
        --accent: #ee6c4d;
        --accent-2: #1d7874;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        color: var(--ink);
        font-family: Georgia, "Times New Roman", serif;
        background:
          radial-gradient(circle at top left, rgba(244,201,93,0.35), transparent 30%),
          radial-gradient(circle at top right, rgba(29,120,116,0.18), transparent 28%),
          linear-gradient(180deg, #f9f4ec 0%, var(--bg) 100%);
      }
      a { color: inherit; }
      .shell {
        max-width: 1200px;
        margin: 0 auto;
        padding: 32px 20px 72px;
      }
      .hero {
        padding: 28px;
        border: 1px solid var(--line);
        background: linear-gradient(145deg, rgba(255,255,255,0.88), rgba(255,248,238,0.78));
        border-radius: 28px;
        box-shadow: 0 24px 60px rgba(16,33,27,0.08);
      }
      .kicker {
        font-size: 12px;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--accent-2);
        margin: 0 0 12px;
      }
      h1 {
        font-size: clamp(2.4rem, 5vw, 4.6rem);
        line-height: 0.95;
        margin: 0;
        max-width: 12ch;
      }
      .topline {
        max-width: 65ch;
        font-size: 1.05rem;
        color: var(--muted);
        line-height: 1.65;
        margin: 20px 0 0;
      }
      .hero-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 22px;
      }
      .pill {
        border: 1px solid var(--line);
        border-radius: 999px;
        padding: 10px 14px;
        background: rgba(255,255,255,0.7);
        font-size: 0.95rem;
      }
      .section {
        margin-top: 34px;
      }
      .eyebrow {
        margin: 0 0 14px;
        font-size: 0.82rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--accent);
      }
      .grid {
        display: grid;
        gap: 18px;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      }
      .card {
        padding: 20px;
        border-radius: 22px;
        border: 1px solid var(--line);
        background: var(--card);
        backdrop-filter: blur(12px);
        box-shadow: 0 18px 40px rgba(16,33,27,0.06);
      }
      .card-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .route {
        font-size: 0.76rem;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        color: var(--accent-2);
      }
      .source {
        font-size: 0.78rem;
        color: var(--muted);
      }
      h3 {
        margin: 12px 0;
        font-size: 1.28rem;
        line-height: 1.2;
      }
      .summary, .why {
        color: var(--muted);
        line-height: 1.6;
      }
      .points {
        margin: 14px 0;
        padding-left: 18px;
        color: var(--ink);
      }
      .points li + li {
        margin-top: 8px;
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 16px;
      }
      .chip {
        background: rgba(29,120,116,0.08);
        color: #165954;
        border-radius: 999px;
        padding: 7px 10px;
        font-size: 0.82rem;
      }
      .footer {
        margin-top: 32px;
        color: var(--muted);
        font-size: 0.95rem;
      }
      @media (max-width: 720px) {
        .shell { padding: 18px 14px 42px; }
        .hero { padding: 22px; border-radius: 24px; }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <section class="hero">
        <p class="kicker">${escapeHtml(config.siteTitle)}</p>
        <h1>${escapeHtml(edition.headline)}</h1>
        <p class="topline">${escapeHtml(edition.topLine)}</p>
        <div class="hero-meta">
          <div class="pill">${escapeHtml(edition.dateLabel)}</div>
          <div class="pill">${edition.sections.reduce((count, section) => count + section.items.length, 0)} curated signals</div>
          ${editionLink ? `<a class="pill" href="${escapeHtml(editionLink)}">Permanent edition link</a>` : ""}
        </div>
      </section>
      ${edition.sections.map(renderSection).join("")}
      <p class="footer">Generated for Traveloka strategy monitoring. Each item links back to its source.</p>
    </main>
  </body>
</html>`;
}

export function renderIndexHtml(editions, config) {
  const cards = editions
    .map((edition) => {
      const href = `./editions/${edition.slug}.html`;
      return `
        <a class="archive-card" href="${href}">
          <div class="archive-date">${escapeHtml(edition.dateLabel)}</div>
          <h2>${escapeHtml(edition.headline)}</h2>
          <p>${escapeHtml(edition.topLine)}</p>
        </a>
      `;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(config.siteTitle)}</title>
    <style>
      body {
        margin: 0;
        font-family: Georgia, "Times New Roman", serif;
        background: linear-gradient(180deg, #10211b 0%, #17342b 100%);
        color: #f6efe3;
      }
      .shell {
        max-width: 960px;
        margin: 0 auto;
        padding: 32px 20px 80px;
      }
      h1 {
        font-size: clamp(2.2rem, 6vw, 4.8rem);
        line-height: 0.95;
        margin-bottom: 8px;
      }
      p {
        color: rgba(246,239,227,0.78);
        line-height: 1.6;
      }
      .archive {
        display: grid;
        gap: 16px;
        margin-top: 32px;
      }
      .archive-card {
        display: block;
        padding: 22px;
        border-radius: 24px;
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.1);
        color: inherit;
        text-decoration: none;
      }
      .archive-date {
        text-transform: uppercase;
        letter-spacing: 0.14em;
        font-size: 0.74rem;
        color: #f4c95d;
      }
      h2 { margin: 10px 0 8px; }
    </style>
  </head>
  <body>
    <main class="shell">
      <h1>${escapeHtml(config.siteTitle)}</h1>
      <p>Daily OTA, market, and route intelligence with web editions ready to share.</p>
      <section class="archive">${cards}</section>
    </main>
  </body>
</html>`;
}

export function renderEmailHtml(edition, config) {
  const url = editionUrl(edition, config);
  const sectionsHtml = edition.sections
    .map(
      (section) => `
        <h2 style="font-size:18px;margin:24px 0 8px;">${escapeHtml(section.title)}</h2>
        ${section.items
          .map(
            (item) => `
              <div style="margin:0 0 18px;padding:16px;border:1px solid #e5ddd0;border-radius:16px;background:#fffdf8;">
                <div style="font-size:12px;color:#57706b;text-transform:uppercase;letter-spacing:.12em;">${escapeHtml(item.route || sourceLabel(item))}</div>
                <div style="font-size:17px;font-weight:700;margin:8px 0;">${escapeHtml(item.title)}</div>
                <div style="color:#4d6059;line-height:1.6;">${escapeHtml(item.summary)}</div>
                <div style="margin-top:10px;color:#10211b;"><strong>Why it matters:</strong> ${escapeHtml(item.strategicWhy)}</div>
                <div style="margin-top:10px;"><a href="${escapeHtml(item.link)}">Open source</a></div>
              </div>
            `
          )
          .join("")}
      `
    )
    .join("");

  return `
    <div style="background:#f7f1e6;padding:28px;font-family:Georgia, 'Times New Roman', serif;color:#10211b;">
      <div style="max-width:720px;margin:0 auto;background:#fff;border-radius:24px;padding:28px;">
        <div style="font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#1d7874;">${escapeHtml(config.siteTitle)}</div>
        <h1 style="font-size:34px;line-height:1.05;margin:10px 0 12px;">${escapeHtml(edition.headline)}</h1>
        <p style="color:#4d6059;line-height:1.7;">${escapeHtml(edition.topLine)}</p>
        <p style="color:#4d6059;">${escapeHtml(edition.dateLabel)}</p>
        ${url ? `<p><a href="${escapeHtml(url)}">Open the full web edition</a></p>` : ""}
        ${sectionsHtml}
      </div>
    </div>
  `;
}

export function renderEmailText(edition, config) {
  const url = editionUrl(edition, config);
  const lines = [
    `${config.siteTitle}`,
    edition.headline,
    edition.dateLabel,
    "",
    edition.topLine,
    ""
  ];

  if (url) {
    lines.push(`Full web edition: ${url}`, "");
  }

  for (const section of edition.sections) {
    lines.push(section.title);
    lines.push("-".repeat(section.title.length));

    for (const item of section.items) {
      lines.push(item.title);
      lines.push(`Why it matters: ${item.strategicWhy}`);
      lines.push(`Source: ${item.link}`);
      lines.push("");
    }
  }

  return lines.join("\n");
}
