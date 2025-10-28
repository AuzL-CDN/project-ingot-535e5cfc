import { ExternalLink, FileText, BookOpen, Database, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Resource {
  id: string;
  label: string;
  type: 'link' | 'onenote' | 'gcdocs' | 'sharepoint';
  url: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const ResourcesTab = () => {
  // Hardcoded resources for Stage 1
  const resources: Resource[] = [
    {
      id: '1',
      label: 'GCDocs Access',
      type: 'gcdocs',
      url: '#', // Will be configured in Admin later
      description: 'Access government documents via Enterprise Connect. Requires VPN and authentication.',
      icon: Database,
    },
    {
      id: '2',
      label: 'OneNote Library',
      type: 'onenote',
      url: 'https://www.onenote.com', // Example link
      description: 'Shared inspection notes and documentation library.',
      icon: BookOpen,
    },
    {
      id: '3',
      label: 'SharePoint Document Library',
      type: 'sharepoint',
      url: '#', // Will be configured in Admin later
      description: 'Access inspection templates, forms, and shared documents.',
      icon: FileText,
    },
  ];

  const getResourceBadge = (type: string) => {
    switch (type) {
      case 'gcdocs':
        return <Badge variant="secondary">GCDocs</Badge>;
      case 'onenote':
        return <Badge variant="outline">OneNote</Badge>;
      case 'sharepoint':
        return <Badge variant="default">SharePoint</Badge>;
      default:
        return <Badge>Link</Badge>;
    }
  };

  const handleResourceClick = (resource: Resource) => {
    if (resource.type === 'gcdocs') {
      // Special handling for GCDocs
      alert(
        'GCDocs Access:\n\n' +
        '1. Ensure you are connected to the corporate network or VPN\n' +
        '2. Open Enterprise Connect application\n' +
        '3. Navigate to the GCDocs repository\n\n' +
        'Note: Direct browser access may be configured in Admin settings.'
      );
    } else if (resource.url !== '#') {
      window.open(resource.url, '_blank');
    } else {
      alert('This resource needs to be configured in Admin settings.');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Resources</h2>
        <p className="text-muted-foreground">
          Access shared documents, libraries, and external resources. Additional resources can be configured in the Admin panel.
        </p>
      </div>

      {/* GCDocs Static Component */}
      <Card className="mb-6 border-accent/20 bg-accent/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="h-6 w-6 text-accent" />
              <div>
                <CardTitle>GCDocs - Enterprise Connect</CardTitle>
                <CardDescription>Government of Canada Document Management System</CardDescription>
              </div>
            </div>
            {getResourceBadge('gcdocs')}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Access secure government documents through Enterprise Connect. This integration requires:
          </p>
          <ul className="text-sm text-muted-foreground mb-4 space-y-1 ml-4">
            <li>• Active VPN connection to corporate network</li>
            <li>• Enterprise Connect application installed and running</li>
            <li>• Valid GCDocs credentials</li>
          </ul>
          <div className="flex space-x-2">
            <Button 
              onClick={() => handleResourceClick({ 
                id: 'gcdocs', 
                label: 'GCDocs', 
                type: 'gcdocs', 
                url: '#', 
                description: '',
                icon: Database 
              })}
              variant="default"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Access Instructions
            </Button>
            <Button variant="outline" disabled>
              <Download className="h-4 w-4 mr-2" />
              Configure in Admin
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Other Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource) => {
          const Icon = resource.icon;
          return (
            <Card key={resource.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-5 w-5 text-accent" />
                  {getResourceBadge(resource.type)}
                </div>
                <CardTitle className="text-lg">{resource.label}</CardTitle>
                <CardDescription className="text-sm">{resource.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => handleResourceClick(resource)} 
                  variant="outline" 
                  className="w-full"
                  disabled={resource.url === '#'}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {resource.url === '#' ? 'Configure in Admin' : 'Open Resource'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Admin Notice */}
      <div className="mt-6 p-4 bg-muted/50 border border-border rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> Additional resources and custom links can be added through the Admin panel. 
          Contact your system administrator to configure organization-specific resources.
        </p>
      </div>
    </div>
  );
};

