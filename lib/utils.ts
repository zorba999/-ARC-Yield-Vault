import { formatUnits } from 'viem'

export function formatBalance(
  raw: bigint | undefined,
  decimals: number,
  displayDecimals = 4
): string {
  if (raw === undefined) return '—'
  const formatted = formatUnits(raw, decimals)
  const num = parseFloat(formatted)
  if (num === 0) return '0.00'
  if (num < 0.0001) return '< 0.0001'
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: displayDecimals,
  })
}

export function formatPrice(raw: bigint | undefined, decimals: number): string {
  if (raw === undefined) return '—'
  const formatted = formatUnits(raw, decimals)
  const num = parseFloat(formatted)
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  })
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function parseInputAmount(value: string, decimals: number): bigint | null {
  if (!value || isNaN(parseFloat(value))) return null
  try {
    const parts = value.split('.')
    const intPart = BigInt(parts[0] || '0')
    let fracPart = BigInt(0)
    if (parts[1]) {
      const fracStr = parts[1].slice(0, decimals).padEnd(decimals, '0')
      fracPart = BigInt(fracStr)
    }
    return intPart * BigInt(10 ** decimals) + fracPart
  } catch {
    return null
  }
}
