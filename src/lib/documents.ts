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

function headerCell(text: string, width: number): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 20 })], spacing: { after: 0 } })],
    shading: { type: 'clear', fill: 'F2F2F2' },
    borders: { top: { style: BorderStyle.SINGLE, size: 1 }, bottom: { style: BorderStyle.SINGLE, size: 1 }, left: { style: BorderStyle.SINGLE, size: 1 }, right: { style: BorderStyle.SINGLE, size: 1 } }
  });
}

function fieldCell(text: string): TableCell {
  return new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text: text || '________________________', size: 20 })], spacing: { after: 0 } })],
    borders: { top: { style: BorderStyle.SINGLE, size: 1 }, bottom: { style: BorderStyle.SINGLE, size: 1 }, left: { style: BorderStyle.SINGLE, size: 1 }, right: { style: BorderStyle.SINGLE, size: 1 } }
  });
}

function labelCell(text: string, width: number): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 20 })], spacing: { after: 0 } })],
    borders: { top: { style: BorderStyle.SINGLE, size: 1 }, bottom: { style: BorderStyle.SINGLE, size: 1 }, left: { style: BorderStyle.SINGLE, size: 1 }, right: { style: BorderStyle.SINGLE, size: 1 } }
  });
}

function dataCell(text: string): TableCell {
  return new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text: text || '', size: 20 })], spacing: { after: 0 } })],
    borders: { top: { style: BorderStyle.SINGLE, size: 1 }, bottom: { style: BorderStyle.SINGLE, size: 1 }, left: { style: BorderStyle.SINGLE, size: 1 }, right: { style: BorderStyle.SINGLE, size: 1 } }
  });
}

/**
 * Generate an Approval Letter .docx using the official government template.
 * Falls back to programmatic generation if the template is unavailable.
 */
export async function generateApprovalLetter(data: ApprovalLetterData): Promise<void> {
  try {
    const { generateApprovalLetter: templateGen } = await import('./templateMailMerge');
    // We need mainForm data, which is partially derived from approvalLetter data
    const { useInspectionState } = await import('@/hooks/useInspectionState');
    // Since we can't call a hook outside a component, build the mainForm mock directly
    const mainForm: MainFormData = {
      companyName: data.companyName,
      csoFullName: data.csoFullName,
      csoEmail: data.csoEmail,
      orgSiteNumber: data.orgNumber,
      securityLevel: data.securityLevel,
      date: data.date,
      activityNumber: '',
      address: '',
      clientDepartment: '',
      contractType: data.contracts?.split(':')[0]?.trim() || '',
      contractNumber: data.contracts?.split(':')[1]?.trim() || '',
      inspectionType: '',
      inspectionClass: '',
      numberOfACSOs: 0,
      acsos: [],
    };
    return templateGen(mainForm, data);
  } catch (err) {
    console.warn('[documents] Template unavailable, using programmatic generation:', err);
    // fall through to programmatic
  }

  const checkboxes = new Table({
    rows: [
      new TableRow({ children: [
        labelCell('Approve', 33),
        labelCell('Approves', 33),
        labelCell('Renewed', 33),
      ]}),
      new TableRow({ children: [
        dataCell(data.approve ? '☑ Yes' : '☐ No'),
        dataCell(data.approves ? '☑ Yes' : '☐ No'),
        dataCell(data.renewed ? '☑ Yes' : '☐ No'),
      ]}),
    ]
  });

  const infoTable = new Table({
    rows: [
      new TableRow({ children: [labelCell('Date:', 30), dataCell(formatDate(data.date)), labelCell('Inspector:', 20), dataCell(data.inspectorInitials)] }),
      new TableRow({ children: [labelCell('CSO Name:', 30), dataCell(data.csoFullName), labelCell('Company:', 20), dataCell(data.companyName)] }),
      new TableRow({ children: [labelCell('Org Number:', 30), dataCell(data.orgNumber), labelCell('Security Level:', 20), dataCell(data.securityLevel)] }),
      new TableRow({ children: [labelCell('Re:', 30), dataCell(`IT Written Approval - ${data.contracts}`), labelCell('', 20), dataCell('')] }),
    ]
  });

  const children: (Paragraph | Table)[] = [
    new Paragraph({ children: [new TextRun({ text: 'GOVERNMENT OF CANADA', bold: true, size: 24, font: 'Calibri' })], alignment: AlignmentType.CENTER, spacing: { after: 0 } }),
    new Paragraph({ children: [new TextRun({ text: 'IT WRITTEN APPROVAL', bold: true, size: 28, font: 'Calibri' })], alignment: AlignmentType.CENTER, spacing: { after: 200 } }),
    new Paragraph({ children: [new TextRun({ text: 'Approval Letter', size: 22, font: 'Calibri', color: '555555' })], alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
    infoTable,
    new Paragraph({ spacing: { after: 200 } }),
    new Paragraph({ children: [new TextRun({ text: 'APPROVAL DECISION', bold: true, size: 22, font: 'Calibri' })], spacing: { after: 100 } }),
    checkboxes,
  ];

  if (data.isBothSpecific) {
    children.push(new Paragraph({ spacing: { after: 100, before: 200 } }));
    children.push(new Paragraph({ children: [new TextRun({ text: '☑ This approval is both site-specific and contract-specific.', size: 20, font: 'Calibri', italics: true })] }));
  }

  if (data.reaffirmsPrevious) {
    children.push(new Paragraph({ spacing: { after: 100 } }));
    children.push(new Paragraph({ children: [new TextRun({ text: '☑ This reaffirms the previously issued IT Written Approval(s) for this site.', size: 20, font: 'Calibri', italics: true })] }));
  }

  if (data.isCSC) {
    const cscTable = new Table({
      rows: [
        new TableRow({ children: [headerCell('CSC Information', 100)] }),
        new TableRow({ children: [labelCell('Computer Name:', 30), dataCell(data.computerName || 'Not specified'), labelCell('Asset/Serial:', 20), dataCell(data.assetSerial || 'Not specified')] }),
        new TableRow({ children: [labelCell('Operating System:', 30), dataCell(data.operatingSystem || 'Not specified'), labelCell('BIOS Password:', 20), dataCell(data.biosPasswordProtected ? 'Protected' : 'Not protected')] }),
        new TableRow({ children: [labelCell('Encryption Level:', 30), dataCell(data.encryptionLevel || 'Not specified'), dataCell(''), dataCell('')] }),
      ]
    });
    children.push(new Paragraph({ spacing: { after: 100, before: 200 } }));
    children.push(cscTable);
  }

  if (data.ccs.filter(c => c.name).length > 0) {
    const ccRows = data.ccs.filter(c => c.name).map(cc =>
      new TableRow({ children: [labelCell('CC:', 15), dataCell(`${cc.name} - ${cc.title}, ${cc.department}`), labelCell('Email:', 10), dataCell(cc.email)] })
    );
    children.push(new Paragraph({ spacing: { after: 100, before: 200 } }));
    children.push(new Table({ rows: [new TableRow({ children: [headerCell('Distribution List', 100)] }), ...ccRows] }));
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      children,
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
  try {
    const { generateFinalReport: templateGen } = await import('./templateMailMerge');
    return templateGen(mainForm, reportData);
  } catch (err) {
    console.warn('[documents] Template unavailable, using programmatic generation:', err);
  }

  const children: (Paragraph | Table)[] = [
    new Paragraph({ children: [new TextRun({ text: 'GOVERNMENT OF CANADA', bold: true, size: 24, font: 'Calibri' })], alignment: AlignmentType.CENTER, spacing: { after: 0 } }),
    new Paragraph({ children: [new TextRun({ text: 'FINAL REPORT', bold: true, size: 28, font: 'Calibri' })], alignment: AlignmentType.CENTER, spacing: { after: 200 } }),
    new Paragraph({ children: [new TextRun({ text: 'Security Inspection Report', size: 22, font: 'Calibri', color: '555555' })], alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
  ];

  const infoRows = [
    new TableRow({ children: [headerCell('Field', 30), headerCell('Value', 70)] }),
    new TableRow({ children: [labelCell('Activity Number:', 30), dataCell(mainForm.activityNumber)] }),
    new TableRow({ children: [labelCell('Company:', 30), dataCell(mainForm.companyName)] }),
    new TableRow({ children: [labelCell('Org/Site:', 30), dataCell(mainForm.orgSiteNumber)] }),
    new TableRow({ children: [labelCell('Inspection Class:', 30), dataCell(mainForm.inspectionClass)] }),
    new TableRow({ children: [labelCell('Inspection Type:', 30), dataCell(mainForm.inspectionType)] }),
    new TableRow({ children: [labelCell('Security Level:', 30), dataCell(mainForm.securityLevel)] }),
    new TableRow({ children: [labelCell('Date:', 30), dataCell(formatDate(reportData.inspectionDate))] }),
    new TableRow({ children: [labelCell('Inspector:', 30), dataCell(reportData.inspectorSignature || mainForm.csoFullName)] }),
  ];

  if (reportData.supplierPurpose) {
    infoRows.push(new TableRow({ children: [labelCell('Supplier Purpose:', 30), dataCell(reportData.supplierPurpose)] }));
  }
  if (reportData.hasTRA) {
    infoRows.push(new TableRow({ children: [labelCell('TRA Completed:', 30), dataCell(reportData.hasTRA)] }));
  }

  children.push(new Table({ rows: infoRows }));

  if (reportData.traComments) {
    children.push(new Paragraph({ spacing: { after: 100, before: 200 } }));
    children.push(new Paragraph({ children: [new TextRun({ text: 'TRA Comments:', bold: true, size: 20 })] }));
    children.push(new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: reportData.traComments, size: 20 })] }));
  }

  if (correctiveMeasures.length > 0) {
    children.push(new Paragraph({ spacing: { after: 100, before: 300 } }));
    children.push(new Paragraph({ children: [new TextRun({ text: 'CORRECTIVE MEASURES', bold: true, size: 24, font: 'Calibri' })], spacing: { after: 100 } }));

    const cmRows = [
      new TableRow({ children: [headerCell('#', 8), headerCell('Section', 22), headerCell('Finding', 50), headerCell('Status', 20)] }),
      ...correctiveMeasures.map(m =>
        new TableRow({ children: [
          dataCell(String(m.index)),
          dataCell(m.section || 'GENERAL'),
          dataCell(m.text),
          dataCell(m.completed ? 'COMPLETED' : 'PENDING'),
        ]})
      ),
    ];
    children.push(new Table({ rows: cmRows }));
  }

  const sectionFields: [string, string][] = [
    ['itMediaInfo', 'IT Media Information'],
    ['osInfo', 'Operating System Details'],
    ['updateSchedule', 'Update/Patch Schedule'],
    ['antivirusDetails', 'Antivirus Details'],
    ['itEquipmentList', 'IT Equipment List'],
    ['encryptionDetails', 'Encryption Details'],
    ['backupPlan', 'Backup/Recovery Plan'],
  ];

  for (const [key, label] of sectionFields) {
    if (reportData[key]) {
      children.push(new Paragraph({ spacing: { after: 100, before: 200 } }));
      children.push(new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20 })] }));
      children.push(new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: reportData[key], size: 20 })] }));
    }
  }

  children.push(new Paragraph({ spacing: { before: 400 }, children: [new TextRun({ text: `Report Generated: ${formatDate(reportData.reportDate)}`, size: 18, color: '666666', italics: true })] }));

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Final_Report_${mainForm.activityNumber || Date.now()}.docx`);
}

export async function generateMemorandum(mainForm: MainFormData, memoData: Record<string, string>): Promise<void> {
  try {
    const { generateMemorandum: templateGen } = await import('./templateMailMerge');
    return templateGen(mainForm, memoData);
  } catch (err) {
    console.warn('[documents] Template unavailable, using programmatic generation:', err);
  }

  const infoTable = new Table({
    rows: [
      new TableRow({ children: [headerCell('Field', 35), headerCell('Details', 65)] }),
      new TableRow({ children: [labelCell('Date:', 35), dataCell(formatDate(memoData.date))] }),
      new TableRow({ children: [labelCell('To:', 35), dataCell(`CSO - ${memoData.csoName}`)] }),
      new TableRow({ children: [labelCell('Organization:', 35), dataCell(memoData.orgName)] }),
      new TableRow({ children: [labelCell('Address:', 35), dataCell(memoData.orgAddress)] }),
      new TableRow({ children: [labelCell('Activity Number:', 35), dataCell(memoData.activityNumber)] }),
      new TableRow({ children: [labelCell('Contract Number:', 35), dataCell(memoData.contractNumber)] }),
      new TableRow({ children: [labelCell('Level:', 35), dataCell(memoData.contractLevel)] }),
      new TableRow({ children: [labelCell('Activity Type:', 35), dataCell(memoData.activityType)] }),
      new TableRow({ children: [labelCell('DISIS #:', 35), dataCell(memoData.disisNumber)] }),
      new TableRow({ children: [labelCell('Email:', 35), dataCell(memoData.emailAddress)] }),
    ]
  });

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      children: [
        new Paragraph({ children: [new TextRun({ text: 'GOVERNMENT OF CANADA', bold: true, size: 24, font: 'Calibri' })], alignment: AlignmentType.CENTER, spacing: { after: 0 } }),
        new Paragraph({ children: [new TextRun({ text: 'MEMORANDUM', bold: true, size: 28, font: 'Calibri' })], alignment: AlignmentType.CENTER, spacing: { after: 200 } }),
        new Paragraph({ children: [new TextRun({ text: 'Security Inspection Memorandum', size: 22, font: 'Calibri', color: '555555' })], alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
        infoTable,
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Memorandum_${memoData.activityNumber || Date.now()}.docx`);
}
