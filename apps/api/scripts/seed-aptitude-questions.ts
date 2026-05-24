import 'dotenv/config';
import mongoose from 'mongoose';
import {
  AptitudeQuestionModelName,
  AptitudeQuestionSchema,
  type AptitudeCategory,
  type Difficulty,
} from '../src/database/mongo.schemas';

interface AptitudeQuestionSeed {
  category: AptitudeCategory;
  text: string;
  options: [string, string, string, string];
  correctAnswer: string;
  difficulty: Difficulty;
}

// 30 questions — 10 categories × 3 questions each
// Difficulty distribution: 10 EASY (1 per category) + 15 MEDIUM + 5 HARD
// Hard categories: HUMANITIES, COMMUNICATIONS, TECHNOLOGY, COMMERCE, LOGICAL_ANALYTICAL
const questions: AptitudeQuestionSeed[] = [

  // ─── HUMANITIES (1E, 1M, 1H) ───────────────────────────────────────────────
  {
    category: 'HUMANITIES',
    text: 'Which branch of government is responsible for making laws in a parliamentary democracy?',
    options: [
      'Executive',
      'Judiciary',
      'Legislature',
      'Military',
    ],
    correctAnswer: 'Legislature',
    difficulty: 'EASY',
  },
  {
    category: 'HUMANITIES',
    text: 'The principle of "separation of powers" in government refers to:',
    options: [
      'Dividing the country into separate administrative states',
      'Distributing authority among the legislative, executive, and judicial branches',
      'Separating civil and criminal court systems',
      'Dividing tax collection between central and regional governments',
    ],
    correctAnswer: 'Distributing authority among the legislative, executive, and judicial branches',
    difficulty: 'MEDIUM',
  },
  {
    category: 'HUMANITIES',
    text: 'Which 1648 treaty established the principle of national sovereignty that underpins modern international law?',
    options: [
      'Treaty of Vienna',
      'Treaty of Westphalia',
      'Treaty of Paris',
      'Treaty of Utrecht',
    ],
    correctAnswer: 'Treaty of Westphalia',
    difficulty: 'HARD',
  },

  // ─── FINE_ARTS (1E, 2M) ────────────────────────────────────────────────────
  {
    category: 'FINE_ARTS',
    text: 'The three primary colors in traditional (subtractive) painting are red, yellow, and:',
    options: [
      'Green',
      'Orange',
      'Purple',
      'Blue',
    ],
    correctAnswer: 'Blue',
    difficulty: 'EASY',
  },
  {
    category: 'FINE_ARTS',
    text: 'In Western music theory, a "minor third" interval consists of how many semitones?',
    options: [
      '2',
      '3',
      '4',
      '5',
    ],
    correctAnswer: '3',
    difficulty: 'MEDIUM',
  },
  {
    category: 'FINE_ARTS',
    text: 'The early 20th-century art movement characterized by dreamlike imagery and exploration of the unconscious mind is:',
    options: [
      'Impressionism',
      'Cubism',
      'Surrealism',
      'Expressionism',
    ],
    correctAnswer: 'Surrealism',
    difficulty: 'MEDIUM',
  },

  // ─── COMMUNICATIONS (1E, 1M, 1H) ───────────────────────────────────────────
  {
    category: 'COMMUNICATIONS',
    text: 'In formal academic writing, a "thesis statement" is best described as:',
    options: [
      'A list of references used in the essay',
      'The central argument or main point of the piece',
      'The concluding paragraph of an essay',
      'A summary of opposing viewpoints',
    ],
    correctAnswer: 'The central argument or main point of the piece',
    difficulty: 'EASY',
  },
  {
    category: 'COMMUNICATIONS',
    text: 'Which literary device involves attributing human qualities or actions to non-human things?',
    options: [
      'Hyperbole',
      'Alliteration',
      'Personification',
      'Onomatopoeia',
    ],
    correctAnswer: 'Personification',
    difficulty: 'MEDIUM',
  },
  {
    category: 'COMMUNICATIONS',
    text: 'In the Shannon–Weaver model of communication, "noise" is defined as:',
    options: [
      'The loudness of the sender\'s voice',
      'Any interference that distorts or disrupts message transmission',
      'The vocabulary level of the message',
      'The emotional tone used by the sender',
    ],
    correctAnswer: 'Any interference that distorts or disrupts message transmission',
    difficulty: 'HARD',
  },

  // ─── VISUAL_DESIGN (1E, 2M) ────────────────────────────────────────────────
  {
    category: 'VISUAL_DESIGN',
    text: 'In visual composition, the "rule of thirds" is a guideline that involves:',
    options: [
      'Using exactly three colors in every design',
      'Dividing text content into three equal sections',
      'Dividing the frame with a 3×3 grid to position key elements along the lines or intersections',
      'Limiting a design to three typefaces',
    ],
    correctAnswer: 'Dividing the frame with a 3×3 grid to position key elements along the lines or intersections',
    difficulty: 'EASY',
  },
  {
    category: 'VISUAL_DESIGN',
    text: 'The golden ratio (approximately 1.618) is used in design because it:',
    options: [
      'Speeds up the loading time of web pages',
      'Creates visually pleasing proportions that feel naturally balanced',
      'Defines the maximum safe number of colors in a design',
      'Sets the standard screen resolution for digital displays',
    ],
    correctAnswer: 'Creates visually pleasing proportions that feel naturally balanced',
    difficulty: 'MEDIUM',
  },
  {
    category: 'VISUAL_DESIGN',
    text: 'In UX design, "information architecture" refers to:',
    options: [
      'The visual aesthetic and color palette of an interface',
      'Structuring and organising content so users can navigate and find information easily',
      'The programming language used to build a website',
      'The physical dimensions of a computer screen',
    ],
    correctAnswer: 'Structuring and organising content so users can navigate and find information easily',
    difficulty: 'MEDIUM',
  },

  // ─── TECHNOLOGY (1E, 1M, 1H) ───────────────────────────────────────────────
  {
    category: 'TECHNOLOGY',
    text: 'What does the acronym "RAM" stand for in computing?',
    options: [
      'Read-Access Memory',
      'Random-Access Memory',
      'Rapid-Application Module',
      'Readable Array Module',
    ],
    correctAnswer: 'Random-Access Memory',
    difficulty: 'EASY',
  },
  {
    category: 'TECHNOLOGY',
    text: 'In programming, a "stack overflow" error typically occurs because:',
    options: [
      'Too much data is written to a hard drive at once',
      'A program exhausts call-stack memory through excessively deep or infinite recursion',
      'A network connection is overwhelmed with simultaneous requests',
      'A database query exceeds its timeout limit',
    ],
    correctAnswer: 'A program exhausts call-stack memory through excessively deep or infinite recursion',
    difficulty: 'MEDIUM',
  },
  {
    category: 'TECHNOLOGY',
    text: 'In asymmetric (public-key) cryptography, data encrypted with a recipient\'s public key can only be decrypted by:',
    options: [
      'Anyone who holds the public key',
      'The certificate authority that issued the key pair',
      'The recipient\'s corresponding private key',
      'A shared symmetric session key',
    ],
    correctAnswer: 'The recipient\'s corresponding private key',
    difficulty: 'HARD',
  },

  // ─── MANAGEMENT (1E, 2M) ───────────────────────────────────────────────────
  {
    category: 'MANAGEMENT',
    text: 'In a SWOT analysis, the letter "T" stands for:',
    options: [
      'Technology',
      'Threats',
      'Timeline',
      'Tactics',
    ],
    correctAnswer: 'Threats',
    difficulty: 'EASY',
  },
  {
    category: 'MANAGEMENT',
    text: 'In Herzberg\'s two-factor theory of motivation, "motivators" are factors that:',
    options: [
      'Prevent employee dissatisfaction when present',
      'Drive active satisfaction and higher performance when present',
      'Relate solely to salary and working conditions',
      'Apply only to senior management roles',
    ],
    correctAnswer: 'Drive active satisfaction and higher performance when present',
    difficulty: 'MEDIUM',
  },
  {
    category: 'MANAGEMENT',
    text: 'The Pareto Principle (80/20 rule) applied to management suggests that:',
    options: [
      '80% of employees are responsible for 20% of company costs',
      'Roughly 20% of causes or inputs are responsible for about 80% of outcomes or results',
      'Managers should spend 80% of their time in planning meetings',
      '20% of meetings account for 80% of strategic decisions',
    ],
    correctAnswer: 'Roughly 20% of causes or inputs are responsible for about 80% of outcomes or results',
    difficulty: 'MEDIUM',
  },

  // ─── COMMERCE (1E, 1M, 1H) ─────────────────────────────────────────────────
  {
    category: 'COMMERCE',
    text: 'GDP (Gross Domestic Product) measures:',
    options: [
      'A government\'s total outstanding external debt',
      'The total market value of all goods and services produced within a country in a given period',
      'The value of a country\'s exports minus its imports',
      'The total value of a nation\'s natural resource reserves',
    ],
    correctAnswer: 'The total market value of all goods and services produced within a country in a given period',
    difficulty: 'EASY',
  },
  {
    category: 'COMMERCE',
    text: 'The law of demand states that, all other factors being constant:',
    options: [
      'Price and quantity demanded move in the same direction',
      'As price rises, quantity demanded falls',
      'Consumer income is the sole determinant of demand',
      'A decrease in supply always raises demand',
    ],
    correctAnswer: 'As price rises, quantity demanded falls',
    difficulty: 'MEDIUM',
  },
  {
    category: 'COMMERCE',
    text: 'In accounting, the "matching principle" requires that:',
    options: [
      'Total assets must always equal total liabilities',
      'All expenses must be paid in cash before being recorded',
      'Expenses are recognised in the same period as the revenues they helped generate',
      'Revenue is recorded only when cash is physically received',
    ],
    correctAnswer: 'Expenses are recognised in the same period as the revenues they helped generate',
    difficulty: 'HARD',
  },

  // ─── CHEMICAL_SCIENCES (1E, 2M) ────────────────────────────────────────────
  {
    category: 'CHEMICAL_SCIENCES',
    text: 'The atomic number of an element is defined as the number of:',
    options: [
      'Neutrons in its nucleus',
      'Protons in its nucleus',
      'Electrons in its outermost shell',
      'Nucleons (protons + neutrons) in its nucleus',
    ],
    correctAnswer: 'Protons in its nucleus',
    difficulty: 'EASY',
  },
  {
    category: 'CHEMICAL_SCIENCES',
    text: 'A covalent bond is formed when two atoms:',
    options: [
      'Transfer electrons from one atom to the other',
      'Share one or more pairs of electrons between them',
      'Attract through opposite electrostatic charges',
      'Exchange protons across their nuclei',
    ],
    correctAnswer: 'Share one or more pairs of electrons between them',
    difficulty: 'MEDIUM',
  },
  {
    category: 'CHEMICAL_SCIENCES',
    text: 'The pH of pure water at 25 °C is:',
    options: [
      '5',
      '6',
      '7',
      '8',
    ],
    correctAnswer: '7',
    difficulty: 'MEDIUM',
  },

  // ─── PHYSICAL_SCIENCES (1E, 2M) ────────────────────────────────────────────
  {
    category: 'PHYSICAL_SCIENCES',
    text: 'Newton\'s second law of motion states that the net force on an object equals:',
    options: [
      'Its mass divided by its acceleration',
      'Its velocity multiplied by time',
      'Its mass multiplied by its acceleration',
      'Its acceleration divided by its mass',
    ],
    correctAnswer: 'Its mass multiplied by its acceleration',
    difficulty: 'EASY',
  },
  {
    category: 'PHYSICAL_SCIENCES',
    text: 'An object is dropped from rest in a vacuum (g = 10 m/s²). Its velocity after 3 seconds is:',
    options: [
      '10 m/s',
      '20 m/s',
      '30 m/s',
      '40 m/s',
    ],
    correctAnswer: '30 m/s',
    difficulty: 'MEDIUM',
  },
  {
    category: 'PHYSICAL_SCIENCES',
    text: 'Electric resistance in a conductor is best defined as:',
    options: [
      'The rate at which electric charge flows through the conductor',
      'The energy stored in the conductor per unit charge',
      'The opposition offered by the conductor to the flow of electric current',
      'The force between two nearby charged conductors',
    ],
    correctAnswer: 'The opposition offered by the conductor to the flow of electric current',
    difficulty: 'MEDIUM',
  },

  // ─── LOGICAL_ANALYTICAL (1E, 1M, 1H) ──────────────────────────────────────
  {
    category: 'LOGICAL_ANALYTICAL',
    text: 'If all squares are rectangles and all rectangles are quadrilaterals, which conclusion must be true?',
    options: [
      'All quadrilaterals are squares',
      'All rectangles are squares',
      'All squares are quadrilaterals',
      'All quadrilaterals are rectangles',
    ],
    correctAnswer: 'All squares are quadrilaterals',
    difficulty: 'EASY',
  },
  {
    category: 'LOGICAL_ANALYTICAL',
    text: 'What is the next number in the sequence: 3, 9, 27, 81, ___?',
    options: [
      '162',
      '243',
      '324',
      '729',
    ],
    correctAnswer: '243',
    difficulty: 'MEDIUM',
  },
  {
    category: 'LOGICAL_ANALYTICAL',
    text: 'In a class of 80 students, 45 study Mathematics, 40 study English, and 20 study both. How many students study neither subject?',
    options: [
      '5',
      '10',
      '15',
      '20',
    ],
    correctAnswer: '15',
    difficulty: 'HARD',
  },
];

async function main(): Promise<void> {
  const uri = process.env['MONGODB_URI'];
  if (!uri) {
    throw new Error('MONGODB_URI is required to seed aptitude questions.');
  }

  await mongoose.connect(uri);
  const AptitudeQuestion = mongoose.model(AptitudeQuestionModelName, AptitudeQuestionSchema);
  const seededTexts = questions.map((q) => q.text);

  await AptitudeQuestion.updateMany({ text: { $nin: seededTexts } }, { $set: { active: false } });

  for (const question of questions) {
    await AptitudeQuestion.replaceOne(
      { text: question.text },
      { ...question, active: true },
      { upsert: true },
    );
  }

  const counts = await AptitudeQuestion.aggregate<{ _id: AptitudeCategory; count: number }>([
    { $match: { active: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  process.stdout.write(`Seeded ${questions.length} aptitude questions.\n`);
  for (const count of counts) {
    process.stdout.write(`  ${count._id}: ${count.count} active questions\n`);
  }

  const diffCounts = await AptitudeQuestion.aggregate<{ _id: string; count: number }>([
    { $match: { active: true } },
    { $group: { _id: '$difficulty', count: { $sum: 1 } } },
  ]);
  process.stdout.write('\nDifficulty breakdown:\n');
  for (const d of diffCounts) {
    process.stdout.write(`  ${d._id}: ${d.count}\n`);
  }

  await mongoose.disconnect();
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Aptitude question seed failed: ${message}\n`);
  void mongoose.disconnect().finally(() => process.exit(1));
});
