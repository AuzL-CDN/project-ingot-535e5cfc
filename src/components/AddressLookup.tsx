import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Search, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { orgDirectory } from '@/data/orgDirectory';

interface AddressLookupProps {
  orgSiteNumber: string;
  currentAddress: string;
  onAddressUpdate: (address: string) => void;
  onCompanyUpdate?: (companyName: string) => void;
}

// Organization directory loaded from ORGDirectory.xlsx

export const AddressLookup = ({ orgSiteNumber, currentAddress, onAddressUpdate, onCompanyUpdate }: AddressLookupProps) => {
  const [isLooking, setIsLooking] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [foundAddress, setFoundAddress] = useState('');
  const [foundCompany, setFoundCompany] = useState('');
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [updateAddress, setUpdateAddress] = useState('');
  const { toast } = useToast();

  const performLookup = () => {
    if (!orgSiteNumber.trim()) {
      toast({
        title: "Organization - Site Number Required",
        description: "Please enter an Organization - Site Number to perform lookup.",
        variant: "destructive"
      });
      return;
    }

    setIsLooking(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const found = orgDirectory.find(org => org.orgSiteNumber === orgSiteNumber.trim());
      
      if (found) {
        setFoundAddress(found.address);
        setFoundCompany(found.companyName);
        setShowVerifyDialog(true);
      } else {
        toast({
          title: "Organization Not Found",
          description: `No organization found with Site Number: ${orgSiteNumber}`,
          variant: "destructive"
        });
      }
      
      setIsLooking(false);
    }, 1000);
  };

  const handleItMatches = () => {
    onAddressUpdate(foundAddress);
    if (onCompanyUpdate && foundCompany) {
      onCompanyUpdate(foundCompany);
    }
    setShowVerifyDialog(false);
    toast({
      title: "Address Verified",
      description: "Organization details have been updated from the directory.",
    });
  };

  const handleItDoesNotMatch = () => {
    setShowVerifyDialog(false);
    setUpdateAddress(currentAddress || foundAddress);
    setShowUpdateDialog(true);
  };

  const handleUpdateAddress = () => {
    if (!updateAddress.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter an address to update the directory.",
        variant: "destructive"
      });
      return;
    }

    // In real implementation, this would update the SharePoint OrgDirectory list
    onAddressUpdate(updateAddress);
    if (onCompanyUpdate && foundCompany) {
      onCompanyUpdate(foundCompany);
    }
    setShowUpdateDialog(false);
    
    toast({
      title: "Address Updated",
      description: "The organization directory has been updated with the new address and company details populated.",
    });
  };

  return (
    <>
      <Card className="bg-accent/5 border-accent/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <MapPin className="h-4 w-4 text-accent" />
            <span>Address Lookup</span>
          </CardTitle>
          <CardDescription className="text-sm">
            Automatically lookup organization details from the directory. Please verify in DISIS that the address is correctly displayed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex space-x-2">
            <Button 
              onClick={performLookup}
              disabled={isLooking || !orgSiteNumber.trim()}
              size="sm"
              className="flex-shrink-0"
            >
              <Search className="h-4 w-4 mr-2" />
              {isLooking ? 'Looking up...' : 'Lookup Address'}
            </Button>
            {currentAddress && (
              <Alert className="flex-1">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Address found and verified
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          {currentAddress && (
            <div className="space-y-2">
              <Label htmlFor="current-address" className="text-sm font-medium">Current Address</Label>
              <Textarea
                id="current-address"
                value={currentAddress}
                className="bg-muted text-sm"
                rows={3}
                readOnly
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Address Verification Dialog */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              <span>Please Verify Address</span>
            </DialogTitle>
            <DialogDescription>
              Please verify the address shown matches in DISIS
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Found Organization</Label>
              <Input value={foundCompany} className="bg-muted" readOnly />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Found Address</Label>
              <Input 
                value={foundAddress}
                className="bg-muted"
                readOnly
              />
            </div>
          </div>
          
          <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0">
            <Button onClick={handleItMatches} className="w-full sm:w-auto">
              <CheckCircle className="h-4 w-4 mr-2" />
              It Matches
            </Button>
            <Button 
              onClick={handleItDoesNotMatch} 
              variant="outline" 
              className="w-full sm:w-auto"
            >
              <X className="h-4 w-4 mr-2" />
              It Does Not Match
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Address Update Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Address</DialogTitle>
            <DialogDescription>
              Please update the address that will be saved to the OrgDirectory list
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="update-address">Address</Label>
              <Textarea
                id="update-address"
                value={updateAddress}
                onChange={(e) => setUpdateAddress(e.target.value)}
                placeholder="Enter the correct address..."
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAddress}>
              Update Directory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};