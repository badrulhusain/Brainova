import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '../../../components/ui/card';
import type { TopicResultSummary } from '../../test-taking/types';

interface TopicBreakdownChartProps {
  breakdown: Record<string, TopicResultSummary>;
}

export function TopicBreakdownChart({ breakdown }: TopicBreakdownChartProps) {
  const data = Object.entries(breakdown).map(([topicId, summary]) => ({
    topic: topicId.length > 14 ? topicId.slice(0, 14) + '…' : topicId,
    correct: summary.correct,
    incorrect: summary.incorrect,
    skipped: summary.skipped,
  }));

  if (data.length === 0) return null;

  return (
    <Card className="p-6 print:break-inside-avoid">
      <h2 className="mb-4 text-base font-semibold">Topic breakdown</h2>
      <ResponsiveContainer height={220} width="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis dataKey="topic" type="category" width={90} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="correct" fill="#16a34a" name="Correct" radius={[0, 2, 2, 0]} stackId="a" />
          <Bar
            dataKey="incorrect"
            fill="#dc2626"
            name="Incorrect"
            radius={[0, 2, 2, 0]}
            stackId="a"
          />
          <Bar dataKey="skipped" fill="#94a3b8" name="Skipped" radius={[0, 2, 2, 0]} stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
