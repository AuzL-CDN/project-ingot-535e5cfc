-- Create organizations table for address lookup
CREATE TABLE public.organizations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    org_site_id TEXT NOT NULL UNIQUE,
    organization_name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (address lookup should be publicly available)
CREATE POLICY "Organizations are publicly readable" 
ON public.organizations 
FOR SELECT 
USING (true);

-- Create indexes for efficient searching
CREATE INDEX idx_organizations_name ON public.organizations USING gin(to_tsvector('english', organization_name));
CREATE INDEX idx_organizations_address ON public.organizations USING gin(to_tsvector('english', address));
CREATE INDEX idx_organizations_org_site_id ON public.organizations (org_site_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();