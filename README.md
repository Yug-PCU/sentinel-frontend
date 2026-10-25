# Sentinel frontend

Web interface for Sentinel, a financial scam detector. Users paste an investment
message (and optionally a link from it), and Sentinel returns an evidence-backed
risk report: a 0–100 score and verdict, every warning sign ranked by severity, the
exact phrases behind each one highlighted in the original message, and a
plain-text copy of the report to send to a bank or fraud hotline.

Built with React 19, Vite 8, and Tailwind CSS 4. This repo is the frontend. The
analysis runs in the sibling `sentinel-backend` service at `POST /analyze`; there
is no mock mode in the app.

## Getting started

Start the backend first:

```bash
cd sentinel-backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

Then start the frontend:

```bash
cd sentinel-frontend
npm install
npm run dev        # http://localhost:5173
```

Requires Node.js 22.22+, 24.15+, or 26+. These versions are required by the test
tools; `dev` and `build` alone also run on Node 20.19+.

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload. Forwards `/analyze` to the backend. |
| `npm test` | Runs the test suite once (Vitest + Testing Library). `npm run test:watch` re-runs on save. |
| `npm run lint` | Lints with Oxlint. |
| `npm run build` | Production build into `dist/`. |
| `npm run preview` | Serves `dist/` locally, with the same `/analyze` forwarding as `dev`. |

## Configuration

Copy `.env.example` to `.env.local` (git-ignored) and edit it. Restart the dev
server after any change, because `VITE_*` values are compiled into the bundle.

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | empty | Backend origin for production, e.g. `https://api.example.com`. Empty means same origin. |
| `VITE_REQUEST_TIMEOUT_MS` | `30000` | How long to wait for the backend before showing a timeout error. |
| `API_PROXY_TARGET` | `http://localhost:8000` | Dev/preview server only: where `/analyze` requests are forwarded. |

In development, the browser sends requests to the Vite dev server, which forwards
them to `API_PROXY_TARGET`. The backend doesn't need CORS for local development.
If the backend isn't running, the app shows "isn't available right now (HTTP 502)"
along with a hint about `API_PROXY_TARGET`.

For production, pick one:

- **Same origin (simplest):** serve `dist/` and the backend from one domain, and
  route `/analyze` to the backend (for example, with a reverse proxy).
- **Separate origins:** build with `VITE_API_BASE_URL=https://your-backend` and
  enable CORS on the backend for the frontend's origin. Because requests send
  `Content-Type: application/json`, browsers first send an `OPTIONS` preflight,
  which the backend must answer.

## API contract

### Request

`POST /analyze` with `Content-Type: application/json`:

```json
{
  "message": "Our AI trading bot guarantees 40% returns every month…",
  "url": "https://vip-crypto-returns.example/join"
}
```

- `message`: trimmed, non-empty, up to 5,000 characters.
- `url`: `null` when the user leaves the field empty. If the user types a link
  without a scheme, `https://` is added (`example.com/x` → `https://example.com/x`).
  Otherwise the link is sent exactly as typed. Only `http` and `https` links are
  accepted.

### Response (200)

```json
{
  "risk_score": 87,
  "risk_level": "high",
  "warnings": [
    {
      "title": "Guaranteed high returns",
      "description": "Promises 40% monthly returns with no risk. Legitimate investments can't guarantee returns.",
      "severity": "critical",
      "evidence": ["guarantees 40% returns", "zero risk"]
    }
  ]
}
```

| Field | Rules |
| --- | --- |
| `risk_score` | Required. A number from 0 to 100 (a numeric string also works). Anything else shows an "Unexpected response" error. Note: send 87, not 0.87. |
| `risk_level` | `low`, `medium`, `high`, or `critical`. Case and `_risk` suffixes are ignored, and `moderate` counts as `medium`. Other values are shown as-is in neutral colors. If missing, the frontend derives it from the score: 0–24 low, 25–49 medium, 50–74 high, 75–100 critical. |
| `warnings` | A list. Missing or `null` means no warnings. Each item can be a plain string (shown as the title) or an object. |

Warning object fields:

| Field | Also accepted | Notes |
| --- | --- | --- |
| `title` | `name`, `label`, `type`, `category` | Short name of the warning sign. |
| `description` | `explanation`, `details`, `detail`, `reason`, `message` | The plain-language explanation. |
| `severity` | `level`, `risk_level` | `low`, `medium`, `high`, or `critical`. Optional. |
| `evidence` | | Optional string or list of strings quoted from the message. |

The response normalizer accepts this shape from the Sentinel backend and also the
older lowercase/alternate field names above, so the UI stays tolerant of contract
drift.

### Errors

For any non-2xx status, the UI shows an error state with a **Try again** button.
If the body is JSON, the frontend shows its `detail`, `error`, or `message` field.
FastAPI-style validation lists (`detail: [{ "msg": … }]`) and `text/plain` bodies
also work. Network failures, timeouts, non-JSON 200 responses, and cancellations
each get their own handling.

## Project structure

```
src/
├── main.jsx               Entry point: font, global CSS, <App />
├── App.jsx                Page layout
├── index.css              Tailwind setup, theme colors (navy, risk scale), gauge animation
├── config.js              Reads the VITE_* settings above, plus input length limits
├── api/
│   ├── analyze.js         analyzeMessage(): real POST /analyze, timeout, error handling
│   ├── normalize.js       Checks the response JSON and converts it for the UI
│   └── errors.js          AnalysisError with kind: network | timeout | http | invalid_response
├── hooks/
│   ├── useAnalysis.js     Request state (idle → loading → success | error), cancel, retry
│   ├── useMediaQuery.js   Media queries, including reduced motion
│   ├── useInView.js       "Has this scrolled into view?" for reveal animations
│   └── useScrollTracking.js  The active section for the nav
├── lib/
│   ├── risk.js            Risk level labels, summaries, advice, and level normalization
│   ├── report.js          Report analysis: severity ranking and counts, evidence highlighting, text export
│   └── validation.js      Form validation and link normalization
├── data/
│   └── samples.js         "Try an example" messages
├── components/
│   ├── Analyzer.jsx       Holds the form state and connects the form to the results panel
│   ├── AnalyzerForm.jsx   Message box, optional link, examples, Analyze / Cancel / Clear
│   ├── ResultsPanel.jsx   Empty, loading, error, and report states
│   ├── RiskReport.jsx     Verdict, metrics, ranked warning signs, evidence, actions, copy report
│   ├── RiskGauge.jsx      0–100 semicircle meter
│   ├── RiskBadge.jsx      Risk category pill (icon + label)
│   ├── ReportMetrics.jsx  Stat tiles: warning count, top severity, evidence coverage, link
│   ├── SeverityBreakdown.jsx  Stacked bar and legend of warning signs per severity
│   ├── WarningList.jsx    Numbered warning signs, most severe first, with quoted evidence
│   ├── AnnotatedMessage.jsx   The message with evidence highlighted and linked to its warning sign
│   ├── Frame.jsx          Sticky header with section nav and a mobile menu
│   ├── Hero.jsx, HeroScene.jsx   Headline plus the 3D "scam radar" card (wide screens; static fallback without WebGL)
│   ├── scene/RadarScene.js       The three.js scene, loaded on demand in its own chunk
│   ├── SectionHeader.jsx, HowItWorks.jsx, RedFlags.jsx, Footer.jsx
│   ├── fx/Reveal.jsx      Fade-in on scroll
│   ├── Logo.jsx
│   ├── riskTones.js       Colors and icons for each risk level
│   └── ui.js              Shared button and card classes
└── test/setup.js          Test setup
```

Tests sit next to the code they cover (`*.test.js` / `*.test.jsx`).
`App.test.jsx` covers the full form → request → report flow with `fetch` stubbed;
`App.live.test.jsx` covers backend errors, retry, and network failures.

## Design notes

- Dark navy surfaces with teal accents. Text colors are at least 6:1 contrast
  against the surfaces they appear on (disabled controls excepted).
- Risk colors (green → amber → orange → red) are used only for risk, and always
  appear with an icon and a text label, never color alone.
- Accessibility: labeled form fields that move focus to the first error, a
  screen-reader announcement when an analysis finishes, an ARIA `meter` for the
  score, and reduced-motion support.
- Fonts are bundled locally (Inter for text and data, Archivo for headlines,
  JetBrains Mono for labels), so pages make no requests to third-party font hosts.
- The analysis is the focus: the page leads straight into the analyzer, and the
  report favors evidence (ranked findings, highlighted quotes, counts) over
  decoration. Motion is limited to the 3D radar, the gauge sweep, the loading
  scan line, and subtle scroll reveals. With "reduce motion" turned on in the
  operating system, all of it is off and the 3D scene renders a single still frame.
- three.js (~140 kB gzipped) loads in a separate chunk after the page renders,
  and only on screens wide enough to show the radar, so it never delays the analyzer.
