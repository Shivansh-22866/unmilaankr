# <div align="center"> ⚡ SCéAL.AI: Momentum Tracker Agent ⚡</div>
<h1 align="center">
  <img width=400 height=400 src="https://github.com/user-attachments/assets/f50d80e8-b0e9-46cb-ae1f-e8b949949287" />
</h1>

**SCéAL.AI** is an AI-powered analytics engine that monitors project activity across multiple channels — **GitHub**, **Twitter**, **Onchain**, and **Community (Discord)** — and distills it into real-time momentum scores, anomaly alerts, and AI-generated insights.

> Built for founders, investors, analysts, and ecosystem explorers who want to track Web3 project activity and signals in one unified intelligence dashboard.

---

## ✨ Features

- 🧠 **AI Insights** from GitHub, Onchain, and Discord data via **Groq + LLaMA**
- 📊 **Momentum Scoring** across GitHub, Twitter, Onchain, and Community streams
- 🔎 **Anomaly Detection** & time-series trend analysis
- 💡 **Insights Dashboard** with breakdown cards, sparkline visualizations, and highlights
- 🔌 **Modular Fetchers** with real APIs (GitHub, Etherscan, Uniswap, Discord)
- 🧱 Built with **Next.js App Router**, **Groq SDK**, **Tailwind CSS**, and **Recharts**

---

## 🧱 Architecture Overview

```txt
.
├── app/
│   ├── github/               → GitHub Analytics page
│   ├── onchain/              → Onchain Token Analytics page
│   ├── discord/              → Discord Activity Analytics
│   └── components/           → Visualizations, charts, cards
│
├── lib/
│   ├── agents/               → Momentum Agent core & time-series logic
│   ├── data/                 → Fetchers: GitHub, Twitter, Onchain, Discord
│   ├── ai/                   → AI Insight generators using Groq + Vercel SDK
│   └── scoring/              → Scoring logic, anomaly detection, trend tracking
│
├── types/                    → Shared types: `MomentumData`, `MomentumScore`, etc.
├── public/                   → Assets and visual elements
└── api/                      → Routes for GitHub, Discord, and Onchain metrics
```
## ⚙️ Setup Instructions

1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/momentum-tracker.git
cd momentum-tracker
```

2. Install the dependencies
```bash
# Using pnpm
pnpm install

# or npm
npm install
```

3. Create a .env.local file
```bash
GITHUB_TOKEN=github-api-key
TWITTER_BEARER_TOKEN=twitter-dev-api-key
ETHERSCAN_API_KEY=api-key
ALCHEMY_RPC_URL=alchemy-rpc-url
GROQ_API_KEY=your-groq-api-key
DISCORD_TOKEN=your-discord-token
```

#### Note: Ensure that the discord bot has enough privileged permissions to read a channel's messages, otherwise it may lead to fault during data fetching.

4. Run the dev server
```bash
npm run dev
# or
pnpm dev
```
Open `localhost:3000` to get started

## 📊 Data Streams & Insights
Each tab uses specialized fetchers + LLaMA models to summarize activity into clear insights.

### 🟣 GitHub
- Metrics: Stars, Forks, PRs, Issues, Velocity, Contributors
- AI: Health summary + growth suggestions

### 🟢 Onchain
- Metrics: Volume, Transactions, Holders, DEX Pairs, Liquidity
- AI: Token flow and liquidity risk analysis

### 🔵 Discord
- Metrics: Messages, Active Users, Message Length, Top Contributors
- AI: Community health + engagement anomalies

## 🔍 Anomaly & Trend Detection
Momentum Tracker uses:
- 📈 Moving averages for smoothed time-series
- ⚠️ Trend change detection via average deltas
- 🔔 Spike alerting with variance & threshold logic
- ⛓️ Federated breakdowns: Discord + Onchain + GitHub in unified cards

## 🧪 Modules
- MomentumAgent – Central orchestrator
- TimeSeriesAnalyzer – EMA, trend detection, federated breakdown
- AnomalyDetector – Spike & pattern detection
- AI Insights – Groq-generated text over GitHub, Onchain, Discord data
- GitHubDataFetcher – REST API for velocity, PRs, contributors
- OnchainDataFetcher – Etherscan + DeFiLlama + Dexscreener
- DiscordDataFetcher – Reads server messages with bot token

<h1 align="center">
  <img src="https://github.com/user-attachments/assets/70e7988a-7700-4182-89b9-022e48f19ce0" widht=500 height=500 />
</h1>


## 🧠 AI-Powered Insight Modules
We use Groq's LLaMA-3 to generate structured object insights:
```ts
{
  summary: string;
  outlook: "bullish" | "bearish" | "neutral";
  keySignals: string[];
  riskLevel: "low" | "medium" | "high";
  reason: string;
}
```

Supported generators:
- `generateGitHubInsight(metrics)`
- `generateOnchainInsight(metrics)`
- `generateDiscordInsight(stats)`

## 📈 Visualizations
- `Recharts` for AreaCharts (Time Series)
- `Framer Motion` for animated cards
- `Lucide` for iconography
- `Tailwind CSS` for glassmorphism UI
- `Next.js App Router` for isolated tab routing

## 📊 Evaluation & Diagrams
Below is an example evaluation breakdown (optional to include as a Jupyter notebook):

| Metric Type |	Inputs	|  Aggregation Engine |	Output |
| --- | --- | --- | --- |
| GitHub |	stars, forks, commits, PRs |	TimeSeriesAnalyzer |	GitHub Momentum Score |
| Onchain |	tx count, holders, liquidity |	Weighted Aggregation |	Onchain Activity Score |
| Discord |	messages, user counts |	AI + Stats |	Community Health Score |
| RAG |	All combined data	| LLM (Groq) | AI-generated Insights + Alerts |


## 🚀 Future Enhancements
- 🧩 Telegram & Reddit community integration
- 📥 Wallet-based custom momentum dashboards
- 🔔 Real-time notifications on momentum spikes
- 📊 CSV/JSON data export for research
- 🔌 Plugin architecture for data pipelines

## 🙌 Credits & Acknowledgments
This project would not be possible without the contributions and technology from:
### Core Libraries
- Next.js
- TailwindCSS
- Framer Motion
- Lucide Icons
- Recharts
- React ScrollArea
- zod

### AI & RAG
- Groq — LLM inference on llama3-8b/70b
- AI SDK — AI integration framework

### Data Providers
- GitHub API
- Etherscan API
- DeFiLlama
- Dexscreener
- Discord API
- Nitter / Puppeteer Scrapers for Twitter alternatives

### Visualization
- Particles.js
- Gradient Hero Backgrounds

## Built with ❤️ for the OnlyFounders AI Hackathon
