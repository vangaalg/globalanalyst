# AutoSignal — AI Automotive Analyst

A production-ready web app that gives your team instant access to the **Analyst Skill** — a structured AI framework for researching any OEM in any country.

Powered by Claude (Anthropic). Deployed on Vercel. API key stored securely server-side — colleagues need no credentials.

---

## What It Does

| Mode | Output |
|------|--------|
| **Mode A — 30-Day Update** | Macro flash, policy snapshot, OEM news card (launches, sales, EV, pricing, investment), analyst commentary |
| **Mode B — Full Analysis** | Country economy deep-dive, auto market snapshot, government policy tracker (90 days), full OEM dossier (~1000 words), model roster, 30-day card |

Covers **any country** — India, Thailand, Indonesia, Germany, USA, South Africa, and more.

---

## Deploy in 5 Minutes

### 1. Fork or clone this repo

```bash
git clone https://github.com/YOUR_USERNAME/autosignal.git
cd autosignal
```

### 2. Push to GitHub

```bash
git add .
git commit -m "Initial AutoSignal deploy"
git push origin main
```

### 3. Import to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Framework preset: **Other** (no build step needed)
4. Click **Deploy**

### 4. Add your API key

In Vercel dashboard → Your Project → **Settings → Environment Variables**:

| Name | Value |
|------|-------|
| `ANTHROPIC_API_KEY` | `sk-ant-...` |

Then go to **Deployments → Redeploy** (so the env var takes effect).

That's it. Share the Vercel URL with your colleagues — no API key needed on their end.

---

## Project Structure

```
autosignal/
├── index.html          # Frontend UI (no build step)
├── api/
│   └── chat.js         # Vercel serverless function (holds API key)
├── vercel.json         # Routing config
└── README.md
```

---

## Cost & Rate Limiting

- All API calls bill to **your** Anthropic account
- Mode A: ~2,000–4,000 tokens per run (~$0.006–$0.012 at Sonnet pricing)
- Mode B: ~6,000–10,000 tokens per run (~$0.018–$0.030)
- Consider adding usage limits in `api/chat.js` if needed

---

## Customisation

- **System prompt**: Edit the `SYSTEM_PROMPT` constant in `api/chat.js`
- **Quick-start prompts**: Edit the `qp-btn` buttons in `index.html`
- **Model**: Change `claude-sonnet-4-5` in `api/chat.js` to use a different Claude model

---

## Security Notes

- The API key is **never** sent to the browser — it lives only in Vercel's environment
- Do not commit `.env` files or hardcode the key anywhere in the frontend
- For internal teams, consider adding a simple shared-secret check in `api/chat.js`
