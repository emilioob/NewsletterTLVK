import path from "node:path";

const cwd = process.cwd();

export const config = {
  baseUrl: process.env.BASE_URL || "",
  siteTitle: process.env.SITE_TITLE || "Travel Pulse SEA",
  timezone: process.env.EDITION_TIMEZONE || "Asia/Singapore",
  outputDir: path.join(cwd, "site"),
  dataDir: path.join(cwd, "data"),
  maxItemsPerSection: Number(process.env.MAX_ITEMS_PER_SECTION || 4),
  maxRawArticles: Number(process.env.MAX_RAW_ARTICLES || 36),
  openAiApiKey: process.env.OPENAI_API_KEY || "",
  openAiModel: process.env.OPENAI_MODEL || "gpt-4.1-mini",
  emailProvider: process.env.EMAIL_PROVIDER || "none",
  emailFrom: process.env.EMAIL_FROM || "",
  emailTo: process.env.EMAIL_TO || "",
  resendApiKey: process.env.RESEND_API_KEY || "",
  sendgridApiKey: process.env.SENDGRID_API_KEY || ""
};
