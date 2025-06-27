
-- Add cv_id column to job_applications_tracking table
ALTER TABLE public.job_applications_tracking 
ADD COLUMN cv_id UUID REFERENCES public.cvs(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX idx_job_applications_tracking_cv_id ON public.job_applications_tracking(cv_id);
