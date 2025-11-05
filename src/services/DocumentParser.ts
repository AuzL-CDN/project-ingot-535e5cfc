import mammoth from 'mammoth';
import type { ParsedChecklistData, ParsedResponse, DocumentParserResult } from '@/types/documentParsing';
import type { ChecklistType } from '@/types/checklist';
import { getChecklistSections } from '@/types/checklist';

export class ChecklistDocumentParser {
  async parseDocument(file: File, checklistType: ChecklistType): Promise<DocumentParserResult> {
    try {
      let extractedText: string;
      
      if (file.name.toLowerCase().endsWith('.docx')) {
        extractedText = await this.parseDocx(file);
      } else {
        return {
          success: false,
          error: 'Only DOCX files are supported at this time. PDF support coming soon.'
        };
      }

      const responses = this.mapTextToQuestions(extractedText, checklistType);

      return {
        success: true,
        data: {
          checklistType,
          responses,
          parseDate: new Date(),
          fileName: file.name
        }
      };
    } catch (error) {
      console.error('Document parsing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to parse document'
      };
    }
  }

  private async parseDocx(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }


  private mapTextToQuestions(text: string, checklistType: ChecklistType): ParsedResponse[] {
    const sections = getChecklistSections(checklistType);
    const responses: ParsedResponse[] = [];
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    for (const section of sections) {
      for (const question of section.questions) {
        const match = this.findQuestionMatch(question.questionText, lines, question.type);
        if (match) {
          responses.push({
            questionId: question.id,
            questionText: question.questionText,
            value: match.value,
            confidence: match.confidence,
            sectionId: section.id
          });
        }
      }
    }

    return responses;
  }

  private findQuestionMatch(
    questionText: string,
    lines: string[],
    questionType: string
  ): { value: string; confidence: number } | null {
    // Create search patterns from question text
    const keywords = this.extractKeywords(questionText);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const matchScore = this.calculateMatchScore(line, keywords);
      
      if (matchScore > 0.5) {
        // Look for answer in same line or next few lines
        const answer = this.extractAnswer(lines, i, questionType);
        if (answer) {
          return {
            value: answer.value,
            confidence: Math.min(matchScore * answer.confidence, 1)
          };
        }
      }
    }

    return null;
  }

  private extractKeywords(text: string): string[] {
    // Remove common words and extract meaningful keywords
    const commonWords = new Set(['the', 'is', 'are', 'was', 'were', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.has(word));
  }

  private calculateMatchScore(line: string, keywords: string[]): number {
    const lineLower = line.toLowerCase();
    let matchCount = 0;
    
    for (const keyword of keywords) {
      if (lineLower.includes(keyword)) {
        matchCount++;
      }
    }
    
    return keywords.length > 0 ? matchCount / keywords.length : 0;
  }

  private extractAnswer(
    lines: string[],
    startIndex: number,
    questionType: string
  ): { value: string; confidence: number } | null {
    const currentLine = lines[startIndex];
    
    // For boolean questions, look for Yes/No
    if (questionType === 'boolean') {
      const yesNoPattern = /\b(yes|no|n\/a|not applicable)\b/i;
      
      // Check current line
      const match = currentLine.match(yesNoPattern);
      if (match) {
        const value = match[1].toLowerCase();
        return {
          value: value === 'yes' ? 'true' : value === 'no' ? 'false' : 'n/a',
          confidence: 0.9
        };
      }
      
      // Check next line
      if (startIndex + 1 < lines.length) {
        const nextLine = lines[startIndex + 1];
        const nextMatch = nextLine.match(yesNoPattern);
        if (nextMatch) {
          const value = nextMatch[1].toLowerCase();
          return {
            value: value === 'yes' ? 'true' : value === 'no' ? 'false' : 'n/a',
            confidence: 0.8
          };
        }
      }
    }
    
    // For text questions, extract nearby text
    if (questionType === 'text' || questionType === 'textarea') {
      const answerLines: string[] = [];
      
      // Check if there's a colon in the current line (inline answer)
      if (currentLine.includes(':')) {
        const parts = currentLine.split(':');
        if (parts.length > 1 && parts[1].trim().length > 0) {
          return {
            value: parts[1].trim(),
            confidence: 0.85
          };
        }
      }
      
      // Collect next few lines as potential answer
      for (let i = startIndex + 1; i < Math.min(startIndex + 4, lines.length); i++) {
        const line = lines[i];
        // Stop if we hit another question pattern
        if (line.match(/^\d+\.|^[a-z]\)|question|section/i)) {
          break;
        }
        answerLines.push(line);
      }
      
      if (answerLines.length > 0) {
        return {
          value: answerLines.join(' ').trim(),
          confidence: 0.7
        };
      }
    }
    
    return null;
  }
}
