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

const questions: AptitudeQuestionSeed[] = [
  {
    category: 'GOVERNANCE',
    text: 'Which responsibility would you most enjoy leading in school or college?',
    options: [
      'Organizing a civic awareness campaign',
      'Designing posters for an event',
      'Building a small software tool',
      'Planning the food and guest experience',
    ],
    correctAnswer: 'Organizing a civic awareness campaign',
    difficulty: 'EASY',
  },
  {
    category: 'GOVERNANCE',
    text: 'A local community problem needs a solution. Which first step feels most natural to you?',
    options: [
      'Study the rules, stakeholders, and public impact',
      'Calculate the possible profit and loss',
      'Create a visual campaign identity',
      'Run a biology-based field experiment',
    ],
    correctAnswer: 'Study the rules, stakeholders, and public impact',
    difficulty: 'MEDIUM',
  },
  {
    category: 'GOVERNANCE',
    text: 'Which topic would you choose for a long research assignment?',
    options: [
      'How public policy affects citizens',
      'How typography affects brand recall',
      'How hotel teams handle peak season',
      'How circuits process signals',
    ],
    correctAnswer: 'How public policy affects citizens',
    difficulty: 'HARD',
  },
  {
    category: 'VISUAL_MEDIA',
    text: 'Which project sounds most exciting to you?',
    options: [
      'Creating a complete logo and social media kit',
      'Mediating conflict inside a team',
      'Studying medicine and patient symptoms',
      'Preparing for civil service interviews',
    ],
    correctAnswer: 'Creating a complete logo and social media kit',
    difficulty: 'EASY',
  },
  {
    category: 'VISUAL_MEDIA',
    text: 'When a website looks confusing, what do you notice first?',
    options: [
      'Layout, colors, spacing, and user flow',
      'Legal permissions and public rules',
      'Accounting entries and tax impact',
      'Guest registration and food service',
    ],
    correctAnswer: 'Layout, colors, spacing, and user flow',
    difficulty: 'MEDIUM',
  },
  {
    category: 'VISUAL_MEDIA',
    text: 'Which skill would you most want to improve over the next year?',
    options: [
      'UI/UX design, animation, and digital ads',
      'Genetics, pharmacology, and nursing care',
      'Investment strategy and stock trading',
      'Foreign language translation',
    ],
    correctAnswer: 'UI/UX design, animation, and digital ads',
    difficulty: 'HARD',
  },
  {
    category: 'FINE_ARTS',
    text: 'Which activity feels most satisfying to complete?',
    options: [
      'Sketching, painting, sculpting, or styling a room',
      'Writing a policy memo',
      'Debugging backend code',
      'Analyzing a company balance sheet',
    ],
    correctAnswer: 'Sketching, painting, sculpting, or styling a room',
    difficulty: 'EASY',
  },
  {
    category: 'FINE_ARTS',
    text: 'You are given an empty studio space. What would you most likely do first?',
    options: [
      'Experiment with materials, light, textures, and composition',
      'Map customer service checkpoints',
      'Draft a hiring process',
      'Model economic demand',
    ],
    correctAnswer: 'Experiment with materials, light, textures, and composition',
    difficulty: 'MEDIUM',
  },
  {
    category: 'FINE_ARTS',
    text: 'Which portfolio would you feel proud to build?',
    options: [
      'Paintings, photographs, fashion concepts, and interior layouts',
      'Court judgments and policy briefs',
      'Cybersecurity reports and data pipelines',
      'Menus, booking plans, and event budgets',
    ],
    correctAnswer: 'Paintings, photographs, fashion concepts, and interior layouts',
    difficulty: 'HARD',
  },
  {
    category: 'COMMUNICATIONS',
    text: 'Which task would you choose for a college magazine?',
    options: [
      'Interviewing people and writing a feature story',
      'Testing a hardware prototype',
      'Designing a hotel banquet plan',
      'Preparing lab samples',
    ],
    correctAnswer: 'Interviewing people and writing a feature story',
    difficulty: 'EASY',
  },
  {
    category: 'COMMUNICATIONS',
    text: 'A message must reach students from different countries. What would you focus on?',
    options: [
      'Clear language, translation, tone, and cultural context',
      'Stock price movement and risk',
      'Sculpture materials and gallery lighting',
      'Network security permissions',
    ],
    correctAnswer: 'Clear language, translation, tone, and cultural context',
    difficulty: 'MEDIUM',
  },
  {
    category: 'COMMUNICATIONS',
    text: 'Which future role sounds most natural for your strengths?',
    options: [
      'Journalist, content writer, translator, or PR specialist',
      'Pharmacologist, geneticist, or veterinary doctor',
      'Event chef, travel consultant, or hotel manager',
      'Civil engineer, data scientist, or network architect',
    ],
    correctAnswer: 'Journalist, content writer, translator, or PR specialist',
    difficulty: 'HARD',
  },
  {
    category: 'TECH_DATA',
    text: 'Which problem would you most enjoy solving?',
    options: [
      'Writing code to automate a repeated task',
      'Negotiating between two team members',
      'Arranging a travel itinerary',
      'Painting a portrait',
    ],
    correctAnswer: 'Writing code to automate a repeated task',
    difficulty: 'EASY',
  },
  {
    category: 'TECH_DATA',
    text: 'A system stops working unexpectedly. What attracts you most?',
    options: [
      'Tracing logs, testing inputs, and finding the technical cause',
      'Writing a press release',
      'Serving customers during a rush',
      'Preparing a courtroom argument',
    ],
    correctAnswer: 'Tracing logs, testing inputs, and finding the technical cause',
    difficulty: 'MEDIUM',
  },
  {
    category: 'TECH_DATA',
    text: 'Which advanced topic would you explore deeply?',
    options: [
      'AI, cybersecurity, hardware, data science, or networks',
      'Fashion styling and sculpture',
      'Community welfare schemes',
      'Culinary presentation',
    ],
    correctAnswer: 'AI, cybersecurity, hardware, data science, or networks',
    difficulty: 'HARD',
  },
  {
    category: 'HR_MANAGEMENT',
    text: 'Which role would you naturally take in a group project?',
    options: [
      'Assigning work, resolving conflict, and keeping everyone aligned',
      'Writing the source code',
      'Testing chemical reactions',
      'Photographing the final artwork',
    ],
    correctAnswer: 'Assigning work, resolving conflict, and keeping everyone aligned',
    difficulty: 'EASY',
  },
  {
    category: 'HR_MANAGEMENT',
    text: 'A talented teammate is demotivated. What would you do first?',
    options: [
      'Understand their concerns and adjust team support',
      'Create a stock trading plan',
      'Draw the event stage layout',
      'Translate a news article',
    ],
    correctAnswer: 'Understand their concerns and adjust team support',
    difficulty: 'MEDIUM',
  },
  {
    category: 'HR_MANAGEMENT',
    text: 'Which workplace challenge interests you most?',
    options: [
      'Hiring, training, operations, leadership, and team culture',
      'Disease diagnosis and patient care',
      'Space science and mathematical proofs',
      'Animation and video editing',
    ],
    correctAnswer: 'Hiring, training, operations, leadership, and team culture',
    difficulty: 'HARD',
  },
  {
    category: 'BUSINESS_FINANCE',
    text: 'Which activity sounds most engaging?',
    options: [
      'Comparing revenue, cost, risk, and market opportunity',
      'Studying literature and language',
      'Planning a public welfare program',
      'Designing interior decor',
    ],
    correctAnswer: 'Comparing revenue, cost, risk, and market opportunity',
    difficulty: 'EASY',
  },
  {
    category: 'BUSINESS_FINANCE',
    text: 'You have a small business idea. What would you analyze first?',
    options: [
      'Customers, pricing, competition, and break-even point',
      'Patient symptoms and medicines',
      'Team emotions and morale',
      'Camera angles and lighting',
    ],
    correctAnswer: 'Customers, pricing, competition, and break-even point',
    difficulty: 'MEDIUM',
  },
  {
    category: 'BUSINESS_FINANCE',
    text: 'Which career set fits your interests best?',
    options: [
      'CA, investment banking, analytics, trading, or entrepreneurship',
      'IAS, judiciary, diplomacy, or public policy',
      'Nursing, biotechnology, psychology, or genetics',
      'Painting, sculpture, photography, or fashion design',
    ],
    correctAnswer: 'CA, investment banking, analytics, trading, or entrepreneurship',
    difficulty: 'HARD',
  },
  {
    category: 'HEALTHCARE',
    text: 'Which subject area pulls your curiosity most?',
    options: [
      'Biology, health, organisms, and patient care',
      'Corporate finance and stock markets',
      'Typography and brand systems',
      'Tour packages and hotel rooms',
    ],
    correctAnswer: 'Biology, health, organisms, and patient care',
    difficulty: 'EASY',
  },
  {
    category: 'HEALTHCARE',
    text: 'Someone describes a health problem. What would you most want to understand?',
    options: [
      'Symptoms, causes, treatment options, and care needs',
      'Election policy and administration',
      'Advertisement performance',
      'Restaurant seating flow',
    ],
    correctAnswer: 'Symptoms, causes, treatment options, and care needs',
    difficulty: 'MEDIUM',
  },
  {
    category: 'HEALTHCARE',
    text: 'Which research question would you choose?',
    options: [
      'How genes, medicines, microbes, or behavior affect living beings',
      'How a logo changes audience perception',
      'How tourism demand changes by season',
      'How a legal reform changes governance',
    ],
    correctAnswer: 'How genes, medicines, microbes, or behavior affect living beings',
    difficulty: 'HARD',
  },
  {
    category: 'PURE_SCIENCES',
    text: 'Which kind of question excites you most?',
    options: [
      'Why a natural phenomenon happens and how to prove it',
      'How to manage hotel guests',
      'How to write a product slogan',
      'How to conduct a job interview',
    ],
    correctAnswer: 'Why a natural phenomenon happens and how to prove it',
    difficulty: 'EASY',
  },
  {
    category: 'PURE_SCIENCES',
    text: 'A lab result is surprising. What would you prefer to do next?',
    options: [
      'Repeat experiments, collect data, and test a theory',
      'Create a marketing budget',
      'Mediate a team disagreement',
      'Plan a wedding venue schedule',
    ],
    correctAnswer: 'Repeat experiments, collect data, and test a theory',
    difficulty: 'MEDIUM',
  },
  {
    category: 'PURE_SCIENCES',
    text: 'Which long-term path sounds most appealing?',
    options: [
      'Physics, chemistry, mathematics, space science, or academic research',
      'Foreign language interpretation',
      'Talent acquisition and corporate leadership',
      'Hotel operations and travel consulting',
    ],
    correctAnswer: 'Physics, chemistry, mathematics, space science, or academic research',
    difficulty: 'HARD',
  },
  {
    category: 'HOSPITALITY_EVENTS',
    text: 'Which environment would energize you most?',
    options: [
      'A busy event, hotel lobby, kitchen, or travel desk',
      'A quiet research laboratory',
      'A software debugging session',
      'A policy debate',
    ],
    correctAnswer: 'A busy event, hotel lobby, kitchen, or travel desk',
    difficulty: 'EASY',
  },
  {
    category: 'HOSPITALITY_EVENTS',
    text: 'A large event is one week away. What would you naturally track?',
    options: [
      'Guests, vendors, timing, food, seating, and service quality',
      'Grammar, translation, and literature',
      'Investment returns',
      'Medical case notes',
    ],
    correctAnswer: 'Guests, vendors, timing, food, seating, and service quality',
    difficulty: 'MEDIUM',
  },
  {
    category: 'HOSPITALITY_EVENTS',
    text: 'Which career cluster best matches your working style?',
    options: [
      'Hotel management, culinary arts, tourism, or event execution',
      'Judiciary, civil services, or international relations',
      'Machine learning, hardware, or cybersecurity',
      'Painting, photography, or interior architecture',
    ],
    correctAnswer: 'Hotel management, culinary arts, tourism, or event execution',
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
  const seededTexts = questions.map((question) => question.text);

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
    process.stdout.write(`${count._id}: ${count.count} active questions\n`);
  }

  await mongoose.disconnect();
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Aptitude question seed failed: ${message}\n`);
  void mongoose.disconnect().finally(() => process.exit(1));
});
