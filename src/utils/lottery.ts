import type { Denomination } from '../types';

export function buildPool(denominations: Denomination[]): number[] {
  const pool: number[] = [];
  for (const denom of denominations) {
    for (let i = 0; i < denom.quantity; i++) {
      pool.push(denom.value);
    }
  }
  return shuffleArray(pool);
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function drawFromPool(pool: number[]): { prize: number; remainingPool: number[] } | null {
  if (pool.length === 0) return null;
  const index = Math.floor(Math.random() * pool.length);
  const prize = pool[index];
  const remainingPool = [...pool.slice(0, index), ...pool.slice(index + 1)];
  return { prize, remainingPool };
}

export function formatMoney(value: number): string {
  if (value >= 1000) {
    const k = value / 1000;
    return `${k.toLocaleString('vi-VN')}k`;
  }
  return value.toLocaleString('vi-VN');
}

export function formatMoneyFull(value: number): string {
  return value.toLocaleString('vi-VN') + 'đ';
}
