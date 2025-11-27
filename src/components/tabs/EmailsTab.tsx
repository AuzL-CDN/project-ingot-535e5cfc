import {{ useMemo, useState }} from 'react';
import {{ Card, CardContent, CardDescription, CardHeader, CardTitle }} from '@/components/ui/card';
import {{ Label }} from '@/components/ui/label';
import {{ Input }} from '@/components/ui/input';
import {{ Textarea }} from '@/components/ui/textarea';
import {{ Button }} from '@/components/ui/button';
import {{ Mail, User, ListChecks }} from 'lucide-react';
import {{ MainFormData, InspectorProfile }} from '@/hooks/useInspectionState';

type EmailClassification = 'PROTECTED' | 'CLASSIFIED' | 'UNCLASSIFIED';

type EmailPurpose =
  | 'INITIAL_CHECKLIST'
  | 'ONSITE_INITIAL'
  | 'OFFSITE_INITIAL'
  | 'CORRECTIVE_MEASURES'
  | 'DECLARATION_OF_COMPLIANCE'
  | 'OTHER';

interface EmailTemplate {{
  id: string;
  name: string;
  classification: EmailClassification;
  purpose: EmailPurpose;
  defaultTo: string | null;
  defaultCc: string | null;
  subjectTemplate: string;
  bodyTemplate: string;
}}

interface EmailsTabProps {{
  mainForm: MainFormData;
  inspector: InspectorProfile;
}}

const builtInEmailTemplates: EmailTemplate[] = [
  {{
    id: 'initial_protected',
    name: 'Initial – Protected (Checklist + Questions)',
    classification: 'PROTECTED',
    purpose: 'INITIAL_CHECKLIST',
    defaultTo: '{{{{CSO_EMAIL}}}}',
    defaultCc: null,
    subjectTemplate:
      'IT Security Inspection - IT Security Checklist for {{{{ORG_NAME}}}}, {{{{ORG_NUMBER}}}}, {{{{CONTRACT_NUMBER}}}}',
    bodyTemplate: `PROTECTED

IMPORTANT: This email contains mandatory requirements and strict deadlines. Your thorough review and prompt action are essential.

Hello {{{{CSO_NAME}}}},

{{{{ORG_NAME}}}}, {{{{ORG_NUMBER}}}}, has been identified for an IT Security Inspection associated with {{{{CONTRACT_TYPE}}}}, {{{{CONTRACT_NUMBER}}}}.

The Security Requirement Checklist (SRCL) for this contract identifies an Information Technology (IT) requirement at the level of {{{{SEC_LEVEL}}}} (reference part C.11.d). As such, the Contract Security Program (CSP) has been mandated to conduct an IT Security Inspection that assesses your organization’s capability to process, produce, store, and back up Protected government information in support of the contract.

The role of the IT Security Inspector is to conduct the IT Security Inspection only, not to provide opinions/consultation/guidance which may be perceived as being in conflict with private organizations involved with a similar line of work.

The goal of the IT Security Inspection is to confirm your organization’s compliance with the IT Security requirements identified in guidelines, directives and other operational security standards, such as the Directive on Security Management (DSM), the Contract Security Manual (CSM), and any additional security requirements identified within the contract as an IT technical document (if applicable). As you indicated through the bidding process, it is expected that your company meets these requirements.

IMMEDIATE ACTION REQUIRED – Preliminary Questions

Response required by: {{{{DUE_DATE_QUESTIONS}}}} (recommended 5 business days)

The following questions must be answered before we can proceed with the inspection:

1. Will any IT equipment be provided by the Client Department to the supplier?
2. Does your organization use cloud computing (IaaS, PaaS, SaaS such as Office 365, email, antivirus) for the processing, producing and/or storing of the Protected information for this contract?
3. Are there additional IT security measures included in the contract’s Statement of Work (SOW)?
4. Will you be operating outside of an operations zone (e.g., work from home)?

Failure to provide responses will delay the process and could impact the start of work for the contract.

REQUIRED DOCUMENTATION

Submission deadline: {{{{DUE_DATE_DOCS}}}} (recommended 20 business days)

Please return the completed IT Security Checklist (attached) along with the following documentation via email:

• PROTECTED data flow diagram
• Company network topology diagram
• Organization’s PROTECTED IT Security Policy
• IT media control list
• Access control list
• Destruction log
• Identification of any other sites and/or locations where data for this contract is or will be processed, produced or stored (if applicable)
• Identification of third-party contractors or subcontractors associated with this contract

IMPORTANT NOTES

• The information system associated with this contract must be installed, configured and operational at the commencement of the IT Security Inspection.
• It is not permitted to use the IS to produce, process, store or back up Protected information for this contract before receiving the official IT Security Approval letter.
• All virtual inspection activities will be recorded within MS Teams for quality assurance, training and auditing purposes. These recordings will be maintained as part of our official inspection documentation.

NEXT STEPS

Once we have received your completed checklist with supporting documentation, a virtual IT Security Inspection via MS Teams will be scheduled and conducted to evaluate your organization’s security posture.

ALTERNATIVE

If you do not wish to proceed with the IT Security Inspection or it has been determined the IT Security Inspection is no longer required, the SRCL needs to be revised to indicate “NO” for part C.11.d. The revised SRCL must be submitted to TPSGC.SSILVERS-ISSSRCL.PWGSC@tpsgc-pwgsc.gc.ca with the undersigned in cc.

Should you have any questions or concerns, please feel free to contact the undersigned.

Regards,

{{{{INSPECTOR_SIGNATURE}}}}`,
  }},
  {{
    id: 'initial_classified',
    name: 'Initial – Classified (Checklist)',
    classification: 'CLASSIFIED',
    purpose: 'INITIAL_CHECKLIST',
    defaultTo: '{{{{CSO_EMAIL}}}}',
    defaultCc: null,
    subjectTemplate:
      'IT Security Inspection - IT Security Checklist for {{{{ORG_NAME}}}}, {{{{ORG_NUMBER}}}}, {{{{CONTRACT_NUMBER}}}}',
    bodyTemplate: `CLASSIFIED

IMPORTANT: This email contains mandatory requirements and strict deadlines. Your thorough review and prompt action are essential.

Hello {{{{CSO_NAME}}}},

{{{{ORG_NAME}}}}, {{{{ORG_NUMBER}}}}, has been identified for an IT Security Inspection associated with {{{{CONTRACT_TYPE}}}}, {{{{CONTRACT_NUMBER}}}}.

The Security Requirement Checklist (SRCL) for this contract identifies an Information Technology (IT) requirement at the level of {{{{SEC_LEVEL}}}} (reference part C.11.d). As such, the Contract Security Program (CSP) has been mandated to conduct an IT Security Inspection that assesses your organization’s capability to process, produce, store, and back up Classified government information in support of the contract.

The role of the IT Security Inspector is to conduct the IT Security Inspection only, not to provide opinions/consultation/guidance which may be perceived as being in conflict with private organizations involved with a similar line of work.

The goal of the IT Security Inspection is to confirm your organization’s compliance with the IT Security requirements identified in guidelines, directives and other operational security standards, such as the Directive on Security Management (DSM), the Contract Security Manual (CSM), and any additional security requirements identified within the contract as an IT technical document (if applicable). As you indicated through the bidding process, it is expected that your company meets these requirements.

REQUIRED DOCUMENTATION

Submission deadline: {{{{DUE_DATE_DOCS}}}} (recommended 20 business days)

Please return the completed IT Security Checklist (attached) along with ALL supporting documentation via email:

• CLASSIFIED data flow diagram
• Company network topology diagram
• Mandatory IT Threat and Risk Assessment (TRA), including a section on Emissions Security (EMSEC)
• Organization’s CLASSIFIED IT Security Policy
• IT media control list
• Access control list
• Destruction log
• Identification of any other sites and/or locations where data for this contract is or will be processed, produced or stored (if applicable)
• Identification of third-party contractors or subcontractors associated with this contract

IMPORTANT NOTES

• The information system associated with this contract must be installed, configured and operational at the commencement of the IT Security Inspection.
• It is not permitted to use the IS to produce, process, store or back up Classified information for this contract before receiving the official IT Security Approval letter.
• All virtual inspections will be recorded in MS Teams for quality assurance, training and auditing purposes. These recordings are maintained as part of our official inspection documentation.

NEXT STEPS

Once we have received your completed checklist with supporting documentation, a virtual IT Security Inspection via MS Teams will be scheduled and conducted to evaluate your organization’s security posture.

ALTERNATIVE

If you do not wish to proceed with the IT Security Inspection or it has been determined the IT Security Inspection is no longer required, the SRCL needs to be revised to indicate “NO” for part C.11.d. The revised SRCL must be submitted to TPSGC.SSILVERS-ISSSRCL.PWGSC@tpsgc-pwgsc.gc.ca with the undersigned in cc.

Should you have any questions or concerns, please feel free to contact the undersigned.

Regards,

{{{{INSPECTOR_SIGNATURE}}}}`,
  }},
  {{
    id: 'onsite_initial',
    name: 'Onsite – Initial Inspection',
    classification: 'PROTECTED',
    purpose: 'ONSITE_INITIAL',
    defaultTo: '{{{{CSO_EMAIL}}}}',
    defaultCc: null,
    subjectTemplate:
      'IT Security Inspection – Onsite visit for {{{{ORG_NAME}}}}, {{{{ORG_NUMBER}}}}, {{{{CONTRACT_NUMBER}}}}',
    bodyTemplate: `PROTECTED

Hello {{{{CSO_NAME}}}},

Further to the IT Security Inspection requirements associated with {{{{CONTRACT_TYPE}}}}, {{{{CONTRACT_NUMBER}}}}, this email is to schedule an onsite IT Security Inspection at your facility located at {{{{CIVIC_ADDRESS}}}}.

The objective of the onsite visit is to validate your organization’s IT security controls as they relate to the processing, production, storage and backup of Protected information for this contract. During the visit, we will review:

• Physical layout of the operations / security zone
• IT equipment and configurations used for this contract
• Backup and recovery arrangements
• Access controls and media handling practices

Please provide your availability for an onsite visit within the following window: {{{{ONSITE_WINDOW}}}}.

Should you have any questions or require clarification, please contact the undersigned.

Regards,

{{{{INSPECTOR_SIGNATURE}}}}`,
  }},
  {{
    id: 'offsite_initial',
    name: 'Offsite / Virtual – Initial Inspection',
    classification: 'PROTECTED',
    purpose: 'OFFSITE_INITIAL',
    defaultTo: '{{{{CSO_EMAIL}}}}',
    defaultCc: null,
    subjectTemplate:
      'IT Security Inspection – Virtual inspection for {{{{ORG_NAME}}}}, {{{{ORG_NUMBER}}}}, {{{{CONTRACT_NUMBER}}}}',
    bodyTemplate: `PROTECTED

Hello {{{{CSO_NAME}}}},

Further to the IT Security Inspection requirements associated with {{{{CONTRACT_TYPE}}}}, {{{{CONTRACT_NUMBER}}}}, this email is to schedule a virtual IT Security Inspection via MS Teams.

The objective of the virtual session is to review your organization’s IT security posture in support of this contract, including:

• Logical and physical network topology
• Systems used to process, produce, store and back up Protected information
• Remote access arrangements (if applicable)
• Backup and recovery solutions

Please provide your availability for a virtual inspection within the following window: {{{{VIRTUAL_WINDOW}}}}.

Meeting connection details and agenda will be provided once a date and time have been confirmed.

Should you have any questions or require clarification, please contact the undersigned.

Regards,

{{{{INSPECTOR_SIGNATURE}}}}`,
  }},
  {{
    id: 'corrective_measures_notice',
    name: 'Corrective Measures – Notification',
    classification: 'PROTECTED',
    purpose: 'CORRECTIVE_MEASURES',
    defaultTo: '{{{{CSO_EMAIL}}}}',
    defaultCc: null,
    subjectTemplate:
      'Corrective Measures – IT Security Inspection – {{{{ORG_NAME}}}}, {{{{ORG_NUMBER}}}}, {{{{CONTRACT_TYPE}}}} {{{{CONTRACT_NUMBER}}}}',
    bodyTemplate: `PROTECTED

Hello {{{{CSO_NAME}}}},

Following the IT Security Inspection conducted for {{{{ORG_NAME}}}} ({{{{ORG_NUMBER}}}}) in relation to {{{{CONTRACT_TYPE}}}}, {{{{CONTRACT_NUMBER}}}}, several corrective measures are required before an IT Security Approval letter can be issued.

The attached letter titled "Corrective Measures – IT Security Inspection" provides the detailed list of outstanding items and the actions required to bring your organization into compliance with the Contract Security Program (CSP) IT security requirements.

All corrective measures must be addressed and all requested documentation received by {{{{CORRECTIVE_DEADLINE}}}}. If you anticipate difficulty in meeting this date, please advise the undersigned as soon as possible so that next steps can be discussed with the Client Department.

Should you have any questions or require clarification on any of the corrective measures, please contact the undersigned.

Regards,

{{{{INSPECTOR_SIGNATURE}}}}`,
  }},
  {{
    id: 'declaration_of_compliance',
    name: 'IT Security – Declaration of Compliance',
    classification: 'PROTECTED',
    purpose: 'DECLARATION_OF_COMPLIANCE',
    defaultTo: '{{{{CSO_EMAIL}}}}',
    defaultCc: null,
    subjectTemplate:
      'IT Security – Declaration of Compliance – {{{{ORG_NAME}}}}, {{{{ORG_NUMBER}}}}, {{{{CONTRACT_NUMBER}}}}',
    bodyTemplate: `PROTECTED

Hello {{{{CSO_NAME}}}},

Please find attached the "IT Security – Declaration of Compliance" form related to {{{{CONTRACT_TYPE}}}}, {{{{CONTRACT_NUMBER}}}} for {{{{ORG_NAME}}}} ({{{{ORG_NUMBER}}}}).

By signing and returning this form, you are confirming that all IT Security requirements identified for this contract are implemented and maintained in accordance with the Contract Security Manual (CSM), the Directive on Security Management (DSM), and any additional security clauses identified in the contract.

Kindly review, sign and return the completed Declaration of Compliance to the undersigned by {{{{DOC_DEADLINE}}}}.

Should you have any questions or concerns, please contact the undersigned.

Regards,

{{{{INSPECTOR_SIGNATURE}}}}`,
  }},
];

interface GlobalEmailTemplateForm {{
  name: string;
  classification: EmailClassification;
  purpose: EmailPurpose;
  subjectTemplate: string;
  bodyTemplate: string;
}}

const initialGlobalTemplateForm: GlobalEmailTemplateForm = {{
  name: '',
  classification: 'PROTECTED',
  purpose: 'OTHER',
  subjectTemplate: '',
  bodyTemplate: '',
}};

const renderTemplate = (template: string, ctx: Record<string, string>): string => {
  return template.replace(/\{{(\w+)\}}/g, (_match, key) => ctx[key] ?? '');
};

export const EmailsTab = ({ mainForm, inspector }: EmailsTabProps) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [globalTemplates, setGlobalTemplates] = useState<EmailTemplate[]>(() => {
    try {
      const raw = localStorage.getItem('ingotGlobalEmailTemplates');
      return raw ? (JSON.parse(raw) as EmailTemplate[]) : [];
    } catch {
      return [];
    }
  });
  const [newTemplate, setNewTemplate] = useState<GlobalEmailTemplateForm>(initialGlobalTemplateForm);
  const [dueDateQuestions, setDueDateQuestions] = useState('');
  const [dueDateDocs, setDueDateDocs] = useState('');
  const [correctiveDeadline, setCorrectiveDeadline] = useState('');
  const [onsiteWindow, setOnsiteWindow] = useState('');
  const [virtualWindow, setVirtualWindow] = useState('');
  const [docDeadline, setDocDeadline] = useState('');

  const allTemplates = useMemo(
    () => [...builtInEmailTemplates, ...globalTemplates],
    [globalTemplates],
  );

  const selectedTemplate = allTemplates.find(t => t.id === selectedTemplateId) ?? null;

  const emailContext = useMemo(
    () => ({
      ORG_NAME: mainForm.companyName || '',
      ORG_NUMBER: mainForm.orgSiteNumber || '',
      CONTRACT_NUMBER: mainForm.contractNumber || '',
      CONTRACT_TYPE: mainForm.contractType || '',
      SEC_LEVEL: mainForm.securityLevel || '',
      CLIENT_DEPARTMENT: mainForm.clientDepartment || '',
      CSO_NAME: mainForm.csoFullName || '',
      CSO_EMAIL: mainForm.csoEmail || '',
      DUE_DATE_QUESTIONS: dueDateQuestions || '',
      DUE_DATE_DOCS: dueDateDocs || '',
      CORRECTIVE_DEADLINE: correctiveDeadline || '',
      ONSITE_WINDOW: onsiteWindow || '',
      VIRTUAL_WINDOW: virtualWindow || '',
      DOC_DEADLINE: docDeadline || '',
      CIVIC_ADDRESS: mainForm.address || '',
      INSPECTOR_SIGNATURE: inspector?.name
        ? `${inspector.name}\nIT Security Inspector`
        : 'IT Security Inspector',
    }),
    [
      mainForm,
      inspector,
      dueDateQuestions,
      dueDateDocs,
      correctiveDeadline,
      onsiteWindow,
      virtualWindow,
      docDeadline,
    ],
  );

  const renderedSubject = selectedTemplate
    ? renderTemplate(selectedTemplate.subjectTemplate, emailContext)
    : '';

  const renderedBody = selectedTemplate
    ? renderTemplate(selectedTemplate.bodyTemplate, emailContext)
    : '';

  const renderedTo = selectedTemplate
    ? renderTemplate(selectedTemplate.defaultTo || '', emailContext)
    : '';

  const renderedCc = selectedTemplate
    ? renderTemplate(selectedTemplate.defaultCc || '', emailContext)
    : '';

  const handleSaveGlobalTemplate = () => {
    if (!newTemplate.name.trim() || !newTemplate.subjectTemplate.trim()) {
      return;
    }

    const id = `global_${Date.now()}`;
    const template: EmailTemplate = {
      id,
      name: newTemplate.name.trim(),
      classification: newTemplate.classification,
      purpose: newTemplate.purpose,
      defaultTo: '{{CSO_EMAIL}}',
      defaultCc: null,
      subjectTemplate: newTemplate.subjectTemplate,
      bodyTemplate: newTemplate.bodyTemplate,
    };

    const updated = [...globalTemplates, template];
    setGlobalTemplates(updated);
    try {
      localStorage.setItem('ingotGlobalEmailTemplates', JSON.stringify(updated));
    } catch {
      // ignore
    }
    setNewTemplate(initialGlobalTemplateForm);
  };

  const handleDeleteGlobalTemplate = (id: string) => {
    const updated = globalTemplates.filter(t => t.id !== id);
    setGlobalTemplates(updated);
    try {
      localStorage.setItem('ingotGlobalEmailTemplates', JSON.stringify(updated));
    } catch {
      // ignore
    }
    if (selectedTemplateId === id) {
      setSelectedTemplateId(null);
    }
  };

  const handleOpenInOutlook = () => {
    if (!selectedTemplate) return;

    const to = renderedTo;
    const cc = renderedCc;
    const subject = renderedSubject;
    const body = renderedBody;

    const params = new URLSearchParams();
    if (subject) params.set('subject', subject);
    if (body) params.set('body', body);
    if (cc) params.set('cc', cc);

    const mailto = `mailto:${encodeURIComponent(to || '')}?${params.toString()}`;
    window.location.href = mailto;
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-primary" />
            <span>E-Mail Templates & Contacts</span>
          </CardTitle>
          <CardDescription>
            Templates are prefilled from the inspection data. Select a template, review the preview,
            then open in Outlook to send.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Contacts / CSO / ACSOs */}
            <div className="space-y-4 lg:col-span-1">
              <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Key Contacts</span>
              </h3>

              <div className="space-y-2">
                <Label>CSO Full Name</Label>
                <Input value={mainForm.csoFullName || 'Not set'} className="bg-muted" readOnly />
              </div>

              <div className="space-y-2">
                <Label>CSO Email Address</Label>
                <Input value={mainForm.csoEmail || 'Not set'} className="bg-muted" readOnly />
              </div>

              <div className="space-y-2">
                <Label>Number of ACSOs</Label>
                <Input
                  value={mainForm.numberOfACSOs.toString()}
                  className="bg-muted"
                  readOnly
                />
              </div>

              {mainForm.numberOfACSOs > 0 && (
                <div className="space-y-4 max-h-64 overflow-auto pr-1">
                  {mainForm.acsos.map((acso, index) => (
                    <div
                      key={index}
                      className="space-y-2 p-3 border rounded-lg bg-muted/30 text-sm"
                    >
                      <div className="font-medium text-foreground">ACSO #{index + 1}</div>
                      <div>
                        <Label className="text-xs">Full Name</Label>
                        <Input
                          value={acso.fullName || 'Not set'}
                          className="bg-muted h-8 text-xs"
                          readOnly
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Email Address</Label>
                        <Input
                          value={acso.email || 'Not set'}
                          className="bg-muted h-8 text-xs"
                          readOnly
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {mainForm.numberOfACSOs === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Mail className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>No ACSOs configured</p>
                  <p>Add ACSOs in the Main tab to see them here.</p>
                </div>
              )}
            </div>

            {/* Middle: Template Library */}
            <div className="space-y-3 lg:col-span-1 border rounded-lg p-3 bg-muted/40">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold flex items-center space-x-2">
                  <ListChecks className="h-4 w-4" />
                  <span>Template Library</span>
                </h3>
              </div>
              <div className="border rounded-md max-h-80 overflow-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/80 sticky top-0 z-10">
                    <tr>
                      <th className="text-left px-2 py-1 w-24">Type</th>
                      <th className="text-left px-2 py-1">Template</th>
                      <th className="text-right px-2 py-1 w-20">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allTemplates.map((tpl) => (
                      <tr
                        key={tpl.id}
                        className={
                          selectedTemplateId === tpl.id
                            ? 'bg-primary/10'
                            : 'hover:bg-muted/60 cursor-pointer'
                        }
                        onClick={() => setSelectedTemplateId(tpl.id)}
                      >
                        <td className="align-top px-2 py-1">
                          <div className="inline-flex px-1.5 py-0.5 rounded-full text-[10px] border bg-background">
                            {tpl.classification}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            {tpl.purpose.replace(/_/g, ' ')}
                          </div>
                        </td>
                        <td className="align-top px-2 py-1">
                          <div className="font-medium">{tpl.name}</div>
                          <div className="text-[11px] text-muted-foreground line-clamp-2">
                            {tpl.subjectTemplate}
                          </div>
                        </td>
                        <td className="align-top px-2 py-1 text-right">
                          <Button
                            size="xs"
                            variant={selectedTemplateId === tpl.id ? 'secondary' : 'outline'}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTemplateId(tpl.id);
                            }}
                          >
                            Use
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {globalTemplates.length > 0 && (
                <div className="pt-2 border-t mt-2">
                  <h4 className="text-xs font-semibold mb-1">Custom templates</h4>
                  <div className="space-y-1 text-[11px] text-muted-foreground">
                    {globalTemplates.map((tpl) => (
                      <div key={tpl.id} className="flex items-center justify-between">
                        <span>{tpl.name}</span>
                        <Button
                          size="xs"
                          variant="ghost"
                          className="h-6 px-1 text-[10px] text-destructive"
                          onClick={() => handleDeleteGlobalTemplate(tpl.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Preview + dial-in values */}
            <div className="space-y-3 lg:col-span-1">
              <Card className="border-none shadow-none bg-transparent">
                <CardContent className="space-y-3 px-0">
                  <div className="space-y-2">
                    <Label>Template-specific dates / windows</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Questions due date</Label>
                        <Input
                          type="date"
                          value={dueDateQuestions}
                          onChange={(e) => setDueDateQuestions(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Documents due date</Label>
                        <Input
                          type="date"
                          value={dueDateDocs}
                          onChange={(e) => setDueDateDocs(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Corrective measures deadline</Label>
                        <Input
                          type="date"
                          value={correctiveDeadline}
                          onChange={(e) => setCorrectiveDeadline(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Declaration of Compliance deadline</Label>
                        <Input
                          type="date"
                          value={docDeadline}
                          onChange={(e) => setDocDeadline(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Onsite window (free text)</Label>
                        <Input
                          value={onsiteWindow}
                          onChange={(e) => setOnsiteWindow(e.target.value)}
                          placeholder="e.g. Next 3 weeks, weekday mornings"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Virtual window (free text)</Label>
                        <Input
                          value={virtualWindow}
                          onChange={(e) => setVirtualWindow(e.target.value)}
                          placeholder="e.g. Week of 2025-02-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Preview – subject</Label>
                    <Input
                      value={renderedSubject || ''}
                      readOnly
                      className="bg-muted text-xs"
                      placeholder="Select a template to see the subject."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Preview – body</Label>
                    <Textarea
                      value={renderedBody || ''}
                      readOnly
                      className="bg-muted h-56 text-xs whitespace-pre-wrap"
                      placeholder="Select a template to see the email body."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>To / Cc</Label>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div>
                        <span className="font-semibold">To: </span>
                        <span>{renderedTo || 'Select a template'}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Cc: </span>
                        <span>{renderedCc || 'None'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t mt-3">
                    <Button
                      disabled={!selectedTemplate}
                      onClick={handleOpenInOutlook}
                    >
                      Open in Outlook
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Global template editor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Add Global E-mail Template</CardTitle>
          <CardDescription>
            Define additional templates once and reuse them for all inspections on this workstation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Template name</Label>
              <Input
                value={newTemplate.name}
                onChange={(e) =>
                  setNewTemplate((prev) => ({{ ...prev, name: e.target.value }}))
                }
                placeholder="e.g. Follow-up reminder"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Classification</Label>
              <select
                className="w-full border rounded-md h-9 bg-background text-xs px-2"
                value={newTemplate.classification}
                onChange={(e) =>
                  setNewTemplate((prev) => ({{ ...prev, classification: e.target.value as EmailClassification }}))
                }
              >
                <option value="PROTECTED">PROTECTED</option>
                <option value="CLASSIFIED">CLASSIFIED</option>
                <option value="UNCLASSIFIED">UNCLASSIFIED</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Purpose</Label>
              <select
                className="w-full border rounded-md h-9 bg-background text-xs px-2"
                value={newTemplate.purpose}
                onChange={(e) =>
                  setNewTemplate((prev) => ({{ ...prev, purpose: e.target.value as EmailPurpose }}))
                }
              >
                <option value="INITIAL_CHECKLIST">Initial checklist</option>
                <option value="ONSITE_INITIAL">Onsite initial</option>
                <option value="OFFSITE_INITIAL">Offsite initial</option>
                <option value="CORRECTIVE_MEASURES">Corrective measures</option>
                <option value="DECLARATION_OF_COMPLIANCE">Declaration of compliance</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Subject template</Label>
            <Input
              value={newTemplate.subjectTemplate}
              onChange={(e) =>
                setNewTemplate((prev) => ({{ ...prev, subjectTemplate: e.target.value }}))
              }
              placeholder="Use placeholders like {{ORG_NAME}}, {{CONTRACT_NUMBER}}"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Body template</Label>
            <Textarea
              value={newTemplate.bodyTemplate}
              onChange={(e) =>
                setNewTemplate((prev) => ({{ ...prev, bodyTemplate: e.target.value }}))
              }
              className="h-40 text-xs"
              placeholder="Write the email body here. You can use placeholders like {{CSO_NAME}}, {{SEC_LEVEL}}, {{INSPECTOR_SIGNATURE}}."
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveGlobalTemplate}>
              Save global template
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
