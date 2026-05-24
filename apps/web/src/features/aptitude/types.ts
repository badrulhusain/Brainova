export type AptitudeCategory =
  | 'HUMANITIES'
  | 'FINE_ARTS'
  | 'COMMUNICATIONS'
  | 'VISUAL_DESIGN'
  | 'TECHNOLOGY'
  | 'MANAGEMENT'
  | 'COMMERCE'
  | 'CHEMICAL_SCIENCES'
  | 'PHYSICAL_SCIENCES'
  | 'LOGICAL_ANALYTICAL';

export const APTITUDE_LABELS: Record<AptitudeCategory, string> = {
  HUMANITIES: 'Humanities & Social Sciences',
  FINE_ARTS: 'Fine Arts & Creative Expression',
  COMMUNICATIONS: 'Linguistics, Media & Communications',
  VISUAL_DESIGN: 'Visual Design & Digital Media',
  TECHNOLOGY: 'Technology, Computing & Engineering',
  MANAGEMENT: 'Management & Organisational Leadership',
  COMMERCE: 'Commerce, Economics & Accounting',
  CHEMICAL_SCIENCES: 'Chemical & Environmental Sciences',
  PHYSICAL_SCIENCES: 'Physical Sciences & Mathematics',
  LOGICAL_ANALYTICAL: 'Logical Reasoning & Analytical Thinking',
};

export interface AptitudeQuestion {
  id: string;
  text: string;
  options: string[];
  category: AptitudeCategory;
}

export interface AptitudeScores {
  HUMANITIES: number;
  FINE_ARTS: number;
  COMMUNICATIONS: number;
  VISUAL_DESIGN: number;
  TECHNOLOGY: number;
  MANAGEMENT: number;
  COMMERCE: number;
  CHEMICAL_SCIENCES: number;
  PHYSICAL_SCIENCES: number;
  LOGICAL_ANALYTICAL: number;
}

export interface AptitudeResult {
  id: string;
  studentId: string;
  scores: AptitudeScores;
  strongestCategory: AptitudeCategory;
  createdAt: string;
}
