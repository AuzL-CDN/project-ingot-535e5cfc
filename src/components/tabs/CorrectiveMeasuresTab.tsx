import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Save, Eye, FileText, Plus, Trash2 } from 'lucide-react';
import { CorrectiveMeasure } from '@/hooks/useInspectionState';
import { useToast } from '@/hooks/use-toast';

interface CorrectiveMeasuresTabProps {
  correctiveMeasures: CorrectiveMeasure[];
  setCorrectiveMeasures: (measures: CorrectiveMeasure[]) => void;
  saveActivity: () => any;
}

const CORRECTIVE_SECTIONS = [
  'INFORMATION SYSTEM / PHYSICAL LOCATION',
  'THREAT RISK ASSESSMENT (TRA)',
  'DATA TRANSFER',
  'IT MEDIA & MEDIA HANDLING',
  'PERSONNEL SECURITY',
  'IT PERSONNEL SECURITY',
  'IT EQUIPMENT / INFORMATION TECHNOLOGY SECURITY',
  'RECOVERY',
  'DISPOSAL'
];

export const CorrectiveMeasuresTab = ({ 
  correctiveMeasures, 
  setCorrectiveMeasures, 
  saveActivity 
}: CorrectiveMeasuresTabProps) => {
  const [measureCount, setMeasureCount] = useState(correctiveMeasures.length || 1);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const handleCountChange = (count: string) => {
    const numCount = parseInt(count) || 1;
    setMeasureCount(numCount);
    
    const newMeasures = Array.from({ length: numCount }, (_, i) => 
      correctiveMeasures[i] || { index: i + 1, text: '' }
    );
    
    setCorrectiveMeasures(newMeasures);
  };

  const updateMeasure = (index: number, updates: Partial<CorrectiveMeasure>) => {
    const updatedMeasures = correctiveMeasures.map((measure, i) => 
      i === index ? { ...measure, ...updates } : measure
    );
    setCorrectiveMeasures(updatedMeasures);
  };

  const addMeasure = () => {
    const newMeasures = [...correctiveMeasures, { index: correctiveMeasures.length + 1, text: '' }];
    setCorrectiveMeasures(newMeasures);
    setMeasureCount(newMeasures.length);
  };

  const removeMeasure = (index: number) => {
    const newMeasures = correctiveMeasures.filter((_, i) => i !== index);
    // Re-index the remaining measures
    const reindexedMeasures = newMeasures.map((measure, i) => ({ ...measure, index: i + 1 }));
    setCorrectiveMeasures(reindexedMeasures);
    setMeasureCount(reindexedMeasures.length);
  };

  const handleSave = () => {
    saveActivity();
    toast({
      title: "Corrective Measures Saved",
      description: "Your corrective measures have been saved successfully.",
    });
  };

  const handleSaveAndPreview = () => {
    handleSave();
    setShowPreview(true);
  };

  const generatePreview = () => {
    return `
CORRECTIVE MEASURES REPORT

The following corrective measures have been identified and must be implemented to address security deficiencies:

${correctiveMeasures.map(measure => 
  measure.text ? `${measure.index}. ${measure.text}` : `${measure.index}. [Measure not specified]`
).join('\n\n')}

IMPLEMENTATION REQUIREMENTS:
- All corrective measures must be implemented within the specified timeframe
- Evidence of implementation must be provided to the security inspector
- Follow-up inspections may be required to verify compliance

Total Measures: ${correctiveMeasures.length}
Date Generated: ${new Date().toLocaleDateString()}

This report is generated in accordance with the Government Security Policy and related security directives.
    `.trim();
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <span>Corrective Measures</span>
          </CardTitle>
          <CardDescription>
            Document corrective measures required for 1F and 1G inspection classes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="information" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="information">Information</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="information" className="space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Label htmlFor="measure-count">How many corrective measures?</Label>
                  <Select value={measureCount.toString()} onValueChange={handleCountChange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 50 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={addMeasure} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Measure
                </Button>
              </div>

              <div className="space-y-4">
                {correctiveMeasures.map((measure, index) => (
                  <Card key={index} className="border-l-4 border-l-accent">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CardTitle className="text-lg">Corrective Measure #{measure.index}</CardTitle>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`completed-${index}`}
                              checked={measure.completed || false}
                              onCheckedChange={(checked) => {
                                const newMeasures = [...correctiveMeasures];
                                newMeasures[index] = { ...newMeasures[index], completed: checked as boolean };
                                setCorrectiveMeasures(newMeasures);
                              }}
                            />
                            <Label htmlFor={`completed-${index}`} className="text-sm text-muted-foreground">
                              Completed
                            </Label>
                          </div>
                        </div>
                        {correctiveMeasures.length > 1 && (
                          <Button 
                            onClick={() => removeMeasure(index)}
                            variant="ghost" 
                            size="sm"
                            className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex-1">
                          <Select
                            value={measure.section || ''}
                            onValueChange={(value) => updateMeasure(index, { section: value })}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Choose a Section this falls under" />
                            </SelectTrigger>
                            <SelectContent>
                              {CORRECTIVE_SECTIONS.map((section) => (
                                <SelectItem key={section} value={section}>
                                  {section}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Textarea
                          value={measure.text}
                          onChange={(e) => updateMeasure(index, { text: e.target.value })}
                          placeholder={`Describe corrective measure #${measure.index} in detail...`}
                          rows={4}
                          className="resize-none"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* User Input Fields for Final Report */}
              <div className="mt-6 space-y-4 border-t pt-6">
                <h4 className="font-medium text-foreground flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Final Report Input Fields</span>
                </h4>
                <div className="text-sm text-muted-foreground mb-4">
                  Complete these fields to populate the green text sections in the Final Report.
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>IT Media Information</Label>
                    <Input
                      placeholder="e.g., USB, DVD, Hard Drive"
                      className="text-sm"
                    />
                    <p className="text-xs text-muted-foreground">Describe media types used for information delivery/return</p>
                  </div>
                  <div className="space-y-2">
                    <Label>OS Information</Label>
                    <Input
                      placeholder="e.g., Windows 11, macOS Ventura"
                      className="text-sm"
                    />
                    <p className="text-xs text-muted-foreground">Operating system details for laptops/desktops</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Update Schedule</Label>
                    <Input
                      placeholder="e.g., weekly, monthly, as needed"
                      className="text-sm"
                    />
                    <p className="text-xs text-muted-foreground">How often updates and patches are applied</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Antivirus Details</Label>
                    <Input
                      placeholder="e.g., Norton, McAfee, Windows Defender"
                      className="text-sm"
                    />
                    <p className="text-xs text-muted-foreground">Antivirus solution name and version</p>
                  </div>
                  <div className="space-y-2">
                    <Label>IT Equipment List</Label>
                    <Textarea
                      placeholder="List all IT equipment (laptops, printers, firewalls, routers, etc.)"
                      rows={3}
                      className="text-sm"
                    />
                    <p className="text-xs text-muted-foreground">Complete list of IT equipment used for the contract</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Encryption Details</Label>
                    <Input
                      placeholder="e.g., AES-256, network segregation method"
                      className="text-sm"
                    />
                    <p className="text-xs text-muted-foreground">Encryption standards and segregation methods</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Backup Plan</Label>
                    <Input
                      placeholder="e.g., daily cloud backup, weekly local backup"
                      className="text-sm"
                    />
                    <p className="text-xs text-muted-foreground">Describe the backup and recovery plan</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 pt-4 border-t">
                <Button onClick={handleSave} variant="outline" className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save & Continue Later
                </Button>
                <Button onClick={handleSaveAndPreview} className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  Save & Preview
                </Button>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                <p className="font-medium mb-2">Instructions:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Each corrective measure should be specific and actionable</li>
                  <li>• Include timelines and responsible parties where applicable</li>
                  <li>• Reference specific security policy requirements if relevant</li>
                  <li>• Use clear, professional language suitable for official documentation</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Document Preview</h3>
                <Button onClick={() => setShowPreview(!showPreview)} variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </Button>
              </div>

              {showPreview && (
                <Card>
                  <CardContent className="p-6">
                    <div className="bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="text-sm whitespace-pre-wrap font-mono">{generatePreview()}</pre>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{correctiveMeasures.length}</div>
                      <div className="text-sm text-muted-foreground">Total Measures</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-success">
                        {correctiveMeasures.filter(m => m.text.trim().length > 0).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Completed</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-warning">
                        {correctiveMeasures.filter(m => m.text.trim().length === 0).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Incomplete</div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Corrective Measures Document (DOCX + PDF)
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};