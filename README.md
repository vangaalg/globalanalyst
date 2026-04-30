# GlobalAnalyst — AI Automotive Intelligence

A bright, clean chat interface for automotive analyst research. Powered by Claude. Deployed on Vercel. No API key needed for colleagues.

## Deploy

1. Push this folder to a GitHub repo
2. Import to [vercel.com](https://vercel.com) → Framework: **Other** → Deploy
3. Vercel → Settings → Environment Variables → add `ANTHROPIC_API_KEY` = `sk-ant-...`
4. Redeploy → share the URL

## Structure

```
globalanalyst/
├── index.html       ← full frontend, single file
├── api/
│   └── chat.js      ← serverless function (holds API key)
├── vercel.json      ← routing
├── package.json     ← Node.js detection
└── README.md
```

## Features

- Bright white editorial design
- Central chat interface with streaming responses
- Mode A (30-day update) / Mode B (full dossier) toggle
- Quick-start research cards
- Live "Recently Researched" feed
- Markdown rendering with tables, blockquotes, code
- Copy button on every response
- Mobile responsive

## Cost

- Mode A: ~2,000–4,000 tokens (~$0.006–$0.012 per query)
- Mode B: ~6,000–10,000 tokens (~$0.018–$0.030 per query)
- All usage billed to your Anthropic account
