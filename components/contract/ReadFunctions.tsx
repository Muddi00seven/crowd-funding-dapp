/**
 * components/contract/ReadFunctions.tsx
 *
 * READ (view) functions of the CrowdFunding contract.
 *
 * What is a "view" function?
 * - Marked `view` in Solidity → only READS data, never changes it.
 * - No gas required, no wallet signature needed.
 * - We call them with a plain Provider (not a Signer).
 *
 * Functions:
 *   getCampaignCount()           → total number of campaigns
 *   getCampaign(id)              → all fields of one campaign
 *   getContributions(campaignId) → list of contributions to a campaign
 */

'use client'

import { useState } from 'react'
import { BrowserProvider } from 'ethers'
import type { Eip1193Provider } from 'ethers'
import { getCrowdFundingContract } from '@/lib/contract'
import { formatUsdt, formatDate, display } from '@/lib/format'

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  // The raw EIP-1193 provider from the connected wallet (MetaMask, etc.)
  // EIP-1193 is the standard all wallets implement — ethers wraps it with BrowserProvider
  walletProvider: Eip1193Provider
}

// ─── Component ────────────────────────────────────────────────────────────────
export function ReadFunctions({ walletProvider }: Props) {

  // Input fields
  const [campaignId,      setCampaignId]      = useState('')
  const [contribCampaignId, setContribCampaignId] = useState('')

  // Result strings shown below each function
  const [countResult,   setCountResult]   = useState('')
  const [campaignResult, setCampaignResult] = useState('')
  const [contribsResult, setContribsResult] = useState('')

  // ── Helper: create a read-only contract instance ────────────────────────
  function getContract() {
    // BrowserProvider wraps the wallet's EIP-1193 provider as an ethers provider
    // We do NOT call getSigner() here — reads don't need a signature
    const provider = new BrowserProvider(walletProvider)
    return getCrowdFundingContract(provider)
  }

  // ── Generic read helper ─────────────────────────────────────────────────
  // Takes a setter function and an async function, handles loading + errors
  async function callRead(
    setResult: (s: string) => void,
    fn: () => Promise<unknown>
  ) {
    setResult('⏳ calling...')
    try {
      const data = await fn()
      setResult(display(data))
    } catch (err: unknown) {
      const e = err as { reason?: string; message?: string }
      setResult('❌ ' + (e.reason ?? e.message))
    }
  }

  // ── getCampaignCount ────────────────────────────────────────────────────
  // Returns how many campaigns have been created so far
  async function handleGetCampaignCount() {
    await callRead(setCountResult, async () => {
      const count = await getContract().getCampaignCount()
      return Number(count) // BigInt → plain number
    })
  }

  // ── getCampaign ─────────────────────────────────────────────────────────
  // Returns all details of a single campaign by its numeric ID
  async function handleGetCampaign() {
    await callRead(setCampaignResult, async () => {
      // Contract returns a tuple (positional values, like a struct)
      // ethers gives us array-like access: r[0], r[1], r[2] ...
      const r = await getContract().getCampaign(BigInt(campaignId))

      // Reshape into a plain readable object
      return {
        id:                Number(r[0]),
        creator:           r[1] as string,
        title:             r[2] as string,
        description:       r[3] as string,
        goal:              formatUsdt(r[4] as bigint),   // 10_000_000 → "10.000000 USDT"
        raised:            formatUsdt(r[5] as bigint),
        deadline:          formatDate(r[6] as bigint),   // unix seconds → readable date
        withdrawn:         r[7] as boolean,
        contributorsCount: Number(r[8]),
      }
    })
  }

  // ── getContributions ────────────────────────────────────────────────────
  // Returns an array of all contributions made to a campaign
  async function handleGetContributions() {
    await callRead(setContribsResult, async () => {
      const raw = await getContract().getContributions(BigInt(contribCampaignId))

      // raw is an array of Solidity tuples — map each to a named readable object
      // We try named access first (c.contributor), fall back to index (c[0])
      // because ethers v6 Result objects sometimes behave differently
      return Array.from(raw).map((c: unknown, index: number) => {
        const item = c as Record<string | number, unknown>
        return {
          '#':         index,
          contributor: (item.contributor ?? item[0]) as string,
          amount:      formatUsdt((item.amount    ?? item[1]) as bigint),
          txHash:      (item.txHash      ?? item[2]) as string,
          timestamp:   formatDate((item.timestamp  ?? item[3]) as bigint),
        }
      })
    })
  }

  // ── Styles ───────────────────────────────────────────────────────────────
  const inputStyle = 'border border-border bg-background text-foreground rounded px-2 py-1 text-xs font-mono'
  const btnStyle   = 'px-3 py-1 rounded bg-primary text-primary-foreground text-xs font-mono hover:opacity-80 cursor-pointer'
  const resultBox  = 'mt-2 text-xs font-mono text-green-400 break-all whitespace-pre-wrap bg-black/20 rounded p-2'
  const fnLabel    = 'text-xs font-mono font-bold text-foreground'
  const row        = 'flex flex-wrap gap-2 items-center'

  // ── UI ───────────────────────────────────────────────────────────────────
  return (
    <section className="border border-border rounded-lg p-4 space-y-5">

      {/* Header */}
      <div className="text-xs text-muted-foreground uppercase tracking-widest">
        READ — view functions (no gas, no signature needed)
      </div>

      {/* ── getCampaignCount() ──────────────────────────────────────────── */}
      <div>
        <div className={row}>
          <span className={fnLabel}>getCampaignCount()</span>
          <button className={btnStyle} onClick={handleGetCampaignCount}>call</button>
        </div>
        {countResult && <div className={resultBox}>{countResult}</div>}
      </div>

      {/* ── getCampaign(id) ─────────────────────────────────────────────── */}
      <div>
        <div className={row}>
          <span className={fnLabel}>getCampaign(</span>
          <input
            className={inputStyle}
            style={{ width: 64 }}
            placeholder="id"
            value={campaignId}
            onChange={e => setCampaignId(e.target.value)}
          />
          <span className={fnLabel}>)</span>
          <button className={btnStyle} onClick={handleGetCampaign}>call</button>
        </div>
        {campaignResult && <div className={resultBox}>{campaignResult}</div>}
      </div>

      {/* ── getContributions(campaignId) ────────────────────────────────── */}
      <div>
        <div className={row}>
          <span className={fnLabel}>getContributions(</span>
          <input
            className={inputStyle}
            style={{ width: 90 }}
            placeholder="campaignId"
            value={contribCampaignId}
            onChange={e => setContribCampaignId(e.target.value)}
          />
          <span className={fnLabel}>)</span>
          <button className={btnStyle} onClick={handleGetContributions}>call</button>
        </div>
        {contribsResult && <div className={resultBox}>{contribsResult}</div>}
      </div>

    </section>
  )
}
