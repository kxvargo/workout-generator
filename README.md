# Workout + Playlist Generator
Endorphin Designs — AI-powered class design with matched music.

## Deploy to Netlify

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "initial commit"
gh repo create workout-generator --private --push
```

### 2. Connect to Netlify
- Go to app.netlify.com → Add new site → Import from Git
- Select your repo
- Build settings are auto-detected from `netlify.toml`

### 3. Add your API key
In Netlify dashboard → Site settings → Environment variables:
```
ANTHROPIC_API_KEY = sk-ant-...
```

### 4. Deploy
Netlify will build and deploy automatically. Your app will be live at:
`https://your-site-name.netlify.app`

---

## Run locally

```bash
npm install
npm run dev
```

For local dev with the Netlify function, install the Netlify CLI:
```bash
npm install -g netlify-cli
netlify dev
```
This runs both the Vite dev server and the function at `http://localhost:8888`.

## Project structure
```
├── netlify/
│   └── functions/
│       └── claude.js        # Serverless function (proxies Anthropic API)
├── src/
│   ├── main.jsx             # React entry point
│   └── App.jsx              # Main app
├── index.html
├── netlify.toml             # Netlify build config
├── vite.config.js
└── package.json
```
