import type { ChecklistType, ChecklistResponse, ChecklistAnalysis } from '@/types/checklist';
import { getChecklistSections } from '@/types/checklist';

export class ChecklistAnalyzer {
  
  async analyzeResponses(
    checklistType: ChecklistType,
    responses: Record<string, ChecklistResponse>,
    mainFormData: any
  ): Promise<ChecklistAnalysis[]> {
    const sections = getChecklistSections(checklistType);
    const analyses: ChecklistAnalysis[] = [];

    for (const section of sections) {
      for (const question of section.questions) {
        const response = responses[question.id];
        if (!response) continue;

        const analysis = await this.analyzeQuestion(question, response, mainFormData);
        if (analysis) {
          analyses.push(analysis);
        }
      }
    }

    return analyses;
  }

  private async analyzeQuestion(
    question: any,
    response: ChecklistResponse,
    mainFormData: any
  ): Promise<ChecklistAnalysis | null> {
    const { id, questionText, finalReportMapping } = question;
    const { value, notes } = response;

    if (!finalReportMapping) return null;

    let finding = '';
    let recommendation = '';
    let finalReportContent = '';
    let automationLevel: 'full' | 'partial' | 'manual' = 'manual';
    let confidence = 0.7;

    // Analyze based on question type and automation rules
    switch (finalReportMapping.automationRule) {
      case 'system_configuration_check':
        if (id === 'is_configured') {
          if (value === 'yes') {
            finding = 'Information System is configured and ready for inspection';
            finalReportContent = `The IS unit was confirmed to be configured and ready for inspection at the time of assessment. The system appears to meet the basic configuration requirements for processing ${mainFormData.securityLevel || 'PROTECTED'} information.`;
            automationLevel = 'full';
            confidence = 0.9;
          } else {
            finding = 'Information System requires configuration before inspection';
            recommendation = 'Complete system configuration and security hardening before proceeding with inspection';
            finalReportContent = `The IS unit was not fully configured at the time of assessment. Additional configuration work is required before the system can be approved for processing ${mainFormData.securityLevel || 'PROTECTED'} information.`;
            automationLevel = 'full';
            confidence = 0.9;
          }
        }
        break;

      case 'os_documentation':
        if (id === 'os_version' && value) {
          finding = `Operating System identified: ${value}`;
          finalReportContent = `The OS for the laptop is ${value}. Updates and patches will be applied as per the organization's maintenance schedule.`;
          automationLevel = 'full';
          confidence = 0.95;
        }
        break;

      case 'antivirus_documentation':
        if (id === 'antivirus_details' && value) {
          finding = 'Antivirus solution documented';
          finalReportContent = `The antivirus solution for the company is ${value}. Antivirus is updated prior to the start of the contract, with regular updates scheduled throughout the contract period.`;
          automationLevel = 'full';
          confidence = 0.9;
        }
        break;

      case 'personnel_clearance_check':
        if (id === 'personnel_cleared') {
          if (value === 'yes') {
            finding = 'All personnel have appropriate security clearances';
            finalReportContent = `All personnel identified in the Personnel Security section have been cross-checked in DISIS and were found to be cleared at the ${mainFormData.securityLevel || 'PROTECTED'} level required for this contract. The CSO confirmed that there is a documented Security Awareness program for all personnel involved with this contract.`;
            automationLevel = 'full';
            confidence = 0.95;
          } else {
            finding = 'Personnel security clearance issues identified';
            recommendation = 'Ensure all personnel obtain appropriate security clearances before contract commencement';
            finalReportContent = `Personnel security clearance verification revealed issues that must be addressed before contract commencement. All personnel must be cleared to the ${mainFormData.securityLevel || 'PROTECTED'} level.`;
            automationLevel = 'full';
            confidence = 0.9;
          }
        }
        break;

      case 'tra_analysis':
        if (id === 'tra_exists') {
          if (value === 'yes') {
            finding = 'Threat Risk Assessment is in place';
            finalReportContent = `The supplier provided a copy of the TRA, which includes a section covering emanations (emissions). ${notes || 'The TRA meets the requirements for this security level.'}`;
            automationLevel = 'partial';
            confidence = 0.8;
          } else {
            finding = 'No Threat Risk Assessment provided';
            finalReportContent = `The supplier did not provide a copy of the TRA. This is not a requirement at the PROTECTED A or B levels, but may be required for higher classification levels.`;
            automationLevel = 'full';
            confidence = 0.95;
          }
        }
        break;

      case 'location_assessment':
        if (id === 'alternate_site') {
          if (value === 'yes') {
            finding = 'Alternate processing sites identified';
            recommendation = 'Ensure all alternate sites are properly secured and included in security documentation';
            finalReportContent = `The organization has identified alternate company sites and/or third-party suppliers/subcontractors for processing protected information. These locations must be properly secured and documented.`;
            automationLevel = 'partial';
            confidence = 0.7;
          } else {
            finding = 'All processing conducted at primary site';
            finalReportContent = `All processing, production, and storage of protected information will be conducted at the primary designated secure site within the organization's DSC.`;
            automationLevel = 'full';
            confidence = 0.9;
          }
        }
        break;

      case 'cloud_computing_assessment':
        if (id === 'cloud_computing') {
          if (value === 'yes') {
            finding = 'Cloud computing services utilized';
            recommendation = 'Ensure cloud services meet government security requirements and are properly configured';
            finalReportContent = `The organization utilizes cloud computing services (Infrastructure as a Service, Platform as a Service, and/or Software as a Service) for processing, producing, and/or storing protected information. These services must comply with government security requirements.`;
            automationLevel = 'partial';
            confidence = 0.7;
          } else {
            finding = 'No cloud computing services used';
            finalReportContent = `The organization does not utilize cloud computing services for this contract, maintaining all processing, production, and storage of protected information within their controlled environment.`;
            automationLevel = 'full';
            confidence = 0.95;
          }
        }
        break;

      default:
        // Generic analysis for unmapped questions
        finding = `Response recorded: ${value}`;
        finalReportContent = `${questionText}: ${value}${notes ? ` (Notes: ${notes})` : ''}`;
        automationLevel = 'manual';
        confidence = 0.5;
    }

    return {
      questionId: id,
      finding,
      recommendation,
      finalReportContent,
      automationLevel,
      confidence
    };
  }

  generateFinalReportUpdates(analyses: ChecklistAnalysis[]): any {
    const updates: any = {};

    // Group analyses by Final Report section
    const sectionUpdates: Record<string, string[]> = {};

    analyses.forEach(analysis => {
      if (analysis.finalReportContent) {
        // Map to Final Report sections based on question mappings
        // This would need to be expanded based on the actual Final Report structure
        const section = this.mapToFinalReportSection(analysis.questionId);
        if (!sectionUpdates[section]) {
          sectionUpdates[section] = [];
        }
        sectionUpdates[section].push(analysis.finalReportContent);
      }
    });

    // Convert to update format that Final Report can consume
    Object.entries(sectionUpdates).forEach(([section, contents]) => {
      updates[section] = contents.join('\n\n');
    });

    return updates;
  }

  private mapToFinalReportSection(questionId: string): string {
    // Map question IDs to Final Report sections
    const mappings: Record<string, string> = {
      'is_configured': 'itEquipmentInfo',
      'os_version': 'osInfo', 
      'antivirus_details': 'antivirusDetails',
      'personnel_cleared': 'personnelSecurity',
      'tra_exists': 'traComments',
      'alternate_site': 'systemLocation',
      'cloud_computing': 'itInfrastructure'
    };

    return mappings[questionId] || 'generalComments';
  }
}