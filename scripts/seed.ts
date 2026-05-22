/**
 * Seed script — populates domains, topics, subtopics, questions, and test configs
 * via the NestJS REST API. No Firebase dependency.
 *
 * Usage:
 *   npm run seed                           # defaults: localhost:3000, admin/Admin@1234
 *   npm run seed -- --url http://...       # custom API URL
 *   npm run seed -- --user bob --pass X    # custom admin credentials
 */

import axios, { type AxiosInstance } from 'axios';

// ── Config ────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flag = (name: string, fallback: string): string => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? (args[i + 1] as string) : fallback;
};
const API_URL = flag('url', 'http://localhost:3000/api');
const ADMIN_USER = flag('user', process.env['ADMIN_USERNAME'] ?? 'admin');
const ADMIN_PASS = flag('pass', process.env['ADMIN_PASSWORD'] ?? 'Admin@1234');

// ── HTTP client ───────────────────────────────────────────────────────────────
const http: AxiosInstance = axios.create({ baseURL: API_URL });
// Unwrap { success, data } envelope from ResponseInterceptor
http.interceptors.response.use((res) => {
  const d = res.data as { success?: boolean; data?: unknown };
  if (d?.success === true && 'data' in d) res.data = d.data;
  return res;
});

// ── Helpers ───────────────────────────────────────────────────────────────────
const log = (msg: string) => process.stdout.write(`  ✓ ${msg}\n`);
const section = (msg: string) => process.stdout.write(`\n▸ ${msg}\n`);

interface WithId { id: string }

async function post<T extends WithId>(path: string, body: object): Promise<T> {
  const res = await http.post<T>(path, body);
  return res.data as T;
}

async function login(): Promise<void> {
  const res = await http.post<{ token: string }>('/auth/admin/login', {
    username: ADMIN_USER, password: ADMIN_PASS,
  });
  const token = (res.data as unknown as { token: string }).token;
  http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  log(`Logged in as "${ADMIN_USER}"`);
}

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

interface QuestionDef {
  text: string;
  options: string[];
  topicId: string;
  subtopicId: string;
  answerKey: { correctAnswer: string; explanation: string };
}

async function seedQuestions(domainId: string, difficulty: Difficulty, timeRec: number, questions: QuestionDef[]) {
  for (const q of questions) {
    await post('/questions', {
      domainId, topicId: q.topicId, subtopicId: q.subtopicId,
      type: 'MCQ', difficulty, text: q.text, options: q.options,
      marks: 1, negativeMarks: 0.25, timeRecommended: timeRec, tags: [],
      answerKey: q.answerKey,
    });
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  process.stdout.write('\nBrainova Seed Script\n' + '='.repeat(42) + '\n');
  await login();

  // ══════════════════════════════════════════════════════
  //  DOMAIN 1 — Quantitative Aptitude
  // ══════════════════════════════════════════════════════
  section('Domain 1: Quantitative Aptitude');
  const qa = await post<WithId>('/domains', {
    name: 'Quantitative Aptitude',
    description: 'Arithmetic, percentages, profit/loss and numerical reasoning.',
    icon: 'calculator', order: 0,
  });

  const pct = await post<WithId>(`/domains/${qa.id}/topics`, { name: 'Percentages', description: 'Percentage calculations and applications.', order: 0 });
  const pctS = await post<WithId>(`/domains/${qa.id}/topics/${pct.id}/subtopics`, { name: 'Basic Percentages', description: 'Finding % of a number, % change.', order: 0 });

  const pl = await post<WithId>(`/domains/${qa.id}/topics`, { name: 'Profit & Loss', description: 'Cost price, selling price, profit/loss.', order: 1 });
  const plS = await post<WithId>(`/domains/${qa.id}/topics/${pl.id}/subtopics`, { name: 'Profit & Loss Calculations', description: 'Computing profit%, loss%, marked price.', order: 0 });

  const tw = await post<WithId>(`/domains/${qa.id}/topics`, { name: 'Time & Work', description: 'Work rate problems and pipe/cistern.', order: 2 });
  const twS = await post<WithId>(`/domains/${qa.id}/topics/${tw.id}/subtopics`, { name: 'Work Rate', description: 'Individual and combined work rates.', order: 0 });

  const ts = await post<WithId>(`/domains/${qa.id}/topics`, { name: 'Time, Speed & Distance', description: 'Speed, distance, and time problems.', order: 3 });
  const tsS = await post<WithId>(`/domains/${qa.id}/topics/${ts.id}/subtopics`, { name: 'Speed & Distance', description: 'Basic and relative speed problems.', order: 0 });

  await seedQuestions(qa.id, 'EASY', 60, [
    { text: 'What is 25% of 200?', options: ['40', '50', '60', '75'], topicId: pct.id, subtopicId: pctS.id, answerKey: { correctAnswer: '50', explanation: '25% of 200 = (25/100)×200 = 50.' } },
    { text: 'A shopkeeper buys at ₹80 and sells at ₹100. What is the profit%?', options: ['15%', '20%', '25%', '30%'], topicId: pl.id, subtopicId: plS.id, answerKey: { correctAnswer: '25%', explanation: 'Profit=20. Profit%=(20/80)×100=25%.' } },
    { text: 'A car travels 120 km in 2 hours. What is its speed in km/h?', options: ['50', '55', '60', '65'], topicId: ts.id, subtopicId: tsS.id, answerKey: { correctAnswer: '60', explanation: 'Speed=Distance÷Time=120÷2=60 km/h.' } },
    { text: '8 workers can finish a job in 12 days. How many days will 4 workers take?', options: ['6', '8', '16', '24'], topicId: tw.id, subtopicId: twS.id, answerKey: { correctAnswer: '24', explanation: '8×12=4×D → D=24 days.' } },
    { text: 'What is 15% of 400?', options: ['50', '55', '60', '65'], topicId: pct.id, subtopicId: pctS.id, answerKey: { correctAnswer: '60', explanation: '15% of 400=(15/100)×400=60.' } },
  ]);

  await seedQuestions(qa.id, 'MEDIUM', 90, [
    { text: 'A price increases by 20% then decreases by 20%. What is the net change?', options: ['0%', '-4%', '+4%', '-2%'], topicId: pct.id, subtopicId: pctS.id, answerKey: { correctAnswer: '-4%', explanation: '1.2×0.8=0.96 → net change=-4%.' } },
    { text: 'Simple interest on ₹5,000 at 8% per annum for 2 years is:', options: ['₹700', '₹750', '₹800', '₹850'], topicId: pl.id, subtopicId: plS.id, answerKey: { correctAnswer: '₹800', explanation: 'SI=5000×8×2÷100=₹800.' } },
    { text: 'Two numbers in ratio 3:5 have sum 160. Find the larger number.', options: ['60', '80', '100', '120'], topicId: pct.id, subtopicId: pctS.id, answerKey: { correctAnswer: '100', explanation: '8x=160→x=20. Larger=5×20=100.' } },
    { text: 'A shopkeeper marks goods 40% above cost and gives 10% discount. Profit%?', options: ['26%', '28%', '30%', '32%'], topicId: pl.id, subtopicId: plS.id, answerKey: { correctAnswer: '26%', explanation: 'SP=Cost×1.4×0.9=1.26×Cost → profit=26%.' } },
    { text: 'A train travels at 60 km/h. How long (in minutes) to cover 45 km?', options: ['30', '40', '45', '50'], topicId: ts.id, subtopicId: tsS.id, answerKey: { correctAnswer: '45', explanation: 'Time=45÷60 hours=0.75 h=45 minutes.' } },
  ]);

  await seedQuestions(qa.id, 'HARD', 120, [
    { text: 'A and B together finish work in 6 days. A alone in 10 days. Days for B alone?', options: ['12', '15', '18', '20'], topicId: tw.id, subtopicId: twS.id, answerKey: { correctAnswer: '15', explanation: '1/B=1/6-1/10=2/30 → B=15 days.' } },
    { text: 'A 150 m train passes a pole in 15 s. Time to pass a 300 m platform?', options: ['30 s', '35 s', '40 s', '45 s'], topicId: ts.id, subtopicId: tsS.id, answerKey: { correctAnswer: '45 s', explanation: 'Speed=10 m/s. Time=(150+300)÷10=45 s.' } },
    { text: 'Sugar price rises 25%. By what % must a family reduce consumption to keep expenditure unchanged?', options: ['20%', '25%', '15%', '10%'], topicId: pct.id, subtopicId: pctS.id, answerKey: { correctAnswer: '20%', explanation: 'Reduction=25÷125×100=20%.' } },
    { text: 'Two pipes fill a tank in 15 and 20 min. A drain empties it in 30 min. Time to fill with all open?', options: ['10 min', '12 min', '15 min', '8 min'], topicId: tw.id, subtopicId: twS.id, answerKey: { correctAnswer: '12 min', explanation: 'Rate=1/15+1/20-1/30=(4+3-2)/60=5/60=1/12 → 12 min.' } },
    { text: 'A sum doubles in 8 years at simple interest. In how many years will it triple?', options: ['12', '16', '18', '20'], topicId: pl.id, subtopicId: plS.id, answerKey: { correctAnswer: '16', explanation: 'Rate=100/8=12.5% p.a. Triple: 2P=P×12.5/100×T → T=16 years.' } },
  ]);
  log(`Quantitative Aptitude: 15 questions created`);

  // ══════════════════════════════════════════════════════
  //  DOMAIN 2 — Logical Reasoning
  // ══════════════════════════════════════════════════════
  section('Domain 2: Logical Reasoning');
  const lr = await post<WithId>('/domains', {
    name: 'Logical Reasoning',
    description: 'Number series, analogies, and logical deduction problems.',
    icon: 'brain', order: 1,
  });

  const ns = await post<WithId>(`/domains/${lr.id}/topics`, { name: 'Number Series', description: 'Find the pattern and next term.', order: 0 });
  const nsS = await post<WithId>(`/domains/${lr.id}/topics/${ns.id}/subtopics`, { name: 'Pattern Finding', description: 'Arithmetic and geometric sequence patterns.', order: 0 });

  const an = await post<WithId>(`/domains/${lr.id}/topics`, { name: 'Analogies', description: 'Word and number analogy questions.', order: 1 });
  const anS = await post<WithId>(`/domains/${lr.id}/topics/${an.id}/subtopics`, { name: 'Word Analogies', description: 'Relationship between pairs of words.', order: 0 });

  const sy = await post<WithId>(`/domains/${lr.id}/topics`, { name: 'Syllogisms', description: 'Logical deduction from given statements.', order: 2 });
  const syS = await post<WithId>(`/domains/${lr.id}/topics/${sy.id}/subtopics`, { name: 'Deductive Reasoning', description: 'Drawing valid conclusions from premises.', order: 0 });

  await seedQuestions(lr.id, 'EASY', 60, [
    { text: 'Find the next number: 2, 4, 8, 16, ?', options: ['24', '28', '32', '36'], topicId: ns.id, subtopicId: nsS.id, answerKey: { correctAnswer: '32', explanation: 'Each number is doubled. 16×2=32.' } },
    { text: 'Find the next number: 3, 6, 9, 12, ?', options: ['14', '15', '16', '18'], topicId: ns.id, subtopicId: nsS.id, answerKey: { correctAnswer: '15', explanation: 'Common difference 3. 12+3=15.' } },
    { text: 'Book : Library :: Patient : ?', options: ['Doctor', 'Hospital', 'Medicine', 'Nurse'], topicId: an.id, subtopicId: anS.id, answerKey: { correctAnswer: 'Hospital', explanation: 'Books are kept in a Library; Patients are treated in a Hospital.' } },
    { text: 'Find the odd one out: Cat, Dog, Lion, Rose, Tiger', options: ['Cat', 'Dog', 'Rose', 'Tiger'], topicId: an.id, subtopicId: anS.id, answerKey: { correctAnswer: 'Rose', explanation: 'Rose is a plant; all others are animals.' } },
    { text: 'Find the next number: 1, 1, 2, 3, 5, 8, ?', options: ['10', '11', '13', '16'], topicId: ns.id, subtopicId: nsS.id, answerKey: { correctAnswer: '13', explanation: 'Fibonacci: each term = sum of two preceding. 5+8=13.' } },
  ]);

  await seedQuestions(lr.id, 'MEDIUM', 90, [
    { text: 'Find the next number: 1, 4, 9, 16, 25, ?', options: ['30', '35', '36', '49'], topicId: ns.id, subtopicId: nsS.id, answerKey: { correctAnswer: '36', explanation: 'Perfect squares: 1²,2²,...,6²=36.' } },
    { text: 'Find the next number: 2, 6, 12, 20, 30, ?', options: ['40', '42', '45', '50'], topicId: ns.id, subtopicId: nsS.id, answerKey: { correctAnswer: '42', explanation: 'n(n+1): 1×2=2,...,6×7=42. Differences 4,6,8,10,12: 30+12=42.' } },
    { text: 'In a row, A is 5th from the left and 8th from the right. How many people are in the row?', options: ['11', '12', '13', '14'], topicId: sy.id, subtopicId: syS.id, answerKey: { correctAnswer: '12', explanation: 'Total=5+8-1=12.' } },
    { text: 'Doctor : Hospital :: Teacher : ?', options: ['Book', 'School', 'Student', 'Classroom'], topicId: an.id, subtopicId: anS.id, answerKey: { correctAnswer: 'School', explanation: 'A Doctor works in a Hospital; a Teacher works in a School.' } },
    { text: 'Find the next number: 3, 7, 13, 21, 31, ?', options: ['40', '41', '43', '45'], topicId: ns.id, subtopicId: nsS.id, answerKey: { correctAnswer: '43', explanation: 'Differences 4,6,8,10,12. 31+12=43.' } },
  ]);

  await seedQuestions(lr.id, 'HARD', 120, [
    { text: 'All roses are flowers. Some flowers fade quickly. Which conclusion is definitely valid?', options: ['All roses fade quickly', 'Some roses may fade quickly', 'No roses fade quickly', 'Roses never fade'], topicId: sy.id, subtopicId: syS.id, answerKey: { correctAnswer: 'Some roses may fade quickly', explanation: 'Only "some flowers" fade quickly, so roses may or may not be among them.' } },
    { text: 'Find the next number: 4, 8, 24, 96, 480, ?', options: ['2400', '2880', '3360', '1920'], topicId: ns.id, subtopicId: nsS.id, answerKey: { correctAnswer: '2880', explanation: 'Multiply by 2,3,4,5,6: 480×6=2880.' } },
    { text: '30% failed Maths, 20% failed English, 10% failed both. What % passed in both?', options: ['50%', '55%', '60%', '65%'], topicId: sy.id, subtopicId: syS.id, answerKey: { correctAnswer: '60%', explanation: 'Failed at least one=30+20-10=40%. Passed both=60%.' } },
    { text: 'A is taller than B. C is taller than A. D is shorter than B. Who is tallest?', options: ['A', 'B', 'C', 'D'], topicId: sy.id, subtopicId: syS.id, answerKey: { correctAnswer: 'C', explanation: 'Order: C>A>B>D. C is tallest.' } },
    { text: 'Find the next number: 1, 2, 6, 24, 120, ?', options: ['240', '360', '720', '600'], topicId: ns.id, subtopicId: nsS.id, answerKey: { correctAnswer: '720', explanation: 'Factorials: 1!=1,2!=2,3!=6,4!=24,5!=120,6!=720.' } },
  ]);
  log(`Logical Reasoning: 15 questions created`);

  // ══════════════════════════════════════════════════════
  //  DOMAIN 3 — Verbal Ability
  // ══════════════════════════════════════════════════════
  section('Domain 3: Verbal Ability');
  const va = await post<WithId>('/domains', {
    name: 'Verbal Ability',
    description: 'Vocabulary, synonyms, antonyms, and grammar for aptitude tests.',
    icon: 'book-open', order: 2,
  });

  const syn = await post<WithId>(`/domains/${va.id}/topics`, { name: 'Synonyms & Antonyms', description: 'Words with same or opposite meanings.', order: 0 });
  const synS = await post<WithId>(`/domains/${va.id}/topics/${syn.id}/subtopics`, { name: 'Word Meanings', description: 'Vocabulary and word relationship.', order: 0 });

  const gr = await post<WithId>(`/domains/${va.id}/topics`, { name: 'Grammar', description: 'Error spotting and sentence correction.', order: 1 });
  const grS = await post<WithId>(`/domains/${va.id}/topics/${gr.id}/subtopics`, { name: 'Sentence Correction', description: 'Identify and correct grammatical errors.', order: 0 });

  await seedQuestions(va.id, 'EASY', 45, [
    { text: 'Choose the synonym of "HAPPY":', options: ['Sad', 'Joyful', 'Angry', 'Tired'], topicId: syn.id, subtopicId: synS.id, answerKey: { correctAnswer: 'Joyful', explanation: '"Joyful" means great happiness — a synonym of "happy".' } },
    { text: 'Choose the antonym of "BRIGHT":', options: ['Shiny', 'Clever', 'Dim', 'Radiant'], topicId: syn.id, subtopicId: synS.id, answerKey: { correctAnswer: 'Dim', explanation: '"Dim" means not bright — the antonym of "bright".' } },
    { text: 'Choose the synonym of "BRAVE":', options: ['Cowardly', 'Fearful', 'Courageous', 'Timid'], topicId: syn.id, subtopicId: synS.id, answerKey: { correctAnswer: 'Courageous', explanation: '"Courageous" means ready to face danger — a synonym of "brave".' } },
    { text: 'Fill in the blank: She ___ to school every day.', options: ['go', 'goes', 'going', 'gone'], topicId: gr.id, subtopicId: grS.id, answerKey: { correctAnswer: 'goes', explanation: 'Singular third-person subject requires "goes".' } },
    { text: 'Choose the antonym of "ANCIENT":', options: ['Old', 'Modern', 'Vintage', 'Historic'], topicId: syn.id, subtopicId: synS.id, answerKey: { correctAnswer: 'Modern', explanation: '"Modern" refers to the present — antonym of "ancient".' } },
  ]);

  await seedQuestions(va.id, 'MEDIUM', 60, [
    { text: 'Choose the synonym of "VERBOSE":', options: ['Concise', 'Wordy', 'Silent', 'Brief'], topicId: syn.id, subtopicId: synS.id, answerKey: { correctAnswer: 'Wordy', explanation: '"Verbose" means using too many words — synonym of "wordy".' } },
    { text: 'Choose the antonym of "OPAQUE":', options: ['Dark', 'Cloudy', 'Transparent', 'Dense'], topicId: syn.id, subtopicId: synS.id, answerKey: { correctAnswer: 'Transparent', explanation: '"Opaque" means not see-through — antonym is "transparent".' } },
    { text: 'Identify the error: "Each of the students have submitted their assignment."', options: ['Each of', 'the students', 'have submitted', 'their assignment'], topicId: gr.id, subtopicId: grS.id, answerKey: { correctAnswer: 'have submitted', explanation: '"Each" is singular → verb should be "has submitted".' } },
    { text: 'Choose the synonym of "EPHEMERAL":', options: ['Permanent', 'Temporary', 'Eternal', 'Lasting'], topicId: syn.id, subtopicId: synS.id, answerKey: { correctAnswer: 'Temporary', explanation: '"Ephemeral" means lasting a very short time — synonym of "temporary".' } },
    { text: 'Fill in the blank: Neither the manager nor the employees ___ satisfied.', options: ['was', 'were', 'is', 'are'], topicId: gr.id, subtopicId: grS.id, answerKey: { correctAnswer: 'were', explanation: 'With "neither...nor", verb agrees with closer subject ("employees" — plural) → "were".' } },
  ]);

  await seedQuestions(va.id, 'HARD', 90, [
    { text: 'Choose the word closest in meaning to "LACONIC":', options: ['Talkative', 'Melodious', 'Brief and concise', 'Complicated'], topicId: syn.id, subtopicId: synS.id, answerKey: { correctAnswer: 'Brief and concise', explanation: '"Laconic" means using very few words. From Laconia (Sparta), famous for brevity.' } },
    { text: 'Choose the antonym of "SANGUINE":', options: ['Optimistic', 'Hopeful', 'Pessimistic', 'Confident'], topicId: syn.id, subtopicId: synS.id, answerKey: { correctAnswer: 'Pessimistic', explanation: '"Sanguine" means optimistic — antonym is "pessimistic".' } },
    { text: 'Identify the correctly written sentence:', options: ['The committee have reached their decision.', 'The committee has reached its decision.', 'The committee have reached its decision.', 'The committee has reached their decision.'], topicId: gr.id, subtopicId: grS.id, answerKey: { correctAnswer: 'The committee has reached its decision.', explanation: '"Committee" is a collective noun treated as singular → "has" and "its".' } },
    { text: 'Choose the synonym of "PERFIDIOUS":', options: ['Loyal', 'Treacherous', 'Honest', 'Reliable'], topicId: syn.id, subtopicId: synS.id, answerKey: { correctAnswer: 'Treacherous', explanation: '"Perfidious" means deceitful and untrustworthy — synonym of "treacherous".' } },
    { text: 'Fill in the blank: Had I known earlier, I ___ helped you.', options: ['would have', 'will have', 'would', 'should'], topicId: gr.id, subtopicId: grS.id, answerKey: { correctAnswer: 'would have', explanation: 'Third conditional (unreal past): "Had I known, I would have [done]".' } },
  ]);
  log(`Verbal Ability: 15 questions created`);

  // ══════════════════════════════════════════════════════
  //  TEST CONFIGURATIONS
  // ══════════════════════════════════════════════════════
  section('Test Configurations');

  await post('/test-configs', {
    name: 'Quantitative Aptitude — Starter', domainId: qa.id,
    description: 'Basic arithmetic, percentages, and profit/loss. 10 questions, 20 minutes.',
    totalQuestions: 10, duration: 1200, marksPerQuestion: 1, negativeMarksRatio: 0.25,
    easyCount: 4, mediumCount: 3, hardCount: 3, shuffleQuestions: true, shuffleOptions: false,
  });
  await post('/test-configs', {
    name: 'Logical Reasoning — Starter', domainId: lr.id,
    description: 'Number series, analogies, and logical deduction. 10 questions, 20 minutes.',
    totalQuestions: 10, duration: 1200, marksPerQuestion: 1, negativeMarksRatio: 0.25,
    easyCount: 4, mediumCount: 3, hardCount: 3, shuffleQuestions: true, shuffleOptions: false,
  });
  await post('/test-configs', {
    name: 'Verbal Ability — Starter', domainId: va.id,
    description: 'Synonyms, antonyms, and grammar. 10 questions, 15 minutes.',
    totalQuestions: 10, duration: 900, marksPerQuestion: 1, negativeMarksRatio: 0.25,
    easyCount: 4, mediumCount: 3, hardCount: 3, shuffleQuestions: true, shuffleOptions: false,
  });
  log('3 test configurations created');

  process.stdout.write('\n' + '='.repeat(42) + '\n');
  process.stdout.write('Seed complete!  3 domains · 45 questions · 3 test configs\n');
  process.stdout.write(`Go to http://localhost:4173/tests to take your first test.\n\n`);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`\nSeed failed: ${msg}\n`);
  if (axios.isAxiosError(err) && err.response) {
    process.stderr.write(JSON.stringify(err.response.data, null, 2) + '\n');
  }
  process.exit(1);
});
