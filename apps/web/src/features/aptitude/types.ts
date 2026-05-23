export type AptitudeCategory =
  | 'GOVERNANCE'
  | 'VISUAL_MEDIA'
  | 'FINE_ARTS'
  | 'COMMUNICATIONS'
  | 'TECH_DATA'
  | 'HR_MANAGEMENT'
  | 'BUSINESS_FINANCE'
  | 'HEALTHCARE'
  | 'PURE_SCIENCES'
  | 'HOSPITALITY_EVENTS';

export const APTITUDE_LABELS: Record<AptitudeCategory, string> = {
  GOVERNANCE: 'Public Administration & Governance',
  VISUAL_MEDIA: 'Visual Branding & Creative Media',
  FINE_ARTS: 'Fine Arts & Creative Expression',
  COMMUNICATIONS: 'Linguistics, Media & Communications',
  TECH_DATA: 'Technology, Engineering & Data',
  HR_MANAGEMENT: 'Human Resources & Corporate Management',
  BUSINESS_FINANCE: 'Business, Finance & Economics',
  HEALTHCARE: 'Healthcare, Medical & Life Sciences',
  PURE_SCIENCES: 'Pure Sciences & Academic Research',
  HOSPITALITY_EVENTS: 'Hospitality, Tourism & Event Management',
};

export interface AptitudeQuestion {
  id: string;
  text: string;
  options: string[];
  category: AptitudeCategory;
}

export interface AptitudeScores {
  GOVERNANCE: number;
  VISUAL_MEDIA: number;
  FINE_ARTS: number;
  COMMUNICATIONS: number;
  TECH_DATA: number;
  HR_MANAGEMENT: number;
  BUSINESS_FINANCE: number;
  HEALTHCARE: number;
  PURE_SCIENCES: number;
  HOSPITALITY_EVENTS: number;
}

export interface AptitudeResult {
  id: string;
  studentId: string;
  scores: AptitudeScores;
  strongestCategory: AptitudeCategory;
  createdAt: string;
}
