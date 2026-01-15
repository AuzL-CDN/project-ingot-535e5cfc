import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, Upload, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
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
  const [importedCount, setImportedCount] = useState<number>(0);
  const { toast } = useToast();

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
        if (row && row.length >= 4 && row[0]) {
          const orgSiteId = String(row[0] || '').trim();
          const organizationName = String(row[1] || '').trim();
          const address = String(row[2] || '').trim();
          const phoneNumber = String(row[3] || '').trim();
          
          if (orgSiteId && organizationName && address) {
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
    setImportedCount(0);

    try {
      // Parse the Excel file
      const organizations = await processExcelData();
      setRecordCount(organizations.length);
      
      if (organizations.length === 0) {
        throw new Error('No valid organizations found in Excel file');
      }

      setStatus('importing');
      setProgress(50);

      // Import in batches of 100
      const batchSize = 100;
      let successCount = 0;
      
      for (let i = 0; i < organizations.length; i += batchSize) {
        const batch = organizations.slice(i, i + batchSize);
        
        try {
          const response = await api.organizations.importBatch(batch);
          
          if (response.success && response.data) {
            successCount += response.data.imported || batch.length;
          }
        } catch (error) {
          console.error(`Batch ${Math.floor(i / batchSize) + 1} failed:`, error);
        }
        
        // Update progress
        const progressPercent = 50 + Math.floor((i / organizations.length) * 50);
        setProgress(progressPercent);
        setImportedCount(successCount);
      }

      setProgress(100);
      setStatus('success');
      setImportedCount(successCount);
      
      toast({
        title: "Import Complete",
        description: `Successfully imported ${successCount} of ${organizations.length} organization records.`,
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
      const response = await api.organizations.count();
      
      if (response.success && response.data) {
        setRecordCount(response.data.total || 0);
        toast({
          title: "Database Status",
          description: `Database contains ${response.data.total || 0} organization records.`,
        });
      } else {
        throw new Error(response.error || 'Failed to check status');
      }
    } catch (error) {
      console.error('Status check error:', error);
      toast({
        title: "Status Check Failed",
        description: "Failed to check database status. Make sure the PHP API is accessible.",
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
          Import organization address data from Excel file to MySQL database for address lookup functionality.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {status === 'idle' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Ready to import organization data from the Excel file into your MySQL database.
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
                  Importing {totalRecords} organization records... ({importedCount} imported)
                </AlertDescription>
              </Alert>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {status === 'success' && (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Successfully imported {importedCount} organization records! Address lookup is now ready.
              </AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Import failed. Make sure the PHP API backend is running and accessible.
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
          <p><strong>Import Process:</strong> Data will be imported in batches of 100 records to the PHP/MySQL backend.</p>
          <p>The imported data will be used by the Address Lookup component to automatically populate organization details.</p>
        </div>
      </CardContent>
    </Card>
  );
};
