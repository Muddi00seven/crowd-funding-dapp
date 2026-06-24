/**
 * components/contract/WriteFunctions.tsx
 *
 * WRITE (state-changing) functions of the CrowdFunding contract.
 *
 * What is a "write" function?
 * - Changes data on the blockchain (not just reads it).
 * - Requires:
 *     1. A wallet SIGNATURE → user clicks "Confirm" in MetaMask
 *     2. GAS FEES → paid in ETH for the network to process the tx
 * - We use a "Signer" from ethers (not just a Provider).
 *
 * Flow of a transaction:
 *   user clicks button
 *     → MetaMask popup (user confirms)
 *       → tx broadcast to network
 *         → tx pending (we show the hash)
 *           → block mined (tx confirmed)
 *
 * Functions:
 *   approveUSDT(amount)                              → allow contract to spend your USDT
 *   createCampaign(title, desc, goal, durationDays)  → create a new campaign
 *   contribute(campaignId, amount)                   → donate USDT to a campaign
 *   withdraw(campaignId)                             → pull out raised funds
 */

'use client'

import { useState } from 'react'
import { BrowserProvider } from 'ethers'
import type { Eip1193Provider } from 'ethers'
import { CONTRACT_ADDRESS, getCrowdFundingContract, getUsdtContract } from '@/lib/contract'
import { toRawUsdt } from '@/lib/format'

// ─── Types ────────────────────────────────────────────────────────────────────

// Every ethers transaction response has at least these two things
type TxResponse = {
  hash: string                    // the transaction hash (like a receipt ID)
  wait: () => Promise<unknown>    // call this to wait until it's mined
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  walletProvider: Eip1193Provider
}

// ─── Component ────────────────────────────────────────────────────────────────
export function WriteFunctions({ walletProvider }: Props) {

  // ── Input state ─────────────────────────────────────────────────────────

  // createCampaign inputs
  const [title,    setTitle]    = useState('')
  const [desc,     setDesc]     = useState('')
  const [goal,     setGoal]     = useState('')     // user types "500" → we convert to 500_000_000n
  const [duration, setDuration] = useState('')     // number of days

  // approveUSDT input
  const [approveAmt, setApproveAmt] = useState('') // user types "10" → 10_000_000n

  // contribute inputs
  const [contribId,  setContribId]  = useState('')
  const [contribAmt, setContribAmt] = useState('') // user types "10" → 10_000_000n

  // withdraw input
  const [withdrawId, setWithdrawId] = useState('')

  // ── Result state ─────────────────────────────────────────────────────────

  const [createResult,   setCreateResult]   = useState('')
  const [approveResult,  setApproveResult]  = useState('')
  const [contribResult,  setContribResult]  = useState('')
  const [withdrawResult, setWithdrawResult] = useState('')

  // ── Helpers: get signer-backed contract instances ────────────────────────

  // getSigner() is the key difference from reads:
  // it returns a Signer object that can cryptographically sign transactions
  // calling it triggers MetaMask to unlock (if locked)
  async function getSignedContract() {
    const provider = new BrowserProvider(walletProvider)
    const signer   = await provider.getSigner()   // get the wallet's signing key
    return getCrowdFundingContract(signer)
  }

  async function getSignedUsdt() {
    const provider = new BrowserProvider(walletProvider)
    const signer   = await provider.getSigner()
    return getUsdtContract(signer)
  }

  // ── Generic write helper ─────────────────────────────────────────────────
  // 1. Shows "waiting for signature" (MetaMask hasn't popped up yet)
  // 2. Calls fn() → MetaMask popup appears
  // 3. Shows tx hash (tx is now in the mempool, not yet mined)
  // 4. Waits for 1 block confirmation
  // 5. Shows confirmed or error
  async function callWrite(
    setResult: (s: string) => void,
    fn: () => Promise<TxResponse>
  ) {
    setResult('⏳ waiting for wallet signature...')
    try {
      const tx = await fn()                            // MetaMask popup here
      setResult(`⏳ tx sent — waiting for confirmation...\n${tx.hash}`)
      await tx.wait()                                  // wait for block to be mined
      setResult(`✅ confirmed!\n${tx.hash}`)
    } catch (err: unknown) {
      const e = err as { reason?: string; message?: string }
      setResult('❌ ' + (e.reason ?? e.message))
    }
  }

  // ── Handlers ─────────────────────────────────────────────────────────────

  /**
   * approveUSDT
   *
   * ERC20 tokens (like USDT) have a security mechanism:
   * before any contract can move tokens OUT of your wallet,
   * you must explicitly APPROVE that contract to do so.
   *
   * This calls USDT.approve(contractAddress, amount)
   * Run this BEFORE calling contribute().
   */
  async function handleApprove() {
    await callWrite(setApproveResult, async () => {
      const usdt = await getSignedUsdt()
      return usdt.approve(
        CONTRACT_ADDRESS,       // who we're approving (our crowdfunding contract)
        toRawUsdt(approveAmt)   // "10" → 10_000_000n
      ) as Promise<TxResponse>
    })
  }

  /**
   * createCampaign
   *
   * Deploys a new campaign into the contract's `campaigns[]` array.
   * Goal and amount inputs are in human-readable USDT — we convert to raw.
   */
  async function handleCreateCampaign() {
    await callWrite(setCreateResult, async () => {
      const contract = await getSignedContract()
      return contract.createCampaign(
        title,
        desc,
        toRawUsdt(goal),    // "500" → 500_000_000n (500 USDT in 6-decimal form)
        BigInt(duration)    // days as BigInt (Solidity expects uint256)
      ) as Promise<TxResponse>
    })
  }

  /**
   * contribute
   *
   * Sends USDT from your wallet to the contract for a specific campaign.
   * IMPORTANT: you must approveUSDT() first with at least this amount.
   */
  async function handleContribute() {
    await callWrite(setContribResult, async () => {
      const contract = await getSignedContract()
      return contract.contribute(
        BigInt(contribId),
        toRawUsdt(contribAmt)   // "10" → 10_000_000n
      ) as Promise<TxResponse>
    })
  }

  /**
   * withdraw
   *
   * Transfers all raised USDT to the campaign creator.
   * Only the creator can call this, and only after goal is reached.
   */
  async function handleWithdraw() {
    await callWrite(setWithdrawResult, async () => {
      const contract = await getSignedContract()
      return contract.withdraw(BigInt(withdrawId)) as Promise<TxResponse>
    })
  }

  // ── Styles ───────────────────────────────────────────────────────────────
  const inputStyle = 'border border-border bg-background text-foreground rounded px-2 py-1 text-xs font-mono'
  const btnStyle   = 'px-3 py-1 rounded bg-primary text-primary-foreground text-xs font-mono hover:opacity-80 cursor-pointer'
  const resultBox  = 'mt-2 text-xs font-mono text-green-400 break-all whitespace-pre-wrap bg-black/20 rounded p-2'
  const fnLabel    = 'text-xs font-mono font-bold text-foreground'
  const note       = 'text-xs text-muted-foreground font-normal font-mono'
  const row        = 'flex flex-wrap gap-2 items-center'

  // ── UI ───────────────────────────────────────────────────────────────────
  return (
    <section className="border border-border rounded-lg p-4 space-y-6">

      {/* Header */}
      <div className="text-xs text-muted-foreground uppercase tracking-widest">
        WRITE — state-changing (requires wallet signature + gas)
      </div>

      {/* ── approveUSDT ─────────────────────────────────────────────────── */}
      {/* Must run BEFORE contribute — ERC20 approval step */}
      <div className="space-y-1">
        <div>
          <span className={fnLabel}>approveUSDT()</span>
          <span className={note}> — run before contribute</span>
        </div>
        <div className={row}>
          <input
            className={inputStyle}
            style={{ width: 180 }}
            placeholder="amount in USDT (e.g. 10)"
            value={approveAmt}
            onChange={e => setApproveAmt(e.target.value)}
          />
          <button className={btnStyle} onClick={handleApprove}>send tx</button>
        </div>
        {approveResult && <div className={resultBox}>{approveResult}</div>}
      </div>

      {/* ── createCampaign ──────────────────────────────────────────────── */}
      <div className="space-y-1">
        <span className={fnLabel}>createCampaign()</span>
        <input
          className={`${inputStyle} w-full`}
          placeholder="title (min 5 characters)"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <input
          className={`${inputStyle} w-full`}
          placeholder="description"
          value={desc}
          onChange={e => setDesc(e.target.value)}
        />
        <div className="flex gap-2">
          <input
            className={`${inputStyle} flex-1`}
            placeholder="goal in USDT (e.g. 500)"
            value={goal}
            onChange={e => setGoal(e.target.value)}
          />
          <input
            className={inputStyle}
            style={{ width: 120 }}
            placeholder="duration (days)"
            value={duration}
            onChange={e => setDuration(e.target.value)}
          />
        </div>
        <button className={btnStyle} onClick={handleCreateCampaign}>send tx</button>
        {createResult && <div className={resultBox}>{createResult}</div>}
      </div>

      {/* ── contribute ──────────────────────────────────────────────────── */}
      <div className="space-y-1">
        <div>
          <span className={fnLabel}>contribute()</span>
          <span className={note}> — approve USDT first ↑</span>
        </div>
        <div className={row}>
          <input
            className={inputStyle}
            style={{ width: 90 }}
            placeholder="campaignId"
            value={contribId}
            onChange={e => setContribId(e.target.value)}
          />
          <input
            className={inputStyle}
            style={{ width: 150 }}
            placeholder="amount in USDT (e.g. 10)"
            value={contribAmt}
            onChange={e => setContribAmt(e.target.value)}
          />
          <button className={btnStyle} onClick={handleContribute}>send tx</button>
        </div>
        {contribResult && <div className={resultBox}>{contribResult}</div>}
      </div>

      {/* ── withdraw ────────────────────────────────────────────────────── */}
      <div className="space-y-1">
        <div>
          <span className={fnLabel}>withdraw()</span>
          <span className={note}> — only creator, only after goal is reached</span>
        </div>
        <div className={row}>
          <input
            className={inputStyle}
            style={{ width: 90 }}
            placeholder="campaignId"
            value={withdrawId}
            onChange={e => setWithdrawId(e.target.value)}
          />
          <button className={btnStyle} onClick={handleWithdraw}>send tx</button>
        </div>
        {withdrawResult && <div className={resultBox}>{withdrawResult}</div>}
      </div>

    </section>
  )
}
