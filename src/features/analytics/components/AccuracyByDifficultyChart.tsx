import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '../../../components/ui/card';
import type { TestAttemptSummary } from '../../test-taking/types';

interface AccuracyByDifficultyChartProps {
  attempts: TestAttemptSummary[];
}

export function AccuracyByDifficultyChart({ attempts: _attempts }: AccuracyByDifficultyChartProps) {
  // This chart requires full result data (difficultyBreakdown).
  // Since attempts only have summary fields, we show placeholder until
  // full result aggregation is implemented.
  const placeholderData = [
    { name: 'Easy', accuracy: 0 },
    { name: 'Medium', accuracy: 0 },
    { name: 'Hard', accuracy: 0 },
  ];

  if (_attempts.length === 0) {
    return (
      <Card className="flex min-h-[200px] items-center justify-center p-6 text-sm text-muted">
        No attempts yet.
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="mb-1 text-base font-semibold">Accuracy by difficulty</h2>
      <p className="mb-4 text-xs text-muted">Based on your recent attempts.</p>
      <ResponsiveContainer height={180} width="100%">
        <BarChart data={placeholderData} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
          <Tooltip formatter={(v: number) => `${v}%`} />
          <Bar dataKey="accuracy" fill="#2563eb" name="Accuracy" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
