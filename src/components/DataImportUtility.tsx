import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Database, Upload, CheckCircle, AlertCircle, FileText, Users, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import * as XLSX from 'xlsx';

interface OrgImportRecord {
  org_site_id: string;
  organization_name: string;
  address: string;
  phone_number: string;
}

interface CSOImportRecord {
  org_site_id: string;
  role: 'CSO' | 'ACSO';
  full_name: string;
  email: string;
  acso_index?: number;
}

type ImportStatus = 'idle' | 'parsing' | 'importing' | 'success' | 'error';

export const DataImportUtility = () => {
  const [activeTab, setActiveTab] = useState('organizations');
  const { toast } = useToast();
  
  // Organization import state
  const [orgStatus, setOrgStatus] = useState<ImportStatus>('idle');
  const [orgProgress, setOrgProgress] = useState(0);
  const [orgTotalRecords, setOrgTotalRecords] = useState(0);
  const [orgImportedCount, setOrgImportedCount] = useState(0);
  const [orgCurrentCount, setOrgCurrentCount] = useState(0);
  
  // CSO import state
  const [csoStatus, setCsoStatus] = useState<ImportStatus>('idle');
  const [csoProgress, setCsoProgress] = useState(0);
  const [csoTotalRecords, setCsoTotalRecords] = useState(0);
  const [csoImportedCount, setCsoImportedCount] = useState(0);
  const [csoCurrentCount, setCsoCurrentCount] = useState(0);

  // Parse ORG_Database.xlsx with new column mappings
  const processOrgExcelData = async (): Promise<OrgImportRecord[]> => {
    setOrgStatus('parsing');
    setOrgProgress(5);
    
    try {
      const response = await fetch('/data/ORG_Database.xlsx');
      if (!response.ok) {
        throw new Error('Failed to fetch ORG_Database.xlsx');
      }
      
      const arrayBuffer = await response.arrayBuffer();
      setOrgProgress(15);
      
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      setOrgProgress(25);
      
      // Convert to JSON with header row
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
      
      const organizations: OrgImportRecord[] = [];
      
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        
        // Map new Excel column names: OrgSite, OrgName, OrgAddress, orgPhone
        const orgSiteId = String(row['OrgSite'] || row['org_site_id'] || '').trim();
        const organizationName = String(row['OrgName'] || row['organization_name'] || '').trim();
        const address = String(row['OrgAddress'] || row['address'] || '').trim();
        const phoneNumber = String(row['orgPhone'] || row['phone_number'] || '').trim();
        
        if (orgSiteId && organizationName) {
          organizations.push({
            org_site_id: orgSiteId,
            organization_name: organizationName,
            address: address,
            phone_number: phoneNumber
          });
        }
        
        if (i % 500 === 0) {
          setOrgProgress(25 + Math.min(25, (i / jsonData.length) * 25));
        }
      }
      
      setOrgProgress(50);
      setOrgTotalRecords(organizations.length);
      
      console.log(`Parsed ${organizations.length} organizations from ORG_Database.xlsx`);
      return organizations;
      
    } catch (error) {
      console.error('Excel parsing error:', error);
      throw new Error(`Failed to parse ORG_Database.xlsx: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Parse CSO_Database.xlsx with column mappings: OrgSite, Role, FullName, Email, ACSO_Index
  const processCsoExcelData = async (): Promise<CSOImportRecord[]> => {
    setCsoStatus('parsing');
    setCsoProgress(5);
    
    try {
      const response = await fetch('/data/CSO_Database.xlsx');
      if (!response.ok) {
        throw new Error('Failed to fetch CSO_Database.xlsx');
      }
      
      const arrayBuffer = await response.arrayBuffer();
      setCsoProgress(15);
      
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      setCsoProgress(25);
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
      
      const csoRecords: CSOImportRecord[] = [];
      
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        
        // Map Excel column names: OrgSite, Role, FullName, Email, ACSO_Index
        const orgSiteId = String(row['OrgSite'] || row['org_site_id'] || '').trim();
        const roleRaw = String(row['Role'] || row['role'] || 'CSO').trim().toUpperCase();
        const role = roleRaw === 'ACSO' ? 'ACSO' : 'CSO';
        const fullName = String(row['FullName'] || row['full_name'] || '').trim();
        const email = String(row['Email'] || row['email'] || '').trim();
        const acsoIndex = row['ACSO_Index'] || row['acso_index'] ? parseInt(String(row['ACSO_Index'] || row['acso_index'])) : undefined;
        
        if (orgSiteId && fullName) {
          csoRecords.push({
            org_site_id: orgSiteId,
            role: role as 'CSO' | 'ACSO',
            full_name: fullName,
            email: email,
            acso_index: role === 'ACSO' ? acsoIndex : undefined
          });
        }
        
        if (i % 500 === 0) {
          setCsoProgress(25 + Math.min(25, (i / jsonData.length) * 25));
        }
      }
      
      setCsoProgress(50);
      setCsoTotalRecords(csoRecords.length);
      
      console.log(`Parsed ${csoRecords.length} CSO records from CSO_Database.xlsx`);
      return csoRecords;
      
    } catch (error) {
      console.error('CSO Excel parsing error:', error);
      throw new Error(`Failed to parse CSO_Database.xlsx: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const importOrgData = async () => {
    setOrgStatus('parsing');
    setOrgProgress(0);
    setOrgImportedCount(0);

    try {
      const organizations = await processOrgExcelData();
      
      if (organizations.length === 0) {
        throw new Error('No valid organizations found in Excel file');
      }

      setOrgStatus('importing');
      setOrgProgress(50);

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
          console.error(`Org batch ${Math.floor(i / batchSize) + 1} failed:`, error);
        }
        
        const progressPercent = 50 + Math.floor((i / organizations.length) * 50);
        setOrgProgress(progressPercent);
        setOrgImportedCount(successCount);
      }

      setOrgProgress(100);
      setOrgStatus('success');
      setOrgImportedCount(successCount);
      
      toast({
        title: "Organization Import Complete",
        description: `Successfully imported ${successCount} of ${organizations.length} organization records.`,
      });

    } catch (error) {
      console.error('Org import error:', error);
      setOrgStatus('error');
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import organization data.",
        variant: "destructive"
      });
    }
  };

  const importCsoData = async () => {
    setCsoStatus('parsing');
    setCsoProgress(0);
    setCsoImportedCount(0);

    try {
      const csoRecords = await processCsoExcelData();
      
      if (csoRecords.length === 0) {
        throw new Error('No valid CSO records found in Excel file');
      }

      setCsoStatus('importing');
      setCsoProgress(50);

      const batchSize = 100;
      let successCount = 0;
      
      for (let i = 0; i < csoRecords.length; i += batchSize) {
        const batch = csoRecords.slice(i, i + batchSize);
        
        try {
          const response = await api.cso.importBatch(batch);
          
          if (response.success && response.data) {
            successCount += response.data.imported || batch.length;
          }
        } catch (error) {
          console.error(`CSO batch ${Math.floor(i / batchSize) + 1} failed:`, error);
        }
        
        const progressPercent = 50 + Math.floor((i / csoRecords.length) * 50);
        setCsoProgress(progressPercent);
        setCsoImportedCount(successCount);
      }

      setCsoProgress(100);
      setCsoStatus('success');
      setCsoImportedCount(successCount);
      
      toast({
        title: "CSO Import Complete",
        description: `Successfully imported ${successCount} of ${csoRecords.length} CSO records.`,
      });

    } catch (error) {
      console.error('CSO import error:', error);
      setCsoStatus('error');
      toast({
        title: "CSO Import Failed",
        description: error instanceof Error ? error.message : "Failed to import CSO data.",
        variant: "destructive"
      });
    }
  };

  const checkOrgStatus = async () => {
    try {
      const response = await api.organizations.count();
      
      if (response.success && response.data) {
        setOrgCurrentCount(response.data.total || 0);
        toast({
          title: "Organization Database Status",
          description: `Database contains ${response.data.total || 0} organization records.`,
        });
      }
    } catch (error) {
      toast({
        title: "Status Check Failed",
        description: "Failed to check organization database status.",
        variant: "destructive"
      });
    }
  };

  const checkCsoStatus = async () => {
    try {
      const response = await api.cso.count();
      
      if (response.success && response.data) {
        setCsoCurrentCount(response.data.total || 0);
        toast({
          title: "CSO Database Status",
          description: `Database contains ${response.data.total || 0} CSO records.`,
        });
      }
    } catch (error) {
      toast({
        title: "Status Check Failed",
        description: "Failed to check CSO database status.",
        variant: "destructive"
      });
    }
  };

  const renderStatusAlert = (status: ImportStatus, total: number, imported: number, type: string) => {
    switch (status) {
      case 'idle':
        return (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Ready to import {type} data from the Excel file.
            </AlertDescription>
          </Alert>
        );
      case 'parsing':
        return (
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Parsing Excel file... Found {total} records so far.
            </AlertDescription>
          </Alert>
        );
      case 'importing':
        return (
          <Alert>
            <Upload className="h-4 w-4" />
            <AlertDescription>
              Importing {total} records... ({imported} imported)
            </AlertDescription>
          </Alert>
        );
      case 'success':
        return (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700 dark:text-green-400">
              Successfully imported {imported} records!
            </AlertDescription>
          </Alert>
        );
      case 'error':
        return (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Import failed. Check console for details.
            </AlertDescription>
          </Alert>
        );
    }
  };

  const isOrgImporting = orgStatus === 'parsing' || orgStatus === 'importing';
  const isCsoImporting = csoStatus === 'parsing' || csoStatus === 'importing';

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-primary" />
          <span>Data Import Utility</span>
        </CardTitle>
        <CardDescription>
          Import organization and CSO data from Excel files to MySQL database.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="organizations" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Organizations
              {orgCurrentCount > 0 && (
                <Badge variant="secondary" className="ml-1">{orgCurrentCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="cso" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              CSO Contacts
              {csoCurrentCount > 0 && (
                <Badge variant="secondary" className="ml-1">{csoCurrentCount}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="organizations" className="space-y-4">
            {renderStatusAlert(orgStatus, orgTotalRecords, orgImportedCount, 'organization')}
            
            {(orgStatus === 'parsing' || orgStatus === 'importing') && (
              <Progress value={orgProgress} className="w-full" />
            )}
            
            <div className="flex space-x-2">
              <Button 
                onClick={importOrgData}
                disabled={isOrgImporting}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                {orgStatus === 'parsing' ? 'Parsing...' : 
                 orgStatus === 'importing' ? 'Importing...' : 
                 'Import ORG_Database.xlsx'}
              </Button>
              
              <Button 
                onClick={checkOrgStatus}
                variant="outline"
                disabled={isOrgImporting}
              >
                <Database className="h-4 w-4 mr-2" />
                Check Status
              </Button>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Source:</strong> ORG_Database.xlsx</p>
              <p><strong>Columns:</strong> OrgSite → org_site_id, OrgName → organization_name, OrgAddress → address, orgPhone → phone_number</p>
            </div>
          </TabsContent>

          <TabsContent value="cso" className="space-y-4">
            {renderStatusAlert(csoStatus, csoTotalRecords, csoImportedCount, 'CSO')}
            
            {(csoStatus === 'parsing' || csoStatus === 'importing') && (
              <Progress value={csoProgress} className="w-full" />
            )}
            
            <div className="flex space-x-2">
              <Button 
                onClick={importCsoData}
                disabled={isCsoImporting}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                {csoStatus === 'parsing' ? 'Parsing...' : 
                 csoStatus === 'importing' ? 'Importing...' : 
                 'Import CSO_Database.xlsx'}
              </Button>
              
              <Button 
                onClick={checkCsoStatus}
                variant="outline"
                disabled={isCsoImporting}
              >
                <Database className="h-4 w-4 mr-2" />
                Check Status
              </Button>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Source:</strong> CSO_Database.xlsx</p>
              <p><strong>Columns:</strong> OrgSite → org_site_id, Role → role (CSO/ACSO), FullName → full_name, Email → email (encrypted), ACSO_Index → acso_index</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
