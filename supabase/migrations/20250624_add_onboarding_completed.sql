
-- Add onboarding_completed column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Update existing users to have onboarding completed (optional - can be set to false if you want all existing users to see onboarding)
-- UPDATE public.profiles SET onboarding_completed = true WHERE onboarding_completed IS NULL;
