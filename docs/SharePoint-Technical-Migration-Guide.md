# Project INGOT - Technical Migration Guide
## From Supabase to SharePoint

This guide provides detailed technical instructions for developers to migrate the current Project INGOT application from Supabase to SharePoint Online.

---

## 📋 Prerequisites

- Node.js 18+ installed
- Git installed
- Access to the current project repository
- SharePoint environment configured (see non-technical guide)
- Azure AD App Registration completed
- Power Automate flows created

---

## Phase 1: Environment Setup

### 1.1 Clone and Prepare the Project

```bash
# Clone the repository (if not already cloned)
git clone [your-repo-url]
cd project-ingot

# Create a new branch for SharePoint migration
git checkout -b feature/sharepoint-migration

# Install dependencies
npm install
```

### 1.2 Remove Supabase Dependencies

```bash
# Uninstall Supabase packages
npm uninstall @supabase/supabase-js

# Remove Supabase-related dev dependencies if any
npm uninstall @supabase/auth-helpers-react
```

### 1.3 Install SharePoint/Microsoft 365 Dependencies

```bash
# Install Microsoft Authentication Library
npm install @azure/msal-browser @azure/msal-react

# Install Microsoft Graph SDK
npm install @microsoft/microsoft-graph-client

# Install SharePoint PnP JS (optional but helpful)
npm install @pnp/sp @pnp/graph

# Install additional utilities
npm install axios
```

---

## Phase 2: Configuration Setup

### 2.1 Create Environment Configuration

Create a new file: `src/config/sharepoint.config.ts`

```typescript
export const sharepointConfig = {
  tenantId: import.meta.env.VITE_AZURE_TENANT_ID || '',
  clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '',
  redirectUri: window.location.origin,
  
  sharepoint: {
    siteUrl: import.meta.env.VITE_SHAREPOINT_SITE_URL || '',
    sitePath: '/sites/ProjectINGOT',
    documentLibrary: 'Shared Documents',
    templatesFolder: 'Templates',
    inspectorsFolder: 'Inspectors'
  },
  
  lists: {
    inspectors: 'Inspectors',
    activities: 'Activities',
    correctiveMeasures: 'CorrectiveMeasures',
    approvalCCs: 'ApprovalCCs',
    runLog: 'RunLog'
  },
  
  powerAutomate: {
    createInspectorFolder: import.meta.env.VITE_FLOW_CREATE_FOLDER || '',
    generateDocument: import.meta.env.VITE_FLOW_GENERATE_DOC || '',
    uploadDocument: import.meta.env.VITE_FLOW_UPLOAD_DOC || ''
  },
  
  scopes: [
    'User.Read',
    'Sites.Read.All',
    'Sites.ReadWrite.All',
    'Files.Read.All',
    'Files.ReadWrite.All'
  ]
};
```

### 2.2 Create Environment Variables File

Create `.env.local` file in project root:

```bash
# Azure AD Configuration
VITE_AZURE_TENANT_ID=your-tenant-id-here
VITE_AZURE_CLIENT_ID=your-client-id-here

# SharePoint Configuration
VITE_SHAREPOINT_SITE_URL=https://yourcompany.sharepoint.com/sites/ProjectINGOT

# Power Automate Flow URLs
VITE_FLOW_CREATE_FOLDER=https://prod-xx.eastus.logic.azure.com:443/workflows/...
VITE_FLOW_GENERATE_DOC=https://prod-xx.eastus.logic.azure.com:443/workflows/...
VITE_FLOW_UPLOAD_DOC=https://prod-xx.eastus.logic.azure.com:443/workflows/...
```

### 2.3 Update .gitignore

```bash
# Add to .gitignore if not already there
.env.local
.env.production.local
.env.development.local
```

---

## Phase 3: Authentication Migration

### 3.1 Create MSAL Authentication Service

Create `src/services/auth/msalService.ts`:

```typescript
import { PublicClientApplication, AccountInfo, InteractionRequiredAuthError } from '@azure/msal-browser';
import { sharepointConfig } from '@/config/sharepoint.config';

const msalConfig = {
  auth: {
    clientId: sharepointConfig.clientId,
    authority: `https://login.microsoftonline.com/${sharepointConfig.tenantId}`,
    redirectUri: sharepointConfig.redirectUri,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  }
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const initializeMsal = async () => {
  await msalInstance.initialize();
  
  // Handle redirect promise
  const response = await msalInstance.handleRedirectPromise();
  if (response) {
    msalInstance.setActiveAccount(response.account);
  }
};

export const login = async () => {
  try {
    const response = await msalInstance.loginPopup({
      scopes: sharepointConfig.scopes,
    });
    msalInstance.setActiveAccount(response.account);
    return response.account;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const logout = async () => {
  const account = msalInstance.getActiveAccount();
  if (account) {
    await msalInstance.logoutPopup({
      account,
    });
  }
};

export const getAccessToken = async (scopes: string[] = sharepointConfig.scopes): Promise<string> => {
  const account = msalInstance.getActiveAccount();
  
  if (!account) {
    throw new Error('No active account');
  }

  try {
    const response = await msalInstance.acquireTokenSilent({
      scopes,
      account,
    });
    return response.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      // Fallback to interactive method
      const response = await msalInstance.acquireTokenPopup({
        scopes,
      });
      return response.accessToken;
    }
    throw error;
  }
};

export const getCurrentUser = (): AccountInfo | null => {
  return msalInstance.getActiveAccount();
};
```

### 3.2 Create Authentication Context

Create `src/contexts/SharePointAuthProvider.tsx`:

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AccountInfo } from '@azure/msal-browser';
import { msalInstance, initializeMsal, login, logout, getCurrentUser } from '@/services/auth/msalService';

interface AuthContextType {
  user: AccountInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SharePointAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AccountInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeMsal();
        const currentUser = getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to initialize MSAL:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const account = await login();
      setUser(account);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login: handleLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useSharePointAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useSharePointAuth must be used within SharePointAuthProvider');
  }
  return context;
};
```

---

## Phase 4: Data Access Layer Migration

### 4.1 Create SharePoint Service

Create `src/services/sharepoint/sharePointService.ts`:

```typescript
import { Client } from '@microsoft/microsoft-graph-client';
import { getAccessToken } from '@/services/auth/msalService';
import { sharepointConfig } from '@/config/sharepoint.config';
import axios from 'axios';

class SharePointService {
  private graphClient: Client | null = null;

  private async getGraphClient(): Promise<Client> {
    if (!this.graphClient) {
      const token = await getAccessToken();
      this.graphClient = Client.init({
        authProvider: (done) => {
          done(null, token);
        },
      });
    }
    return this.graphClient;
  }

  // List Operations
  async getListItems(listName: string): Promise<any[]> {
    try {
      const client = await this.getGraphClient();
      const siteId = await this.getSiteId();
      
      const response = await client
        .api(`/sites/${siteId}/lists/${listName}/items`)
        .expand('fields')
        .get();
      
      return response.value.map((item: any) => item.fields);
    } catch (error) {
      console.error(`Error fetching list items from ${listName}:`, error);
      throw error;
    }
  }

  async createListItem(listName: string, data: any): Promise<any> {
    try {
      const client = await this.getGraphClient();
      const siteId = await this.getSiteId();
      
      const response = await client
        .api(`/sites/${siteId}/lists/${listName}/items`)
        .post({
          fields: data
        });
      
      return response.fields;
    } catch (error) {
      console.error(`Error creating list item in ${listName}:`, error);
      throw error;
    }
  }

  async updateListItem(listName: string, itemId: string, data: any): Promise<any> {
    try {
      const client = await this.getGraphClient();
      const siteId = await this.getSiteId();
      
      const response = await client
        .api(`/sites/${siteId}/lists/${listName}/items/${itemId}`)
        .patch({
          fields: data
        });
      
      return response.fields;
    } catch (error) {
      console.error(`Error updating list item in ${listName}:`, error);
      throw error;
    }
  }

  async deleteListItem(listName: string, itemId: string): Promise<void> {
    try {
      const client = await this.getGraphClient();
      const siteId = await this.getSiteId();
      
      await client
        .api(`/sites/${siteId}/lists/${listName}/items/${itemId}`)
        .delete();
    } catch (error) {
      console.error(`Error deleting list item from ${listName}:`, error);
      throw error;
    }
  }

  // File Operations
  async uploadFile(folderPath: string, fileName: string, fileContent: Blob): Promise<any> {
    try {
      const client = await this.getGraphClient();
      const siteId = await this.getSiteId();
      const driveId = await this.getDriveId();
      
      const uploadPath = `${folderPath}/${fileName}`;
      
      const response = await client
        .api(`/sites/${siteId}/drives/${driveId}/root:${uploadPath}:/content`)
        .put(fileContent);
      
      return response;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async downloadFile(filePath: string): Promise<Blob> {
    try {
      const client = await this.getGraphClient();
      const siteId = await this.getSiteId();
      const driveId = await this.getDriveId();
      
      const response = await client
        .api(`/sites/${siteId}/drives/${driveId}/root:${filePath}:/content`)
        .get();
      
      return response;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  // Power Automate Flow Triggers
  async triggerFlow(flowUrl: string, data: any): Promise<any> {
    try {
      const response = await axios.post(flowUrl, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error triggering flow:', error);
      throw error;
    }
  }

  // Helper Methods
  private async getSiteId(): Promise<string> {
    const client = await this.getGraphClient();
    const hostname = new URL(sharepointConfig.sharepoint.siteUrl).hostname;
    const sitePath = sharepointConfig.sharepoint.sitePath;
    
    const site = await client
      .api(`/sites/${hostname}:${sitePath}`)
      .get();
    
    return site.id;
  }

  private async getDriveId(): Promise<string> {
    const client = await this.getGraphClient();
    const siteId = await this.getSiteId();
    
    const drive = await client
      .api(`/sites/${siteId}/drive`)
      .get();
    
    return drive.id;
  }
}

export const sharePointService = new SharePointService();
```

### 4.2 Create Activity Service

Create `src/services/sharepoint/activityService.ts`:

```typescript
import { sharePointService } from './sharePointService';
import { sharepointConfig } from '@/config/sharepoint.config';

export interface Activity {
  id?: string;
  OrgSiteNumber: string;
  CompanyName: string;
  ClientDepartment?: string;
  ContractType?: string;
  ContractNumber?: string;
  SecurityLevel?: string;
  InspectionType?: string;
  InspectionClass?: string;
  InspectionDate: string;
  Status: string;
}

export const activityService = {
  async getAll(): Promise<Activity[]> {
    return await sharePointService.getListItems(sharepointConfig.lists.activities);
  },

  async getById(id: string): Promise<Activity | null> {
    const activities = await this.getAll();
    return activities.find(a => a.id === id) || null;
  },

  async create(activity: Omit<Activity, 'id'>): Promise<Activity> {
    return await sharePointService.createListItem(
      sharepointConfig.lists.activities,
      activity
    );
  },

  async update(id: string, activity: Partial<Activity>): Promise<Activity> {
    return await sharePointService.updateListItem(
      sharepointConfig.lists.activities,
      id,
      activity
    );
  },

  async delete(id: string): Promise<void> {
    await sharePointService.deleteListItem(
      sharepointConfig.lists.activities,
      id
    );
  },

  async search(query: string): Promise<Activity[]> {
    const activities = await this.getAll();
    const lowerQuery = query.toLowerCase();
    
    return activities.filter(activity =>
      activity.CompanyName?.toLowerCase().includes(lowerQuery) ||
      activity.OrgSiteNumber?.toLowerCase().includes(lowerQuery) ||
      activity.ContractNumber?.toLowerCase().includes(lowerQuery)
    );
  }
};
```

### 4.3 Create Inspector Service

Create `src/services/sharepoint/inspectorService.ts`:

```typescript
import { sharePointService } from './sharePointService';
import { sharepointConfig } from '@/config/sharepoint.config';

export interface Inspector {
  id?: string;
  Initials: string;
  Email: string;
  FolderPath?: string;
}

export const inspectorService = {
  async getAll(): Promise<Inspector[]> {
    return await sharePointService.getListItems(sharepointConfig.lists.inspectors);
  },

  async create(inspector: Omit<Inspector, 'id'>): Promise<Inspector> {
    // Create inspector record
    const created = await sharePointService.createListItem(
      sharepointConfig.lists.inspectors,
      inspector
    );

    // Trigger Power Automate flow to create folder
    await sharePointService.triggerFlow(
      sharepointConfig.powerAutomate.createInspectorFolder,
      {
        initials: inspector.Initials,
        email: inspector.Email
      }
    );

    return created;
  },

  async getByEmail(email: string): Promise<Inspector | null> {
    const inspectors = await this.getAll();
    return inspectors.find(i => i.Email === email) || null;
  }
};
```

### 4.4 Create Document Service

Create `src/services/sharepoint/documentService.ts`:

```typescript
import { sharePointService } from './sharePointService';
import { sharepointConfig } from '@/config/sharepoint.config';

export const documentService = {
  async generateDocument(
    templateName: string,
    outputFileName: string,
    data: any,
    folderPath: string
  ): Promise<void> {
    await sharePointService.triggerFlow(
      sharepointConfig.powerAutomate.generateDocument,
      {
        templateName,
        outputFileName,
        data,
        folderPath
      }
    );
  },

  async uploadSupportingDocument(
    fileName: string,
    fileContent: string,
    folderPath: string
  ): Promise<void> {
    await sharePointService.triggerFlow(
      sharepointConfig.powerAutomate.uploadDocument,
      {
        fileName,
        fileContent,
        folderPath
      }
    );
  },

  async uploadFileDirectly(
    folderPath: string,
    fileName: string,
    file: File
  ): Promise<void> {
    await sharePointService.uploadFile(folderPath, fileName, file);
  }
};
```

---

## Phase 5: Component Migration

### 5.1 Update App.tsx

```typescript
import { SharePointAuthProvider } from '@/contexts/SharePointAuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { Layout } from './components/layout/Layout';
import { routes } from './routes';
import { AuthPage } from './components/auth/AuthPage';
import { useSharePointAuth } from './contexts/SharePointAuthProvider';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SharePointAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="*"
              element={
                <RequireAuth>
                  <Layout>
                    <Routes>
                      {routes.map((route) => (
                        <Route
                          key={route.path}
                          path={route.path}
                          element={<route.component />}
                        />
                      ))}
                    </Routes>
                  </Layout>
                </RequireAuth>
              }
            />
          </Routes>
        </BrowserRouter>
      </SharePointAuthProvider>
    </QueryClientProvider>
  );
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useSharePointAuth();

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return <>{children}</>;
}

export default App;
```

### 5.2 Update Auth Components

Replace `src/components/auth/AuthPage.tsx` content:

```typescript
import { useSharePointAuth } from '@/contexts/SharePointAuthProvider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const AuthPage = () => {
  const { login, isLoading } = useSharePointAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6">Project INGOT</h1>
        <p className="text-muted-foreground mb-6">
          Sign in with your Microsoft 365 account to continue
        </p>
        <Button
          onClick={login}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Signing in...' : 'Sign in with Microsoft'}
        </Button>
      </Card>
    </div>
  );
};
```

### 5.3 Update Inspection Hook

Modify `src/hooks/useInspectionState.ts` to use SharePoint services:

```typescript
import { useState, useEffect } from 'react';
import { activityService, Activity } from '@/services/sharepoint/activityService';
import { useToast } from '@/hooks/use-toast';

export const useInspectionState = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadActivities = async () => {
    setIsLoading(true);
    try {
      const data = await activityService.getAll();
      setActivities(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load activities',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveActivity = async (activity: Omit<Activity, 'id'>) => {
    setIsLoading(true);
    try {
      if (currentActivity?.id) {
        const updated = await activityService.update(currentActivity.id, activity);
        setCurrentActivity(updated);
      } else {
        const created = await activityService.create(activity);
        setCurrentActivity(created);
      }
      toast({
        title: 'Success',
        description: 'Activity saved successfully'
      });
      await loadActivities();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save activity',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  return {
    activities,
    currentActivity,
    setCurrentActivity,
    saveActivity,
    loadActivities,
    isLoading
  };
};
```

---

## Phase 6: Remove Supabase Code

### 6.1 Delete Supabase Files

```bash
# Remove Supabase integration
rm -rf src/integrations/supabase/

# Remove old auth components
rm src/components/auth/AuthProvider.tsx

# Keep these as they may be referenced elsewhere
# src/components/auth/AuthPage.tsx (already updated)
```

### 6.2 Update Imports Across Codebase

Search and replace across all files:

```bash
# Find all files importing from Supabase
grep -r "@supabase/supabase-js" src/

# Find all files using old auth context
grep -r "useAuth" src/

# Update imports manually or use find-replace
```

---

## Phase 7: Build and Test

### 7.1 Local Testing

```bash
# Start development server
npm run dev

# In another terminal, run type checking
npm run type-check

# Run linting
npm run lint
```

### 7.2 Build for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

### 7.3 Test Checklist

- [ ] Authentication works (login/logout)
- [ ] Can create inspector profile
- [ ] Can save inspection data
- [ ] Can search activities
- [ ] Can generate documents
- [ ] Can upload files
- [ ] All tabs function correctly
- [ ] No console errors

---

## Phase 8: Deployment

### 8.1 Deploy to Azure Static Web Apps

```bash
# Install Azure CLI (if not installed)
# Windows: winget install -e --id Microsoft.AzureCLI
# Mac: brew install azure-cli
# Linux: curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login to Azure
az login

# Create resource group (if needed)
az group create --name project-ingot-rg --location eastus

# Create static web app
az staticwebapp create \
  --name project-ingot \
  --resource-group project-ingot-rg \
  --location eastus \
  --sku Free

# Get deployment token
az staticwebapp secrets list \
  --name project-ingot \
  --resource-group project-ingot-rg \
  --query "properties.apiKey" -o tsv

# Deploy using SWA CLI
npm install -g @azure/static-web-apps-cli

swa deploy ./dist \
  --deployment-token <your-deployment-token> \
  --env production
```

### 8.2 Configure Environment Variables in Azure

```bash
# Set environment variables
az staticwebapp appsettings set \
  --name project-ingot \
  --resource-group project-ingot-rg \
  --setting-names \
    VITE_AZURE_TENANT_ID=your-tenant-id \
    VITE_AZURE_CLIENT_ID=your-client-id \
    VITE_SHAREPOINT_SITE_URL=your-site-url \
    VITE_FLOW_CREATE_FOLDER=your-flow-url \
    VITE_FLOW_GENERATE_DOC=your-flow-url \
    VITE_FLOW_UPLOAD_DOC=your-flow-url
```

### 8.3 Update Azure AD Redirect URI

```bash
# Get the deployed URL
az staticwebapp show \
  --name project-ingot \
  --resource-group project-ingot-rg \
  --query "defaultHostname" -o tsv

# Update redirect URI in Azure AD (do this in Azure Portal)
# Go to: Azure AD -> App Registrations -> Project INGOT -> Authentication
# Add: https://<your-app>.azurestaticapps.net
```

---

## Phase 9: Post-Deployment

### 9.1 Verify Deployment

```bash
# Test the deployed application
curl https://<your-app>.azurestaticapps.net

# Check application logs
az staticwebapp logs show \
  --name project-ingot \
  --resource-group project-ingot-rg
```

### 9.2 Monitor Performance

```bash
# Enable Application Insights (optional)
az monitor app-insights component create \
  --app project-ingot-insights \
  --location eastus \
  --resource-group project-ingot-rg

# Link to static web app
# (Configure in Azure Portal)
```

---

## Troubleshooting

### Common Issues

**Issue: CORS errors when calling Power Automate**
```bash
# Solution: Enable CORS in flow settings
# In Power Automate, edit flow -> Settings -> Enable CORS
```

**Issue: Authentication fails**
```bash
# Solution: Verify redirect URIs match exactly
# Check Azure AD app registration redirect URIs
# Ensure URLs are HTTPS in production
```

**Issue: Cannot access SharePoint lists**
```bash
# Solution: Verify API permissions
# Ensure admin consent is granted
# Check that user has access to SharePoint site
```

**Issue: Build fails**
```bash
# Clear cache and rebuild
rm -rf node_modules
rm -rf dist
npm install
npm run build
```

---

## Rollback Procedure

If you need to rollback to Supabase:

```bash
# Checkout the previous version
git checkout main

# Reinstall Supabase dependencies
npm install @supabase/supabase-js

# Redeploy
npm run build
```

---

## Maintenance

### Regular Tasks

**Weekly:**
- Review Power Automate flow run history
- Check RunLog SharePoint list for errors
- Monitor application usage

**Monthly:**
- Review and update npm dependencies
- Check for Azure service updates
- Review and optimize Power Automate flows

**Quarterly:**
- Review access permissions
- Audit security settings
- Performance optimization review

---

## Additional Resources

- [Azure Static Web Apps Documentation](https://docs.microsoft.com/azure/static-web-apps/)
- [Microsoft Graph API Reference](https://docs.microsoft.com/graph/api/overview)
- [MSAL.js Documentation](https://docs.microsoft.com/azure/active-directory/develop/msal-overview)
- [Power Automate Documentation](https://docs.microsoft.com/power-automate/)
- [SharePoint REST API](https://docs.microsoft.com/sharepoint/dev/sp-add-ins/get-to-know-the-sharepoint-rest-service)

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**For:** Project INGOT - SharePoint Migration
