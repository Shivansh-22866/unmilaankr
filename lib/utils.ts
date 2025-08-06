import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toString();
}

export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function normalizeScore(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

export function weightedAverage(values: number[], weights: number[]): number {
  if (values.length !== weights.length) throw new Error('Values and weights must have same length');
  
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  if (totalWeight === 0) return 0;
  
  const weightedSum = values.reduce((sum, value, i) => sum + value * weights[i], 0);
  return weightedSum / totalWeight;
}

export function calculateTrend(values: number[]): 'rising' | 'falling' | 'stable' {
  if (values.length < 2) return 'stable';
  
  const recentValues = values.slice(-5); // Last 5 values
  const avg1 = recentValues.slice(0, Math.floor(recentValues.length / 2))
    .reduce((sum, v) => sum + v, 0) / Math.floor(recentValues.length / 2);
  const avg2 = recentValues.slice(Math.floor(recentValues.length / 2))
    .reduce((sum, v) => sum + v, 0) / Math.ceil(recentValues.length / 2);
  
  const change = ((avg2 - avg1) / avg1) * 100;
  
  if (change > 5) return 'rising';
  if (change < -5) return 'falling';
  return 'stable';
}

export function exponentialMovingAverage(values: number[], alpha: number = 0.3): number[] {
  if (values.length === 0) return [];
  
  const ema = [values[0]];
  for (let i = 1; i < values.length; i++) {
    ema.push(alpha * values[i] + (1 - alpha) * ema[i - 1]);
  }
  return ema;
}

export function detectSpikes(values: number[], threshold: number = 2): number[] {
  if (values.length < 3) return [];
  
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  return values.map((value, index) => {
    const zScore = Math.abs((value - mean) / stdDev);
    return zScore > threshold ? index : -1;
  }).filter(index => index !== -1);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}