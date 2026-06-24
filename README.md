# ChainFund — Decentralized Crowdfunding DApp

A beginner-friendly guide to understanding this project from scratch.  
This README explains **every concept step by step** — from installing Next.js to calling smart contract functions.

---

## Table of Contents

1. [What is this project?](#1-what-is-this-project)
2. [Tech stack — what tools we use and why](#2-tech-stack)
3. [Prerequisites — what to install first](#3-prerequisites)
4. [Create a Next.js project from scratch](#4-create-a-nextjs-project-from-scratch)
5. [Install project dependencies](#5-install-project-dependencies)
6. [Environment variables setup](#6-environment-variables-setup)
7. [How Next.js App Router works](#7-how-nextjs-app-router-works)
8. [What is a Component?](#8-what-is-a-component)
9. [How Wallet Connect works](#9-how-wallet-connect-works)
10. [How ethers.js works](#10-how-ethersjs-works)
11. [The Smart Contract](#11-the-smart-contract)
12. [File structure explained](#12-file-structure-explained)
13. [Read functions — how they work](#13-read-functions)
14. [Write functions — how they work](#14-write-functions)
15. [Run the project](#15-run-the-project)

---

## 1. What is this project?

**ChainFund** is a crowdfunding app that runs on the blockchain (Ethereum Sepolia testnet).

Think of it like GoFundMe — but instead of a company holding the money, a **smart contract** holds it.  
No middleman. No bank. Code is in charge.

**What users can do:**
- Connect their crypto wallet (MetaMask)
- Create a fundraising campaign with a goal amount
- Donate USDT to any campaign
- Withdraw funds once the goal is reached

**What makes it "decentralized":**
- The campaign data lives on the blockchain — not on our server
- We cannot touch the money — only the smart contract rules decide
- Anyone with an internet connection can interact with it

---

## 2. Tech Stack

| Tool | What it does |
|------|-------------|
| **Next.js 14** | React framework — handles pages, routing, server/client rendering |
| **TypeScript** | JavaScript with types — catches errors before they happen |
| **Tailwind CSS** | Utility-first CSS — write styles directly in HTML classes |
| **ethers.js v6** | JavaScript library to talk to the Ethereum blockchain |
| **AppKit (Reown)** | Ready-made wallet connect UI — MetaMask popup, account modal |
| **Solidity** | Language the smart contract is written in |
| **Sepolia Testnet** | A fake Ethereum network for testing — free ETH, no real money |

---

## 3. Prerequisites

Before you start, install these on your computer:

### Node.js (required)
Next.js runs on Node.js. Download from [nodejs.org](https://nodejs.org) — install the **LTS** version.

Check it's installed:
```bash
node --version   # should print something like v20.x.x
npm --version    # should print something like 10.x.x
```

### MetaMask (required)
The browser extension wallet we use to sign transactions.  
Download from [metamask.io](https://metamask.io) → Add to Chrome.

After installing MetaMask:
1. Create a new wallet (save your seed phrase safely)
2. Switch network to **Sepolia testnet**
   - Open MetaMask → click the network dropdown (top left) → Show test networks → Sepolia
3. Get free testnet ETH from [sepoliafaucet.com](https://sepoliafaucet.com) (you need ETH to pay gas fees)

### Git (optional but recommended)
Download from [git-scm.com](https://git-scm.com) — used to clone and version the project.

---

## 4. Create a Next.js Project from Scratch

> **Note:** This project already exists. This section explains how it was originally created,  
> so you understand what `create-next-app` does.

Run this command in your terminal:

```bash
npx create-next-app@14 chainfund
```

You will be asked questions — answer like this:

```
Would you like to use TypeScript?  → Yes
Would you like to use ESLint?      → Yes
Would you like to use Tailwind CSS? → Yes
Would you like to use `src/` directory? → No
Would you like to use App Router?  → Yes
Would you like to customize the import alias? → Yes (@/*)
```

This creates a folder called `chainfund` with a complete Next.js project inside.

**What `create-next-app` gives you:**

```
chainfund/
  app/
    page.tsx       ← your home page (what appears at localhost:3000)
    layout.tsx     ← the HTML shell wrapping every page
    globals.css    ← global CSS styles
  public/          ← static files (images, icons)
  package.json     ← list of all npm packages used
  next.config.mjs  ← Next.js configuration
  tsconfig.json    ← TypeScript configuration
  tailwind.config.ts ← Tailwind CSS configuration
```

---

## 5. Install Project Dependencies

### Clone and install this project

```bash
git clone https://github.com/your-username/crowd-funding-dapp.git
cd crowd-funding-dapp
npm install
```

`npm install` reads `package.json` and downloads all packages listed there into a `node_modules/` folder.

### Key packages explained

**ethers.js** — talks to the blockchain
```bash
npm install ethers
```

**AppKit** — wallet connect UI components
```bash
npm install @reown/appkit @reown/appkit-adapter-ethers
```

**Tailwind CSS** — utility CSS (already included in `create-next-app`)
```bash
npm install tailwindcss
```

---

## 6. Environment Variables Setup

Environment variables are **secret config values** that we don't want to hardcode in the code.  
They live in a `.env` file that is NOT committed to git.

### Step 1 — Copy the example file

```bash
cp .env.local.example .env
```

### Step 2 — Fill in the values

Open `.env` and fill in:

```env
# Get this from https://cloud.reown.com — create a project, copy the Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Address of the MockUSDT contract you deployed on Sepolia (via Remix IDE)
NEXT_PUBLIC_USDT_ADDRESS=0x...

# Address of the CrowdFunding contract you deployed on Sepolia (via Remix IDE)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...

# Chain ID: 11155111 = Sepolia testnet. Don't change this unless deploying to mainnet.
NEXT_PUBLIC_CHAIN_ID=11155111

# Block explorer for Sepolia — used to build links to transactions
NEXT_PUBLIC_EXPLORER_URL=https://sepolia.etherscan.io

# Public RPC endpoint — how we connect to the Sepolia network
NEXT_PUBLIC_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
```

### What does `NEXT_PUBLIC_` mean?

In Next.js, variables starting with `NEXT_PUBLIC_` are exposed to the **browser**.  
Variables WITHOUT `NEXT_PUBLIC_` are only available on the server side and never sent to the browser.

Since we need these values in client-side React components (to connect to wallets and contracts), we use `NEXT_PUBLIC_`.

### How to get a WalletConnect Project ID

1. Go to [cloud.reown.com](https://cloud.reown.com)
2. Sign up / log in
3. Click "Create Project"
4. Name it anything (e.g. "ChainFund")
5. Copy the **Project ID** — paste it into `.env`

---

## 7. How Next.js App Router Works

Next.js 14 uses the **App Router** — a folder-based routing system inside the `app/` directory.

### Pages and Routes

Every `page.tsx` file inside `app/` becomes a URL route:

```
app/page.tsx           → localhost:3000/
app/about/page.tsx     → localhost:3000/about
app/campaigns/page.tsx → localhost:3000/campaigns
```

### The Layout file

`app/layout.tsx` wraps every page. Think of it as the HTML document shell:

```tsx
// app/layout.tsx — runs on EVERY page

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}   {/* ← each page.tsx renders here */}
        </Providers>
      </body>
    </html>
  )
}
```

### Server Components vs Client Components

This is the most important concept in Next.js App Router:

| | Server Component | Client Component |
|---|---|---|
| Runs on | Server (Node.js) | Browser |
| Can use | `async/await`, databases | `useState`, `useEffect`, browser APIs |
| Default | Yes — all components are server by default | Must add `'use client'` at top |
| Can talk to wallet? | ❌ No | ✅ Yes |

**Our wallet and contract code all needs `'use client'`** because:
- MetaMask lives in the browser
- `useState` / `useEffect` are browser-only React hooks
- `window.ethereum` (what MetaMask injects) only exists in the browser

```tsx
// Must be at the very top of any file that uses hooks or browser APIs
'use client'

import { useState } from 'react'
```

---

## 8. What is a Component?

A **component** is a reusable piece of UI — like a LEGO block.

In React, a component is just a **TypeScript function** that returns HTML (called JSX):

```tsx
// A simple component
function MyButton() {
  return (
    <button className="px-4 py-2 bg-blue-500 text-white rounded">
      Click me
    </button>
  )
}

// Use it anywhere in another component
function MyPage() {
  return (
    <div>
      <h1>Hello</h1>
      <MyButton />   {/* ← reuse the component */}
      <MyButton />   {/* ← use it again */}
    </div>
  )
}
```

### Components in this project

```
components/
  WalletConnect.tsx          ← wallet button + balance display + root panel
  contract/
    ReadFunctions.tsx        ← READ section (view functions)
    WriteFunctions.tsx       ← WRITE section (state-changing functions)
  Providers.tsx              ← initializes AppKit (wallet connect SDK)
```

### Props — passing data into components

Components can accept data from their parent through **props** (properties):

```tsx
// Component that accepts a walletProvider prop
function ReadFunctions({ walletProvider }: { walletProvider: Eip1193Provider }) {
  // use walletProvider here
}

// Parent passes the prop
<ReadFunctions walletProvider={walletProvider} />
```

### State — data that changes over time

```tsx
import { useState } from 'react'

function Counter() {
  // balance is the current value
  // setBalance is the function to change it
  // null is the initial value
  const [balance, setBalance] = useState<string | null>(null)

  return (
    <div>
      <p>{balance}</p>
      <button onClick={() => setBalance('1.5 ETH')}>Load</button>
    </div>
  )
}
```

---

## 9. How Wallet Connect Works

This project uses **AppKit by Reown** — a library that handles all the wallet connection UI for us.

### Setup (already done in this project)

**Step 1 — Initialize AppKit** in `lib/appkit.ts`:

```ts
// lib/appkit.ts
import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { sepolia } from '@reown/appkit/networks'

createAppKit({
  adapters: [new EthersAdapter()],   // use ethers.js as the wallet adapter
  networks: [sepolia],               // only support Sepolia testnet
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
})
```

**Step 2 — Wrap the app with Providers** in `app/layout.tsx`:

```tsx
// The Providers component imports lib/appkit.ts which calls createAppKit()
// dynamic import with ssr: false prevents server-side errors
const Providers = dynamic(
  () => import('@/components/Providers').then(m => m.Providers),
  { ssr: false }
)
```

Why `ssr: false`?  
AppKit uses `indexedDB` (browser storage) internally. The server doesn't have `indexedDB`, so we tell Next.js to only load this component in the browser.

### The three AppKit hooks

These hooks are used in `WalletConnect.tsx`:

```tsx
import { useAppKit, useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'

// 1. open() → opens the wallet selection modal (MetaMask popup)
const { open } = useAppKit()

// 2. address, isConnected → current wallet state
const { address, isConnected } = useAppKitAccount()
// address    → "0xAbcd...1234" or undefined when not connected
// isConnected → true / false

// 3. walletProvider → the raw EIP-1193 provider
const { walletProvider } = useAppKitProvider('eip155')
// This is what MetaMask injects as window.ethereum
// We wrap it with ethers BrowserProvider to get a nicer API
```

### What is EIP-1193?

EIP-1193 is a **standard interface** that all wallets (MetaMask, Coinbase Wallet, etc.) implement.  
It gives us a simple `request()` method to talk to the wallet:

```js
// Under the hood, wallets speak EIP-1193:
window.ethereum.request({ method: 'eth_accounts' })

// But we don't use this directly — ethers.js wraps it for us:
const provider = new BrowserProvider(walletProvider)
const balance = await provider.getBalance(address)
```

### The wallet connect flow

```
User clicks "Connect Wallet"
  → open() is called
    → AppKit modal opens (MetaMask selection)
      → User selects MetaMask
        → MetaMask asks "Allow this site to connect?"
          → User clicks "Connect"
            → isConnected becomes true
            → address is now available
            → walletProvider is now available
```

---

## 10. How ethers.js Works

**ethers.js** is a JavaScript library that lets us talk to the Ethereum blockchain.  
The key difference between two things:

### Provider vs Signer

| | Provider | Signer |
|---|---|---|
| What it is | Read-only connection to the blockchain | A Provider + your private key |
| Can do | Read balances, call view functions | Everything a Provider can + send transactions |
| Needs wallet? | No (can use public RPC) | Yes (needs MetaMask to sign) |
| Gas cost? | No | Yes |

```ts
// Provider — for reading
const provider = new BrowserProvider(walletProvider)
const balance = await provider.getBalance(address)   // no MetaMask popup

// Signer — for writing (triggers MetaMask confirmation popup)
const signer = await provider.getSigner()
```

### Creating a Contract instance

To talk to a smart contract, we need three things:
1. The **contract address** — where it lives on the blockchain
2. The **ABI** — a list of all functions the contract has (like a menu)
3. A **Provider** (for reads) or **Signer** (for writes)

```ts
import { Contract, BrowserProvider } from 'ethers'

const CONTRACT_ADDRESS = '0x999a423...'

// ABI = Application Binary Interface
// Tells ethers what functions exist and what parameters they take
const ABI = [
  'function getCampaignCount() view returns (uint256)',
  'function createCampaign(string title, string description, uint256 goal, uint256 durationDays)',
]

// Read-only contract (Provider — no signature needed)
const provider = new BrowserProvider(walletProvider)
const readContract = new Contract(CONTRACT_ADDRESS, ABI, provider)
const count = await readContract.getCampaignCount()

// Write contract (Signer — MetaMask popup appears)
const signer = await provider.getSigner()
const writeContract = new Contract(CONTRACT_ADDRESS, ABI, signer)
const tx = await writeContract.createCampaign('My Campaign', 'Description', 500_000_000n, 30n)
await tx.wait()   // wait for it to be mined
```

In this project, the contract setup lives in `lib/contract.ts` so we don't repeat this code everywhere:

```ts
// lib/contract.ts — gives us ready-made contract instances
import { getCrowdFundingContract } from '@/lib/contract'

// For reads — pass the provider
const contract = getCrowdFundingContract(provider)

// For writes — pass the signer
const contract = getCrowdFundingContract(signer)
```

---

## 11. The Smart Contract

The smart contract lives in `contracts/CrowdFunding.sol` and is deployed on Sepolia.

### Key concepts

**What is a smart contract?**  
A program that lives on the blockchain. Once deployed, nobody can change it.  
It holds money and follows its own rules — no middleman.

**What is Solidity?**  
The programming language used to write smart contracts. Looks a bit like JavaScript.

### The CrowdFunding contract — simplified

```solidity
// contracts/CrowdFunding.sol

contract CrowdFunding {

  // A Campaign is like a row in a database
  struct Campaign {
    uint256 id;
    address creator;     // wallet address of the person who created it
    string  title;
    string  description;
    uint256 goal;        // target amount in USDT (6 decimals)
    uint256 raised;      // amount raised so far
    uint256 deadline;    // unix timestamp when campaign ends
    bool    withdrawn;   // true if creator already pulled the money
    uint256 contributorsCount;
  }

  Campaign[] public campaigns;   // array of all campaigns — stored on-chain

  // READ functions (view) — free, no gas
  function getCampaignCount() external view returns (uint256) { ... }
  function getCampaign(uint256 id) external view returns (...) { ... }
  function getContributions(uint256 campaignId) external view returns (...) { ... }

  // WRITE functions — cost gas, need MetaMask confirmation
  function createCampaign(string title, string description, uint256 goal, uint256 durationDays) external { ... }
  function contribute(uint256 campaignId, uint256 amount) external { ... }
  function withdraw(uint256 campaignId) external { ... }
}
```

### USDT and decimals

USDT has **6 decimal places** on-chain. This means:

```
What you type    →    What the contract stores
─────────────────────────────────────────────
1 USDT           →    1,000,000
10 USDT          →    10,000,000
0.5 USDT         →    500,000
500 USDT         →    500,000,000
```

The helper `toRawUsdt()` in `lib/format.ts` handles this conversion:

```ts
toRawUsdt("10")   // → 10_000_000n  (BigInt)
toRawUsdt("0.5")  // → 500_000n
```

And `formatUsdt()` converts back for display:

```ts
formatUsdt(10_000_000n)  // → "10.000000 USDT"
```

### Why BigInt?

Ethereum amounts are very large numbers — bigger than what JavaScript's normal `number` type can handle safely. So ethers.js uses **BigInt** (a JavaScript built-in for large integers):

```ts
// Regular number (unsafe for large values — loses precision)
const amount = 10000000   // OK for small numbers

// BigInt (safe for any size)
const amount = 10_000_000n   // the "n" suffix makes it a BigInt
const amount = BigInt(10_000_000)   // same thing
```

---

## 12. File Structure Explained

```
crowd-funding-dapp/
│
├── app/                          ← Next.js App Router pages
│   ├── layout.tsx                ← HTML shell for all pages, loads Providers
│   ├── page.tsx                  ← Home page (renders WalletConnect)
│   └── globals.css               ← Global CSS (dark theme CSS variables)
│
├── components/                   ← Reusable UI components
│   ├── WalletConnect.tsx         ← Root component: wallet button + renders Read/Write
│   ├── Providers.tsx             ← Initializes AppKit (wallet SDK)
│   └── contract/
│       ├── ReadFunctions.tsx     ← READ panel (getCampaignCount, getCampaign, getContributions)
│       └── WriteFunctions.tsx    ← WRITE panel (approveUSDT, createCampaign, contribute, withdraw)
│
├── lib/                          ← Shared logic (not UI)
│   ├── contract.ts               ← ABI, contract address, contract factory functions
│   ├── format.ts                 ← formatUsdt, formatDate, toRawUsdt, display
│   └── appkit.ts                 ← AppKit initialization (called once at app start)
│
├── contracts/                    ← Solidity source files
│   ├── CrowdFunding.sol          ← Main contract
│   └── MockUSDT.sol              ← Fake USDT for testing on Sepolia
│
├── .env                          ← Your secret config (not in git)
├── .env.local.example            ← Template showing what variables are needed
├── package.json                  ← npm dependencies list
├── tailwind.config.ts            ← Tailwind CSS setup
└── tsconfig.json                 ← TypeScript config
```

### How the files connect

```
app/layout.tsx
  └── loads Providers.tsx
        └── imports lib/appkit.ts  (initializes AppKit once)

app/page.tsx
  └── renders <WalletConnect />
        ├── uses AppKit hooks (useAppKitAccount, useAppKitProvider)
        ├── renders <ReadFunctions walletProvider={...} />
        │     └── imports getCrowdFundingContract from lib/contract.ts
        │     └── imports formatUsdt, formatDate from lib/format.ts
        └── renders <WriteFunctions walletProvider={...} />
              └── imports getCrowdFundingContract, getUsdtContract from lib/contract.ts
              └── imports toRawUsdt from lib/format.ts
```

---

## 13. Read Functions

Read functions call `view` functions on the smart contract.  
**No gas. No signature. No MetaMask popup.** Just a network call.

### File: `components/contract/ReadFunctions.tsx`

### How a read call works — step by step

```ts
// 1. Get the wallet provider from AppKit
const { walletProvider } = useAppKitProvider('eip155')

// 2. Wrap it with ethers BrowserProvider
const provider = new BrowserProvider(walletProvider)

// 3. Create a contract instance (no signer — just provider)
const contract = getCrowdFundingContract(provider)
// This is equivalent to:
// new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)

// 4. Call the view function — returns data directly, no tx hash
const count = await contract.getCampaignCount()

// 5. Display the result
console.log(Number(count))   // e.g. 6
```

### Example: getCampaignCount()

```tsx
async function handleGetCampaignCount() {
  const provider = new BrowserProvider(walletProvider)
  const contract = getCrowdFundingContract(provider)

  const count = await contract.getCampaignCount()
  // count is a BigInt, e.g. 6n
  // convert to number for display
  console.log(Number(count))  // → 6
}
```

### Example: getCampaign(id)

The contract returns a **tuple** — positional values like `(id, creator, title, description, goal, raised, deadline, withdrawn, contributorsCount)`.

ethers.js gives us array-like access:

```tsx
async function handleGetCampaign() {
  const provider = new BrowserProvider(walletProvider)
  const contract = getCrowdFundingContract(provider)

  const r = await contract.getCampaign(BigInt(0))   // get campaign #0
  // r[0] = id (BigInt)
  // r[1] = creator address (string)
  // r[2] = title (string)
  // r[3] = description (string)
  // r[4] = goal in raw USDT (BigInt)
  // r[5] = raised in raw USDT (BigInt)
  // r[6] = deadline as unix timestamp (BigInt)
  // r[7] = withdrawn (boolean)
  // r[8] = contributorsCount (BigInt)

  console.log({
    id:          Number(r[0]),
    creator:     r[1],
    title:       r[2],
    goal:        formatUsdt(r[4]),   // "500.000000 USDT"
    raised:      formatUsdt(r[5]),   // "500.000000 USDT"
    deadline:    formatDate(r[6]),   // "3/26/2026, 9:51:36 PM"
    withdrawn:   r[7],               // true / false
  })
}
```

### Example: getContributions(campaignId)

Returns an **array of structs** — each struct is one contribution.

```tsx
async function handleGetContributions() {
  const provider = new BrowserProvider(walletProvider)
  const contract = getCrowdFundingContract(provider)

  const raw = await contract.getContributions(BigInt(0))
  // raw is an array where each item is a tuple:
  // item[0] = contributor address
  // item[1] = amount in raw USDT (BigInt)
  // item[2] = txHash (bytes32)
  // item[3] = timestamp (BigInt)

  const contributions = Array.from(raw).map((c, index) => {
    const item = c as Record<string | number, unknown>
    return {
      '#':          index,
      contributor:  item[0] as string,
      amount:       formatUsdt(item[1] as bigint),   // "1.000000 USDT"
      txHash:       item[2] as string,
      timestamp:    formatDate(item[3] as bigint),   // "2/8/2026, 11:37 AM"
    }
  })

  console.log(contributions)
}
```

---

## 14. Write Functions

Write functions change state on the blockchain.  
They **require a wallet signature** (MetaMask popup) and **cost gas** (ETH).

### File: `components/contract/WriteFunctions.tsx`

### How a write call works — step by step

```ts
// 1. Get the wallet provider
const { walletProvider } = useAppKitProvider('eip155')

// 2. Wrap with BrowserProvider
const provider = new BrowserProvider(walletProvider)

// 3. Get a SIGNER (this is what requires the wallet)
const signer = await provider.getSigner()

// 4. Create a contract instance WITH the signer
const contract = getCrowdFundingContract(signer)

// 5. Call the write function — MetaMask popup appears here
const tx = await contract.createCampaign(...)
// tx is a TransactionResponse — it has a hash but is NOT yet confirmed

console.log(tx.hash)   // "0xabc123..." — the transaction ID

// 6. Wait for the transaction to be mined (included in a block)
await tx.wait()
// Now it's confirmed — state has changed on the blockchain
```

### Example: approveUSDT (run before contribute)

USDT is an ERC20 token. Before any contract can move your USDT, you must **approve** it.  
This is a security mechanism — you're explicitly saying "this contract is allowed to take X USDT from me."

```tsx
async function handleApprove() {
  const provider = new BrowserProvider(walletProvider)
  const signer   = await provider.getSigner()   // MetaMask unlocks if locked
  const usdt     = getUsdtContract(signer)

  // Approve the crowdfunding contract to spend 10 USDT from our wallet
  const tx = await usdt.approve(
    CONTRACT_ADDRESS,   // who we're approving
    toRawUsdt("10")     // "10" → 10_000_000n (10 USDT in 6-decimal form)
  )
  // MetaMask popup: "Allow chainfund to spend 10 USDT?"

  await tx.wait()
  console.log("Approved! tx:", tx.hash)
}
```

### Example: createCampaign

```tsx
async function handleCreateCampaign() {
  const provider = new BrowserProvider(walletProvider)
  const signer   = await provider.getSigner()
  const contract = getCrowdFundingContract(signer)

  const tx = await contract.createCampaign(
    "Solar Panels for Rural Schools",   // title (min 5 chars)
    "Installing solar energy in...",    // description
    toRawUsdt("500"),                   // goal: "500" → 500_000_000n (500 USDT)
    BigInt(30)                          // duration: 30 days
  )
  // MetaMask popup: "Confirm transaction?"

  console.log("Tx sent:", tx.hash)
  await tx.wait()
  console.log("Campaign created!")
}
```

### Example: contribute

Must run `approveUSDT` first with at least this amount.

```tsx
async function handleContribute() {
  const provider = new BrowserProvider(walletProvider)
  const signer   = await provider.getSigner()
  const contract = getCrowdFundingContract(signer)

  const tx = await contract.contribute(
    BigInt(0),          // campaignId = 0 (first campaign)
    toRawUsdt("10")     // donate 10 USDT → 10_000_000n
  )

  console.log("Tx sent:", tx.hash)
  await tx.wait()
  console.log("Contributed successfully!")
}
```

### Example: withdraw

Only the campaign creator can call this. Only works if `raised >= goal`.

```tsx
async function handleWithdraw() {
  const provider = new BrowserProvider(walletProvider)
  const signer   = await provider.getSigner()
  const contract = getCrowdFundingContract(signer)

  const tx = await contract.withdraw(BigInt(0))   // withdraw from campaign #0

  console.log("Tx sent:", tx.hash)
  await tx.wait()
  console.log("Funds withdrawn!")
}
```

### The full contribute flow (2 steps)

```
Step 1: approveUSDT("10")
  → calls USDT.approve(crowdfundingContract, 10_000_000n)
  → MetaMask popup #1
  → wait for confirmation

Step 2: contribute(0, "10")
  → calls CrowdFunding.contribute(campaignId=0, amount=10_000_000n)
  → contract internally calls USDT.transferFrom(yourWallet, contract, 10_000_000n)
  → MetaMask popup #2
  → wait for confirmation
```

---

## 15. Run the Project

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.local.example .env
# Then open .env and fill in your values

# 3. Start the development server
npm run dev
```

Open your browser at **http://localhost:3000**

You should see a "Connect Wallet" button. Click it, select MetaMask, and you'll see the READ and WRITE panels.

### Other commands

```bash
npm run build    # build for production (checks for TypeScript errors)
npm run start    # run the production build
npm run lint     # check for code style errors
```

### Common errors and fixes

| Error | Fix |
|-------|-----|
| `Cannot find module '@/lib/contract'` | Make sure `tsconfig.json` has `"paths": { "@/*": ["./*"] }` |
| `NEXT_PUBLIC_CONTRACT_ADDRESS is undefined` | Check your `.env` file exists and has the value |
| `MetaMask not found` | Install the MetaMask browser extension |
| `Insufficient funds` | Get free Sepolia ETH from sepoliafaucet.com |
| `execution reverted: Goal not reached` | The campaign hasn't raised enough to withdraw yet |
| `execution reverted: USDT transfer failed` | Run approveUSDT before contribute |

---

## Quick Reference

### lib/format.ts helper functions

```ts
formatUsdt(10_000_000n)   // → "10.000000 USDT"   (raw → readable)
toRawUsdt("10")           // → 10_000_000n          (readable → raw, for transactions)
formatDate(1_773_701_424n) // → "2/8/2026, 11:37 AM" (unix → readable)
display(anyValue)         // → JSON string (handles BigInt)
```

### lib/contract.ts factory functions

```ts
// Pass a Provider for reads (no gas, no signature)
getCrowdFundingContract(provider)

// Pass a Signer for writes (triggers MetaMask)
getCrowdFundingContract(signer)

// USDT contract (for approve)
getUsdtContract(signer)
```

### AppKit hooks

```ts
const { open }                        = useAppKit()          // open modal
const { address, isConnected }        = useAppKitAccount()   // wallet state
const { walletProvider }              = useAppKitProvider('eip155')  // raw provider
```
