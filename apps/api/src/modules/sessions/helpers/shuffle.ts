/**
 * Fisher-Yates shuffle — pure function, never mutates the input array.
 * Safe for crypto-adjacent use-cases (question ordering) but uses Math.random(),
 * which is sufficient for a fair exam question ordering.
 */
export function shuffleArray<T>(array: readonly T[]): T[] {
  const result = Array.from(array);
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}
