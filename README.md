# ChainFund — Decentralized Crowdfunding

A full-stack Web3 crowdfunding dApp built on **Ethereum Sepolia testnet**. Contributors fund campaigns with **USDT** (ERC-20). Everything runs through a smart contract — no backend, no middlemen.

Built by [Mudassir Khan](https://mudassirkhan.me)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Blockchain | Ethereum Sepolia testnet |
| Smart Contracts | Solidity ^0.8.20 |
| Wallet Integration | Reown AppKit + Ethers.js v6 |
| Form Validation | React Hook Form + Zod |
| State Management | Zustand |
| Notifications | Sonner (toast) |

---

## Features

### Wallet
- Connect via MetaMask or any EIP-6963 injected wallet
- Displays connected address (truncated) and USDT balance in the navbar
- Chain enforcement — app only works on Sepolia (chain ID `11155111`)

### Browse Campaigns (Home)
- Lists all on-chain campaigns fetched directly from the smart contract
- Each card shows: title, description, funding progress bar, raised vs goal (USDT), days remaining, and contributor count
- Campaigns sorted newest-first
- Skeleton loading state while fetching
- Falls back to mock data if `NEXT_PUBLIC_CONTRACT_ADDRESS` is not set (useful for UI-only development)

### Campaign Detail Page (`/campaigns/[id]`)
- Full campaign info: title, description, goal, raised, deadline, creator address
- Live progress bar with percentage
- Contribute form (inline, opens as a dialog)
- Withdraw button — visible only to the campaign creator, only enabled when goal is met and funds haven't been withdrawn yet
- Transaction history — lists every contribution with contributor address, amount, timestamp, and a link to Etherscan

### Create Campaign (`/campaigns/create`)
- Form fields: title, description, funding goal (USDT), duration (days)
- Client-side validation via Zod:
  - Title: 5–100 characters
  - Description: 20–1000 characters
  - Goal: 1–10,000,000 USDT
  - Duration: 1–365 days
- Submits `createCampaign(title, description, goal, durationDays)` to the contract
- Redirects to the new campaign's detail page on success

### My Campaigns (`/campaigns/mine`)
- Filters all campaigns to show only those created by the connected wallet

### Contribute Flow
1. User enters USDT amount (min 1, max 100,000 per transaction)
2. App checks the current USDT allowance granted to the contract
3. If allowance is insufficient → sends an `approve()` transaction first
4. After approval confirms (1 block) → sends the `contribute()` transaction
5. Both steps are reflected live in the blockchain loading overlay

### Withdraw Flow
1. Campaign creator clicks Withdraw on the campaign detail page
2. App verifies: caller is the creator, goal has been met, not already withdrawn
3. Sends `withdraw(campaignId)` to the contract
4. Contract transfers all raised USDT directly to the creator's wallet

### Transaction Loading Overlay
- Full-screen animated overlay appears for every pending transaction
- Shows step-by-step status messages ("Waiting for signature...", "Processing on blockchain...", etc.)
- Displays the live transaction hash with a direct link to Etherscan while the tx mines
- Dismissed automatically on confirmation or user rejection

### MockUSDT Faucet
- `MockUSDT.sol` includes a public `faucet()` function
- Call it from Remix or Etherscan to receive **10,000 test USDT** per call, with no limit

---

## User Flows

### Flow 1 — Contributor

```
Connect Wallet
    ↓
Browse campaigns on Home (/)
    ↓
Click a campaign card → Campaign Detail (/campaigns/[id])
    ↓
Click "Contribute" → Enter USDT amount
    ↓
[If allowance < amount]
    Wallet popup: Sign APPROVE transaction
    Wait for 1-block confirmation
    ↓
Wallet popup: Sign CONTRIBUTE transaction
    Wait for 1-block confirmation
    ↓
Success toast + campaign stats refresh live
```

### Flow 2 — Campaign Creator

```
Connect Wallet
    ↓
Click "Create Campaign" → /campaigns/create
    ↓
Fill form (title, description, goal, duration)
    ↓
Wallet popup: Sign CREATE CAMPAIGN transaction
    Wait for 1-block confirmation
    ↓
Redirect to new campaign's detail page
    ↓
[After goal is reached]
Campaign Detail shows "Withdraw Funds" button
    ↓
Click Withdraw → Wallet popup: Sign WITHDRAW transaction
    Wait for 1-block confirmation
    ↓
USDT transferred to creator's wallet
```

### Flow 3 — UI Dev (no contracts deployed)

```
Leave NEXT_PUBLIC_CONTRACT_ADDRESS empty in .env
    ↓
App loads with mock campaign data automatically
All UI, animations, and navigation work normally
No wallet or RPC calls are made for read operations
```

---

## Smart Contracts

Both contracts are deployed to **Sepolia** via Remix IDE.

### MockUSDT.sol
- Standard ERC-20 with 6 decimals (same as real USDT)
- Deployer receives 1,000,000 USDT on deploy
- `faucet()` — anyone can call to receive 10,000 USDT, no limit

### CrowdFunding.sol
- Constructor takes the MockUSDT contract address
- `createCampaign(title, description, goal, durationDays)` — creates a new campaign on-chain
- `contribute(campaignId, amount)` — pulls USDT from contributor into the contract (requires prior ERC-20 approval)
- `withdraw(campaignId)` — creator claims all raised funds (only when `raised >= goal`, only once)
- `getCampaignCount()` — returns total number of campaigns
- `getCampaign(id)` — returns all fields for a single campaign
- `getContributions(campaignId)` — returns the full contribution history for a campaign

**Events:** `CampaignCreated`, `ContributionMade`, `FundsWithdrawn`

---

## Project Structure

```
crowd-funding-dapp/
├── app/
│   ├── page.tsx                      # Home — campaign grid
│   ├── layout.tsx                    # Root layout with Providers
│   ├── globals.css                   # Tailwind base + CSS variables
│   └── campaigns/
│       ├── [id]/page.tsx             # Campaign detail
│       ├── create/page.tsx           # Create campaign form
│       └── mine/page.tsx             # My campaigns
│
├── components/
│   ├── Navbar.tsx                    # Top nav with wallet status
│   ├── Providers.tsx                 # AppKit init + Toaster
│   ├── PageWrapper.tsx               # Fade-in page animation
│   ├── TransactionLoadingScreen.tsx  # Full-screen tx overlay
│   ├── campaigns/
│   │   ├── CampaignCard.tsx
│   │   ├── CampaignDetail.tsx
│   │   ├── CampaignGrid.tsx
│   │   ├── CampaignSkeleton.tsx
│   │   ├── CreateCampaignForm.tsx
│   │   └── ProgressBar.tsx
│   ├── contribute/
│   │   ├── ContributeButton.tsx
│   │   └── ContributeForm.tsx
│   ├── contract/
│   │   └── ContractStatus.tsx
│   ├── transactions/
│   │   ├── BlockchainLoadingScreen.tsx
│   │   ├── TransactionHistory.tsx
│   │   └── TransactionRow.tsx
│   ├── wallet/
│   │   ├── ConnectButton.tsx
│   │   └── WalletStatus.tsx
│   ├── withdraw/
│   │   └── WithdrawButton.tsx
│   └── ui/                           # shadcn/ui primitives
│
├── hooks/
│   ├── useWeb3.ts                    # Wallet provider + address
│   ├── useCampaigns.ts               # Fetch all campaigns
│   ├── useCampaign.ts                # Fetch single campaign
│   ├── useCreateCampaign.ts          # Create campaign transaction
│   ├── useContribute.ts              # Approve + contribute transaction
│   ├── useWithdraw.ts                # Withdraw transaction
│   ├── useTokenBalance.ts            # USDT balance + allowance
│   └── useTransactions.ts            # Contribution history
│
├── lib/
│   ├── appkit.ts                     # Reown AppKit config
│   ├── contract.ts                   # Addresses, ABIs, provider helpers
│   ├── authorizedSigner.ts           # eth_requestAccounts wrapper
│   ├── utils.ts                      # formatUsdt, truncateAddress, etc.
│   ├── validations.ts                # Zod schemas
│   ├── mockData.ts                   # Fallback campaigns for dev
│   └── txErrors.ts                   # Error code → message map
│
├── store/
│   └── transactionStore.ts           # Zustand — pending tx state + refresh trigger
│
├── types/
│   └── index.ts                      # Campaign, Contribution TypeScript interfaces
│
└── contracts/
    ├── CrowdFunding.sol
    └── MockUSDT.sol
```

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.local.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=   # Get from https://cloud.reown.com
NEXT_PUBLIC_USDT_ADDRESS=               # MockUSDT contract address
NEXT_PUBLIC_CONTRACT_ADDRESS=           # CrowdFunding contract address
NEXT_PUBLIC_CHAIN_ID=11155111           # Sepolia
NEXT_PUBLIC_RPC_URL=https://rpc.sepolia.org
NEXT_PUBLIC_EXPLORER_URL=https://sepolia.etherscan.io
```

> Leave `NEXT_PUBLIC_CONTRACT_ADDRESS` empty to run with mock data (no wallet required).

### 3. Deploy contracts (Sepolia)

Using [Remix IDE](https://remix.ethereum.org):

1. Deploy `MockUSDT.sol` → copy the deployed address
2. Deploy `CrowdFunding.sol`, passing the MockUSDT address as the constructor argument
3. Paste both addresses into `.env.local`

### 4. Get test USDT

Call `faucet()` on the MockUSDT contract via Remix or Etherscan (Write Contract). Receive 10,000 USDT per call.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Key Design Decisions

**No backend** — all reads go directly to a public Sepolia RPC via `JsonRpcProvider`. Writes go through the user's injected wallet provider.

**Two-step contribute** — ERC-20 requires an `approve()` before the contract can pull tokens. The app handles this automatically and re-requests wallet authorization between the two transactions to prevent the MetaMask error 4100 ("unauthorized") that appears after a long confirmation wait.

**Global tx overlay** — instead of per-button spinners, a single Zustand store drives a full-screen overlay. Any hook calls `setPending(true, message)` and all in-flight status is shown in one place across the entire app.

**Refresh trigger** — `triggerRefresh()` in the transaction store increments a counter that every data hook subscribes to. After any write transaction confirms, all campaigns and balances re-fetch automatically — no prop drilling or custom event emitters needed.

**Mock data fallback** — if `NEXT_PUBLIC_CONTRACT_ADDRESS` is not set, `useCampaigns` and `useCampaign` return hardcoded data. This lets frontend development continue without a deployed contract.
