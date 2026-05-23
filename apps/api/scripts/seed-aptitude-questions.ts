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
    category: 'QUANT',
    text: 'A student scores 72 out of 90 in a test. What is the percentage score?',
    options: ['72%', '75%', '80%', '85%'],
    correctAnswer: '80%',
    difficulty: 'EASY',
  },
  {
    category: 'QUANT',
    text: 'If 18 notebooks cost Rs. 450, what is the cost of 10 notebooks?',
    options: ['Rs. 200', 'Rs. 225', 'Rs. 250', 'Rs. 275'],
    correctAnswer: 'Rs. 250',
    difficulty: 'EASY',
  },
  {
    category: 'QUANT',
    text: 'The average of 12, 18, 24, and 30 is:',
    options: ['18', '20', '21', '24'],
    correctAnswer: '21',
    difficulty: 'EASY',
  },
  {
    category: 'QUANT',
    text: 'A value increases from 500 to 650. What is the percentage increase?',
    options: ['20%', '25%', '30%', '35%'],
    correctAnswer: '30%',
    difficulty: 'MEDIUM',
  },
  {
    category: 'QUANT',
    text: 'A train covers 180 km in 3 hours. At the same speed, how far will it travel in 45 minutes?',
    options: ['30 km', '40 km', '45 km', '60 km'],
    correctAnswer: '45 km',
    difficulty: 'MEDIUM',
  },
  {
    category: 'QUANT',
    text: 'The ratio of boys to girls in a class is 5:3. If there are 32 students, how many are girls?',
    options: ['10', '12', '15', '20'],
    correctAnswer: '12',
    difficulty: 'MEDIUM',
  },
  {
    category: 'QUANT',
    text: 'A shopkeeper gives a 20% discount on a marked price of Rs. 750. What is the selling price?',
    options: ['Rs. 550', 'Rs. 575', 'Rs. 600', 'Rs. 650'],
    correctAnswer: 'Rs. 600',
    difficulty: 'MEDIUM',
  },
  {
    category: 'QUANT',
    text: 'A sum becomes Rs. 6,600 in 2 years at 10% simple interest per year. What was the principal?',
    options: ['Rs. 5,000', 'Rs. 5,500', 'Rs. 6,000', 'Rs. 6,200'],
    correctAnswer: 'Rs. 6,000',
    difficulty: 'HARD',
  },
  {
    category: 'QUANT',
    text: 'A and B can finish a task in 12 days and 18 days respectively. Working together, they finish it in:',
    options: ['6.8 days', '7.2 days', '8 days', '9 days'],
    correctAnswer: '7.2 days',
    difficulty: 'HARD',
  },
  {
    category: 'QUANT',
    text: 'If x is 40% of y and y is 25% of z, then x is what percent of z?',
    options: ['10%', '15%', '20%', '25%'],
    correctAnswer: '10%',
    difficulty: 'HARD',
  },
  {
    category: 'VERBAL',
    text: 'Choose the word closest in meaning to "meticulous".',
    options: ['Careless', 'Detailed', 'Rapid', 'Ordinary'],
    correctAnswer: 'Detailed',
    difficulty: 'EASY',
  },
  {
    category: 'VERBAL',
    text: 'Choose the antonym of "expand".',
    options: ['Extend', 'Grow', 'Contract', 'Increase'],
    correctAnswer: 'Contract',
    difficulty: 'EASY',
  },
  {
    category: 'VERBAL',
    text: 'Fill in the blank: The team ___ preparing for the final presentation.',
    options: ['are', 'is', 'were', 'be'],
    correctAnswer: 'is',
    difficulty: 'EASY',
  },
  {
    category: 'VERBAL',
    text: 'Choose the correctly spelled word.',
    options: ['Accomodate', 'Acommodate', 'Accommodate', 'Acomodate'],
    correctAnswer: 'Accommodate',
    difficulty: 'MEDIUM',
  },
  {
    category: 'VERBAL',
    text: 'Choose the best replacement: "Despite of the rain, the match continued."',
    options: ['Despite the rain', 'Although of the rain', 'In spite the rain', 'Because the rain'],
    correctAnswer: 'Despite the rain',
    difficulty: 'MEDIUM',
  },
  {
    category: 'VERBAL',
    text: 'Select the word that best completes the sentence: Her explanation was so ___ that everyone understood the process.',
    options: ['vague', 'lucid', 'lengthy', 'doubtful'],
    correctAnswer: 'lucid',
    difficulty: 'MEDIUM',
  },
  {
    category: 'VERBAL',
    text: 'Choose the sentence with correct subject-verb agreement.',
    options: [
      'The list of items are on the desk.',
      'The list of items is on the desk.',
      'The list of items were on the desk.',
      'The list of items be on the desk.',
    ],
    correctAnswer: 'The list of items is on the desk.',
    difficulty: 'MEDIUM',
  },
  {
    category: 'VERBAL',
    text: 'Choose the word closest in meaning to "ambiguous".',
    options: ['Clear', 'Uncertain', 'Brief', 'Harsh'],
    correctAnswer: 'Uncertain',
    difficulty: 'HARD',
  },
  {
    category: 'VERBAL',
    text: 'Choose the antonym of "benevolent".',
    options: ['Kind', 'Generous', 'Hostile', 'Helpful'],
    correctAnswer: 'Hostile',
    difficulty: 'HARD',
  },
  {
    category: 'VERBAL',
    text: 'Identify the correct indirect speech: He said, "I am ready."',
    options: [
      'He said that he is ready.',
      'He said that he was ready.',
      'He said that I was ready.',
      'He says that he was ready.',
    ],
    correctAnswer: 'He said that he was ready.',
    difficulty: 'HARD',
  },
  {
    category: 'LOGICAL',
    text: 'Find the next number: 5, 10, 20, 40, ?',
    options: ['60', '70', '80', '90'],
    correctAnswer: '80',
    difficulty: 'EASY',
  },
  {
    category: 'LOGICAL',
    text: 'If all pens are tools and some tools are blue, which statement must be true?',
    options: ['All pens are blue', 'Some pens are blue', 'All pens are tools', 'No tools are pens'],
    correctAnswer: 'All pens are tools',
    difficulty: 'EASY',
  },
  {
    category: 'LOGICAL',
    text: 'Book is to Reading as Fork is to:',
    options: ['Drawing', 'Eating', 'Writing', 'Cooking'],
    correctAnswer: 'Eating',
    difficulty: 'EASY',
  },
  {
    category: 'LOGICAL',
    text: 'Find the odd one out: 2, 3, 5, 9, 11',
    options: ['2', '3', '9', '11'],
    correctAnswer: '9',
    difficulty: 'MEDIUM',
  },
  {
    category: 'LOGICAL',
    text: 'In a code, CAT is written as DBU. How is DOG written?',
    options: ['EPH', 'EPI', 'FPI', 'CNF'],
    correctAnswer: 'EPH',
    difficulty: 'MEDIUM',
  },
  {
    category: 'LOGICAL',
    text: 'Find the next number: 3, 6, 11, 18, 27, ?',
    options: ['36', '38', '40', '42'],
    correctAnswer: '38',
    difficulty: 'MEDIUM',
  },
  {
    category: 'LOGICAL',
    text: 'A is older than B. C is younger than B. D is older than A. Who is the oldest?',
    options: ['A', 'B', 'C', 'D'],
    correctAnswer: 'D',
    difficulty: 'MEDIUM',
  },
  {
    category: 'LOGICAL',
    text: 'If Monday is coded as 1, Wednesday as 3, and Sunday as 7, what is Friday coded as?',
    options: ['4', '5', '6', '8'],
    correctAnswer: '5',
    difficulty: 'HARD',
  },
  {
    category: 'LOGICAL',
    text: 'Statements: Some artists are writers. All writers are thinkers. Which conclusion follows?',
    options: [
      'All artists are thinkers',
      'Some artists are thinkers',
      'No artist is a thinker',
      'All thinkers are writers',
    ],
    correctAnswer: 'Some artists are thinkers',
    difficulty: 'HARD',
  },
  {
    category: 'LOGICAL',
    text: 'Find the next term: AZ, BY, CX, DW, ?',
    options: ['EV', 'FU', 'EX', 'DV'],
    correctAnswer: 'EV',
    difficulty: 'HARD',
  },
  {
    category: 'ABSTRACT',
    text: 'A shape rotates 90 degrees clockwise each step. If an arrow points up first, where will it point after two steps?',
    options: ['Up', 'Right', 'Down', 'Left'],
    correctAnswer: 'Down',
    difficulty: 'EASY',
  },
  {
    category: 'ABSTRACT',
    text: 'Which figure has the greatest number of sides?',
    options: ['Triangle', 'Square', 'Pentagon', 'Circle'],
    correctAnswer: 'Pentagon',
    difficulty: 'EASY',
  },
  {
    category: 'ABSTRACT',
    text: 'A pattern alternates circle, square, circle, square. What comes next?',
    options: ['Circle', 'Square', 'Triangle', 'Rectangle'],
    correctAnswer: 'Circle',
    difficulty: 'EASY',
  },
  {
    category: 'ABSTRACT',
    text: 'A black square becomes a white square, then a black circle becomes a white circle. What changes each step?',
    options: ['Only size', 'Only color', 'Only shape', 'Both size and shape'],
    correctAnswer: 'Only color',
    difficulty: 'MEDIUM',
  },
  {
    category: 'ABSTRACT',
    text: 'A sequence shows 1 dot, 3 dots, 5 dots, 7 dots. How many dots come next?',
    options: ['8', '9', '10', '11'],
    correctAnswer: '9',
    difficulty: 'MEDIUM',
  },
  {
    category: 'ABSTRACT',
    text: 'If a paper is folded once vertically and a hole is punched on the left side, where will holes appear when unfolded?',
    options: [
      'Left side only',
      'Right side only',
      'Both left and right sides',
      'Top and bottom sides',
    ],
    correctAnswer: 'Both left and right sides',
    difficulty: 'MEDIUM',
  },
  {
    category: 'ABSTRACT',
    text: 'A cube has opposite faces in matching pairs. If top is red and bottom is red, left is blue and right is blue, what should the front match?',
    options: ['Top', 'Bottom', 'Back', 'Left'],
    correctAnswer: 'Back',
    difficulty: 'MEDIUM',
  },
  {
    category: 'ABSTRACT',
    text: 'A pattern changes from small circle to medium circle to large circle, then repeats with squares. What comes after large square?',
    options: ['Small square', 'Small triangle', 'Small circle', 'Medium square'],
    correctAnswer: 'Small circle',
    difficulty: 'HARD',
  },
  {
    category: 'ABSTRACT',
    text: 'A 2x2 grid has black cells at top-left, then top-right, then bottom-right. Which cell likely comes next if the black cell moves clockwise?',
    options: ['Top-left', 'Top-right', 'Bottom-left', 'Bottom-right'],
    correctAnswer: 'Bottom-left',
    difficulty: 'HARD',
  },
  {
    category: 'ABSTRACT',
    text: 'In a sequence, a triangle gains one side each step: triangle, square, pentagon. What comes next?',
    options: ['Hexagon', 'Heptagon', 'Octagon', 'Circle'],
    correctAnswer: 'Hexagon',
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

  for (const question of questions) {
    await AptitudeQuestion.replaceOne(
      { category: question.category, text: question.text },
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
