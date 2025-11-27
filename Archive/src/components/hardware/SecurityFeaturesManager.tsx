import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { SecurityFeatureDetail } from '@/types/hardware';
import { SECURITY_PRODUCTS, SECURITY_CATEGORIES } from '@/config/securityProducts';

interface SecurityFeaturesData {
  features: SecurityFeatureDetail[];
}

interface SecurityFeaturesManagerProps {
  data: SecurityFeaturesData;
  onUpdate: (data: SecurityFeaturesData) => void;
}

export const SecurityFeaturesManager = ({ data, onUpdate }: SecurityFeaturesManagerProps) => {
  const [editingFeatures, setEditingFeatures] = useState<SecurityFeatureDetail[]>(data.features || []);

  const addSecurityCategory = (category: string) => {
    const newFeature: SecurityFeatureDetail = {
      category,
      product: '',
      customProduct: undefined,
      version: undefined
    };
    setEditingFeatures([...editingFeatures, newFeature]);
  };

  const updateFeature = (index: number, updates: Partial<SecurityFeatureDetail>) => {
    const updated = [...editingFeatures];
    updated[index] = { ...updated[index], ...updates };
    setEditingFeatures(updated);
    onUpdate({ features: updated });
  };

  const removeFeature = (index: number) => {
    const updated = editingFeatures.filter((_, i) => i !== index);
    setEditingFeatures(updated);
    onUpdate({ features: updated });
    toast.success('Security feature removed');
  };

  const getSelectedCategories = () => {
    return editingFeatures.map(f => f.category);
  };

  const getAvailableCategories = () => {
    const selected = getSelectedCategories();
    return SECURITY_CATEGORIES.filter(cat => !selected.includes(cat));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Security Features</CardTitle>
          <CardDescription>
            Select and configure security features for this inspection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category Selection Buttons */}
          <div>
            <Label className="mb-3 block">Add Security Category</Label>
            <div className="flex flex-wrap gap-2">
              {getAvailableCategories().map(category => (
                <Button
                  key={category}
                  variant="outline"
                  size="sm"
                  onClick={() => addSecurityCategory(category)}
                >
                  + {category}
                </Button>
              ))}
            </div>
            {getAvailableCategories().length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                All security categories have been added
              </p>
            )}
          </div>

          {/* Selected Features Configuration */}
          {editingFeatures.length > 0 ? (
            <div className="space-y-4">
              <Label>Selected Security Features</Label>
              {editingFeatures.map((feature, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{feature.category}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeature(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Product *</Label>
                      <Select
                        value={feature.product}
                        onValueChange={(value) => updateFeature(index, { product: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product..." />
                        </SelectTrigger>
                        <SelectContent>
                          {SECURITY_PRODUCTS[feature.category as keyof typeof SECURITY_PRODUCTS]?.map(product => (
                            <SelectItem key={product} value={product}>
                              {product}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {feature.product === 'Other' && (
                      <div className="space-y-2">
                        <Label className="text-xs">Specify Product *</Label>
                        <Input
                          value={feature.customProduct || ''}
                          onChange={(e) => updateFeature(index, { customProduct: e.target.value })}
                          placeholder="Enter product name..."
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-xs">Version (Optional)</Label>
                      <Input
                        value={feature.version || ''}
                        onChange={(e) => updateFeature(index, { version: e.target.value })}
                        placeholder="e.g., 10.7.0, 2023.1"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No security features added yet.</p>
              <p className="text-sm mt-2">Click a category button above to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
