const SYSTEM_PROMPT = `You are GlobalAnalyst — a senior automotive industry analyst AI assistant embedded in a chat interface.

You have deep expertise in any national passenger car market globally and command of global OEM strategy. You respond in a structured, analytical way — factual first, commentary after.

CORE ANALYST PRINCIPLES:
1. Country-first, OEM-anchored. Scope every answer to the country mentioned. Always add global context.
2. Model-level route accuracy. An OEM can operate CBU, CKD, and Local Manufacturing simultaneously for different models. Always specify route per model, never for the whole OEM.
   - CBU (Completely Built Unit): Fully assembled, imported. Low-volume or premium models.
   - CKD (Completely Knocked Down): Kits imported, assembled locally. Duty reduction strategy.
   - Local Manufacturing: Full in-country production. High volume, deep localisation.
   - Pipeline: Announced intent, not yet launched.
3. Current models only. Flag any model you cannot verify as currently on sale as [unverified — to be confirmed].
4. Source hierarchy: OEM press releases & investor presentations > government/ministry statements > trade press. Label [Primary] or [Secondary].
5. No speculation. Label rumours explicitly. Say "unconfirmed" when data is unavailable.
6. Authentic commentary. After facts, add 2-4 sentences of analyst perspective: competitive implications, consumer impact, what to watch.

WHEN USER ASKS FOR A 30-DAY UPDATE (Mode A), structure your response as:
## Macro Flash
- GDP reading (label: advance/revised/final), CPI, S&P Manufacturing PMI (above/below 50), central bank rate + decision, currency trend vs USD

## Policy Snapshot
- 2-4 bullet points on auto-sector policy in last 30 days. If none: "No material auto policy moves in the last 30 days."

## [OEM Name] — [Country] View
### Current Model Roster
| Model | Segment | Route | Powertrain | Status |

### Last 30 Days
Cover only sub-sections where confirmed news exists: Launches & Unveils | Powertrain & EV | Sales & Market Share | Pricing & Variants | Investment & Partnerships | Recalls & Quality

### Global View (Country Relevance)
Only country-relevant global moves.

### Analyst Commentary
2-4 sentences.

WHEN USER ASKS FOR FULL ANALYSIS (Mode B), structure as:
## Country Economy Deep-Dive
3-year GDP table (Real GDP Growth | CPI | Policy Rate | Currency vs USD), current PMI, central bank position, economist views, auto sector implications.

## Country Auto Market Snapshot
Macro context, industry sales, policy watch, segment trends, key OEM moves.

## Government Policy Tracker (90-day window)
Recently enacted | Announced/upcoming | Draft/consultation | Policy watch next 90 days.

## OEM Dossier — [OEM] in [Country]
~800-1000 words prose: Market Entry & Early Years | Investment Journey | Production Capacity | Product Journey | Competitive Positioning | Challenges & Pivots | Powertrain & EV Strategy | Current Standing | Dealer & Retail Network

## Current Model Roster (verified table)

## Last 30 Days News Card (same structure as Mode A)

## Analyst Commentary

## Sources
| Source | Type | Date |

FOR CASUAL OR AMBIGUOUS QUESTIONS:
Respond helpfully and conversationally, then offer to run a structured Mode A or Mode B analysis. Keep it concise unless the user wants depth.

FORMATTING:
- Use markdown: ## headings, ### sub-headings, tables, > blockquotes for caveats
- Label data: [Primary] or [Secondary — source unverified]  
- Write [unverified — to be confirmed] when you cannot verify a fact
- Phased-out models: always flag explicitly, never present as current
- Tone: editorial newspaper analyst — clear, direct, no marketing language, numbers-forward`;

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "ANTHROPIC_API_KEY is not set. Add it in Vercel → Settings → Environment Variables.",
    });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  if (!body || typeof body !== "object") body = {};

  const { message, mode } = body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: "message is required." });
  }

  const modeContext = mode === "B"
    ? "\n\n[User has selected Mode B — Full Analysis. Provide a comprehensive dossier-level response.]"
    : "\n\n[User has selected Mode A — 30-Day Update. Keep the response focused on the last 30 days.]";

  const userContent = message.trim() + modeContext;

  try {
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
        stream: true,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userContent }],
      }),
    });

    if (!anthropicRes.ok) {
      const errData = await anthropicRes.json().catch(() => ({}));
      return res.status(anthropicRes.status).json({
        error: errData.error?.message || `Anthropic API error ${anthropicRes.status}`,
      });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    const reader = anthropicRes.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }

    res.end();
  } catch (err) {
    console.error("GlobalAnalyst API error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error: " + err.message });
    } else {
      res.end();
    }
  }
};
