import { Link } from 'react-router-dom';
import { Atom, Beaker, BookOpenCheck, Brain, Clock3, Dna, Earth, FlaskConical } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { appCopy } from '../lib/constants/copy';

type UpcomingKey = keyof typeof appCopy.upcoming;

interface UpcomingPageProps {
  page: UpcomingKey;
}

const scienceDomains = [
  {
    title: 'Physics reasoning',
    detail: 'Motion, force, work, energy, light, electricity, and units.',
    icon: Atom,
  },
  {
    title: 'Chemistry basics',
    detail: 'Atoms, reactions, acids, bases, metals, non-metals, and separation.',
    icon: FlaskConical,
  },
  {
    title: 'Biology systems',
    detail: 'Cells, tissues, nutrition, respiration, transport, heredity, and ecology.',
    icon: Dna,
  },
  {
    title: 'Earth science',
    detail: 'Climate, resources, pollution, cycles, soil, water, and space science.',
    icon: Earth,
  },
] as const;

const questionBank = [
  {
    id: 1,
    domain: 'Physics',
    difficulty: 'Easy',
    question: 'A student walks 40 m east and then 30 m west. What is the displacement from the starting point?',
    options: ['10 m east', '70 m east', '10 m west', '70 m west'],
    answer: '10 m east',
    explanation: 'Displacement depends on the final position. 40 m east minus 30 m west leaves the student 10 m east.',
  },
  {
    id: 2,
    domain: 'Physics',
    difficulty: 'Medium',
    question: 'A force of 20 N moves an object by 3 m in the direction of the force. How much work is done?',
    options: ['6 J', '17 J', '23 J', '60 J'],
    answer: '60 J',
    explanation: 'Work equals force multiplied by displacement, so 20 N x 3 m = 60 J.',
  },
  {
    id: 3,
    domain: 'Physics',
    difficulty: 'Medium',
    question: 'Which device is used to measure electric current in a circuit?',
    options: ['Voltmeter', 'Ammeter', 'Barometer', 'Thermometer'],
    answer: 'Ammeter',
    explanation: 'An ammeter is connected in series to measure current. A voltmeter measures potential difference.',
  },
  {
    id: 4,
    domain: 'Chemistry',
    difficulty: 'Easy',
    question: 'Which of the following has a pH less than 7?',
    options: ['Lemon juice', 'Soap solution', 'Baking soda solution', 'Distilled water'],
    answer: 'Lemon juice',
    explanation: 'Acids have pH values below 7. Lemon juice contains citric acid.',
  },
  {
    id: 5,
    domain: 'Chemistry',
    difficulty: 'Medium',
    question: 'Which method is best for separating salt from a salt-water solution?',
    options: ['Filtration', 'Evaporation', 'Magnetic separation', 'Sedimentation'],
    answer: 'Evaporation',
    explanation: 'Salt dissolves in water, so filtration will not remove it. Evaporation leaves the dissolved salt behind.',
  },
  {
    id: 6,
    domain: 'Chemistry',
    difficulty: 'Hard',
    question: 'In the reaction Zn + CuSO4 -> ZnSO4 + Cu, what type of reaction is shown?',
    options: ['Combination', 'Decomposition', 'Displacement', 'Neutralization'],
    answer: 'Displacement',
    explanation: 'Zinc is more reactive than copper, so it displaces copper from copper sulphate solution.',
  },
  {
    id: 7,
    domain: 'Biology',
    difficulty: 'Easy',
    question: 'Which cell organelle is known as the powerhouse of the cell?',
    options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Vacuole'],
    answer: 'Mitochondria',
    explanation: 'Mitochondria release energy from food through cellular respiration.',
  },
  {
    id: 8,
    domain: 'Biology',
    difficulty: 'Medium',
    question: 'Which part of the human blood mainly transports oxygen?',
    options: ['Platelets', 'White blood cells', 'Red blood cells', 'Plasma proteins'],
    answer: 'Red blood cells',
    explanation: 'Red blood cells contain haemoglobin, which binds and carries oxygen.',
  },
  {
    id: 9,
    domain: 'Biology',
    difficulty: 'Hard',
    question: 'If tallness is dominant over dwarfness in pea plants, what does a heterozygous tall plant mean?',
    options: ['TT', 'Tt', 'tt', 'No allele is present'],
    answer: 'Tt',
    explanation: 'Heterozygous means two different alleles. With tallness dominant, Tt appears tall.',
  },
  {
    id: 10,
    domain: 'Earth science',
    difficulty: 'Easy',
    question: 'Which gas is used by plants during photosynthesis?',
    options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'],
    answer: 'Carbon dioxide',
    explanation: 'Plants use carbon dioxide and water to make glucose in the presence of light and chlorophyll.',
  },
  {
    id: 11,
    domain: 'Earth science',
    difficulty: 'Medium',
    question: 'Which process changes water vapour into liquid water droplets?',
    options: ['Evaporation', 'Condensation', 'Sublimation', 'Infiltration'],
    answer: 'Condensation',
    explanation: 'Condensation occurs when water vapour cools and changes into liquid droplets.',
  },
  {
    id: 12,
    domain: 'Earth science',
    difficulty: 'Hard',
    question: 'Why does the Moon appear to change shape during a month?',
    options: [
      'Earth blocks sunlight every night',
      'The Moon changes its actual shape',
      'We see different sunlit portions of the Moon',
      'Clouds cover different parts of the Moon',
    ],
    answer: 'We see different sunlit portions of the Moon',
    explanation: 'Moon phases happen because the Moon orbits Earth and we see changing portions of its lit half.',
  },
] as const;

const studyFocus = [
  'Revise one domain at a time, then mix questions to build switching speed.',
  'Write formulas with units before calculating numerical physics answers.',
  'For biology and earth science, connect each fact to a process or cause-effect chain.',
  'Review every wrong answer by naming why the correct option wins and why the others fail.',
] as const;

function ScienceAptitudePage() {
  return (
    <main className="bg-background px-4 py-8 text-foreground sm:px-6 lg:py-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase text-brand-700 dark:text-brand-300">Science aptitude</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Question bank for science practice
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
              Practice core science reasoning across physics, chemistry, biology, and earth science. Each question
              includes the correct option and a short explanation so students can revise quickly after attempting.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <Card className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200">
                <BookOpenCheck aria-hidden="true" className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold font-numeric">{questionBank.length}</p>
                <p className="text-sm text-muted">Practice questions</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-200">
                <Brain aria-hidden="true" className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold font-numeric">4</p>
                <p className="text-sm text-muted">Science domains</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-200">
                <Clock3 aria-hidden="true" className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold font-numeric">25 min</p>
                <p className="text-sm text-muted">Suggested attempt</p>
              </div>
            </Card>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Science domains">
          {scienceDomains.map((domain) => {
            const Icon = domain.icon;

            return (
              <Card key={domain.title} className="p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-foreground">{domain.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">{domain.detail}</p>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-200">
                <Beaker aria-hidden="true" className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase text-brand-700 dark:text-brand-300">Related content</p>
                <h2 className="text-xl font-semibold">How to use this bank</h2>
              </div>
            </div>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-muted">
              {studyFocus.map((item) => (
                <li key={item} className="rounded-lg border border-border bg-background px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          <section className="grid gap-4" aria-label="Science question bank">
            {questionBank.map((item) => (
              <Card key={item.id} className="p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase">
                    <span className="rounded-lg bg-sky-50 px-2.5 py-1 text-sky-800 dark:bg-sky-950/60 dark:text-sky-200">
                      {item.domain}
                    </span>
                    <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200">
                      {item.difficulty}
                    </span>
                  </div>
                  <span className="font-numeric text-sm font-semibold text-muted">Q{item.id}</span>
                </div>
                <h3 className="mt-4 text-base font-semibold leading-7 text-foreground">{item.question}</h3>
                <ol className="mt-4 grid gap-2 sm:grid-cols-2">
                  {item.options.map((option) => (
                    <li
                      key={option}
                      className="rounded-lg border border-border bg-background px-4 py-3 text-sm leading-6 text-foreground"
                    >
                      {option}
                    </li>
                  ))}
                </ol>
                <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
                  <p className="font-semibold">Answer: {item.answer}</p>
                  <p className="mt-1">{item.explanation}</p>
                </div>
              </Card>
            ))}
          </section>
        </section>
      </div>
    </main>
  );
}

export default function UpcomingPage({ page }: UpcomingPageProps) {
  const copy = appCopy.upcoming[page];

  if (page === 'tests') {
    return <ScienceAptitudePage />;
  }

  return (
    <main className="bg-background px-4 py-12 text-foreground sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        <Card className="p-8">
          <p className="text-sm font-semibold uppercase text-brand-700 dark:text-brand-300">Milestone roadmap</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">{copy.title}</h1>
          <p className="mt-3 text-base leading-7 text-muted">{copy.body}</p>
          <Link to="/">
            <Button className="mt-6">{appCopy.notFound.action}</Button>
          </Link>
        </Card>
      </div>
    </main>
  );
}
