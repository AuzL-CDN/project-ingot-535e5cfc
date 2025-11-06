-- Create activities table
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_number TEXT NOT NULL,
  org_site_number TEXT NOT NULL,
  company_name TEXT NOT NULL,
  inspection_class TEXT NOT NULL CHECK (inspection_class IN ('1F', '1G', '19F', '19G')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on activities
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create activity_deadlines table
CREATE TABLE IF NOT EXISTS public.activity_deadlines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  deadline_type TEXT NOT NULL CHECK (deadline_type IN ('checklist', 'doc', 'corrective_measures')),
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  business_days_allocated INTEGER NOT NULL CHECK (business_days_allocated IN (20, 30)),
  status TEXT NOT NULL DEFAULT 'on_track' CHECK (status IN ('on_track', 'approaching', 'due', 'overdue')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(activity_id, deadline_type)
);

-- Enable RLS on activity_deadlines
ALTER TABLE public.activity_deadlines ENABLE ROW LEVEL SECURITY;

-- RLS Policies for activities
CREATE POLICY "Users can view their own activities"
  ON public.activities
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities"
  ON public.activities
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities"
  ON public.activities
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activities"
  ON public.activities
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for activity_deadlines
CREATE POLICY "Users can view their own activity deadlines"
  ON public.activity_deadlines
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.activities
      WHERE activities.id = activity_deadlines.activity_id
      AND activities.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own activity deadlines"
  ON public.activity_deadlines
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.activities
      WHERE activities.id = activity_deadlines.activity_id
      AND activities.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own activity deadlines"
  ON public.activity_deadlines
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.activities
      WHERE activities.id = activity_deadlines.activity_id
      AND activities.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all activity deadlines"
  ON public.activity_deadlines
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_activities_user_id ON public.activities(user_id);
CREATE INDEX idx_activities_is_completed ON public.activities(is_completed);
CREATE INDEX idx_activity_deadlines_activity_id ON public.activity_deadlines(activity_id);
CREATE INDEX idx_activity_deadlines_status ON public.activity_deadlines(status);

-- Create trigger for updating updated_at
CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON public.activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for activity_deadlines
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_deadlines;