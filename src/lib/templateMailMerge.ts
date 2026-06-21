import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { MainFormData, ApprovalLetterData } from '@/hooks/useInspectionState';

type FieldValue = string | boolean | undefined;

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
}

function buildFieldMap(
  templateType: 'approval' | 'csc_approval' | 'final_report' | 'memorandum',
  mainForm: MainFormData,
  approvalData: Partial<ApprovalLetterData>,
  extras: Record<string, FieldValue> = {}
): Record<string, FieldValue> {
  const now = new Date().toISOString().split('T')[0];
  return {
    // Common fields
    companyName: mainForm.companyName || '',
    orgNumber: mainForm.orgSiteNumber || '',
    orgSiteNumber: mainForm.orgSiteNumber || '',
    securityLevel: mainForm.securityLevel || '',
    contractNumber: mainForm.contractNumber || '',
    contractInfo: `${mainForm.contractType}: ${mainForm.contractNumber}`.trim(),
    csoFullName: mainForm.csoFullName || '',
    csoEmail: mainForm.csoEmail || '',
    email: mainForm.csoEmail || '',
    date: formatDate(approvalData.date || now),
    todayDate: formatDate(now),
    inspectorInitials: approvalData.inspectorInitials || 'ITSI',
    siteAddress: mainForm.address || '',
    declarationLetterDate: formatDate(now),

    // Approval-specific
    approve: approvalData.approve || false,
    approves: approvalData.approves || false,
    renewed: approvalData.renewed || false,
    isBothSpecific: approvalData.isBothSpecific || false,
    reaffirmsPrevious: approvalData.reaffirmsPrevious || false,
    approvalAction1: approvalData.approves ? 'approves' : approvalData.renewed ? 'renews' : 'approves',
    approvalAction2: approvalData.approved ? 'approved' : approvalData.renewed ? 'renewed' : 'approved',

    ...extras,
  };
}

function replaceInXml(xml: string, fields: Record<string, FieldValue>): string {
  let result = xml;

  // 1. Simple text replacements in <w:t> elements
  for (const [key, value] of Object.entries(fields)) {
    const strVal = String(value ?? '');
    // Replace complete <w:t>text</w:t> patterns
    result = result.replace(
      new RegExp(`<w:t[^>]*>${escapeXml(key)}</w:t>`, 'g'),
      (match) => match.replace(escapeXml(key), strVal)
    );
  }

  // 2. Handle colored bracket placeholders: [ text ] across multiple runs with highlight
  result = replaceColoredBrackets(result, 'security level', String(fields['securityLevel'] ?? ''));
  result = replaceColoredBrackets(result, 'site address', String(fields['siteAddress'] ?? ''));
  result = replaceColoredBrackets(result, 'declaration letter date', String(fields['declarationLetterDate'] ?? ''));
  result = replaceColoredBrackets(result, 'name of company', String(fields['companyName'] ?? ''));
  result = replaceColoredBrackets(result, 'name of company', String(fields['companyName'] ?? ''));
  result = replaceColoredBrackets(result, 'd', formatDate(new Date().toISOString().split('T')[0])); // single-letter colored placeholder
  result = replaceColoredBrackets(result, 'ate', '');
  result = replaceColoredBrackets(result, 'security l', '');
  result = replaceColoredBrackets(result, 'evel', '');
  result = replaceColoredBrackets(result, 'eclaration l', '');
  result = replaceColoredBrackets(result, 'etter ', '');
  result = replaceColoredBrackets(result, 'n', '');
  result = replaceColoredBrackets(result, 'ame of c', '');
  result = replaceColoredBrackets(result, 'ompany', '');

  // 3. Handle content controls (date picker, dropdowns)
  result = replaceContentControl(result, {
    placeholder: 'Click or tap to enter a date.',
    replacement: formatDate(String(fields['date'] ?? '')),
  });
  result = replaceContentControl(result, {
    placeholder: 'Choose an item.',
    replacement: String(fields['approvalAction1'] ?? 'approves'),
    dropdownOptions: ['Choose an item.', 'approves', 'renews'],
  });
  result = replaceContentControl(result, {
    placeholder: 'Choose an item.',
    replacement: String(fields['approvalAction2'] ?? 'approved'),
    dropdownOptions: ['Choose an item.', 'approved', 'renewed'],
  });
  result = replaceContentControl(result, {
    placeholder: 'Choose an item.',
    replacement: String(fields['isBothSpecific'] ? 'is both site-specific and contract-specific,' : 'Choose an item.'),
    dropdownOptions: ['Choose an item.', 'is both site-specific and contract-specific,', 'reaffirms the previously issued IT Written Approval(s) for this site,'],
  });

  return result;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function replaceColoredBrackets(xml: string, innerText: string, replacement: string): string {
  // Pattern: bracketed text split across runs with w:highlight or w:color formatting
  // [<runs with highlight/color><text></runs>]
  // We need to replace the structure: <w:r>...<w:t>[</w:t>... with <w:r>...<w:t>replacement</w:t>...
  
  // Find runs with colored formatting that contain our inner text
  const escapedInner = innerText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(
    `(<w:r>\\s*<w:rPr>[^<]*(?:<w:color[^>]*>|<w:highlight[^>]*>)[^<]*</w:rPr>\\s*<w:t[^>]*>)\\[</w:t>\\s*</w:r>` +
    `[\\s\\S]*?` +
    `<w:t[^>]*>${escapedInner}</w:t>` +
    `[\\s\\S]*?` +
    `(<w:r>\\s*<w:rPr>[^<]*(?:<w:color[^>]*>|<w:highlight[^>]*>)[^<]*</w:rPr>\\s*<w:t[^>]*>)\\](</w:t>\\s*</w:r>)`,
    'g'
  );
  
  if (replacement) {
    return xml.replace(pattern, (_match, openRun, closeRun, closeTag) => {
      return `<w:r><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/></w:rPr><w:t xml:space="preserve">${escapeXml(replacement)}</w:t></w:r>`;
    });
  }
  // If no replacement, remove the bracket structure entirely
  return xml.replace(pattern, '');
}

function replaceContentControl(
  xml: string,
  config: { placeholder: string; replacement: string; dropdownOptions?: string[] }
): string {
  const escapedPlaceholder = config.placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Find sdt blocks containing the placeholder text
  const sdtPattern = new RegExp(
    `(<w:sdt>)([\\s\\S]*?)(<w:t[^>]*>)${escapedPlaceholder}(</w:t>)([\\s\\S]*?)(</w:sdt>)`,
    'g'
  );

  return xml.replace(sdtPattern, (_match, sdtOpen, beforeText, tOpen, tClose, afterText, sdtClose) => {
    const newText = `${tOpen}${escapeXml(config.replacement)}${tClose}`;
    
    // For dropdowns, also update the selected listItem
    if (config.dropdownOptions && config.dropdownOptions.includes(config.replacement)) {
      // Find the listItem matching the selected value
      const listItemMatch = beforeText.match(
        new RegExp(`<w:listItem[^>]*w:displayText=["']${escapeXml(config.replacement)}["'][^>]*/>`)
      );
      if (listItemMatch) {
        return `${sdtOpen}${beforeText}${newText}${afterText}${sdtClose}`;
      }
    }
    
    return `${sdtOpen}${beforeText}${newText}${afterText}${sdtClose}`;
  });
}

async function loadTemplate(templateName: string): Promise<ArrayBuffer> {
  const response = await fetch(`/templates/${templateName}`);
  if (!response.ok) {
    throw new Error(`Failed to load template: ${templateName}`);
  }
  return response.arrayBuffer();
}

async function fillTemplate(
  templateName: string,
  fields: Record<string, FieldValue>
): Promise<Blob> {
  const templateData = await loadTemplate(templateName);
  const zip = await JSZip.loadAsync(templateData);

  // Process document.xml
  const docXml = await zip.file('word/document.xml')!.async('string');
  const processedXml = replaceInXml(docXml, fields);
  zip.file('word/document.xml', processedXml);

  const blob = await zip.generateAsync({ type: 'blob' });
  return blob;
}

export async function generateApprovalLetter(
  mainForm: MainFormData,
  approvalData: Partial<ApprovalLetterData>
): Promise<void> {
  const fields = buildFieldMap('approval', mainForm, approvalData);
  const templateName = approvalData.isCSC ? 'CSC_ApprovalLetter.docx' : 'ApprovalLetter.docx';
  
  try {
    const blob = await fillTemplate(templateName, fields);
    saveAs(blob, `Approval_Letter_${mainForm.orgSiteNumber || Date.now()}.docx`);
  } catch (err) {
    console.error('[templateMailMerge] ApprovalLetter failed, falling back to programmatic:', err);
    throw err;
  }
}

export async function generateFinalReport(
  mainForm: MainFormData,
  reportData: Record<string, FieldValue> = {}
): Promise<void> {
  const fields: Record<string, FieldValue> = {
    companyName: mainForm.companyName || '',
    orgNumber: mainForm.orgSiteNumber || '',
    orgSiteNumber: mainForm.orgSiteNumber || '',
    securityLevel: mainForm.securityLevel || '',
    contractNumber: mainForm.contractNumber || '',
    contractInfo: `${mainForm.contractType}: ${mainForm.contractNumber}`.trim(),
    csoFullName: mainForm.csoFullName || '',
    csoEmail: mainForm.csoEmail || '',
    email: mainForm.csoEmail || '',
    date: formatDate(mainForm.date || ''),
    todayDate: formatDate(new Date().toISOString().split('T')[0]),
    inspectorInitials: (reportData['inspectorInitials'] as string) || 'ITSI',
    siteAddress: mainForm.address || '',
    govDepartment: mainForm.clientDepartment || '',
    activityNumber: mainForm.activityNumber || '',
    awardDate: formatDate(mainForm.date || ''),
    expiryDate: formatDate(''),
  };

  try {
    const blob = await fillTemplate('FinalReport.docx', fields);
    saveAs(blob, `Final_Report_${mainForm.activityNumber || Date.now()}.docx`);
  } catch (err) {
    console.error('[templateMailMerge] FinalReport failed:', err);
    throw err;
  }
}

export async function generateMemorandum(
  mainForm: MainFormData,
  memoData: Record<string, FieldValue> = {}
): Promise<void> {
  const rawMemoData = memoData as Record<string, string>;
  const fields: Record<string, FieldValue> = {
    companyName: rawMemoData['orgName'] || mainForm.companyName || '',
    orgNumber: mainForm.orgSiteNumber || '',
    securityLevel: mainForm.securityLevel || '',
    contractNumber: rawMemoData['contractNumber'] || mainForm.contractNumber || '',
    csoFullName: rawMemoData['csoName'] || mainForm.csoFullName || '',
    csoEmail: rawMemoData['emailAddress'] || mainForm.csoEmail || '',
    email: rawMemoData['emailAddress'] || mainForm.csoEmail || '',
    date: formatDate(rawMemoData['date'] || mainForm.date || ''),
    todayDate: formatDate(new Date().toISOString().split('T')[0]),
    siteAddress: rawMemoData['orgAddress'] || mainForm.address || '',
    activityNumber: rawMemoData['activityNumber'] || mainForm.activityNumber || '',
    inspectorInitials: rawMemoData['inspectorInitials'] || 'ITSI',
    disisNumber: rawMemoData['disisNumber'] || '',
    activityType: rawMemoData['activityType'] || mainForm.inspectionType || '',
    requiredLevel: rawMemoData['contractLevel'] || mainForm.securityLevel || '',
  };

  try {
    const blob = await fillTemplate('Memorandum.docx', fields);
    saveAs(blob, `Memorandum_${mainForm.activityNumber || Date.now()}.docx`);
  } catch (err) {
    console.error('[templateMailMerge] Memorandum failed:', err);
    throw err;
  }
}
