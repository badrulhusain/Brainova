import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts';
import { Card } from '../../../components/ui/card';
import { cn } from '../../../lib/utils/cn';
import { APTITUDE_LABELS, type AptitudeCategory, type AptitudeResult } from '../types';

interface AptitudeResultCardProps {
  result: AptitudeResult;
}

const CATEGORY_ORDER: AptitudeCategory[] = [
  'HUMANITIES',
  'FINE_ARTS',
  'COMMUNICATIONS',
  'VISUAL_DESIGN',
  'TECHNOLOGY',
  'MANAGEMENT',
  'COMMERCE',
  'CHEMICAL_SCIENCES',
  'PHYSICAL_SCIENCES',
  'LOGICAL_ANALYTICAL',
];

const RECOMMENDATIONS: Record<AptitudeCategory, string[]> = {
  HUMANITIES: ['Political Science', 'Law & Judiciary', 'History', 'Public Policy', 'Philosophy'],
  FINE_ARTS: ['Fine Arts', 'Painting & Sculpture', 'Music & Performing Arts', 'Photography', 'Fashion Design'],
  COMMUNICATIONS: ['Journalism', 'Content Writing', 'Translation & Interpretation', 'Public Relations', 'Media Studies'],
  VISUAL_DESIGN: ['UI/UX Design', 'Graphic Design', 'Animation & Motion Graphics', 'Brand Communication', 'Digital Media'],
  TECHNOLOGY: ['Software Engineering', 'Artificial Intelligence', 'Cybersecurity', 'Data Science', 'Electronics & Embedded Systems'],
  MANAGEMENT: ['Human Resources', 'Operations Management', 'Entrepreneurship', 'Corporate Leadership', 'Organisational Behaviour'],
  COMMERCE: ['Chartered Accountancy', 'Economics', 'Business Administration', 'Finance & Taxation', 'Commerce Research'],
  CHEMICAL_SCIENCES: ['Chemistry', 'Biochemistry', 'Materials Science', 'Environmental Science', 'Pharmacy'],
  PHYSICAL_SCIENCES: ['Physics', 'Mathematics', 'Astronomy & Space Science', 'Engineering Sciences', 'Academic Research'],
  LOGICAL_ANALYTICAL: ['Statistics', 'Data Analytics', 'Actuarial Science', 'Research Methodology', 'Applied Mathematics'],
};

function scoreBadgeClass(score: number): string {
  if (score >= 70)
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300';
  if (score >= 40) return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300';
  return 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300';
}

export function AptitudeResultCard({ result }: AptitudeResultCardProps) {
  const chartData = CATEGORY_ORDER.map((category) => ({
    subject: APTITUDE_LABELS[category],
    score: result.scores[category] ?? 0,
  }));

  return (
    <Card className="mx-auto max-w-3xl p-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Your Aptitude Profile</h1>
          <p className="mt-2 text-muted">
            Your strongest aptitude:{' '}
            <strong className="font-semibold text-foreground">
              {APTITUDE_LABELS[result.strongestCategory]}
            </strong>
          </p>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer height="100%" width="100%">
            <RadarChart data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
              <Radar
                dataKey="score"
                fill="#2563eb"
                fillOpacity={0.28}
                name="Score"
                stroke="#2563eb"
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {CATEGORY_ORDER.map((category) => {
            const score = result.scores[category] ?? 0;
            return (
              <div
                key={category}
                className={cn(
                  'rounded-lg px-3 py-2 text-center text-sm font-semibold',
                  scoreBadgeClass(score),
                )}
              >
                <div className="text-xs font-medium">{APTITUDE_LABELS[category]}</div>
                <div className="mt-1 text-lg tabular-nums">{score}%</div>
              </div>
            );
          })}
        </div>

        <section className="rounded-lg border border-border bg-surfaceSoft p-4">
          <h2 className="text-sm font-semibold text-foreground">Explore these academic tracks:</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {(RECOMMENDATIONS[result.strongestCategory] ?? []).map((name) => (
              <span
                key={name}
                className="rounded-full bg-surface px-3 py-1 text-sm font-medium text-foreground"
              >
                {name}
              </span>
            ))}
          </div>
        </section>
      </div>
    </Card>
  );
}
