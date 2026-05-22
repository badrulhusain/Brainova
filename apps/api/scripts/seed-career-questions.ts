import { config as loadEnv } from 'dotenv';
import { join } from 'path';
import mongoose from 'mongoose';
import {
  DomainModelName,
  DomainSchema,
  TopicModelName,
  TopicSchema,
  SubtopicModelName,
  SubtopicSchema,
  QuestionModelName,
  QuestionSchema,
  AnswerKeyModelName,
  AnswerKeySchema,
  type Difficulty,
  type QuestionType,
} from '../src/database/mongo.schemas';

loadEnv({ path: join(process.cwd(), '.env.local') });
loadEnv({ path: join(process.cwd(), '.env') });

const DomainModel = mongoose.model(DomainModelName, DomainSchema);
const TopicModel = mongoose.model(TopicModelName, TopicSchema);
const SubtopicModel = mongoose.model(SubtopicModelName, SubtopicSchema);
const QuestionModel = mongoose.model(QuestionModelName, QuestionSchema);
const AnswerKeyModel = mongoose.model(AnswerKeyModelName, AnswerKeySchema);

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuestionSeed {
  type: QuestionType;
  difficulty: Difficulty;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  tags: string[];
}

interface SubtopicSeed {
  name: string;
  description: string;
  questions: QuestionSeed[];
}

interface TopicSeed {
  name: string;
  description: string;
  subtopics: SubtopicSeed[];
}

// ─── Career Discovery Domain ──────────────────────────────────────────────────
// One domain, 10 topics (one per career track), subtopics group question sets.

const CAREER_DOMAIN = {
  name: 'Career Discovery',
  icon: 'compass',
  description: 'Aptitude and interest questions to identify ideal career paths for students.',
};

// ─── Topics = Career Tracks ───────────────────────────────────────────────────

const CAREER_TOPICS: TopicSeed[] = [

  // ── 1. Public Administration & Governance ─────────────────────────────────
  {
    name: 'Public Administration & Governance',
    description: 'IAS/Civil Service Track — law, public policy, judiciary, community development.',
    subtopics: [
      {
        name: 'Civic Reasoning',
        description: 'Questions on law, governance, and social systems.',
        questions: [
          {
            type: 'MCQ', difficulty: 'EASY',
            text: 'A local government wants to build a road through farmland. What is the BEST first step?',
            options: [
              'Start construction immediately',
              'Consult affected farmers and assess impact',
              'Pass the law without discussion',
              'Abandon the project',
            ],
            correctAnswer: 'Consult affected farmers and assess impact',
            explanation: 'Good governance requires stakeholder consultation before decisions that affect communities.',
            tags: ['governance', 'policy', 'civics'],
          },
          {
            type: 'MCQ', difficulty: 'EASY',
            text: 'Which branch of government is responsible for making laws?',
            options: ['Executive', 'Judiciary', 'Legislature', 'Bureaucracy'],
            correctAnswer: 'Legislature',
            explanation: 'The legislature (parliament/assembly) is the branch responsible for enacting laws.',
            tags: ['law', 'governance'],
          },
          {
            type: 'MCQ', difficulty: 'MEDIUM',
            text: 'A policy reduces unemployment but increases inflation. This is an example of:',
            options: [
              'A perfect policy outcome',
              'A policy trade-off',
              'Policy failure',
              'Legislative overreach',
            ],
            correctAnswer: 'A policy trade-off',
            explanation: 'Public policy often involves trade-offs where solving one problem can worsen another.',
            tags: ['policy', 'economics', 'governance'],
          },
          {
            type: 'MCQ', difficulty: 'MEDIUM',
            text: 'International disputes between countries are typically resolved through:',
            options: ['Military force', 'Diplomacy and international law', 'Ignoring the dispute', 'Media pressure'],
            correctAnswer: 'Diplomacy and international law',
            explanation: 'Diplomacy backed by international law is the standard method for resolving inter-state disputes.',
            tags: ['international-relations', 'diplomacy'],
          },
          {
            type: 'MCQ', difficulty: 'HARD',
            text: 'Which principle holds that government power must be exercised within legal boundaries?',
            options: ['Separation of powers', 'Rule of law', 'Federalism', 'Parliamentary sovereignty'],
            correctAnswer: 'Rule of law',
            explanation: 'The rule of law means that no person or government is above the law.',
            tags: ['law', 'governance', 'civics'],
          },
          {
            type: 'MCQ', difficulty: 'HARD',
            text: 'A civil servant receives a bribe to approve a permit faster. This violates:',
            options: ['Free market principles', 'Public trust and ethical duty', 'Competition law', 'Tax regulations'],
            correctAnswer: 'Public trust and ethical duty',
            explanation: 'Civil servants hold a position of public trust; accepting bribes is a fundamental ethical breach.',
            tags: ['ethics', 'civil-service'],
          },
        ],
      },
      {
        name: 'Leadership & Social Impact',
        description: 'Questions measuring leadership orientation and social awareness.',
        questions: [
          {
            type: 'MCQ', difficulty: 'EASY',
            text: 'A community leader faces a problem affecting only 20% of residents but severely. What should they do?',
            options: [
              'Ignore it since the majority is unaffected',
              'Address the issue because leadership protects all members',
              'Take a vote and only act if 51% agree',
              'Transfer responsibility to another department',
            ],
            correctAnswer: 'Address the issue because leadership protects all members',
            explanation: 'Effective leadership ensures that even minority concerns receive attention and protection.',
            tags: ['leadership', 'social-impact'],
          },
          {
            type: 'MCQ', difficulty: 'MEDIUM',
            text: 'Which skill is MOST critical for a civil services officer?',
            options: [
              'Speed reading',
              'Decision-making under incomplete information',
              'Computer programming',
              'Physical fitness',
            ],
            correctAnswer: 'Decision-making under incomplete information',
            explanation: 'Civil servants routinely make consequential decisions without perfect data.',
            tags: ['civil-service', 'decision-making'],
          },
        ],
      },
    ],
  },

  // ── 2. Visual Branding & Creative Media ────────────────────────────────────
  {
    name: 'Visual Branding & Creative Media',
    description: 'Graphic Expert Track — digital design, UI/UX, animation, video editing.',
    subtopics: [
      {
        name: 'Design Thinking',
        description: 'Aptitude for visual problem solving and aesthetics.',
        questions: [
          {
            type: 'MCQ', difficulty: 'EASY',
            text: 'A company logo should primarily be:',
            options: [
              'Complex and detailed to show effort',
              'Simple, memorable, and recognisable at small sizes',
              'Colourful with as many shades as possible',
              'Changed every month to stay fresh',
            ],
            correctAnswer: 'Simple, memorable, and recognisable at small sizes',
            explanation: 'Effective logos are simple and scalable — think Nike, Apple, or McDonald\'s.',
            tags: ['design', 'branding', 'visual'],
          },
          {
            type: 'MCQ', difficulty: 'EASY',
            text: 'Which colour combination creates the highest visual contrast?',
            options: ['Blue and green', 'Black and white', 'Red and orange', 'Yellow and cream'],
            correctAnswer: 'Black and white',
            explanation: 'Black on white (or vice versa) provides the maximum contrast ratio for readability.',
            tags: ['colour-theory', 'design'],
          },
          {
            type: 'MCQ', difficulty: 'MEDIUM',
            text: 'In UI/UX design, "user flow" refers to:',
            options: [
              'The speed of an app',
              'The path a user takes to complete a task',
              'The colour scheme of an interface',
              'The number of users online',
            ],
            correctAnswer: 'The path a user takes to complete a task',
            explanation: 'User flow maps the sequence of screens and decisions a user experiences.',
            tags: ['ui-ux', 'design'],
          },
          {
            type: 'MCQ', difficulty: 'MEDIUM',
            text: 'Which principle ensures that important elements on a design page draw the eye first?',
            options: ['Proximity', 'Visual hierarchy', 'Alignment', 'Repetition'],
            correctAnswer: 'Visual hierarchy',
            explanation: 'Visual hierarchy uses size, colour, and placement to guide the viewer\'s eye in a deliberate order.',
            tags: ['design', 'visual-hierarchy'],
          },
          {
            type: 'MCQ', difficulty: 'HARD',
            text: 'A brand\'s "visual identity" includes all of the following EXCEPT:',
            options: ['Logo', 'Typography', 'Mission statement', 'Colour palette'],
            correctAnswer: 'Mission statement',
            explanation: 'A mission statement is part of brand strategy/messaging, not visual identity.',
            tags: ['branding', 'visual-identity'],
          },
          {
            type: 'MCQ', difficulty: 'HARD',
            text: 'Typography "kerning" refers to:',
            options: [
              'The height of capital letters',
              'The spacing between individual character pairs',
              'The thickness of a font',
              'The line spacing between paragraphs',
            ],
            correctAnswer: 'The spacing between individual character pairs',
            explanation: 'Kerning is the adjustment of space between two specific characters for visual balance.',
            tags: ['typography', 'design'],
          },
        ],
      },
    ],
  },

  // ── 3. Fine Arts & Creative Expression ─────────────────────────────────────
  {
    name: 'Fine Arts & Creative Expression',
    description: 'Artist Track — painting, sculpture, photography, fashion, interior design.',
    subtopics: [
      {
        name: 'Art Fundamentals',
        description: 'Core artistic knowledge and spatial reasoning.',
        questions: [
          {
            type: 'MCQ', difficulty: 'EASY',
            text: 'Mixing red and blue paint produces which colour?',
            options: ['Green', 'Orange', 'Purple', 'Brown'],
            correctAnswer: 'Purple',
            explanation: 'Red + blue = purple in traditional subtractive (pigment) colour mixing.',
            tags: ['colour', 'art-basics'],
          },
          {
            type: 'MCQ', difficulty: 'EASY',
            text: 'Which art technique involves applying thick paint to create a textured surface?',
            options: ['Watercolour wash', 'Impasto', 'Stippling', 'Cross-hatching'],
            correctAnswer: 'Impasto',
            explanation: 'Impasto is a technique where paint is applied thickly, often with a palette knife.',
            tags: ['painting', 'technique'],
          },
          {
            type: 'MCQ', difficulty: 'MEDIUM',
            text: 'In photography, "depth of field" refers to:',
            options: [
              'How close the camera is to the subject',
              'The range of distance that appears acceptably sharp',
              'The brightness of the image',
              'The resolution of the photograph',
            ],
            correctAnswer: 'The range of distance that appears acceptably sharp',
            explanation: 'A shallow depth of field blurs the background; a deep depth of field keeps more in focus.',
            tags: ['photography', 'technique'],
          },
          {
            type: 'MCQ', difficulty: 'MEDIUM',
            text: 'Which element of art refers to the lightness or darkness of a colour?',
            options: ['Hue', 'Saturation', 'Value', 'Texture'],
            correctAnswer: 'Value',
            explanation: 'Value in art refers to how light or dark a colour is, independent of hue.',
            tags: ['art-elements', 'colour-theory'],
          },
          {
            type: 'MCQ', difficulty: 'HARD',
            text: 'An interior designer uses "negative space" primarily to:',
            options: [
              'Fill rooms with as much furniture as possible',
              'Create visual breathing room and emphasise key elements',
              'Indicate walls that need repainting',
              'Mark unusable floor area',
            ],
            correctAnswer: 'Create visual breathing room and emphasise key elements',
            explanation: 'Negative space — empty areas — is a design tool to highlight what matters and avoid visual clutter.',
            tags: ['interior-design', 'spatial-design'],
          },
          {
            type: 'MCQ', difficulty: 'HARD',
            text: 'Which sculptor is known for "The Thinker"?',
            options: ['Michelangelo', 'Auguste Rodin', 'Donatello', 'Bernini'],
            correctAnswer: 'Auguste Rodin',
            explanation: '"The Thinker" (1902) is one of the most recognised sculptures by French artist Auguste Rodin.',
            tags: ['art-history', 'sculpture'],
          },
        ],
      },
    ],
  },

  // ── 4. Linguistics, Media & Communications ─────────────────────────────────
  {
    name: 'Linguistics, Media & Communications',
    description: 'Language Expert Track — journalism, content writing, translation, PR.',
    subtopics: [
      {
        name: 'Language & Communication Skills',
        description: 'Verbal reasoning, grammar, and communication aptitude.',
        questions: [
          {
            type: 'MCQ', difficulty: 'EASY',
            text: 'A journalist\'s primary responsibility is to:',
            options: [
              'Promote the views of the newspaper\'s owner',
              'Report facts accurately and fairly',
              'Write the most entertaining story possible',
              'Avoid covering controversial topics',
            ],
            correctAnswer: 'Report facts accurately and fairly',
            explanation: 'Journalistic ethics demand accuracy, fairness, and independence from bias.',
            tags: ['journalism', 'ethics'],
          },
          {
            type: 'MCQ', difficulty: 'EASY',
            text: 'What is the purpose of a "lede" in news writing?',
            options: [
              'The closing paragraph summarising the story',
              'The opening sentence that captures the key facts',
              'A byline showing the author\'s name',
              'A subheading within the article',
            ],
            correctAnswer: 'The opening sentence that captures the key facts',
            explanation: 'The lede (or lead) is the opening sentence of a news article, answering the who, what, where, when.',
            tags: ['journalism', 'writing'],
          },
          {
            type: 'MCQ', difficulty: 'MEDIUM',
            text: 'In translation, "false friends" are:',
            options: [
              'Inaccurate dictionaries',
              'Words in two languages that look similar but have different meanings',
              'Phrases that cannot be translated',
              'Grammatical errors in the source text',
            ],
            correctAnswer: 'Words in two languages that look similar but have different meanings',
            explanation: 'E.g., "embarrassed" in English ≠ "embarazada" (pregnant) in Spanish — a classic false friend.',
            tags: ['translation', 'linguistics'],
          },
          {
            type: 'MCQ', difficulty: 'MEDIUM',
            text: 'PR (Public Relations) differs from advertising because PR:',
            options: [
              'Costs more',
              'Earns media coverage rather than paying for it',
              'Uses only social media',
              'Is only for large corporations',
            ],
            correctAnswer: 'Earns media coverage rather than paying for it',
            explanation: 'PR builds credibility through earned media; advertising is paid placement.',
            tags: ['pr', 'media', 'communications'],
          },
          {
            type: 'MCQ', difficulty: 'HARD',
            text: 'Chomsky\'s theory of "Universal Grammar" suggests that:',
            options: [
              'All languages share the same vocabulary',
              'Humans are born with an innate capacity for language acquisition',
              'Grammar rules are the same in every language',
              'Children learn language purely by imitation',
            ],
            correctAnswer: 'Humans are born with an innate capacity for language acquisition',
            explanation: 'Chomsky proposed that the brain has a built-in "language acquisition device" common to all humans.',
            tags: ['linguistics', 'grammar', 'theory'],
          },
          {
            type: 'MCQ', difficulty: 'HARD',
            text: 'A content strategist creating a B2B article should prioritise:',
            options: [
              'Short sentences and memes',
              'Industry data, case studies, and professional tone',
              'Pop-culture references to seem relatable',
              'Emotional storytelling with minimal facts',
            ],
            correctAnswer: 'Industry data, case studies, and professional tone',
            explanation: 'B2B content targets business decision-makers who value evidence and ROI over entertainment.',
            tags: ['content-writing', 'strategy'],
          },
        ],
      },
    ],
  },

  // ── 5. Technology, Engineering & Data ──────────────────────────────────────
  {
    name: 'Technology, Engineering & Data',
    description: 'Tech Expert Track — software dev, AI/ML, data science, cybersecurity.',
    subtopics: [
      {
        name: 'Computational Thinking',
        description: 'Logic, algorithms, and technology fundamentals.',
        questions: [
          {
            type: 'MCQ', difficulty: 'EASY',
            text: 'What does an algorithm do?',
            options: [
              'Stores data permanently',
              'Provides a step-by-step procedure to solve a problem',
              'Connects two computers',
              'Measures computer speed',
            ],
            correctAnswer: 'Provides a step-by-step procedure to solve a problem',
            explanation: 'An algorithm is a finite sequence of instructions designed to solve a specific problem.',
            tags: ['algorithms', 'programming', 'logic'],
          },
          {
            type: 'MCQ', difficulty: 'EASY',
            text: 'In binary, what is the decimal value of "1010"?',
            options: ['8', '10', '12', '14'],
            correctAnswer: '10',
            explanation: '1×8 + 0×4 + 1×2 + 0×1 = 10.',
            tags: ['binary', 'maths', 'computing'],
          },
          {
            type: 'MCQ', difficulty: 'MEDIUM',
            text: 'Which data structure operates on a "first in, first out" (FIFO) basis?',
            options: ['Stack', 'Queue', 'Tree', 'Hash table'],
            correctAnswer: 'Queue',
            explanation: 'A queue processes the element inserted first, like a real-world checkout line.',
            tags: ['data-structures', 'programming'],
          },
          {
            type: 'MCQ', difficulty: 'MEDIUM',
            text: 'In machine learning, "overfitting" means:',
            options: [
              'The model is too simple to learn patterns',
              'The model has memorised training data and performs poorly on new data',
              'The training data is too large',
              'The model takes too long to train',
            ],
            correctAnswer: 'The model has memorised training data and performs poorly on new data',
            explanation: 'Overfitting is when a model learns noise in training data and fails to generalise.',
            tags: ['machine-learning', 'ai', 'data-science'],
          },
          {
            type: 'MCQ', difficulty: 'HARD',
            text: 'A "SQL injection" attack exploits:',
            options: [
              'Weak Wi-Fi passwords',
              'Unsanitised user input in database queries',
              'Slow server response times',
              'Outdated operating systems',
            ],
            correctAnswer: 'Unsanitised user input in database queries',
            explanation: 'SQL injection inserts malicious SQL through input fields when queries are not properly sanitised.',
            tags: ['cybersecurity', 'databases'],
          },
          {
            type: 'MCQ', difficulty: 'HARD',
            text: 'Big O notation O(n log n) is typical for which type of algorithm?',
            options: ['Linear search', 'Bubble sort', 'Merge sort', 'Binary search'],
            correctAnswer: 'Merge sort',
            explanation: 'Merge sort has O(n log n) time complexity and is one of the most efficient comparison sorts.',
            tags: ['algorithms', 'complexity', 'sorting'],
          },
        ],
      },
    ],
  },

  // ── 6. Human Resources & Corporate Management ──────────────────────────────
  {
    name: 'Human Resources & Corporate Management',
    description: 'HR/Management Track — talent, org psychology, operations, leadership.',
    subtopics: [
      {
        name: 'Organisational Behaviour',
        description: 'People management, conflict resolution, and team dynamics.',
        questions: [
          {
            type: 'MCQ', difficulty: 'EASY',
            text: 'Two team members have a conflict over deadlines. The best HR response is:',
            options: [
              'Fire the more difficult employee',
              'Ignore it and hope it resolves itself',
              'Facilitate a structured conversation to understand both perspectives',
              'Immediately escalate to the CEO',
            ],
            correctAnswer: 'Facilitate a structured conversation to understand both perspectives',
            explanation: 'Effective conflict resolution starts with understanding all sides before making decisions.',
            tags: ['conflict-resolution', 'hr'],
          },
          {
            type: 'MCQ', difficulty: 'EASY',
            text: 'What does "talent acquisition" mean in HR?',
            options: [
              'Purchasing new office equipment',
              'The process of finding and hiring skilled employees',
              'Training existing staff',
              'Performance reviews',
            ],
            correctAnswer: 'The process of finding and hiring skilled employees',
            explanation: 'Talent acquisition covers the entire recruitment lifecycle from sourcing to onboarding.',
            tags: ['recruitment', 'hr'],
          },
          {
            type: 'MCQ', difficulty: 'MEDIUM',
            text: 'Maslow\'s hierarchy of needs suggests employees perform best when:',
            options: [
              'They earn the highest salary in their field',
              'Basic needs are met AND they feel valued and have growth opportunities',
              'They fear losing their jobs',
              'They work the longest hours',
            ],
            correctAnswer: 'Basic needs are met AND they feel valued and have growth opportunities',
            explanation: 'Maslow\'s pyramid shows that motivation requires meeting lower needs (safety, income) before higher ones (esteem, self-actualisation).',
            tags: ['psychology', 'motivation', 'hr'],
          },
          {
            type: 'MCQ', difficulty: 'MEDIUM',
            text: 'A 360-degree feedback process collects input from:',
            options: [
              'Only the direct manager',
              'Peers, subordinates, managers, and sometimes customers',
              'The HR department only',
              'An external auditor',
            ],
            correctAnswer: 'Peers, subordinates, managers, and sometimes customers',
            explanation: '360-degree feedback provides a well-rounded view of an employee from multiple directions.',
            tags: ['performance-management', 'hr'],
          },
          {
            type: 'MCQ', difficulty: 'HARD',
            text: 'Which leadership style is most effective during an organisational crisis?',
            options: [
              'Laissez-faire — give employees complete freedom',
              'Transformational — inspire through vision',
              'Directive — provide clear, immediate instructions',
              'Democratic — take a vote on every decision',
            ],
            correctAnswer: 'Directive — provide clear, immediate instructions',
            explanation: 'In crisis situations, clarity and speed matter most; directive leadership reduces ambiguity.',
            tags: ['leadership', 'management'],
          },
          {
            type: 'MCQ', difficulty: 'HARD',
            text: 'An employee consistently arrives late despite verbal warnings. The correct HR process is:',
            options: [
              'Immediate termination',
              'Progressive discipline: verbal → written warning → final warning → termination',
              'Reassign their duties to another employee',
              'Publicly announce the issue at a team meeting',
            ],
            correctAnswer: 'Progressive discipline: verbal → written warning → final warning → termination',
            explanation: 'Progressive discipline ensures fairness, documentation, and legal compliance.',
            tags: ['hr', 'discipline', 'compliance'],
          },
        ],
      },
    ],
  },

  // ── 7. Business, Finance & Economics ───────────────────────────────────────
  {
    name: 'Business, Finance & Economics',
    description: 'Finance Track — CA, investment banking, entrepreneurship, marketing strategy.',
    subtopics: [
      {
        name: 'Financial & Business Reasoning',
        description: 'Quantitative reasoning for business and finance aptitude.',
        questions: [
          {
            type: 'MCQ', difficulty: 'EASY',
            text: 'A business spends ₹50,000 and earns ₹80,000 in a month. The profit is:',
            options: ['₹20,000', '₹30,000', '₹50,000', '₹1,30,000'],
            correctAnswer: '₹30,000',
            explanation: 'Profit = Revenue − Cost = 80,000 − 50,000 = ₹30,000.',
            tags: ['profit-loss', 'business-math'],
          },
          {
            type: 'MCQ', difficulty: 'EASY',
            text: 'The "demand curve" in economics typically slopes:',
            options: ['Upward to the right', 'Downward to the right', 'Horizontally', 'Vertically'],
            correctAnswer: 'Downward to the right',
            explanation: 'As price rises, quantity demanded falls — this inverse relationship creates a downward slope.',
            tags: ['economics', 'demand'],
          },
          {
            type: 'MCQ', difficulty: 'MEDIUM',
            text: 'An investor buys shares at ₹200 and sells at ₹250. The return on investment is:',
            options: ['20%', '25%', '50%', '10%'],
            correctAnswer: '25%',
            explanation: 'ROI = (250 − 200) / 200 × 100 = 25%.',
            tags: ['investment', 'roi', 'finance'],
          },
          {
            type: 'MCQ', difficulty: 'MEDIUM',
            text: 'A "balance sheet" shows a company\'s:',
            options: [
              'Monthly revenue and expenses',
              'Assets, liabilities, and equity at a point in time',
              'Number of employees and salaries',
              'Cash flow over a year',
            ],
            correctAnswer: 'Assets, liabilities, and equity at a point in time',
            explanation: 'The balance sheet is a financial snapshot: Assets = Liabilities + Equity.',
            tags: ['accounting', 'finance', 'ca'],
          },
          {
            type: 'MCQ', difficulty: 'HARD',
            text: 'In stock markets, a "bull market" means:',
            options: [
              'Prices are falling consistently',
              'Prices are rising consistently and investor confidence is high',
              'Trading volume is very low',
              'The market is closed for trading',
            ],
            correctAnswer: 'Prices are rising consistently and investor confidence is high',
            explanation: 'A bull market is characterised by rising prices (20%+ gain) and optimistic sentiment.',
            tags: ['stock-market', 'investment', 'finance'],
          },
          {
            type: 'MCQ', difficulty: 'HARD',
            text: 'Working capital is calculated as:',
            options: [
              'Total assets − total liabilities',
              'Current assets − current liabilities',
              'Revenue − expenses',
              'Equity − debt',
            ],
            correctAnswer: 'Current assets − current liabilities',
            explanation: 'Working capital measures short-term liquidity: Current Assets − Current Liabilities.',
            tags: ['accounting', 'finance', 'ca'],
          },
        ],
      },
    ],
  },

  // ── 8. Healthcare, Medical & Life Sciences ─────────────────────────────────
  {
    name: 'Healthcare, Medical & Life Sciences',
    description: 'Medical Track — medicine, nursing, biotech, pharmacology, psychology.',
    subtopics: [
      {
        name: 'Life Sciences Fundamentals',
        description: 'Biology and health science aptitude questions.',
        questions: [
          {
            type: 'MCQ', difficulty: 'EASY',
            text: 'Which organ pumps blood throughout the body?',
            options: ['Liver', 'Lungs', 'Heart', 'Kidney'],
            correctAnswer: 'Heart',
            explanation: 'The heart is the muscular organ that pumps blood through the circulatory system.',
            tags: ['biology', 'anatomy', 'medicine'],
          },
          {
            type: 'MCQ', difficulty: 'EASY',
            text: 'What is the function of white blood cells?',
            options: [
              'Carry oxygen',
              'Clot blood after injury',
              'Fight infections and pathogens',
              'Transport nutrients',
            ],
            correctAnswer: 'Fight infections and pathogens',
            explanation: 'White blood cells (leukocytes) are the immune system\'s primary defence against infection.',
            tags: ['biology', 'immunology'],
          },
          {
            type: 'MCQ', difficulty: 'MEDIUM',
            text: 'DNA replication occurs in which phase of the cell cycle?',
            options: ['G1 phase', 'S phase', 'G2 phase', 'M phase'],
            correctAnswer: 'S phase',
            explanation: 'DNA synthesis (replication) occurs during the S (Synthesis) phase of interphase.',
            tags: ['genetics', 'cell-biology'],
          },
          {
            type: 'MCQ', difficulty: 'MEDIUM',
            text: 'A patient\'s blood pressure is 140/90 mmHg. This is classified as:',
            options: ['Normal', 'Hypotension', 'Hypertension', 'Optimal'],
            correctAnswer: 'Hypertension',
            explanation: 'Blood pressure ≥ 130/80 mmHg is classified as hypertension (high blood pressure).',
            tags: ['medicine', 'clinical', 'health'],
          },
          {
            type: 'MCQ', difficulty: 'HARD',
            text: 'CRISPR-Cas9 is a biotechnology tool used for:',
            options: [
              'Measuring blood glucose',
              'Editing specific sequences in DNA',
              'Producing antibiotics',
              'Cloning entire organisms',
            ],
            correctAnswer: 'Editing specific sequences in DNA',
            explanation: 'CRISPR-Cas9 acts as molecular scissors that cut and edit specific DNA sequences.',
            tags: ['genetics', 'biotech', 'research'],
          },
          {
            type: 'MCQ', difficulty: 'HARD',
            text: 'Which psychological disorder is characterised by persistent, intrusive thoughts and repetitive behaviours?',
            options: ['Major Depressive Disorder', 'Bipolar Disorder', 'OCD', 'Schizophrenia'],
            correctAnswer: 'OCD',
            explanation: 'Obsessive-Compulsive Disorder (OCD) involves unwanted intrusive thoughts and compulsive rituals.',
            tags: ['psychology', 'mental-health', 'clinical'],
          },
        ],
      },
    ],
  },

  // ── 9. Pure Sciences & Academic Research ───────────────────────────────────
  {
    name: 'Pure Sciences & Academic Research',
    description: 'Research Track — physics, chemistry, maths, space sciences, environmental research.',
    subtopics: [
      {
        name: 'Scientific Reasoning',
        description: 'Analytical and experimental science aptitude.',
        questions: [
          {
            type: 'MCQ', difficulty: 'EASY',
            text: 'Newton\'s second law states that Force =',
            options: ['mass × velocity', 'mass × acceleration', 'mass ÷ acceleration', 'velocity ÷ time'],
            correctAnswer: 'mass × acceleration',
            explanation: 'F = ma is Newton\'s second law of motion.',
            tags: ['physics', 'mechanics'],
          },
          {
            type: 'MCQ', difficulty: 'EASY',
            text: 'The chemical formula for water is:',
            options: ['HO', 'H₂O', 'H₂O₂', 'OH'],
            correctAnswer: 'H₂O',
            explanation: 'Water is composed of two hydrogen atoms and one oxygen atom: H₂O.',
            tags: ['chemistry', 'basics'],
          },
          {
            type: 'MCQ', difficulty: 'MEDIUM',
            text: 'In scientific research, a "control group" is used to:',
            options: [
              'Receive the experimental treatment',
              'Provide a baseline for comparison without the variable being tested',
              'Control the speed of the experiment',
              'Represent the worst-case scenario',
            ],
            correctAnswer: 'Provide a baseline for comparison without the variable being tested',
            explanation: 'A control group is identical to the experimental group except it lacks the variable under study.',
            tags: ['research-methodology', 'science'],
          },
          {
            type: 'MCQ', difficulty: 'MEDIUM',
            text: 'Which mathematical concept describes the rate of change of a function?',
            options: ['Integration', 'Differentiation', 'Probability', 'Matrix multiplication'],
            correctAnswer: 'Differentiation',
            explanation: 'Differentiation (derivative) measures how a function changes as its input changes.',
            tags: ['mathematics', 'calculus'],
          },
          {
            type: 'MCQ', difficulty: 'HARD',
            text: 'The Hubble constant is used to measure:',
            options: [
              'The age of atoms',
              'The rate of expansion of the universe',
              'The distance between electrons',
              'The mass of black holes',
            ],
            correctAnswer: 'The rate of expansion of the universe',
            explanation: 'The Hubble constant (H₀) quantifies how fast the universe is expanding per unit distance.',
            tags: ['astrophysics', 'cosmology', 'space'],
          },
          {
            type: 'MCQ', difficulty: 'HARD',
            text: 'Peer review in academic publishing ensures:',
            options: [
              'Research is published quickly',
              'Findings are evaluated by independent experts before publication',
              'Authors receive payment for their work',
              'Research is freely available to everyone',
            ],
            correctAnswer: 'Findings are evaluated by independent experts before publication',
            explanation: 'Peer review is the quality-control mechanism of academic publishing.',
            tags: ['research', 'academia', 'methodology'],
          },
        ],
      },
    ],
  },

  // ── 10. Hospitality, Tourism & Event Management ────────────────────────────
  {
    name: 'Hospitality, Tourism & Event Management',
    description: 'Hospitality Track — hotel management, culinary arts, travel, event execution.',
    subtopics: [
      {
        name: 'Hospitality & Service Excellence',
        description: 'Customer service, logistics, and event management aptitude.',
        questions: [
          {
            type: 'MCQ', difficulty: 'EASY',
            text: 'A hotel guest complains that their room is noisy. The BEST immediate response is:',
            options: [
              'Tell them to use earplugs',
              'Apologise and offer to move them to a quieter room',
              'Explain that noise is normal in hotels',
              'Ask them to wait until morning',
            ],
            correctAnswer: 'Apologise and offer to move them to a quieter room',
            explanation: 'Service recovery requires empathy and an immediate practical solution.',
            tags: ['hospitality', 'customer-service'],
          },
          {
            type: 'MCQ', difficulty: 'EASY',
            text: 'What does "RevPAR" measure in hotel management?',
            options: [
              'Revenue per available room',
              'Restaurant revenue per customer',
              'Room price after discount',
              'Total annual profit',
            ],
            correctAnswer: 'Revenue per available room',
            explanation: 'RevPAR (Revenue Per Available Room) is the primary KPI for hotel financial performance.',
            tags: ['hotel-management', 'finance', 'kpi'],
          },
          {
            type: 'MCQ', difficulty: 'MEDIUM',
            text: 'An event planner discovers the booked venue has flooded 48 hours before a 500-person conference. What should they do FIRST?',
            options: [
              'Cancel the event and refund everyone',
              'Contact the client and simultaneously source alternative venues',
              'Wait to see if the venue dries out',
              'Announce the cancellation on social media',
            ],
            correctAnswer: 'Contact the client and simultaneously source alternative venues',
            explanation: 'Crisis management requires immediate communication and parallel problem-solving.',
            tags: ['event-management', 'crisis', 'logistics'],
          },
          {
            type: 'MCQ', difficulty: 'MEDIUM',
            text: 'The "mise en place" concept in culinary arts means:',
            options: [
              'A French dessert recipe',
              'Everything in its place — having all ingredients prepped before cooking',
              'Plating food attractively',
              'A kitchen safety inspection',
            ],
            correctAnswer: 'Everything in its place — having all ingredients prepped before cooking',
            explanation: '"Mise en place" is the chef\'s discipline of preparing and organising all components before service.',
            tags: ['culinary', 'hospitality', 'kitchen'],
          },
          {
            type: 'MCQ', difficulty: 'HARD',
            text: 'A travel agency\'s yield management strategy aims to:',
            options: [
              'Sell all seats at the same price',
              'Maximise revenue by varying prices based on demand and timing',
              'Offer the lowest price in the market at all times',
              'Avoid overbooking at all costs',
            ],
            correctAnswer: 'Maximise revenue by varying prices based on demand and timing',
            explanation: 'Yield management adjusts prices dynamically — airlines and hotels charge more at peak times.',
            tags: ['tourism', 'revenue-management', 'strategy'],
          },
          {
            type: 'MCQ', difficulty: 'HARD',
            text: 'Which international certification is most recognised for sustainable tourism practices?',
            options: ['ISO 9001', 'LEED', 'Green Globe', 'Six Sigma'],
            correctAnswer: 'Green Globe',
            explanation: 'Green Globe is the global certification standard specifically for sustainable travel and tourism businesses.',
            tags: ['tourism', 'sustainability', 'certification'],
          },
        ],
      },
    ],
  },
];

// ─── Main Seed Function ───────────────────────────────────────────────────────

async function main(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is required');

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  // 1 ─ Upsert the Career Discovery domain
  const domainDoc = await DomainModel.findOneAndUpdate(
    { name: CAREER_DOMAIN.name },
    { ...CAREER_DOMAIN, order: 10, active: true },
    { upsert: true, new: true },
  );
  const domainId = String(domainDoc._id);
  console.log(`✔ Domain: ${CAREER_DOMAIN.name} (${domainId})`);

  // 2 ─ Iterate topics → subtopics → questions
  for (const [topicIndex, topicSeed] of CAREER_TOPICS.entries()) {
    const topicDoc = await TopicModel.findOneAndUpdate(
      { domainId, name: topicSeed.name },
      {
        domainId,
        name: topicSeed.name,
        description: topicSeed.description,
        order: topicIndex + 1,
        active: true,
      },
      { upsert: true, new: true },
    );
    const topicId = String(topicDoc._id);
    console.log(`  ✔ Topic: ${topicSeed.name}`);

    for (const [subIndex, subtopicSeed] of topicSeed.subtopics.entries()) {
      const subtopicDoc = await SubtopicModel.findOneAndUpdate(
        { topicId, name: subtopicSeed.name },
        {
          topicId,
          name: subtopicSeed.name,
          description: subtopicSeed.description,
          order: subIndex + 1,
          active: true,
        },
        { upsert: true, new: true },
      );
      const subtopicId = String(subtopicDoc._id);
      console.log(`    ✔ Subtopic: ${subtopicSeed.name} (${subtopicSeed.questions.length} Qs)`);

      for (const q of subtopicSeed.questions) {
        const questionDoc = await QuestionModel.findOneAndUpdate(
          { text: q.text },
          {
            domainId,
            topicId,
            subtopicId,
            type: q.type,
            difficulty: q.difficulty,
            text: q.text,
            options: q.options,
            marks: 1,
            negativeMarks: 0.25,
            timeRecommended: 60,
            tags: q.tags,
            active: true,
            createdBy: 'career-seed',
            updatedBy: 'career-seed',
          },
          { upsert: true, new: true },
        );
        const questionId = String(questionDoc._id);

        await AnswerKeyModel.updateOne(
          { questionId },
          {
            questionId,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            updatedBy: 'career-seed',
          },
          { upsert: true },
        );
      }
    }
  }

  console.log('\n✅ Career questions seeded successfully.');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
  });