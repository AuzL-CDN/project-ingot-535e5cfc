import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Activity, Building, Calendar, FileText } from 'lucide-react';
import { ActivityRecord } from '@/hooks/useInspectionState';

interface SearchTabProps {
  searchActivities: (searchTerm: string) => ActivityRecord[];
  loadActivity: (activity: ActivityRecord) => void;
}

export const SearchTab = ({ searchActivities, loadActivity }: SearchTabProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ActivityRecord[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    // Simulate API delay
    setTimeout(() => {
      const results = searchActivities(searchTerm);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
  };

  const handleLoadActivity = (activity: ActivityRecord) => {
    loadActivity(activity);
    // In a real app, would navigate to Main tab or show success message
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-primary" />
            <span>Search Activities</span>
          </CardTitle>
          <CardDescription>
            Search by Activity Number or Organization Number to recall previous activities.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex space-x-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="search-input">Search Term</Label>
              <Input
                id="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter Activity # (e.g., 20241234) or Org # (e.g., 123-00)"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleSearch}
                disabled={!searchTerm.trim() || isSearching}
              >
                <Search className="h-4 w-4 mr-2" />
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Search Results ({searchResults.length})</h3>
              <div className="space-y-3">
                {searchResults.map((activity) => (
                  <Card key={activity.id} className="hover:shadow-md transition-smooth cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline" className="font-mono">
                              <Activity className="h-3 w-3 mr-1" />
                              {activity.mainForm.activityNumber}
                            </Badge>
                            <Badge 
                              variant={activity.mainForm.inspectionClass ? "default" : "secondary"}
                            >
                              {activity.mainForm.inspectionClass || 'No Class'}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center space-x-1">
                              <Building className="h-3 w-3" />
                              <span>{activity.mainForm.companyName}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <FileText className="h-3 w-3" />
                              <span>{activity.mainForm.orgSiteNumber}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(activity.createdAt)}</span>
                            </span>
                          </div>

                          <p className="text-sm text-foreground">
                            {activity.mainForm.inspectionType} • {activity.mainForm.securityLevel}
                          </p>
                        </div>

                        <Button 
                          onClick={() => handleLoadActivity(activity)}
                          variant="outline"
                          size="sm"
                        >
                          Load Activity
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {searchResults.length === 0 && searchTerm && !isSearching && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No activities found matching "{searchTerm}"</p>
              <p className="text-sm mt-2">Try searching by Activity Number or Organization Number</p>
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
            <p className="font-medium mb-2">Search Tips:</p>
            <ul className="space-y-1 text-xs">
              <li>• Search by Activity Number for exact match</li>
              <li>• Search by Organization Number to see all activities for that org</li>
              <li>• Partial matches are supported for company names</li>
              <li>• Loading an activity will populate all tabs with saved data</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};