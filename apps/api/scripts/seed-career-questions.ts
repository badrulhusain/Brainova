import 'dotenv/config';
import mongoose from 'mongoose';
import {
  AptitudeQuestionModelName,
  AptitudeQuestionSchema,
  type AptitudeCategory,
  type Difficulty,
} from '../src/database/mongo.schemas';

/**
 * APTITUDE QUESTION DESIGN RATIONALE
 * ─────────────────────────────────────────────────────────────────────────────
 * Institution : Darul Huda Islamic University
 * Student range: 6th standard (≈ age 11–12) → Degree level (≈ age 18–22)
 *
 * DIFFICULTY MAPPING
 *   EASY   → 6th – 8th standard  (basic recall, single-step reasoning)
 *   MEDIUM → 9th – 12th standard (two-step reasoning, moderate vocabulary)
 *   HARD   → Degree level         (multi-step logic, abstract concepts)
 *
 * CATEGORY PHILOSOPHY
 *   Questions test APTITUDE (reasoning ability, pattern recognition,
 *   verbal understanding, numerical sense) NOT rote subject knowledge.
 *   Each question should reveal HOW a student thinks, not what they memorised.
 *
 * TOTAL: 30 questions — 10 categories × 3 each
 * Difficulty: 10 EASY + 15 MEDIUM + 5 HARD
 * Hard categories: HUMANITIES, COMMUNICATIONS, TECHNOLOGY,
 *                  COMMERCE, LOGICAL_ANALYTICAL
 * ─────────────────────────────────────────────────────────────────────────────
 */

interface AptitudeQuestionSeed {
  category: AptitudeCategory;
  text: string;
  options: [string, string, string, string];
  correctAnswer: string;
  difficulty: Difficulty;
}

const questions: AptitudeQuestionSeed[] = [

  // ═══════════════════════════════════════════════════════════════════════════
  // HUMANITIES  (1 EASY · 1 MEDIUM · 1 HARD)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    // 6th–8th std: Simple civic concept every student encounters
    category: 'HUMANITIES',
    text: 'A rule that everyone in a country must follow and is made by the government is called a:',
    options: ['Story', 'Law', 'Poem', 'Map'],
    correctAnswer: 'Law',
    difficulty: 'EASY',
  },
  {
    // 9th–12th std: Understanding purpose of governance
    category: 'HUMANITIES',
    text: 'A government makes decisions for millions of people it has never met.'
      + ' Which quality is MOST important for that government to have?',
    options: [
      'Speed — decisions must be made as fast as possible',
      'Fairness — rules should treat all citizens equally',
      'Secrecy — plans work better when kept hidden from citizens',
      'Size — a larger government always serves people better',
    ],
    correctAnswer: 'Fairness — rules should treat all citizens equally',
    difficulty: 'MEDIUM',
  },
  {
    // Degree: Abstract reasoning about political philosophy
    category: 'HUMANITIES',
    text: 'A leader argues: "My country follows a single set of religious laws,'
      + ' so there is no need for a written constitution."\n'
      + 'What is the strongest counter-argument to this position?',
    options: [
      'Religious law and constitutional law have always agreed with each other throughout history',
      'A written constitution protects individuals from the arbitrary exercise of power'
        + ' even when religious authority is respected',
      'Constitutions are only useful in non-religious states',
      'The size of a country determines whether it needs a constitution',
    ],
    correctAnswer:
      'A written constitution protects individuals from the arbitrary exercise of power'
      + ' even when religious authority is respected',
    difficulty: 'HARD',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FINE_ARTS  (1 EASY · 2 MEDIUM)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    // 6th–8th std: Simple colour observation
    category: 'FINE_ARTS',
    text: 'You mix red paint and yellow paint together. What colour do you get?',
    options: ['Green', 'Orange', 'Purple', 'Brown'],
    correctAnswer: 'Orange',
    difficulty: 'EASY',
  },
  {
    // 9th–12th std: Understanding artistic purpose
    category: 'FINE_ARTS',
    text: 'An artist paints a mother\'s face half in warm sunlight and half in cold shadow.'
      + ' What is the artist MOST likely trying to show?',
    options: [
      'The time of day when the portrait was painted',
      'The mother\'s mixed feelings or dual nature — joy and sorrow coexisting',
      'That the artist ran out of one colour of paint',
      'The geographical location of the painting',
    ],
    correctAnswer: 'The mother\'s mixed feelings or dual nature — joy and sorrow coexisting',
    difficulty: 'MEDIUM',
  },
  {
    // 9th–12th std: Applying concept of rhythm to art
    category: 'FINE_ARTS',
    text: 'A designer repeats the same arch shape at regular intervals across a building facade.'
      + ' In design terms, this technique creates:',
    options: [
      'Contrast — making each arch look different from the last',
      'Rhythm — the repeated pattern guides the viewer\'s eye smoothly across the surface',
      'Isolation — each arch stands completely apart from the others',
      'Hierarchy — one arch is made more important than the rest',
    ],
    correctAnswer: 'Rhythm — the repeated pattern guides the viewer\'s eye smoothly across the surface',
    difficulty: 'MEDIUM',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMUNICATIONS  (1 EASY · 1 MEDIUM · 1 HARD)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    // 6th–8th std: Basic reading comprehension skill
    category: 'COMMUNICATIONS',
    text: 'Your friend sends you this message: "The match starts at 4 pm — DON\'T be late!"\n'
      + 'What is the MAIN purpose of this message?',
    options: [
      'To describe what a football match looks like',
      'To give your friend information about themselves',
      'To inform you of a time and warn you to be punctual',
      'To ask for your opinion about football',
    ],
    correctAnswer: 'To inform you of a time and warn you to be punctual',
    difficulty: 'EASY',
  },
  {
    // 9th–12th std: Identifying logical fallacy in argument
    category: 'COMMUNICATIONS',
    text: 'Read this argument: "You should not listen to his advice on healthy eating —'
      + ' he is overweight himself."\n'
      + 'What is WRONG with this argument?',
    options: [
      'It correctly identifies that only healthy people can give health advice',
      'It attacks the person rather than addressing whether the advice itself is correct',
      'It uses too many complicated words for the audience',
      'It provides too much evidence to support its point',
    ],
    correctAnswer: 'It attacks the person rather than addressing whether the advice itself is correct',
    difficulty: 'MEDIUM',
  },
  {
    // Degree: Evaluating source reliability and media literacy
    category: 'COMMUNICATIONS',
    text: 'A social-media post claims a new study "proves" a common food causes illness.'
      + ' It provides no link to the study and is shared widely.\n'
      + 'A critical reader\'s FIRST step should be to:',
    options: [
      'Share the post immediately so others can be warned',
      'Accept it as true because many people have shared it',
      'Locate the original study, check who conducted it, and assess its methodology',
      'Dismiss it entirely because social media is never reliable',
    ],
    correctAnswer: 'Locate the original study, check who conducted it, and assess its methodology',
    difficulty: 'HARD',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // VISUAL_DESIGN  (1 EASY · 2 MEDIUM)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    // 6th–8th std: Basic visual observation
    category: 'VISUAL_DESIGN',
    text: 'A poster has a very large title at the top and small text at the bottom.'
      + ' Where will a reader\'s eye go FIRST?',
    options: [
      'The bottom right corner',
      'The large title at the top',
      'Exactly in the middle of the poster',
      'To the back of the poster',
    ],
    correctAnswer: 'The large title at the top',
    difficulty: 'EASY',
  },
  {
    // 9th–12th std: Applying contrast principle
    category: 'VISUAL_DESIGN',
    text: 'A student designs a school notice using white text on a light-yellow background.'
      + ' Their teacher says it is hard to read. Why?',
    options: [
      'The notice uses too many different fonts',
      'White and light yellow are too similar in brightness, so there is not enough contrast',
      'Notices should never use colour — only black and white',
      'The text size is too large for the background',
    ],
    correctAnswer: 'White and light yellow are too similar in brightness, so there is not enough contrast',
    difficulty: 'MEDIUM',
  },
  {
    // 9th–12th std: Layout and user navigation
    category: 'VISUAL_DESIGN',
    text: 'On a school website, students cannot find the exam timetable even though it exists.'
      + ' Which design problem does this MOST likely indicate?',
    options: [
      'The website has too many photographs',
      'The timetable is written in the wrong language',
      'The navigation structure is poorly organised, making important content hard to locate',
      'The website loads too slowly',
    ],
    correctAnswer: 'The navigation structure is poorly organised, making important content hard to locate',
    difficulty: 'MEDIUM',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TECHNOLOGY  (1 EASY · 1 MEDIUM · 1 HARD)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    // 6th–8th std: Basic digital literacy
    category: 'TECHNOLOGY',
    text: 'You are writing an assignment on a computer and the power cuts out suddenly.'
      + ' Your work disappears. What should you do differently next time?',
    options: [
      'Write the assignment faster so it finishes before the power cuts',
      'Save your work regularly so it is not lost if something goes wrong',
      'Use a pen and paper instead of a computer',
      'Leave the computer running all night so it does not switch off',
    ],
    correctAnswer: 'Save your work regularly so it is not lost if something goes wrong',
    difficulty: 'EASY',
  },
  {
    // 9th–12th std: Logical understanding of algorithm steps
    category: 'TECHNOLOGY',
    text: 'A computer program sorts a list of 1,000 names alphabetically.'
      + ' If the list grows to 10,000 names, what generally happens to the time needed?',
    options: [
      'It stays exactly the same — computers work at a fixed speed',
      'It decreases — more names give the computer more practice',
      'It increases — a larger list requires more comparisons and operations',
      'It becomes zero — modern computers sort instantly regardless of size',
    ],
    correctAnswer: 'It increases — a larger list requires more comparisons and operations',
    difficulty: 'MEDIUM',
  },
  {
    // Degree: Security reasoning
    category: 'TECHNOLOGY',
    text: 'A university stores student passwords as plain text in its database.'
      + ' The database is stolen by a hacker.\n'
      + 'Which practice would have BEST protected the students?',
    options: [
      'Storing passwords in a different folder on the same server',
      'Hashing passwords with a strong algorithm so stolen hashes cannot easily reveal original passwords',
      'Making all passwords exactly eight characters long',
      'Emailing each student a copy of their password for safekeeping',
    ],
    correctAnswer:
      'Hashing passwords with a strong algorithm so stolen hashes cannot easily reveal original passwords',
    difficulty: 'HARD',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MANAGEMENT  (1 EASY · 2 MEDIUM)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    // 6th–8th std: Basic planning concept
    category: 'MANAGEMENT',
    text: 'You have an exam in three weeks. You decide to study a little every day'
      + ' instead of cramming the night before. This is an example of:',
    options: [
      'Wasting time on small tasks',
      'Poor time management',
      'Planning ahead to reach a goal steadily',
      'Ignoring the importance of rest',
    ],
    correctAnswer: 'Planning ahead to reach a goal steadily',
    difficulty: 'EASY',
  },
  {
    // 9th–12th std: Prioritisation skill
    category: 'MANAGEMENT',
    text: 'A class president has four tasks: (A) reply to messages, (B) prepare a speech'
      + ' due tomorrow, (C) reorganise old files, (D) plan next month\'s event.\n'
      + 'Which task should be done FIRST?',
    options: [
      'A — replying to messages is always most important',
      'B — it has an immediate deadline and high consequence if missed',
      'C — organising files will make all other tasks easier',
      'D — planning ahead prevents future stress',
    ],
    correctAnswer: 'B — it has an immediate deadline and high consequence if missed',
    difficulty: 'MEDIUM',
  },
  {
    // 9th–12th std: Understanding delegation
    category: 'MANAGEMENT',
    text: 'A department head notices that doing every small task personally leaves no time'
      + ' for important decisions. The BEST solution is to:',
    options: [
      'Work longer hours to fit in every task',
      'Assign smaller tasks to capable team members so attention can focus on key decisions',
      'Stop making important decisions until all small tasks are finished',
      'Hire more staff but continue doing all tasks personally',
    ],
    correctAnswer:
      'Assign smaller tasks to capable team members so attention can focus on key decisions',
    difficulty: 'MEDIUM',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMERCE  (1 EASY · 1 MEDIUM · 1 HARD)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    // 6th–8th std: Basic money concept
    category: 'COMMERCE',
    text: 'Ahmed earns ₹500 per week and spends ₹350. How much does he save each week?',
    options: ['₹100', '₹150', '₹200', '₹250'],
    correctAnswer: '₹150',
    difficulty: 'EASY',
  },
  {
    // 9th–12th std: Supply-and-demand reasoning
    category: 'COMMERCE',
    text: 'During exam season, the price of notebooks in the college stationery shop rises.'
      + ' Which explanation fits BEST?',
    options: [
      'The shop owner dislikes students and raises prices to annoy them',
      'Higher demand during exam season, with limited supply, pushes prices up',
      'The government orders shops to raise prices every semester',
      'Notebooks become more expensive to produce only during exams',
    ],
    correctAnswer: 'Higher demand during exam season, with limited supply, pushes prices up',
    difficulty: 'MEDIUM',
  },
  {
    // Degree: Interpreting a simple financial scenario
    category: 'COMMERCE',
    text: 'A business earns ₹80,000 in revenue. Its costs are ₹95,000.\n'
      + 'An investor says, "You are growing fast — I want to invest!"\n'
      + 'What should the investor reconsider?',
    options: [
      'Revenue alone is impressive; costs are unimportant for growth businesses',
      'The business is spending more than it earns (a net loss of ₹15,000),'
        + ' which is unsustainable without a clear path to profitability',
      'Growth rate is the only metric that matters for investment decisions',
      'High costs always mean a business is investing wisely in its future',
    ],
    correctAnswer:
      'The business is spending more than it earns (a net loss of ₹15,000),'
      + ' which is unsustainable without a clear path to profitability',
    difficulty: 'HARD',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CHEMICAL_SCIENCES  (1 EASY · 2 MEDIUM)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    // 6th–8th std: Everyday chemistry observation
    category: 'CHEMICAL_SCIENCES',
    text: 'When you add sugar to a glass of water and stir, the sugar disappears.'
      + ' The water now tastes sweet. What has happened?',
    options: [
      'The sugar was destroyed by the water',
      'The sugar dissolved and mixed evenly throughout the water',
      'The water turned into sugar',
      'The sugar floated to the top of the glass invisibly',
    ],
    correctAnswer: 'The sugar dissolved and mixed evenly throughout the water',
    difficulty: 'EASY',
  },
  {
    // 9th–12th std: Reasoning about chemical change vs physical change
    category: 'CHEMICAL_SCIENCES',
    text: 'Which of the following is a CHEMICAL change (a new substance is formed)?',
    options: [
      'Cutting paper into small pieces',
      'Melting ice into water',
      'Burning wood and producing ash and smoke',
      'Dissolving salt in water',
    ],
    correctAnswer: 'Burning wood and producing ash and smoke',
    difficulty: 'MEDIUM',
  },
  {
    // 9th–12th std: Applying particle model thinking
    category: 'CHEMICAL_SCIENCES',
    text: 'A perfume bottle is opened at one end of a room.'
      + ' After a few minutes, people at the other end can smell it.'
      + ' Which property of gases BEST explains this?',
    options: [
      'Gases are very heavy and fall to the ground quickly',
      'Gas particles move randomly and spread out to fill available space (diffusion)',
      'The perfume reacted chemically with the air to create a new gas',
      'Air currents in the room carried the liquid perfume across',
    ],
    correctAnswer: 'Gas particles move randomly and spread out to fill available space (diffusion)',
    difficulty: 'MEDIUM',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PHYSICAL_SCIENCES  (1 EASY · 2 MEDIUM)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    // 6th–8th std: Everyday physics intuition
    category: 'PHYSICAL_SCIENCES',
    text: 'You push a heavy box across the floor. It is much harder to start moving'
      + ' than to keep it moving. What force makes it hard to start moving?',
    options: ['Gravity', 'Magnetism', 'Friction', 'Air resistance'],
    correctAnswer: 'Friction',
    difficulty: 'EASY',
  },
  {
    // 9th–12th std: Applying energy conservation reasoning
    category: 'PHYSICAL_SCIENCES',
    text: 'A ball is dropped from the top of a building. Just before it hits the ground,'
      + ' which statement about its energy is correct?',
    options: [
      'Its potential energy is at its highest and kinetic energy is zero',
      'Both potential energy and kinetic energy are zero',
      'Its potential energy is nearly zero and kinetic energy is at its highest',
      'Kinetic energy and potential energy remain equal throughout the fall',
    ],
    correctAnswer: 'Its potential energy is nearly zero and kinetic energy is at its highest',
    difficulty: 'MEDIUM',
  },
  {
    // 9th–12th std: Circuit reasoning
    category: 'PHYSICAL_SCIENCES',
    text: 'In a circuit, three bulbs are connected in series. One bulb blows out.'
      + ' What happens to the other two bulbs?',
    options: [
      'They glow brighter because more electricity reaches them',
      'They are unaffected and continue to glow normally',
      'They also go out because the circuit is broken',
      'One goes out but the other continues to glow',
    ],
    correctAnswer: 'They also go out because the circuit is broken',
    difficulty: 'MEDIUM',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LOGICAL_ANALYTICAL  (1 EASY · 1 MEDIUM · 1 HARD)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    // 6th–8th std: Simple sequence pattern
    category: 'LOGICAL_ANALYTICAL',
    text: 'What comes next in this sequence?\n  2, 4, 6, 8, ___',
    options: ['9', '10', '11', '12'],
    correctAnswer: '10',
    difficulty: 'EASY',
  },
  {
    // 9th–12th std: Word analogy reasoning
    category: 'LOGICAL_ANALYTICAL',
    text: 'Doctor is to Patient as Teacher is to ___?',
    options: ['Hospital', 'Classroom', 'Student', 'Textbook'],
    correctAnswer: 'Student',
    difficulty: 'MEDIUM',
  },
  {
    // Degree: Multi-step set logic
    category: 'LOGICAL_ANALYTICAL',
    text: 'In a group of 60 students:\n'
      + '  • 35 study Arabic\n'
      + '  • 30 study English\n'
      + '  • 15 study both\n\n'
      + 'How many students study NEITHER Arabic nor English?',
    options: ['5', '10', '15', '20'],
    correctAnswer: '10',
    difficulty: 'HARD',
  },
];

// ─── Database seeding ────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const uri = process.env['MONGODB_URI'];
  if (!uri) throw new Error('MONGODB_URI is required to seed aptitude questions.');

  await mongoose.connect(uri);
  const AptitudeQuestion = mongoose.model(AptitudeQuestionModelName, AptitudeQuestionSchema);
  const seededTexts = questions.map((q) => q.text);

  // Deactivate questions no longer in this seed list
  await AptitudeQuestion.updateMany(
    { text: { $nin: seededTexts } },
    { $set: { active: false } },
  );

  // Upsert every question
  for (const question of questions) {
    await AptitudeQuestion.replaceOne(
      { text: question.text },
      { ...question, active: true },
      { upsert: true },
    );
  }

  // ── Summary output ─────────────────────────────────────────────────────────
  const counts = await AptitudeQuestion.aggregate<{ _id: AptitudeCategory; count: number }>([
    { $match: { active: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  process.stdout.write(`\nSeeded ${questions.length} aptitude questions.\n\nCategory breakdown:\n`);
  for (const c of counts) {
    process.stdout.write(`  ${c._id}: ${c.count} active questions\n`);
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
  process.stderr.write(`Aptitude seed failed: ${message}\n`);
  void mongoose.disconnect().finally(() => process.exit(1));
});