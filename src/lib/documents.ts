import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, HeadingLevel, TabStopPosition, TabStopType
} from 'docx';
import { saveAs } from 'file-saver';
import type { ApprovalLetterData, MainFormData, CorrectiveMeasure } from '@/hooks/useInspectionState';

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
}

export async function generateApprovalLetter(data: ApprovalLetterData): Promise<void> {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({ children: [new TextRun({ text: 'APPROVAL LETTER', bold: true, size: 28 })], alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `Date: ${formatDate(data.date)}` })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `Inspector: ${data.inspectorInitials}` })] }),
        new Paragraph({ spacing: { after: 100 } }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `TO: ${data.csoFullName}`, bold: true })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `Company: ${data.companyName}` })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `Organization Number: ${data.orgNumber}` })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `Re: IT Written Approval - ${data.contracts}`, bold: true })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `Security Level: ${data.securityLevel}` })] }),
        new Paragraph({ spacing: { after: 100 } }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `${data.approve ? '☑' : '☐'} Approve` })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `${data.approves ? '☑' : '☐'} Approves` })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `${data.renewed ? '☑' : '☐'} Renewed` })] }),
        new Paragraph({ spacing: { after: 100 } }),
        ...(data.isBothSpecific
          ? [new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: 'This approval is both site-specific and contract-specific.', italics: true })] })]
          : []),
        ...(data.reaffirmsPrevious
          ? [new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: 'This reaffirms the previously issued IT Written Approval(s) for this site.', italics: true })] })]
          : []),
        ...(data.isCSC ? [
          new Paragraph({ spacing: { after: 100 } }),
          new Paragraph({ children: [new TextRun({ text: 'CSC Information', bold: true, size: 24 })], spacing: { after: 200 } }),
          new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `Computer Name: ${data.computerName || '[Not specified]'}` })] }),
          new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `Asset/Serial: ${data.assetSerial || '[Not specified]'}` })] }),
          new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `Operating System: ${data.operatingSystem || '[Not specified]'}` })] }),
          new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `Encryption Level: ${data.encryptionLevel || '[Not specified]'}` })] }),
          new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `BIOS Password Protected: ${data.biosPasswordProtected ? 'Yes' : 'No'}` })] }),
        ] : []),
        ...(data.ccs.length > 0 ? [
          new Paragraph({ spacing: { after: 100 } }),
          new Paragraph({ children: [new TextRun({ text: 'CC:', bold: true })], spacing: { after: 200 } }),
          ...data.ccs.filter(cc => cc.name).map(cc =>
            new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: `${cc.name} - ${cc.title}, ${cc.department} (${cc.email})` })] })
          ),
        ] : []),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Approval_Letter_${data.orgNumber || Date.now()}.docx`);
}

export async function generateFinalReport(
  mainForm: MainFormData,
  correctiveMeasures: CorrectiveMeasure[],
  reportData: Record<string, string>
): Promise<void> {
  const children: Paragraph[] = [
    new Paragraph({ children: [new TextRun({ text: 'FINAL REPORT', bold: true, size: 28 })], alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
    new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `Activity: ${mainForm.activityNumber}` })] }),
    new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `Company: ${mainForm.companyName}` })] }),
    new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `Organization: ${mainForm.orgSiteNumber}` })] }),
    new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `Inspection Class: ${mainForm.inspectionClass}` })] }),
    new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `Date: ${formatDate(reportData.inspectionDate)}` })] }),
    new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `Inspector: ${reportData.inspectorSignature || mainForm.csoFullName}` })] }),
  ];

  if (reportData.supplierPurpose) {
    children.push(new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `Supplier Purpose: ${reportData.supplierPurpose}` })] }));
  }

  if (correctiveMeasures.length > 0) {
    children.push(new Paragraph({ spacing: { after: 100 } }));
    children.push(new Paragraph({ children: [new TextRun({ text: 'CORRECTIVE MEASURES', bold: true, size: 24 })], spacing: { after: 200 } }));
    for (const m of correctiveMeasures) {
      const status = m.completed ? '[COMPLETED]' : '[PENDING]';
      children.push(new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: `${m.index}. ${status} ${m.text}` })] }));
    }
  }

  for (const [key, label] of Object.entries({
    itMediaInfo: 'IT Media Information', osInfo: 'Operating System',
    updateSchedule: 'Update Schedule', antivirusDetails: 'Antivirus Details',
    itEquipmentList: 'IT Equipment List', encryptionDetails: 'Encryption Details',
    backupPlan: 'Backup Plan',
  })) {
    if (reportData[key]) {
      children.push(new Paragraph({ spacing: { after: 100 } }));
      children.push(new Paragraph({ children: [new TextRun({ text: `${label}:`, bold: true })] }));
      children.push(new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: reportData[key] })] }));
    }
  }

  children.push(new Paragraph({ spacing: { before: 400 }, children: [new TextRun({ text: `Report Date: ${formatDate(reportData.reportDate)}` })] }));

  if (reportData.traComments) {
    children.push(new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `TRA Comments: ${reportData.traComments}` })] }));
  }

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Final_Report_${mainForm.activityNumber || Date.now()}.docx`);
}

export async function generateMemorandum(mainForm: MainFormData, memoData: Record<string, string>): Promise<void> {
  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ children: [new TextRun({ text: 'MEMORANDUM', bold: true, size: 28 })], alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `Date: ${formatDate(memoData.date)}` })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `To: CSO - ${memoData.csoName}` })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `Organization: ${memoData.orgName}` })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `Address: ${memoData.orgAddress}` })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `Activity Number: ${memoData.activityNumber}` })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `Contract Number: ${memoData.contractNumber}` })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `Level: ${memoData.contractLevel}` })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `Activity Type: ${memoData.activityType}` })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `DISIS #: ${memoData.disisNumber}` })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `Email: ${memoData.emailAddress}` })] }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Memorandum_${memoData.activityNumber || Date.now()}.docx`);
}
