🚀 DataForge Hub - Verifiable AI Datasets on Filecoin Onchain Cloud

DataForge Hub is the premier decentralized marketplace for cryptographically verifiable AI datasets, powered by Filecoin Onchain Cloud. We solve AI bias from centralized data silos (80% from 5 giants) by enabling trustless, fast, and fair data access. Wave 2 MVP: From design blueprints to live testnet execution – real contract NFT mints, PDP dashboards, FilCDN previews, and Pay rails.
🌟 Live Demo: https://dataforge-verify.vercel.app/
📱 Mobile-Ready: Responsive UX, dark/light mode.
🔗 Contract Explorer: Filfox Calibration
🎥 Demo Video: Watch 1-Min Walkthrough (Embed YouTube/Loom here)

🎯 Why DataForge Hub? (The AI Data Revolution)
AI models reflect their data – but centralized sources breed bias, opacity, and scarcity. DataForge Hub democratizes AI training data:

* Verifiable Provenance: PDP proofs ensure data integrity (no tampering).
* Fast Access: FilCDN for <1s global retrieval.
* Fair Monetization: Filecoin Pay for streaming/one-time rails, tied to SLAs.
* Bias-Free Marketplace: Community-voted quality, diversity charts for ethical AI.

Target Users: AI/ML devs, researchers, DePIN operators – need auditable, bias-reduced datasets.
PMF Validation: Wave 2 MVP proves full-stack feasibility; Wave 3: Real Synapse + partnerships (e.g., Hugging Face).
🚀 Wave 2 MVP: Key Features
From Wave 1 designs to executable code – we've built a frictionless dApp showcasing Filecoin depth.
📋 Core Flows

1. Browse Datasets (/browse): Search/filter (name/price/AI category), sortable cards with PDP badges. Mock 5+ datasets; infinite scroll.
2. Dataset Details (/dataset/:id): Immersive view with Data Integrity Dashboard:

PDP Calendar: Recharts heatmap (green/red 30-day proofs, 95% success).
Bias Viz: Interactive pie/bar charts (e.g., 60% demographic diversity).
Paid Preview: Micro-payment unlocks FilCDN sample (image/table).


3. List Dataset (/list): Form (name/desc/CID/price/verified). Mocks Synapse PDP → Connect wallet → registerDataset mints NFT (ERC721).
4. Buy & Access: Toggle one-time/streaming → processPayment tx. Sim: "10 USDFC/30 days, pause on failed PDP."
5. Dashboard (/dashboard): Profile (wallet/balance), owned datasets (via balanceOf + getDataset), earnings from Pay events. "Verify PDP" mocks Synapse challenge.

🌟 Filecoin Onchain Cloud Integrations (Full-Stack Depth)

* Synapse SDK Mock: "Orchestrating ProofSet..." in listing; dashboard button simulates hot storage.
* PDP: Contract isVerified flag; disables buys if false. Beyond storage: Enables "hot" AI previews.
* FilCDN: Fetch previews (https://gateway.filcdn.io/ipfs/${cid}) – <1s SLA, fallback placeholders.
* Filecoin Pay: USDFC rails via processPayment; emits events for streaming (daily on PDP success).
* Compliance: Ownable RBAC; NFT provenance tracks ERC721 transfers.

UX Polish: No early wallet (connect on action), tx sims/modals, animations (Framer Motion: hovers/slides), toasts (react-hot-toast), mobile-responsive (Tailwind sm/md/lg).

(Add screenshot: Dashboard with charts)
📊 Wave 1 → Wave 2 Progress
AspectWave 1 (Design)Wave 2 (MVP)ArchitectureDiagrams (PDP/CDN/Pay flows)Live testnet deploy (Vercel + Calibration)ContractConceptual ERC721 registryDeployed Solidity (OpenZeppelin secure; addr: 0x569C43c4...)FrontendStatic prototypesReact app with Ethers.js calls (async txs, error handling)IntegrationsService plansReal mocks (Synapse/PDP/FilCDN/Pay) + dashboard viz (Recharts)UXWireframesFrictionless flows, animations, tx sims; mobile-optimizedValidationGTM strategyEnd-to-end testing: Mint NFT → View dashboard → Mock buy/preview
Criteria Hit: Deep integration (30%: Full-stack mocks + txs), Creativity/UX (20%: Unique dashboard), Execution (25%: Stable code/docs), Progress (10%: Design → MVP), Engagement (15%: Cohort feedback).
🛠 Tech Stack
Frontend

* React 18+: Hooks/Context for state (wallet/datasets).
* Tailwind CSS: Dark mode gradients (#3B82F6-#8B5CF6), glassmorphism (blur hovers).
* React Router: Page navigation.
* Recharts: PDP/bias charts (heatmaps, pies).
* Framer Motion: Animations (fades, scales, confetti).
* Lucide React: AI/data icons.
* react-hot-toast: Error/success toasts.

Blockchain

* Ethers.js v6: FVM provider (Calibration RPC: https://calibration.filfox.info/rpc/v1, Chain ID: 3141592, tFIL).
* Solidity 0.8.20: DatasetRegistry.sol (ERC721 + Ownable; import OpenZeppelin).
* MetaMask + Filecoin Snap: Wallet connect/switch.

Deployment

* Vercel: Auto-deploy from GitHub (env vars: RPC/CHAIN_ID/ABI).
* No Backend: Direct contract calls + localStorage mocks.

Key Files

* /src/App.js: Router + WalletProvider.
* /contracts/DatasetRegistry.sol: Smart contract (compile/deploy via Remix).
* /src/config/contract.js: ABI + address.
* /public/favicon.ico: Custom AI icon.

⚡ Quick Start (5 Mins)
Prerequisites

* Node.js 18+.
* MetaMask + Filecoin Snap (for testing).
* tFIL from faucet: Calibration Faucet.

Setup

1. 
Clone & Install:
bashDownloadCopy code Wrapgit clone https://github.com/mohamedwael201193/dataforge-verify.git
cd dataforge-verify
npm install  # Installs: ethers, tailwindcss, react-router-dom, recharts, framer-motion, lucide-react, react-hot-toast

2. 
Env Vars (Copy .env.example to .env):
REACT_APP_RPC_URL=https://calibration.filfox.info/rpc/v1
REACT_APP_CHAIN_ID=3141592
REACT_APP_CURRENCY=tFIL
REACT_APP_CONTRACT_ADDRESS=0x569C43c4Cb8e332037Bc02ae997177F35cd8a017
REACT_APP_ABI=[Full ABI JSON - paste from Remix or below]


3. 
Run Locally:
bashDownloadCopy code Wrapnpm start  # http://localhost:3000

Test: Browse → List dataset (connect MetaMask) → Mint NFT → Dashboard.


4. 
Deploy:

Vercel: Connect GitHub repo → Deploy (auto-builds on push).
Netlify: Drag ZIP or GitHub link.



Smart Contract ABI (Embed in Env)
jsonDownloadCopy code Wrap[
  {"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_description","type":"string"},{"internalType":"string","name":"_cid","type":"string"},{"internalType":"uint256","name":"_price","type":"uint256"},{"internalType":"bool","name":"_isVerified","type":"bool"}],"name":"registerDataset","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"processPayment","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"getDataset","outputs":[{"components":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"string","name":"cid","type":"string"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"bool","name":"isVerified","type":"bool"}],"internalType":"struct DatasetRegistry.Dataset","name":"","type":"tuple"}],"stateMutability":"view","type":"function"}
  // Full ABI: Include all ERC721/Ownable/events from Remix export
]
Testing on Testnet

* Deploy Contract: Remix IDE → Solidity Compiler (0.8.20) → Deploy to Injected (MetaMask Calibration).
* Verify Tx: After mint/buy, check Filfox for events (DatasetRegistered, PaymentProcessed).
* Troubleshooting:

Wallet Error: Switch to Calibration (Chain ID 3141592, filfox RPC). Install Filecoin Snap.
No tFIL: Faucet request – wait 1 min.
Tx Fails: Check gas (0.01 tFIL), owner (deployer wallet for register).
Mocks Not Loading: Clear localStorage; refresh.
RPC Issues: Fallback to env var; test provider in console.



🤝 Contributing

1. Fork → Clone → Create branch (git checkout -b feature/amazing-feature).
2. Commit (git commit -m "Add PDP viz enhancement").
3. Push → PR to main.
4. Ideas: Real Synapse integration, ML bias detection, DAO voting.

Guidelines: Semantic commits, TypeScript where possible, test txs on testnet.
📄 License
MIT License – Free to use, fork, and build upon. See LICENSE.
🙌 Acknowledgments

* Filecoin Team: Onchain Cloud docs, Calibration testnet.
* OpenZeppelin: Secure contracts.
* Lovable.dev: AI-assisted MVP generation.
* Community: Wave 2 feedback from standups.

