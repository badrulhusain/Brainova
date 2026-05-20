import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '../../../components/ui/card';
import type { TestAttemptSummary } from '../../test-taking/types';

interface ScoreTrendChartProps {
  attempts: TestAttemptSummary[];
}

const DOMAIN_COLORS = [
  '#2563eb', '#16a34a', '#d97706', '#9333ea', '#db2777', '#0891b2',
];

export function ScoreTrendChart({ attempts }: ScoreTrendChartProps) {
  if (attempts.length < 2) {
    return (
      <Card className="flex min-h-[200px] items-center justify-center p-6 text-sm text-muted">
        At least 2 attempts needed to show trend.
      </Card>
    );
  }

  // Group by domain, compute percentage score
  const domains = [...new Set(attempts.map((a) => a.domainId))];

  const byDate = [...attempts]
    .reverse()
    .reduce<Record<string, Record<string, number>>>((acc, attempt) => {
      const label = attempt.date.toDate().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
      if (!acc[label]) acc[label] = {};
      const pct = attempt.totalMarks > 0 ? Math.round((attempt.score / attempt.totalMarks) * 100) : 0;
      acc[label]![attempt.domainId] = pct;
      return acc;
    }, {});

  const data = Object.entries(byDate).map(([date, scores]) => ({ date, ...scores }));

  return (
    <Card className="p-6">
      <h2 className="mb-4 text-base font-semibold">Score trend</h2>
      <ResponsiveContainer height={220} width="100%">
        <LineChart data={data} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
          <Tooltip formatter={(v: number) => `${v}%`} />
          <Legend />
          {domains.map((domain, idx) => (
            <Line
              key={domain}
              dataKey={domain}
              dot={{ r: 3 }}
              name={domain}
              stroke={DOMAIN_COLORS[idx % DOMAIN_COLORS.length]}
              strokeWidth={2}
              type="monotone"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
