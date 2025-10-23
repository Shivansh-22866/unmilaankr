# <div align="center"> ⚡ Siqniq: Momentum Tracker Agent ⚡</div>

<h3 align="center"><i>Where Signals Grow. Builders Emerge.</i></h3>

<h1 align="center">
   <img width="1920" height="1080" alt="Signiq Intro" src="https://github.com/user-attachments/assets/2543d942-56dd-4406-ba22-9286834b528a" />
</h1>


**Siqniq** is a real-time signal engine that tracks project activity across multiple dimensions — **GitHub**, **Socials**, **Onchain**, and **Community** — to generate federated momentum scores, trend breakdowns, and AI-powered insights using **RAG pipelines**.

> Built for builders, researchers, and Web3 explorers who seek early signals, actionable data, and project health intelligence.

---

## ✨ Key Features

- 🧠 **AI Insights** across GitHub, Onchain, and Discord via **Groq + AI SDK**
- 🧩 **Federated Momentum Scoring** across multiple project signal streams
- 🔍 **Anomaly Detection** + trend shift monitoring with EMA models
- 📊 **Insight Dashboard** with stacked area breakdowns and time-series charts
- 🔌 **Real APIs & Scrapers** (GitHub, Etherscan, Uniswap, Nitter, Discord)
- 🧱 Built with **Next.js App Router**, **TailwindCSS**, **Groq SDK**, and **Recharts**

---

---

## 📄 Whitepaper
| Section                 | Description                                                                                                                                                                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Vision & Philosophy** | Unmilaankr empowers builders, analysts, and researchers to detect signals early and evaluate community-backed innovation. Inspired by the Sanskrit–Prakrit term *Unmīla*, we believe great projects germinate silently — and deserve visibility. |
| **Core Modules**        | Modular momentum agent system with GitHub, Discord, Onchain fetchers, federated scoring, anomaly detectors, and RAG (Retrieval-Augmented Generation) AI insight generation.                                                                      |
| **Scoring Framework**   | Momentum scores are calculated using weighted time-series EMA models over activity vectors from multiple sources, including GitHub commits, token liquidity, and Discord message churn.                                                          |
| **RAG-based Insights**  | Powered by Groq (LLaMA-3) and optionally Gemini Pro, our structured object responses highlight risk levels, key drivers, and actionable suggestions per stream.                                                                                  |
| **Onchain Footprint**   | The system is Solana-native, with deployment pipelines planned for compressed NFTs, wallet-based dashboards, and token-triggered access.                                                                                                         |
| **Token Utility**       | The native \$UNKR token will enable usage-tiered access, API credits, and insight personalization modules. Governance modules to follow.                                                                                                         |
| **Roadmap**             | See below — includes Telegram integration, Farcaster signal ingestion, mobile dashboards, and RAG-as-a-service tooling.                                                                                                                          |

🔗 [Read the Full Whitepaper](/public/whitepaper_signiq.pdf)



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
git clone https://github.com/Shivansh-22866/unmilaankr.git
cd unmilaankr
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
  <img width="1000" height="550" alt="Screenshot_20250807_022418" src="https://github.com/user-attachments/assets/b57e43da-65d1-45ad-8c1b-77d545f2c4dd" />

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


## 🔮 Future Additions
📥 Wallet-based dashboards

📲 Mobile-optimized dashboards

🔌 Plugin system for new fetchers

⛓️ Solana-native onchain indexer

🔁 Gemini + LLaMA hybrid AI engine

🔗 Farcaster feeds + influencer mapping

## 🚀 Planned Roadmap (Late 2025 → Q3 2026)

| Quarter	 |	Milestone	|
| --- | --- |
| Q4 2025	 |	Project rebrand, Solana deployment, Telegram integration |
| Q1 2026	 |	Wallet-based dashboards, real-time alerts |
| Q2 2026	 |	Plugin system for signal customizations |
| Q3 2026	 | RAG-as-a-service, zkProof of Alignment |

