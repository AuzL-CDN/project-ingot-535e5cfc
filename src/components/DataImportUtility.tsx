import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, Upload, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

interface ImportRecord {
  org_site_id: string;
  organization_name: string;
  address: string;
  phone_number: string;
}

export const DataImportUtility = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'parsing' | 'importing' | 'success' | 'error'>('idle');
  const [recordCount, setRecordCount] = useState<number>(0);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const { toast } = useToast();

  // Sample data extracted from the Excel file structure
  const sampleData: ImportRecord[] = [
    { org_site_id: '113-0', organization_name: 'A.U.G. Signals Ltd.', address: '103-73 Richmond Street West Toronto ON M5H4E8', phone_number: '(416) 923-4425' },
    { org_site_id: '118-0', organization_name: 'ABI/Advanced Business Interiors Inc.', address: '2355 St. Laurent Boulevard Ottawa ON K1G4L2', phone_number: '(613) 738-1003' },
    { org_site_id: '120-0', organization_name: 'Robert Half Canada Inc.', address: '820-181 Bay Street (Head Office) Toronto ON M5J2T3', phone_number: '(613) 236-4253' },
    { org_site_id: '123-0', organization_name: 'Accurate Design & Communication Inc.', address: '100-57 Auriga Drive Ottawa ON K2E8B2', phone_number: '(613) 723-2057' },
    { org_site_id: '128-0', organization_name: 'Action Personnel of Ottawa-Hull Limited', address: '126-130 Albert Street Ottawa ON K1P5G4', phone_number: '(613) 238-8511' },
  ];

  const processExcelData = async (): Promise<ImportRecord[]> => {
    setStatus('parsing');
    setProgress(5);
    
    try {
      // Fetch the Excel file from the public directory
      const response = await fetch('/data/ORGs_Actual_Address-Merge_Data.xlsx');
      if (!response.ok) {
        throw new Error('Failed to fetch Excel file');
      }
      
      const arrayBuffer = await response.arrayBuffer();
      setProgress(15);
      
      // Parse the Excel file
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      setProgress(25);
      
      // Convert to JSON with headers
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
      
      // Skip the header row and process data
      const organizations: ImportRecord[] = [];
      
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (row && row.length >= 4 && row[0]) { // Ensure we have data
          const orgSiteId = String(row[0] || '').trim();
          const organizationName = String(row[1] || '').trim();
          const address = String(row[2] || '').trim();
          const phoneNumber = String(row[3] || '').trim();
          
          if (orgSiteId && organizationName && address) { // Must have at least these fields
            organizations.push({
              org_site_id: orgSiteId,
              organization_name: organizationName,
              address: address,
              phone_number: phoneNumber
            });
          }
        }
        
        // Update progress during parsing
        if (i % 1000 === 0) {
          setProgress(25 + Math.min(25, (i / jsonData.length) * 25));
        }
      }
      
      setProgress(50);
      setTotalRecords(organizations.length);
      
      console.log(`Parsed ${organizations.length} organizations from Excel file`);
      return organizations;
      
    } catch (error) {
      console.error('Excel parsing error:', error);
      throw new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const importData = async () => {
    setIsImporting(true);
    setStatus('parsing');
    setProgress(0);

    try {
      // Parse the Excel file
      const organizations = await processExcelData();
      setRecordCount(organizations.length);
      
      if (organizations.length === 0) {
        throw new Error('No valid organizations found in Excel file');
      }

      setStatus('importing');
      setProgress(50);

      // Import in chunks to handle large datasets
      const chunkSize = 500; // Import 500 records per batch
      let importedCount = 0;
      
      for (let i = 0; i < organizations.length; i += chunkSize) {
        const chunk = organizations.slice(i, i + chunkSize);
        
        const { data, error } = await supabase.functions.invoke('import-organizations', {
          body: { organizations: chunk }
        });

        if (error) {
          throw error;
        }

        if (!data.success) {
          throw new Error(data.error || 'Import batch failed');
        }

        importedCount += data.imported;
        
        // Update progress
        const progressPercent = 50 + ((importedCount / organizations.length) * 50);
        setProgress(Math.min(100, progressPercent));
        
        console.log(`Imported batch ${Math.floor(i / chunkSize) + 1}: ${data.imported} records (Total: ${importedCount}/${organizations.length})`);
      }

      setProgress(100);
      setStatus('success');
      setRecordCount(importedCount);
      
      toast({
        title: "Import Successful",
        description: `Successfully imported ${importedCount} organization records from Excel file.`,
      });

    } catch (error) {
      console.error('Import error:', error);
      setStatus('error');
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import organization data.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const checkCurrentRecords = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('import-organizations');
      
      if (error) throw error;
      
      if (data.success) {
        setRecordCount(data.currentRecords);
        toast({
          title: "Database Status",
          description: data.message,
        });
      }
    } catch (error) {
      console.error('Status check error:', error);
      toast({
        title: "Status Check Failed",
        description: "Failed to check database status.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-primary" />
          <span>Organization Data Import</span>
        </CardTitle>
        <CardDescription>
          Import organization address data from Excel file to Supabase database for address lookup functionality.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {status === 'idle' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Ready to import organization data from the uploaded Excel file into your Supabase database.
                Current database contains {recordCount} records.
              </AlertDescription>
            </Alert>
          )}

          {status === 'parsing' && (
            <div className="space-y-2">
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  Parsing Excel file... Found {totalRecords} records so far.
                </AlertDescription>
              </Alert>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {status === 'importing' && (
            <div className="space-y-2">
              <Alert>
                <Upload className="h-4 w-4" />
                <AlertDescription>
                  Importing {totalRecords} organization records in batches...
                </AlertDescription>
              </Alert>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {status === 'success' && (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Successfully imported {recordCount} organization records! Address lookup is now ready with the full database.
              </AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Import failed. Please try again or check the console for error details.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex space-x-2">
          <Button 
            onClick={importData}
            disabled={isImporting}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            {status === 'parsing' ? 'Parsing Excel...' : 
             status === 'importing' ? 'Importing...' : 
             'Import Full Database'}
          </Button>
          
          <Button 
            onClick={checkCurrentRecords}
            variant="outline"
            disabled={isImporting}
          >
            <Database className="h-4 w-4 mr-2" />
            Check Status
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p><strong>Excel File:</strong> Processing the complete ORGs_Actual_Address-Merge_Data.xlsx file with 25,000+ organization records.</p>
          <p><strong>Import Process:</strong> Data will be imported in batches of 500 records for optimal performance.</p>
          <p>The imported data will be used by the Address Lookup component to automatically populate organization details.</p>
        </div>
      </CardContent>
    </Card>
  );
};