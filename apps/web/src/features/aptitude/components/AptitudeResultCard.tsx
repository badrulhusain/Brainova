import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { cn } from '../../../lib/utils/cn';
import { APTITUDE_LABELS, type AptitudeCategory, type AptitudeResult } from '../types';

interface AptitudeResultCardProps {
  result: AptitudeResult;
  onRetake: () => void;
}

const CATEGORY_ORDER: AptitudeCategory[] = [
  'GOVERNANCE',
  'VISUAL_MEDIA',
  'FINE_ARTS',
  'COMMUNICATIONS',
  'TECH_DATA',
  'HR_MANAGEMENT',
  'BUSINESS_FINANCE',
  'HEALTHCARE',
  'PURE_SCIENCES',
  'HOSPITALITY_EVENTS',
];

const RECOMMENDATIONS: Record<AptitudeCategory, string[]> = {
  GOVERNANCE: ['IAS/Civil Service Track', 'Law', 'Public Policy', 'Judiciary'],
  VISUAL_MEDIA: ['Graphic Expert Track', 'UI/UX Design', 'Animation', 'Advertisement'],
  FINE_ARTS: ['Artist Track', 'Painting', 'Photography', 'Fashion Design'],
  COMMUNICATIONS: ['Language Expert Track', 'Journalism', 'Translation', 'Public Relations'],
  TECH_DATA: ['Tech Expert Track', 'Software Development', 'AI/ML', 'Cybersecurity'],
  HR_MANAGEMENT: ['HR/Management Track', 'Talent Acquisition', 'Operations', 'Leadership'],
  BUSINESS_FINANCE: ['Chartered Accountancy', 'Investment Banking', 'Entrepreneurship'],
  HEALTHCARE: ['Medicine', 'Biotechnology', 'Psychology', 'Veterinary Sciences'],
  PURE_SCIENCES: ['Physics', 'Chemistry', 'Mathematics', 'Academic Research'],
  HOSPITALITY_EVENTS: ['Hotel Management', 'Culinary Arts', 'Travel Consulting', 'Event Management'],
};

function scoreBadgeClass(score: number): string {
  if (score >= 70)
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300';
  if (score >= 40) return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300';
  return 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300';
}

export function AptitudeResultCard({ result, onRetake }: AptitudeResultCardProps) {
  const chartData = CATEGORY_ORDER.map((category) => ({
    subject: APTITUDE_LABELS[category],
    score: result.scores[category],
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
            const score = result.scores[category];
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
          <h2 className="text-sm font-semibold text-foreground">Explore these test domains:</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {RECOMMENDATIONS[result.strongestCategory].map((name) => (
              <span
                key={name}
                className="rounded-full bg-surface px-3 py-1 text-sm font-medium text-foreground"
              >
                {name}
              </span>
            ))}
          </div>
        </section>

        <Button className="self-start" onClick={onRetake} type="button" variant="ghost">
          Retake Assessment
        </Button>
      </div>
    </Card>
  );
}
