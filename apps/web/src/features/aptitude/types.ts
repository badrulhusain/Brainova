export type AptitudeCategory = 'QUANT' | 'VERBAL' | 'LOGICAL' | 'ABSTRACT';

export const APTITUDE_LABELS: Record<AptitudeCategory, string> = {
  QUANT: 'Quantitative',
  VERBAL: 'Verbal',
  LOGICAL: 'Logical Reasoning',
  ABSTRACT: 'Abstract',
};

export interface AptitudeQuestion {
  id: string;
  text: string;
  options: string[];
  category: AptitudeCategory;
}

export interface AptitudeScores {
  QUANT: number;
  VERBAL: number;
  LOGICAL: number;
  ABSTRACT: number;
}

export interface AptitudeResult {
  id: string;
  studentId: string;
  scores: AptitudeScores;
  strongestCategory: AptitudeCategory;
  createdAt: string;
}
