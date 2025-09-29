-- Remove the overly permissive public read policy
DROP POLICY IF EXISTS "Organizations are publicly readable" ON public.organizations;

-- Create a new policy that restricts access to authenticated users only
CREATE POLICY "Authenticated users can view organizations" 
ON public.organizations 
FOR SELECT 
TO authenticated 
USING (true);

-- Also add policies for admins to manage organization data
CREATE POLICY "Admins can insert organizations" 
ON public.organizations 
FOR INSERT 
TO authenticated 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update organizations" 
ON public.organizations 
FOR UPDATE 
TO authenticated 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete organizations" 
ON public.organizations 
FOR DELETE 
TO authenticated 
USING (has_role(auth.uid(), 'admin'::app_role));