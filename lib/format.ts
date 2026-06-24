/**
 * lib/format.ts
 *
 * Helper functions to convert raw blockchain data into human-readable values.
 *
 * WHY do we need these?
 * - USDT is stored with 6 decimal places on-chain.
 *   e.g.  1 USDT = 1_000_000 in raw BigInt form
 *         10 USDT = 10_000_000
 * - Timestamps are stored as Unix seconds (number of seconds since Jan 1, 1970).
 * - BigInt is JavaScript's type for large integers — JSON.stringify can't handle
 *   it by default, so we need a custom replacer.
 */

// ─── USDT Formatting ──────────────────────────────────────────────────────────

/**
 * Convert raw on-chain USDT amount → readable string.
 *
 * Example: formatUsdt(10_000_000n) → "10.000000 USDT"
 */
export function formatUsdt(raw: bigint | number): string {
  return (Number(raw) / 1_000_000).toFixed(6) + ' USDT'
}

/**
 * Convert human-readable USDT string → raw BigInt for the contract.
 * Use this before sending any transaction that takes a USDT amount.
 *
 * Example: toRawUsdt("10") → 10_000_000n
 * Example: toRawUsdt("0.5") → 500_000n
 */
export function toRawUsdt(humanAmount: string): bigint {
  return BigInt(Math.round(parseFloat(humanAmount) * 1_000_000))
}

// ─── Timestamp Formatting ─────────────────────────────────────────────────────

/**
 * Convert a Unix timestamp (seconds) → readable date string.
 *
 * Example: formatDate(1_773_701_424n) → "2/8/2026, 11:37:04 AM"
 */
export function formatDate(unixSeconds: bigint | number): string {
  return new Date(Number(unixSeconds) * 1000).toLocaleString()
}

// ─── Display Helper ───────────────────────────────────────────────────────────

/**
 * Convert any value to a pretty-printed JSON string for display.
 * Handles BigInt, which JSON.stringify throws on by default.
 *
 * Example: display(6n) → "6"
 * Example: display({ goal: 10_000_000n }) → '{\n  "goal": "10000000"\n}'
 */
export function display(value: unknown): string {
  if (typeof value === 'bigint') return value.toString()

  return JSON.stringify(
    value,
    // replacer: called for every key-value pair during serialization
    (_key, val) => (typeof val === 'bigint' ? val.toString() : val),
    2 // indent with 2 spaces
  )
}
