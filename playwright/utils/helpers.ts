export const hexToRgb = (hex: string): string => {
  const value = parseInt(hex.slice(1), 16)
  const r = Math.floor(value / 65536) % 256
  const g = Math.floor(value / 256) % 256
  const b = value % 256
  return `rgb(${r}, ${g}, ${b})`
}
