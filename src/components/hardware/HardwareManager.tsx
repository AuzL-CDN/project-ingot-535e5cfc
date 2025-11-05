import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import type { HardwareItem, HardwareType, HardwareData } from '@/types/hardware';

interface HardwareManagerProps {
  data: HardwareData;
  onUpdate: (data: HardwareData) => void;
}

export const HardwareManager = ({ data, onUpdate }: HardwareManagerProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<HardwareItem>>({
    type: 'desktop',
    securityFeatures: []
  });

  const handleSubmit = () => {
    if (!formData.manufacturer || !formData.model || !formData.serialNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newItem: HardwareItem = {
      id: editingId || crypto.randomUUID(),
      type: formData.type as HardwareType,
      manufacturer: formData.manufacturer,
      model: formData.model,
      serialNumber: formData.serialNumber,
      operatingSystem: formData.operatingSystem,
      processor: formData.processor,
      ram: formData.ram,
      storage: formData.storage,
      assignedTo: formData.assignedTo,
      securityFeatures: formData.securityFeatures || [],
      notes: formData.notes,
      addedAt: editingId ? (data.items.find(i => i.id === editingId)?.addedAt || new Date()) : new Date()
    };

    if (editingId) {
      onUpdate({
        items: data.items.map(item => item.id === editingId ? newItem : item)
      });
      toast.success('Hardware item updated');
    } else {
      onUpdate({
        items: [...data.items, newItem]
      });
      toast.success('Hardware item added');
    }

    resetForm();
  };

  const handleEdit = (item: HardwareItem) => {
    setFormData(item);
    setEditingId(item.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    onUpdate({
      items: data.items.filter(item => item.id !== id)
    });
    toast.success('Hardware item deleted');
  };

  const resetForm = () => {
    setFormData({ type: 'desktop', securityFeatures: [] });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSecurityFeatureToggle = (feature: string) => {
    const current = formData.securityFeatures || [];
    setFormData({
      ...formData,
      securityFeatures: current.includes(feature)
        ? current.filter(f => f !== feature)
        : [...current, feature]
    });
  };

  const securityOptions = [
    'TPM',
    'Secure Boot',
    'BitLocker/Encryption',
    'Antivirus',
    'Firewall',
    'VPN',
    'Password Protection',
    'Biometric Auth'
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Hardware Inventory</CardTitle>
              <CardDescription>
                Track all hardware items involved in this inspection
              </CardDescription>
            </div>
            {!isAdding && (
              <Button onClick={() => setIsAdding(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Hardware
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isAdding && (
            <Card className="mb-6 border-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {editingId ? 'Edit Hardware Item' : 'Add New Hardware Item'}
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={resetForm}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value as HardwareType })}
                    >
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desktop">Desktop</SelectItem>
                        <SelectItem value="laptop">Laptop</SelectItem>
                        <SelectItem value="server">Server</SelectItem>
                        <SelectItem value="network">Network Device</SelectItem>
                        <SelectItem value="storage">Storage Device</SelectItem>
                        <SelectItem value="mobile">Mobile Device</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="manufacturer">Manufacturer *</Label>
                    <Input
                      id="manufacturer"
                      value={formData.manufacturer || ''}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                      placeholder="e.g., Dell, HP, Cisco"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">Model *</Label>
                    <Input
                      id="model"
                      value={formData.model || ''}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="e.g., Latitude 7420"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serialNumber">Serial Number *</Label>
                    <Input
                      id="serialNumber"
                      value={formData.serialNumber || ''}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                      placeholder="e.g., SN123456789"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="operatingSystem">Operating System</Label>
                    <Input
                      id="operatingSystem"
                      value={formData.operatingSystem || ''}
                      onChange={(e) => setFormData({ ...formData, operatingSystem: e.target.value })}
                      placeholder="e.g., Windows 11 Pro"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="processor">Processor</Label>
                    <Input
                      id="processor"
                      value={formData.processor || ''}
                      onChange={(e) => setFormData({ ...formData, processor: e.target.value })}
                      placeholder="e.g., Intel i7-11800H"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ram">RAM</Label>
                    <Input
                      id="ram"
                      value={formData.ram || ''}
                      onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                      placeholder="e.g., 16GB DDR4"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storage">Storage</Label>
                    <Input
                      id="storage"
                      value={formData.storage || ''}
                      onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                      placeholder="e.g., 512GB SSD"
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="assignedTo">Assigned To</Label>
                    <Input
                      id="assignedTo"
                      value={formData.assignedTo || ''}
                      onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                      placeholder="e.g., John Doe, IT Department"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Security Features</Label>
                  <div className="flex flex-wrap gap-2">
                    {securityOptions.map(option => (
                      <Badge
                        key={option}
                        variant={(formData.securityFeatures || []).includes(option) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => handleSecurityFeatureToggle(option)}
                      >
                        {option}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional information about this hardware..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit}>
                    <Save className="h-4 w-4 mr-2" />
                    {editingId ? 'Update' : 'Add'} Item
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {data.items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No hardware items added yet.</p>
              <p className="text-sm mt-2">Click "Add Hardware" to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.items.map(item => (
                <Card key={item.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <Badge>{item.type}</Badge>
                          <h4 className="font-semibold">
                            {item.manufacturer} {item.model}
                          </h4>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Serial Number:</span>{' '}
                            <span className="font-mono">{item.serialNumber}</span>
                          </div>
                          {item.operatingSystem && (
                            <div>
                              <span className="text-muted-foreground">OS:</span> {item.operatingSystem}
                            </div>
                          )}
                          {item.processor && (
                            <div>
                              <span className="text-muted-foreground">Processor:</span> {item.processor}
                            </div>
                          )}
                          {item.ram && (
                            <div>
                              <span className="text-muted-foreground">RAM:</span> {item.ram}
                            </div>
                          )}
                          {item.storage && (
                            <div>
                              <span className="text-muted-foreground">Storage:</span> {item.storage}
                            </div>
                          )}
                          {item.assignedTo && (
                            <div>
                              <span className="text-muted-foreground">Assigned To:</span> {item.assignedTo}
                            </div>
                          )}
                        </div>

                        {item.securityFeatures.length > 0 && (
                          <div>
                            <span className="text-sm text-muted-foreground">Security Features:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.securityFeatures.map(feature => (
                                <Badge key={feature} variant="secondary" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {item.notes && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Notes:</span> {item.notes}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
