import type { ChecklistType, ChecklistResponse } from './checklist';

export interface ParsedResponse {
  questionId: string;
  questionText: string;
  value: string;
  confidence: number;
  sectionId: string;
}

export interface ParsedChecklistData {
  checklistType: ChecklistType;
  responses: ParsedResponse[];
  parseDate: Date;
  fileName: string;
}

export interface DocumentParserResult {
  success: boolean;
  data?: ParsedChecklistData;
  error?: string;
}
