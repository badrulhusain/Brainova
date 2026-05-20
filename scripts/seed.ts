import { initializeApp, type AppOptions } from 'firebase-admin/app';
import { FieldValue, getFirestore, type WriteBatch } from 'firebase-admin/firestore';
import { existsSync, readFileSync } from 'node:fs';

type QuestionType = 'mcq' | 'true_false' | 'fill';
type QuestionDifficulty = 'easy' | 'medium' | 'hard';

interface SubtopicSeed {
  id: string;
  name: string;
  description: string;
  order: number;
  active: boolean;
}

interface TopicSeed {
  id: string;
  name: string;
  description: string;
  order: number;
  active: boolean;
  subtopics: SubtopicSeed[];
}

interface DomainSeed {
  id: string;
  name: string;
  description: string;
  icon: string;
  active: boolean;
  order: number;
  topics: TopicSeed[];
}

interface QuestionSeed {
  id: string;
  domain: string;
  topic: string;
  subtopic: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  marks: number;
  negativeMarks: number;
  timeRecommended: number;
  tags: string[];
}

const seedActor = 'system-seed';
const seedTag = 'seed:milestone-1-aptitude';
const expectedQuestionsPerDomain = 12;

const domains: DomainSeed[] = [
  {
    id: 'quantitative-aptitude',
    name: 'Quantitative Aptitude',
    description: 'Arithmetic and numerical reasoning for exam-style aptitude practice.',
    icon: 'calculator',
    active: true,
    order: 0,
    topics: [
      {
        id: 'percentages',
        name: 'Percentages',
        description: 'Percent values, percentage change, and comparison questions.',
        order: 0,
        active: true,
        subtopics: [
          {
            id: 'percentage-change',
            name: 'Percentage Change',
            description: 'Increase, decrease, and comparison by percent.',
            order: 0,
            active: true,
          },
        ],
      },
      {
        id: 'ratio-proportion',
        name: 'Ratio and Proportion',
        description: 'Ratio simplification, sharing, and direct proportion.',
        order: 1,
        active: true,
        subtopics: [
          {
            id: 'ratio-sharing',
            name: 'Ratio Sharing',
            description: 'Distributing values by a given ratio.',
            order: 0,
            active: true,
          },
        ],
      },
      {
        id: 'profit-loss',
        name: 'Profit and Loss',
        description: 'Cost price, selling price, gain, loss, and discount.',
        order: 2,
        active: true,
        subtopics: [
          {
            id: 'basic-profit-loss',
            name: 'Basic Profit and Loss',
            description: 'Single-step profit, loss, and discount calculations.',
            order: 0,
            active: true,
          },
        ],
      },
      {
        id: 'time-work',
        name: 'Time and Work',
        description: 'Work rates, combined work, and completion time.',
        order: 3,
        active: true,
        subtopics: [
          {
            id: 'work-rates',
            name: 'Work Rates',
            description: 'Individual and combined efficiency problems.',
            order: 0,
            active: true,
          },
        ],
      },
    ],
  },
  {
    id: 'logical-reasoning',
    name: 'Logical Reasoning',
    description: 'Pattern recognition, deduction, and structured reasoning practice.',
    icon: 'brain-circuit',
    active: true,
    order: 1,
    topics: [
      {
        id: 'series',
        name: 'Series',
        description: 'Number, letter, and mixed sequence patterns.',
        order: 0,
        active: true,
        subtopics: [
          {
            id: 'number-series',
            name: 'Number Series',
            description: 'Arithmetic, geometric, and alternating number patterns.',
            order: 0,
            active: true,
          },
        ],
      },
      {
        id: 'analogies',
        name: 'Analogies',
        description: 'Relationship matching between words, ideas, or symbols.',
        order: 1,
        active: true,
        subtopics: [
          {
            id: 'word-analogies',
            name: 'Word Analogies',
            description: 'Meaning-based and function-based analogy pairs.',
            order: 0,
            active: true,
          },
        ],
      },
      {
        id: 'coding-decoding',
        name: 'Coding and Decoding',
        description: 'Rule-based symbol and letter transformations.',
        order: 2,
        active: true,
        subtopics: [
          {
            id: 'letter-coding',
            name: 'Letter Coding',
            description: 'Alphabet shifting and positional coding.',
            order: 0,
            active: true,
          },
        ],
      },
      {
        id: 'syllogisms',
        name: 'Syllogisms',
        description: 'Logical conclusions from stated premises.',
        order: 3,
        active: true,
        subtopics: [
          {
            id: 'basic-syllogisms',
            name: 'Basic Syllogisms',
            description: 'Validity of conclusions under universal and particular statements.',
            order: 0,
            active: true,
          },
        ],
      },
    ],
  },
  {
    id: 'verbal-ability',
    name: 'Verbal Ability',
    description: 'Vocabulary, grammar, and reading comprehension fundamentals.',
    icon: 'book-open-text',
    active: true,
    order: 2,
    topics: [
      {
        id: 'synonyms-antonyms',
        name: 'Synonyms and Antonyms',
        description: 'Vocabulary meaning, opposites, and context usage.',
        order: 0,
        active: true,
        subtopics: [
          {
            id: 'word-meaning',
            name: 'Word Meaning',
            description: 'Closest meaning and opposite meaning questions.',
            order: 0,
            active: true,
          },
        ],
      },
      {
        id: 'sentence-correction',
        name: 'Sentence Correction',
        description: 'Grammar, agreement, tense, and concise expression.',
        order: 1,
        active: true,
        subtopics: [
          {
            id: 'grammar-usage',
            name: 'Grammar Usage',
            description: 'Common grammar and sentence structure corrections.',
            order: 0,
            active: true,
          },
        ],
      },
      {
        id: 'reading-comprehension',
        name: 'Reading Comprehension',
        description: 'Main idea, inference, and factual understanding.',
        order: 2,
        active: true,
        subtopics: [
          {
            id: 'short-passages',
            name: 'Short Passages',
            description: 'Brief passages with direct and inferential questions.',
            order: 0,
            active: true,
          },
        ],
      },
      {
        id: 'fill-blanks',
        name: 'Fill Blanks',
        description: 'Contextual word choice and sentence completion.',
        order: 3,
        active: true,
        subtopics: [
          {
            id: 'contextual-completion',
            name: 'Contextual Completion',
            description: 'Choosing the best word or phrase for a sentence gap.',
            order: 0,
            active: true,
          },
        ],
      },
    ],
  },
];

const questions: QuestionSeed[] = [
  {
    id: 'qa-percentages-easy-001',
    domain: 'quantitative-aptitude',
    topic: 'percentages',
    subtopic: 'percentage-change',
    type: 'mcq',
    difficulty: 'easy',
    text: 'What is 20% of 250?',
    options: ['25', '40', '50', '75'],
    correctAnswer: '50',
    explanation: '20% of 250 is 0.20 x 250 = 50.',
    marks: 1,
    negativeMarks: 0.25,
    timeRecommended: 45,
    tags: ['aptitude', 'percentage', 'calculation'],
  },
  {
    id: 'qa-percentages-easy-002',
    domain: 'quantitative-aptitude',
    topic: 'percentages',
    subtopic: 'percentage-change',
    type: 'true_false',
    difficulty: 'easy',
    text: 'Increasing 80 by 25% gives 100.',
    options: ['True', 'False'],
    correctAnswer: 'True',
    explanation: '25% of 80 is 20, and 80 + 20 = 100.',
    marks: 1,
    negativeMarks: 0,
    timeRecommended: 40,
    tags: ['aptitude', 'percentage', 'increase'],
  },
  {
    id: 'qa-percentages-medium-001',
    domain: 'quantitative-aptitude',
    topic: 'percentages',
    subtopic: 'percentage-change',
    type: 'mcq',
    difficulty: 'medium',
    text: 'A number is increased by 10% and then decreased by 10%. What is the net change?',
    options: ['No change', '1% decrease', '1% increase', '10% decrease'],
    correctAnswer: '1% decrease',
    explanation: 'Successive changes multiply: 1.10 x 0.90 = 0.99, so the result is 1% less.',
    marks: 1,
    negativeMarks: 0.25,
    timeRecommended: 75,
    tags: ['aptitude', 'percentage', 'successive-change'],
  },
  {
    id: 'qa-ratio-easy-001',
    domain: 'quantitative-aptitude',
    topic: 'ratio-proportion',
    subtopic: 'ratio-sharing',
    type: 'mcq',
    difficulty: 'easy',
    text: 'Simplify the ratio 18:24.',
    options: ['2:3', '3:4', '4:3', '6:8'],
    correctAnswer: '3:4',
    explanation: 'Divide both terms by their greatest common divisor, 6, to get 3:4.',
    marks: 1,
    negativeMarks: 0.25,
    timeRecommended: 45,
    tags: ['aptitude', 'ratio', 'simplification'],
  },
  {
    id: 'qa-ratio-medium-001',
    domain: 'quantitative-aptitude',
    topic: 'ratio-proportion',
    subtopic: 'ratio-sharing',
    type: 'mcq',
    difficulty: 'medium',
    text: 'A sum of 840 is divided between A and B in the ratio 3:4. What is B share?',
    options: ['240', '360', '420', '480'],
    correctAnswer: '480',
    explanation: 'The total parts are 7. B gets 4 parts, so 840 x 4 / 7 = 480.',
    marks: 1,
    negativeMarks: 0.25,
    timeRecommended: 75,
    tags: ['aptitude', 'ratio', 'sharing'],
  },
  {
    id: 'qa-ratio-hard-001',
    domain: 'quantitative-aptitude',
    topic: 'ratio-proportion',
    subtopic: 'ratio-sharing',
    type: 'mcq',
    difficulty: 'hard',
    text: 'The ratio of boys to girls is 5:3. If there are 16 more boys than girls, how many students are there in total?',
    options: ['48', '56', '64', '72'],
    correctAnswer: '64',
    explanation: 'The difference is 2 parts, which equals 16, so 1 part is 8. Total is 8 parts = 64.',
    marks: 1,
    negativeMarks: 0.25,
    timeRecommended: 95,
    tags: ['aptitude', 'ratio', 'word-problem'],
  },
  {
    id: 'qa-profit-easy-001',
    domain: 'quantitative-aptitude',
    topic: 'profit-loss',
    subtopic: 'basic-profit-loss',
    type: 'mcq',
    difficulty: 'easy',
    text: 'An item bought for 500 is sold for 600. What is the profit?',
    options: ['50', '75', '100', '120'],
    correctAnswer: '100',
    explanation: 'Profit is selling price minus cost price: 600 - 500 = 100.',
    marks: 1,
    negativeMarks: 0.25,
    timeRecommended: 45,
    tags: ['aptitude', 'profit-loss', 'basic'],
  },
  {
    id: 'qa-profit-medium-001',
    domain: 'quantitative-aptitude',
    topic: 'profit-loss',
    subtopic: 'basic-profit-loss',
    type: 'mcq',
    difficulty: 'medium',
    text: 'A shopkeeper sells an item at a 15% profit. If the cost price is 800, what is the selling price?',
    options: ['900', '920', '940', '960'],
    correctAnswer: '920',
    explanation: '15% of 800 is 120, so the selling price is 800 + 120 = 920.',
    marks: 1,
    negativeMarks: 0.25,
    timeRecommended: 70,
    tags: ['aptitude', 'profit-loss', 'percentage'],
  },
  {
    id: 'qa-profit-hard-001',
    domain: 'quantitative-aptitude',
    topic: 'profit-loss',
    subtopic: 'basic-profit-loss',
    type: 'mcq',
    difficulty: 'hard',
    text: 'After a 20% discount, an article sells for 960. What was the marked price?',
    options: ['1,120', '1,152', '1,200', '1,280'],
    correctAnswer: '1,200',
    explanation: 'After 20% discount, selling price is 80% of marked price. 960 / 0.80 = 1,200.',
    marks: 1,
    negativeMarks: 0.25,
    timeRecommended: 90,
    tags: ['aptitude', 'discount', 'marked-price'],
  },
  {
    id: 'qa-work-medium-001',
    domain: 'quantitative-aptitude',
    topic: 'time-work',
    subtopic: 'work-rates',
    type: 'mcq',
    difficulty: 'medium',
    text: 'A can complete a task in 12 days and B can complete it in 6 days. Working together, how long will they take?',
    options: ['3 days', '4 days', '6 days', '9 days'],
    correctAnswer: '4 days',
    explanation: 'Their combined rate is 1/12 + 1/6 = 3/12 = 1/4 task per day, so they take 4 days.',
    marks: 1,
    negativeMarks: 0.25,
    timeRecommended: 85,
    tags: ['aptitude', 'time-work', 'combined-work'],
  },
  {
    id: 'qa-work-medium-002',
    domain: 'quantitative-aptitude',
    topic: 'time-work',
    subtopic: 'work-rates',
    type: 'true_false',
    difficulty: 'medium',
    text: 'If two people have equal efficiency, working together they finish the same job in half the time taken by one person.',
    options: ['True', 'False'],
    correctAnswer: 'True',
    explanation: 'Equal rates add together, so the combined rate doubles and the time becomes half.',
    marks: 1,
    negativeMarks: 0,
    timeRecommended: 60,
    tags: ['aptitude', 'time-work', 'efficiency'],
  },
  {
    id: 'qa-work-hard-001',
    domain: 'quantitative-aptitude',
    topic: 'time-work',
    subtopic: 'work-rates',
    type: 'mcq',
    difficulty: 'hard',
    text: 'A pipe fills a tank in 8 hours and a leak empties it in 24 hours. If both are open, when will the tank fill?',
    options: ['10 hours', '12 hours', '16 hours', '18 hours'],
    correctAnswer: '12 hours',
    explanation: 'Net rate is 1/8 - 1/24 = 2/24 = 1/12 tank per hour.',
    marks: 1,
    negativeMarks: 0.25,
    timeRecommended: 100,
    tags: ['aptitude', 'pipes-cisterns', 'time-work'],
  },
  {
    id: 'lr-series-easy-001',
    domain: 'logical-reasoning',
    topic: 'series',
    subtopic: 'number-series',
    type: 'mcq',
    difficulty: 'easy',
    text: 'Find the next number in the series: 2, 4, 6, 8, ?',
    options: ['9', '10', '12', '14'],
    correctAnswer: '10',
    explanation: 'The sequence increases by 2 each time.',
    marks: 1,
    negativeMarks: 0.25,
    timeRecommended: 35,
    tags: ['reasoning', 'series', 'arithmetic-pattern'],
  },
  {
    id: 'lr-series-easy-002',
    domain: 'logical-reasoning',
    topic: 'series',
    subtopic: 'number-series',
    type: 'mcq',
    difficulty: 'easy',
    text: 'Find the next letter in the series: A, C, E, G, ?',
    options: ['H', 'I', 'J', 'K'],
    correctAnswer: 'I',
    explanation: 'The pattern skips one letter each time: A, C, E, G, I.',
    marks: 1,
    negativeMarks: 0.25,
    timeRecommended: 40,
    tags: ['reasoning', 'letter-series', 'pattern'],
  },
  {
    id: 'lr-series-medium-001',
    domain: 'logical-reasoning',
    topic: 'series',
    subtopic: 'number-series',
    type: 'mcq',
    difficulty: 'medium',
    text: 'Find the next number in the series: 3, 6, 12, 24, ?',
    options: ['30', '36', '42', '48'],
    correctAnswer: '48',
    explanation: 'Each term is multiplied by 2.',
    marks: 1,
    negativeMarks: 0.25,
    timeRecommended: 55,
    tags: ['reasoning', 'series', 'geometric-pattern'],
  },
  {
    id: 'lr-analogy-easy-001',
    domain: 'logical-reasoning',
    topic: 'analogies',
    subtopic: 'word-analogies',
    type: 'mcq',
    difficulty: 'easy',
    text: 'Bird is to Nest as Bee is to ____.',
    options: ['Hive', 'Web', 'Stable', 'Den'],
    correctAnswer: 'Hive',
    explanation: 'A bird lives in a nest, and a bee lives in a hive.',
    marks: 1,
    negativeMarks: 0.25,
    timeRecommended: 40,
    tags: ['reasoning', 'analogy', 'relationship'],
  },
  {
    id: 'lr-analogy-easy-002',
    domain: 'logical-reasoning',
    topic: 'analogies',
    subtopic: 'word-analogies',
    type: 'mcq',
    difficulty: 'easy',
    text: 'Doctor is to Hospital as Teacher is to ____.',
    options: ['Court', 'School', 'Factory', 'Market'],
    correctAnswer: 'School',
    explanation: 'The relationship is profession to typical workplace.',
    marks: 1,
    negativeMarks: 0.25,
    timeRecommended: 50,
    tags: ['reasoning', 'analogy', 'workplace'],
  },
  {
    id: 'lr-analogy-hard-001',
    domain: 'logical-reasoning',
    topic: 'analogies',
    subtopic: 'word-analogies',
    type: 'mcq',
    difficulty: 'hard',
    text: 'Seed is to Tree as Idea is to ____.',
    options: ['Book', 'Plan', 'Thought', 'Outcome'],
    correctAnswer: 'Outcome',
    explanation: 'A seed develops into a tree; an idea can develop into an outcome.',
    marks: 1,
    negativeMarks: 0.25,
    timeRecommended: 75,
    tags: ['reasoning', 'analogy', 'abstract-relationship'],
  },
  {
    id: 'lr-coding-medium-001',
    domain: 'logical-reasoning',
    topic: 'coding-decoding',
    subtopic: 'letter-coding',
    type: 'mcq',
    difficulty: 'medium',
    text: 'If CAT is coded as DBU, how is DOG coded?',
    options: ['EPH', 'EPI', 'FQH', 'CNG'],
    correctAnswer: 'EPH',
    explanation: 'Each letter shifts forward by one: D->E, O->P, G->H.',
    marks: 1,
    negativeMarks: 0.25,
    timeRecommended: 65,
    tags: ['reasoning', 'coding-decoding', 'letter-shift'],
  },
  {
    id: 'lr-coding-medium-002',
    domain: 'logical-reasoning',
    topic: 'coding-decoding',
    subtopic: 'letter-coding',
    type: 'true_false',
    difficulty: 'medium',
    text: 'If every letter is shifted two places forward, M becomes O.',
    options: ['True', 'False'],
    correctAnswer: 'True',
    explanation: 'M shifted forward two places is O.',
    marks: 1,
    negativeMarks: 0,
    timeRecommended: 45,
    tags: ['reasoning', 'coding-decoding', 'letter-shift'],
  },
  {
    id: 'lr-coding-hard-001',
    domain: 'logical-reasoning',
    topic: 'coding-decoding',
    subtopic: 'letter-coding',
    type: 'mcq',
    difficulty: 'hard',
    text: 'In a code, TABLE is written as UBCMF. How will CHAIR be written?',
    options: ['DIBJS', 'DJBIS', 'DIBIR', 'BGZHQ'],
    correctAnswer: 'DIBJS',
    explanation: 'Each letter shifts forward by one: C->D, H->I, A->B, I->J, R->S.',
    marks: 1,
    negativeMarks: 0.25,
    timeRecommended: 80,
    tags: ['reasoning', 'coding-decoding', 'alphabet'],
  },
  {
    id: 'lr-syllogism-medium-001',
    domain: 'logical-reasoning',
    topic: 'syllogisms',
    subtopic: 'basic-syllogisms',
    type: 'mcq',
    difficulty: 'medium',
    text: 'Statements: All roses are flowers. Some flowers are red. Which conclusion definitely follows?',
    options: ['All roses are red', 'Some roses are red', 'Some flowers are roses', 'No rose is a flower'],
    correctAnswer: 'Some flowers are roses',
    explanation: 'If all roses are flowers, then the rose group is within flowers, so some flowers are roses.',
    marks: 1,
    negativeMarks: 0.25,
    timeRecommended: 80,
    tags: ['reasoning', 'syllogism', 'deduction'],
  },
  {
    id: 'lr-syllogism-medium-002',
    domain: 'logical-reasoning',
    topic: 'syllogisms',
    subtopic: 'basic-syllogisms',
    type: 'mcq',
    difficulty: 'medium',
    text: 'Statements: No pens are pencils. All pencils are tools. Which conclusion follows?',
    options: ['No tools are pens', 'Some tools are pencils', 'All tools are pencils', 'Some pens are tools'],
    correctAnswer: 'Some tools are pencils',
    explanation: 'All pencils being tools means the pencils are included in tools, so some tools are pencils.',
    marks: 1,
    negativeMarks: 0.25,
    timeRecommended: 85,
    tags: ['reasoning', 'syllogism', 'deduction'],
  },
  {
    id: 'lr-syllogism-hard-001',
    domain: 'logical-reasoning',
    topic: 'syllogisms',
    subtopic: 'basic-syllogisms',
    type: 'mcq',
    difficulty: 'hard',
    text: 'Statements: All artists are creative people. Some creative people are engineers. Which conclusion definitely follows?',
    options: ['All artists are engineers', 'Some engineers are artists', 'Some creative people are artists', 'No engineer is creative'],
    correctAnswer: 'Some creative people are artists',
    explanation: 'Because all artists are within creative people, at least those artists are creative people.',
    marks: 1,
    negativeMarks: 0.25,
    timeRecommended: 90,
    tags: ['reasoning', 'syllogism', 'validity'],
  },
  {
    id: 'va-vocab-easy-001',
    domain: 'verbal-ability',
    topic: 'synonyms-antonyms',
    subtopic: 'word-meaning',
    type: 'mcq',
    difficulty: 'easy',
    text: 'Choose the closest synonym of "rapid".',
    options: ['Slow', 'Quick', 'Weak', 'Late'],
    correctAnswer: 'Quick',
    explanation: 'Rapid means fast or quick.',
    marks: 1,
    negativeMarks: 0.25,
    timeRecommended: 35,
    tags: ['verbal', 'synonym', 'vocabulary'],
  },
  {
    id: 'va-vocab-easy-002',
    domain: 'verbal-ability',
    topic: 'synonyms-antonyms',
    subtopic: 'word-meaning',
    type: 'mcq',
    difficulty: 'easy',
    text: 'Choose the antonym of "ancient".',
    options: ['Old', 'Modern', 'Historic', 'Former'],
    correctAnswer: 'Modern',
    explanation: 'Ancient means very old; modern is its opposite in this context.',
    marks: 1,
    negativeMarks: 0.25,
    timeRecommended: 40,
    tags: ['verbal', 'antonym', 'vocabulary'],
  },
  {
    id: 'va-vocab-medium-001',
    domain: 'verbal-ability',
    topic: 'synonyms-antonyms',
    subtopic: 'word-meaning',
    type: 'mcq',
    difficulty: 'medium',
    text: 'Choose the closest meaning of "reluctant".',
    options: ['Unwilling', 'Excited', 'Careless', 'Certain'],
    correctAnswer: 'Unwilling',
    explanation: 'Reluctant means hesitant or unwilling to do something.',
    marks: 1,
    negativeMarks: 0.25,
    timeRecommended: 50,
    tags: ['verbal', 'synonym', 'vocabulary'],
  },
  {
    id: 'va-correction-easy-001',
    domain: 'verbal-ability',
    topic: 'sentence-correction',
    subtopic: 'grammar-usage',
    type: 'mcq',
    difficulty: 'easy',
    text: 'Choose the correct sentence.',
    options: ['She go to school daily.', 'She goes to school daily.', 'She going to school daily.', 'She gone to school daily.'],
    correctAnswer: 'She goes to school daily.',
    explanation: 'For third-person singular present tense, the verb takes -s: she goes.',
    marks: 1,
    negativeMarks: 0.25,
    timeRecommended: 45,
    tags: ['verbal', 'grammar', 'subject-verb-agreement'],
  },
  {
    id: 'va-correction-medium-001',
    domain: 'verbal-ability',
    topic: 'sentence-correction',
    subtopic: 'grammar-usage',
    type: 'mcq',
    difficulty: 'medium',
    text: 'Choose the best correction: "Neither of the answers are correct."',
    options: [
      'Neither of the answers is correct.',
      'Neither of the answers were correct.',
      'Neither answers is correct.',
      'Neither answer are correct.',
    ],
    correctAnswer: 'Neither of the answers is correct.',
    explanation: 'Neither is singular, so it takes the singular verb is.',
    marks: 1,
    negativeMarks: 0.25,
    timeRecommended: 65,
    tags: ['verbal', 'grammar', 'agreement'],
  },
  {
    id: 'va-correction-hard-001',
    domain: 'verbal-ability',
    topic: 'sentence-correction',
    subtopic: 'grammar-usage',
    type: 'mcq',
    difficulty: 'hard',
    text: 'Choose the most concise and grammatically correct sentence.',
    options: [
      'Due to the fact that it rained, the match was postponed.',
      'Because it rained, the match was postponed.',
      'The match was postponed due to raining was there.',
      'Since raining, therefore the match postponed.',
    ],
    correctAnswer: 'Because it rained, the match was postponed.',
    explanation: 'This option is both concise and grammatically complete.',
    marks: 1,
    negativeMarks: 0.25,
    timeRecommended: 80,
    tags: ['verbal', 'grammar', 'conciseness'],
  },
  {
    id: 'va-reading-medium-001',
    domain: 'verbal-ability',
    topic: 'reading-comprehension',
    subtopic: 'short-passages',
    type: 'mcq',
    difficulty: 'medium',
    text: 'Passage: "Regular practice improves speed, but careful review improves accuracy." What is the main idea?',
    options: [
      'Speed is always more important than accuracy.',
      'Review has no effect on performance.',
      'Practice and review improve different skills.',
      'Accuracy cannot be improved.',
    ],
    correctAnswer: 'Practice and review improve different skills.',
    explanation: 'The passage contrasts speed from practice with accuracy from review.',
    marks: 1,
    negativeMarks: 0.25,
    timeRecommended: 75,
    tags: ['verbal', 'reading-comprehension', 'main-idea'],
  },
  {
    id: 'va-reading-medium-002',
    domain: 'verbal-ability',
    topic: 'reading-comprehension',
    subtopic: 'short-passages',
    type: 'true_false',
    difficulty: 'medium',
    text: 'Passage: "The library opens at 8 AM on weekdays and 10 AM on Sundays." The library opens later on Sundays than on weekdays.',
    options: ['True', 'False'],
    correctAnswer: 'True',
    explanation: '10 AM is later than 8 AM.',
    marks: 1,
    negativeMarks: 0,
    timeRecommended: 45,
    tags: ['verbal', 'reading-comprehension', 'detail'],
  },
  {
    id: 'va-reading-hard-001',
    domain: 'verbal-ability',
    topic: 'reading-comprehension',
    subtopic: 'short-passages',
    type: 'mcq',
    difficulty: 'hard',
    text: 'Passage: "The manager praised the proposal but delayed approval until costs were verified." What can be inferred?',
    options: [
      'The proposal was rejected immediately.',
      'The manager had no interest in the proposal.',
      'Cost verification was required before approval.',
      'The costs were already proven incorrect.',
    ],
    correctAnswer: 'Cost verification was required before approval.',
    explanation: 'Approval was delayed until costs were verified, so verification was a condition before approval.',
    marks: 1,
    negativeMarks: 0.25,
    timeRecommended: 90,
    tags: ['verbal', 'reading-comprehension', 'inference'],
  },
  {
    id: 'va-fill-easy-001',
    domain: 'verbal-ability',
    topic: 'fill-blanks',
    subtopic: 'contextual-completion',
    type: 'mcq',
    difficulty: 'easy',
    text: 'Choose the best word: The instructions were clear, so the task was ____ to complete.',
    options: ['difficult', 'easy', 'unclear', 'impossible'],
    correctAnswer: 'easy',
    explanation: 'Clear instructions make a task easy to complete.',
    marks: 1,
    negativeMarks: 0.25,
    timeRecommended: 40,
    tags: ['verbal', 'fill-blanks', 'context'],
  },
  {
    id: 'va-fill-medium-001',
    domain: 'verbal-ability',
    topic: 'fill-blanks',
    subtopic: 'contextual-completion',
    type: 'mcq',
    difficulty: 'medium',
    text: 'Choose the best word: Despite several setbacks, the team remained ____ and finished the project.',
    options: ['discouraged', 'persistent', 'careless', 'confused'],
    correctAnswer: 'persistent',
    explanation: 'Persistent means continuing despite difficulty, which fits the sentence.',
    marks: 1,
    negativeMarks: 0.25,
    timeRecommended: 55,
    tags: ['verbal', 'fill-blanks', 'context'],
  },
  {
    id: 'va-fill-hard-001',
    domain: 'verbal-ability',
    topic: 'fill-blanks',
    subtopic: 'contextual-completion',
    type: 'mcq',
    difficulty: 'hard',
    text: 'Choose the best word: Her explanation was so ____ that even beginners understood the concept.',
    options: ['ambiguous', 'lucid', 'irrelevant', 'hostile'],
    correctAnswer: 'lucid',
    explanation: 'Lucid means clear and easy to understand.',
    marks: 1,
    negativeMarks: 0.25,
    timeRecommended: 70,
    tags: ['verbal', 'fill-blanks', 'vocabulary'],
  },
];

const appOptions: AppOptions = {};
const envLocalPath = new URL('../.env.local', import.meta.url);
const envLocalProjectId = existsSync(envLocalPath)
  ? readFileSync(envLocalPath, 'utf8')
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line.startsWith('VITE_FIREBASE_PROJECT_ID='))
      ?.replace('VITE_FIREBASE_PROJECT_ID=', '')
  : undefined;
const projectId = process.env.FIREBASE_PROJECT_ID ?? envLocalProjectId;

if (projectId) {
  appOptions.projectId = projectId;
}

initializeApp(appOptions);

const db = getFirestore();

function validateSeed() {
  const domainIds = new Set(domains.map((domain) => domain.id));
  const questionIds = new Set<string>();

  domains.forEach((domain) => {
    const domainQuestionCount = questions.filter((question) => question.domain === domain.id).length;
    const difficultyCounts = questions
      .filter((question) => question.domain === domain.id)
      .reduce<Record<QuestionDifficulty, number>>(
        (counts, question) => ({
          ...counts,
          [question.difficulty]: counts[question.difficulty] + 1,
        }),
        { easy: 0, medium: 0, hard: 0 },
      );

    if (domainQuestionCount !== expectedQuestionsPerDomain) {
      throw new Error(`Expected ${expectedQuestionsPerDomain} questions for ${domain.id}, received ${domainQuestionCount}.`);
    }

    if (difficultyCounts.easy !== 4 || difficultyCounts.medium !== 5 || difficultyCounts.hard !== 3) {
      throw new Error(
        `Invalid difficulty mix for ${domain.id}: easy=${difficultyCounts.easy}, medium=${difficultyCounts.medium}, hard=${difficultyCounts.hard}.`,
      );
    }
  });

  questions.forEach((question) => {
    const domain = domains.find((candidate) => candidate.id === question.domain);
    const topic = domain?.topics.find((candidate) => candidate.id === question.topic);
    const subtopic = topic?.subtopics.find((candidate) => candidate.id === question.subtopic);

    if (!domainIds.has(question.domain) || !domain || !topic || !subtopic) {
      throw new Error(`Question ${question.id} references an unknown domain/topic/subtopic.`);
    }

    if (questionIds.has(question.id)) {
      throw new Error(`Duplicate question id: ${question.id}.`);
    }

    questionIds.add(question.id);

    if (question.options.includes(question.correctAnswer) === false) {
      throw new Error(`Question ${question.id} has a correct answer that is not in its options.`);
    }
  });
}

function setDomainTree(batch: WriteBatch) {
  domains.forEach((domain) => {
    const domainRef = db.collection('domains').doc(domain.id);

    batch.set(
      domainRef,
      {
        id: domain.id,
        name: domain.name,
        description: domain.description,
        icon: domain.icon,
        active: domain.active,
        order: domain.order,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    domain.topics.forEach((topic) => {
      const topicRef = domainRef.collection('topics').doc(topic.id);

      batch.set(
        topicRef,
        {
          id: topic.id,
          name: topic.name,
          description: topic.description,
          order: topic.order,
          active: topic.active,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      topic.subtopics.forEach((subtopic) => {
        batch.set(
          topicRef.collection('subtopics').doc(subtopic.id),
          {
            id: subtopic.id,
            name: subtopic.name,
            description: subtopic.description,
            order: subtopic.order,
            active: subtopic.active,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      });
    });
  });
}

function setQuestions(batch: WriteBatch) {
  questions.forEach((question) => {
    const questionRef = db.collection('questions').doc(question.id);
    const tags = Array.from(new Set([...question.tags, seedTag])).sort();

    batch.set(
      questionRef,
      {
        id: question.id,
        domain: question.domain,
        topic: question.topic,
        subtopic: question.subtopic,
        type: question.type,
        difficulty: question.difficulty,
        text: question.text,
        options: question.options,
        marks: question.marks,
        negativeMarks: question.negativeMarks,
        timeRecommended: question.timeRecommended,
        tags,
        active: true,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        createdBy: seedActor,
        updatedBy: seedActor,
      },
      { merge: true },
    );

    batch.set(
      db.collection('answer_keys').doc(question.id),
      {
        questionId: question.id,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: seedActor,
      },
      { merge: true },
    );
  });
}

async function main() {
  validateSeed();

  const batch = db.batch();

  setDomainTree(batch);
  setQuestions(batch);

  await batch.commit();

  process.stdout.write(`Seeded ${domains.length} aptitude domains with ${questions.length} public questions.\n`);
  process.stdout.write(`Created or updated ${questions.length} private answer key documents.\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Unknown seed failure.';
    process.stderr.write(`${message}\n`);
    process.exit(1);
  });
