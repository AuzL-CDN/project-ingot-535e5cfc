export type HardwareType = 'desktop' | 'laptop' | 'server' | 'network' | 'storage' | 'mobile' | 'other';

export interface HardwareItem {
  id: string;
  type: HardwareType;
  manufacturer: string;
  model: string;
  serialNumber: string;
  operatingSystem?: string;
  processor?: string;
  ram?: string;
  storage?: string;
  assignedTo?: string;
  securityFeatures: string[];
  notes?: string;
  addedAt: Date;
}

export interface HardwareData {
  items: HardwareItem[];
}
