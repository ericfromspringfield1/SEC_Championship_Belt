export type LedgerRow = { date: string; new_champ: string; old_champ: string; score: string };

export function diffLedger(expected: LedgerRow[], actual: LedgerRow[], maxDiffs = 50): string[] {
  const mismatches: string[] = [];
  const max = Math.max(expected.length, actual.length);
  for (let i = 0; i < max; i++) {
    const e = expected[i];
    const a = actual[i];
    if (!e || !a || e.date !== a.date || e.new_champ !== a.new_champ || e.old_champ !== a.old_champ || e.score !== a.score) {
      mismatches.push(`index=${i} expected=${JSON.stringify(e)} actual=${JSON.stringify(a)}`);
      if (mismatches.length >= maxDiffs) break;
    }
  }
  return mismatches;
}
