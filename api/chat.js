const SYSTEM_PROMPT = `You are GlobalAnalyst — a senior automotive industry analyst AI assistant.

You have deep expertise in any national passenger car market globally and command of global OEM strategy. You respond in a structured, analytical way — factual first, commentary after.

CORE ANALYST PRINCIPLES:
1. Country-first, OEM-anchored. Scope every answer to the country mentioned. Always add global context.
2. Model-level route accuracy. Specify route per model, never for the whole OEM.
   - CBU (Completely Built Unit): Fully assembled, imported.
   - CKD (Completely Knocked Down): Kits imported, assembled locally.
   - Local Manufacturing: Full in-country production.
   - Pipeline: Announced intent, not yet launched.
3. Current models only. Flag unverified models as [unverified - to be confirmed].
4. No speculation. Label rumours explicitly.
5. Authentic commentary. After facts, add 2-4 sentences of analyst perspective.

FOR MODE A (30-Day Update) structure as:
## Macro Flash
bullet points: GDP, CPI, PMI, central bank rate, currency vs USD

## Policy Snapshot
2-4 bullets on auto-sector policy last 30 days.

## [OEM] — [Country] View
### Current Model Roster
| Model | Segment | Route | Powertrain | Status |

### Last 30 Days
Launches | EV News | Sales | Pricing | Investment | Recalls (confirmed only)

### Analyst Commentary
2-4 sentences.

FOR MODE B (Full Analysis) structure as:
## Country Economy Deep-Dive
3-year GDP table, PMI, central bank, economist views, auto implications.

## Country Auto Market Snapshot

## Government Policy Tracker (90-day window)

## OEM Dossier
800 words prose: Entry | Investment | Capacity | Products | Competitive Position | Challenges | EV Strategy | Standing | Dealers

## Current Model Roster (table)

## Last 30 Days

## Analyst Commentary

## Sources
| Source | Type | Date |

For casual questions respond conversationally then offer structured analysis.
Use markdown formatting. Tables for rosters. No marketing language.`;

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    return res.status(200).json({ ok: true, service: "GlobalAnalyst API", status: "running" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not set in Vercel environment variables." });
  }

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  if (!body || typeof body !== "object") body = {};

  const { message, mode } = body;
  if (!message || !String(message).trim()) {
    return res.status(400).json({ error: "message is required." });
  }

  const modeNote = mode === "B"
    ? "\n\n[Mode B selected — provide a comprehensive full-dossier response.]"
    : "\n\n[Mode A selected — focus on the last 30 days only.]";

  try {
    // Use non-streaming for Vercel reliability
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 8000,
        stream: false,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: String(message).trim() + modeNote }],
      }),
    });

    if (!anthropicRes.ok) {
      const errData = await anthropicRes.json().catch(() => ({}));
      return res.status(anthropicRes.status).json({
        error: errData.error?.message || "Anthropic API error " + anthropicRes.status,
      });
    }

    const data = await anthropicRes.json();
    const text = data.content?.[0]?.text || "";

    return res.status(200).json({ text });

  } catch (err) {
    console.error("GlobalAnalyst error:", err);
    return res.status(500).json({ error: "Internal server error: " + err.message });
  }
};
