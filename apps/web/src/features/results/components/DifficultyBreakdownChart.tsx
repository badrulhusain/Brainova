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
import type { DifficultyResultSummary, QuestionDifficulty } from '../../test-taking/types';

interface DifficultyBreakdownChartProps {
  breakdown: Partial<Record<QuestionDifficulty, DifficultyResultSummary>>;
}

const DIFFICULTIES: QuestionDifficulty[] = ['EASY', 'MEDIUM', 'HARD'];

export function DifficultyBreakdownChart({ breakdown }: DifficultyBreakdownChartProps) {
  const data = DIFFICULTIES.map((diff) => {
    const summary = breakdown[diff] ?? { total: 0, correct: 0, incorrect: 0, skipped: 0 };
    return {
      name: diff.charAt(0).toUpperCase() + diff.slice(1).toLowerCase(),
      correct: summary.correct,
      incorrect: summary.incorrect,
      skipped: summary.skipped,
    };
  }).filter((d) => d.correct + d.incorrect + d.skipped > 0);

  if (data.length === 0) return null;

  return (
    <Card className="p-6 print:break-inside-avoid">
      <h2 className="mb-4 text-base font-semibold">Difficulty breakdown</h2>
      <ResponsiveContainer height={200} width="100%">
        <BarChart data={data} margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="correct" fill="#16a34a" name="Correct" radius={[4, 4, 0, 0]} />
          <Bar dataKey="incorrect" fill="#dc2626" name="Incorrect" radius={[4, 4, 0, 0]} />
          <Bar dataKey="skipped" fill="#94a3b8" name="Skipped" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
