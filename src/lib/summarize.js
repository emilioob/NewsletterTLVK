export async function enhanceEditionWithOpenAi(edition, config) {
  if (!config.openAiApiKey) {
    return edition;
  }

  const prompt = [
    "You are writing a crisp executive OTA industry digest for a Traveloka strategy stakeholder.",
    "Return JSON only.",
    "Schema:",
    '{"headline":"string","topLine":"string","sections":[{"title":"string","items":[{"title":"string","summary":"string","keyPoints":["string"],"strategicWhy":"string"}]}]}',
    "Keep sections aligned to the supplied structure.",
    "Focus on Southeast Asia travel demand, routes, disruptions, and competitor moves."
  ].join("\n");

  const payload = {
    model: config.openAiModel,
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: prompt }]
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: JSON.stringify({
              editionDate: edition.dateLabel,
              sections: edition.sections.map((section) => ({
                title: section.title,
                items: section.items.map((item) => ({
                  title: item.title,
                  summary: item.summary,
                  keyPoints: item.keyPoints,
                  strategicWhy: item.strategicWhy,
                  link: item.link,
                  route: item.route,
                  impacts: item.impacts
                }))
              }))
            })
          }
        ]
      }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "newsletter_edition",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            headline: { type: "string" },
            topLine: { type: "string" },
            sections: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  title: { type: "string" },
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      additionalProperties: false,
                      properties: {
                        title: { type: "string" },
                        summary: { type: "string" },
                        keyPoints: {
                          type: "array",
                          items: { type: "string" }
                        },
                        strategicWhy: { type: "string" }
                      },
                      required: ["title", "summary", "keyPoints", "strategicWhy"]
                    }
                  }
                },
                required: ["title", "items"]
              }
            }
          },
          required: ["headline", "topLine", "sections"]
        }
      }
    }
  };

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.openAiApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    return edition;
  }

  const body = await response.json();
  const rawText = body.output?.[0]?.content?.[0]?.text;
  if (!rawText) {
    return edition;
  }

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return edition;
  }

  return {
    ...edition,
    headline: parsed.headline || edition.headline,
    topLine: parsed.topLine || edition.topLine,
    sections: edition.sections.map((section, sectionIndex) => ({
      ...section,
      title: parsed.sections?.[sectionIndex]?.title || section.title,
      items: section.items.map((item, itemIndex) => ({
        ...item,
        title: parsed.sections?.[sectionIndex]?.items?.[itemIndex]?.title || item.title,
        summary: parsed.sections?.[sectionIndex]?.items?.[itemIndex]?.summary || item.summary,
        keyPoints: parsed.sections?.[sectionIndex]?.items?.[itemIndex]?.keyPoints || item.keyPoints,
        strategicWhy:
          parsed.sections?.[sectionIndex]?.items?.[itemIndex]?.strategicWhy || item.strategicWhy
      }))
    }))
  };
}
