import { config as loadEnv } from 'dotenv';
import { join } from 'path';
import * as bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import {
  AdminModelName,
  AdminSchema,
  AnswerKeyModelName,
  AnswerKeySchema,
  DomainModelName,
  DomainSchema,
  QuestionModelName,
  QuestionSchema,
  StudentModelName,
  StudentSchema,
  SubtopicModelName,
  SubtopicSchema,
  TestConfigModelName,
  TestConfigSchema,
  TopicModelName,
  TopicSchema,
  type Difficulty,
  type QuestionType,
} from '../src/database/mongo.schemas';

loadEnv({ path: join(process.cwd(), '.env.local') });
loadEnv({ path: join(process.cwd(), '.env') });

const AdminModel = mongoose.model(AdminModelName, AdminSchema);
const StudentModel = mongoose.model(StudentModelName, StudentSchema);
const DomainModel = mongoose.model(DomainModelName, DomainSchema);
const TopicModel = mongoose.model(TopicModelName, TopicSchema);
const SubtopicModel = mongoose.model(SubtopicModelName, SubtopicSchema);
const QuestionModel = mongoose.model(QuestionModelName, QuestionSchema);
const AnswerKeyModel = mongoose.model(AnswerKeyModelName, AnswerKeySchema);
const TestConfigModel = mongoose.model(TestConfigModelName, TestConfigSchema);

interface QuestionSeed {
  type: QuestionType;
  difficulty: Difficulty;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  tags: string[];
}

const domains = [
  {
    name: 'Arabic Language',
    icon: 'book-open',
    description: 'Arabic grammar, vocabulary, and comprehension',
  },
  {
    name: 'Islamic Studies',
    icon: 'moon-star',
    description: 'Fiqh, Aqeedah, Seerah, and Islamic history',
  },
  {
    name: 'Quran & Tajweed',
    icon: 'scroll',
    description: 'Quranic recitation rules and memorisation',
  },
  {
    name: 'General Aptitude',
    icon: 'brain',
    description: 'Logical reasoning and quantitative aptitude',
  },
  {
    name: 'Mathematics',
    icon: 'calculator',
    description: 'Arithmetic, algebra, and problem solving',
  },
  {
    name: 'English Language',
    icon: 'type',
    description: 'Grammar, vocabulary, and comprehension',
  },
];

const questions: QuestionSeed[] = [
  {
    type: 'MCQ',
    difficulty: 'EASY',
    text: 'Which number comes next in the sequence: 2, 4, 8, 16, ?',
    options: ['20', '24', '32', '36'],
    correctAnswer: '32',
    explanation: 'Each term is multiplied by 2, so 16 x 2 = 32.',
    tags: ['sequence', 'reasoning'],
  },
  {
    type: 'MCQ',
    difficulty: 'EASY',
    text: 'If all students are learners and Abdullah is a student, what can be concluded?',
    options: [
      'Abdullah is a learner',
      'All learners are students',
      'Abdullah is a teacher',
      'No conclusion can be made',
    ],
    correctAnswer: 'Abdullah is a learner',
    explanation: 'The statement places every student inside the learner group.',
    tags: ['logic'],
  },
  {
    type: 'MCQ',
    difficulty: 'EASY',
    text: 'Which word does not belong with the others: Apple, Mango, Carrot, Banana?',
    options: ['Apple', 'Mango', 'Carrot', 'Banana'],
    correctAnswer: 'Carrot',
    explanation: 'Apple, mango, and banana are fruits; carrot is a vegetable.',
    tags: ['classification'],
  },
  {
    type: 'MCQ',
    difficulty: 'EASY',
    text: 'A student has 5 pencils and buys 3 more. How many pencils does the student have now?',
    options: ['7', '8', '9', '10'],
    correctAnswer: '8',
    explanation: '5 + 3 = 8.',
    tags: ['arithmetic'],
  },
  {
    type: 'MCQ',
    difficulty: 'MEDIUM',
    text: 'A class has 24 students. If 3/8 of them study Arabic grammar after class, how many students is that?',
    options: ['6', '8', '9', '12'],
    correctAnswer: '9',
    explanation: '3/8 of 24 is 24 / 8 x 3 = 9.',
    tags: ['fractions'],
  },
  {
    type: 'MCQ',
    difficulty: 'MEDIUM',
    text: 'Find the odd one out: Fajr, Dhuhr, Asr, Ramadan.',
    options: ['Fajr', 'Dhuhr', 'Asr', 'Ramadan'],
    correctAnswer: 'Ramadan',
    explanation: 'Fajr, Dhuhr, and Asr are daily prayers; Ramadan is a month.',
    tags: ['classification', 'islamic-context'],
  },
  {
    type: 'MCQ',
    difficulty: 'MEDIUM',
    text: 'A book costs 120 rupees after a 20% discount. What was the original price?',
    options: ['140', '150', '160', '180'],
    correctAnswer: '150',
    explanation: 'After a 20% discount, the price is 80% of the original. 120 / 0.8 = 150.',
    tags: ['percentage'],
  },
  {
    type: 'MCQ',
    difficulty: 'HARD',
    text: 'A student answers 40 questions. Correct answers receive 2 marks and incorrect answers lose 0.5 marks. If the student answered all questions and scored 55, how many were correct?',
    options: ['28', '30', '32', '34'],
    correctAnswer: '30',
    explanation: 'Let correct = x. Score = 2x - 0.5(40 - x) = 55, so 2.5x = 75 and x = 30.',
    tags: ['algebra', 'scoring'],
  },
  {
    type: 'MCQ',
    difficulty: 'HARD',
    text: 'If A is older than B, B is older than C, and D is younger than C, who is definitely the oldest?',
    options: ['A', 'B', 'C', 'D'],
    correctAnswer: 'A',
    explanation: 'The order from oldest to youngest is A, B, C, D.',
    tags: ['ordering', 'reasoning'],
  },
  {
    type: 'MCQ',
    difficulty: 'HARD',
    text: 'In a code, TEACH is written as VGCEJ. Using the same pattern, how is LEARN written?',
    options: ['NGCTP', 'MGCSO', 'NGDTO', 'MFBSO'],
    correctAnswer: 'NGCTP',
    explanation: 'Each letter is shifted two positions forward: L to N, E to G, A to C, R to T, and N to P.',
    tags: ['coding', 'reasoning'],
  },
];

async function main(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  const username = process.env.ADMIN_USERNAME?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!uri) throw new Error('MONGODB_URI is required');
  if (!username || !password) {
    throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD are required');
  }

  await mongoose.connect(uri);

  await AdminModel.updateOne(
    { username },
    { username, password: await bcrypt.hash(password, 10) },
    { upsert: true },
  );

  await StudentModel.updateOne(
    { admissionNo: 'ISL2024001' },
    {
      name: 'Abdullah Rahman',
      admissionNo: 'ISL2024001',
      department: 'Islamic Studies',
      batch: '2024-2028',
      active: true,
    },
    { upsert: true },
  );

  const domainIds = new Map<string, string>();
  for (const [index, domain] of domains.entries()) {
    const saved = await DomainModel.findOneAndUpdate(
      { name: domain.name },
      { ...domain, order: index + 1, active: true },
      { upsert: true, new: true },
    );
    domainIds.set(domain.name, String(saved._id));
  }

  const generalDomainId = domainIds.get('General Aptitude');
  if (!generalDomainId) throw new Error('General Aptitude domain was not seeded');

  const topic = await TopicModel.findOneAndUpdate(
    { domainId: generalDomainId, name: 'Logical Reasoning' },
    {
      domainId: generalDomainId,
      name: 'Logical Reasoning',
      description: 'Sequences, classification, ordering, and deduction',
      order: 1,
      active: true,
    },
    { upsert: true, new: true },
  );

  const subtopic = await SubtopicModel.findOneAndUpdate(
    { topicId: String(topic._id), name: 'Reasoning Basics' },
    {
      topicId: String(topic._id),
      name: 'Reasoning Basics',
      description: 'Foundational aptitude reasoning questions',
      order: 1,
      active: true,
    },
    { upsert: true, new: true },
  );

  for (const seed of questions) {
    const question = await QuestionModel.findOneAndUpdate(
      { text: seed.text },
      {
        domainId: generalDomainId,
        topicId: String(topic._id),
        subtopicId: String(subtopic._id),
        type: seed.type,
        difficulty: seed.difficulty,
        text: seed.text,
        options: seed.options,
        marks: 1,
        negativeMarks: 0,
        timeRecommended: 60,
        tags: seed.tags,
        active: true,
        createdBy: 'seed',
        updatedBy: 'seed',
      },
      { upsert: true, new: true },
    );

    await AnswerKeyModel.updateOne(
      { questionId: String(question._id) },
      {
        questionId: String(question._id),
        correctAnswer: seed.correctAnswer,
        explanation: seed.explanation,
        updatedBy: 'seed',
      },
      { upsert: true },
    );
  }

  await TestConfigModel.updateOne(
    { name: 'General Aptitude Diagnostic' },
    {
      name: 'General Aptitude Diagnostic',
      description: 'A short aptitude diagnostic for institute admission readiness.',
      domainId: generalDomainId,
      totalQuestions: 10,
      duration: 900,
      marksPerQuestion: 1,
      negativeMarksRatio: 0,
      easyCount: 4,
      mediumCount: 3,
      hardCount: 3,
      topicFilter: [],
      shuffleQuestions: true,
      shuffleOptions: false,
      active: true,
      createdBy: 'seed',
    },
    { upsert: true },
  );

  console.log(`MongoDB seed complete. Default admin is ready: ${username}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
