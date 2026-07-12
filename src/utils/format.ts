/** Format a THB amount as "฿12,900". */
export function formatBaht(amount: number): string {
  return `฿${amount.toLocaleString('en-US')}`;
}

/** Format seconds as HH:MM:SS for the flash-sale countdown. */
export function formatCountdown(totalSeconds: number): string {
  const clamped = Math.max(0, totalSeconds);
  const h = Math.floor(clamped / 3600);
  const m = Math.floor((clamped % 3600) / 60);
  const s = clamped % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
