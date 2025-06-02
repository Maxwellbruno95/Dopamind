/*
  # Update schema for Dopamind app

  1. Changes
    - Add duration and type to focus_sessions
    - Add soundscape tracking
    - Add streak tracking
    - Add analytics

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies
*/

-- Update focus_sessions table
ALTER TABLE public.focus_sessions
ADD COLUMN IF NOT EXISTS duration INTEGER NOT NULL DEFAULT 25,
ADD COLUMN IF NOT EXISTS session_type TEXT NOT NULL DEFAULT 'focus',
ADD COLUMN IF NOT EXISTS soundscape TEXT,
ADD COLUMN IF NOT EXISTS completed BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Create streaks table
CREATE TABLE IF NOT EXISTS public.streaks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_session_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own streaks"
  ON public.streaks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks"
  ON public.streaks
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks"
  ON public.streaks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create analytics table
CREATE TABLE IF NOT EXISTS public.analytics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analytics"
  ON public.analytics
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics"
  ON public.analytics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add trigger for streaks
CREATE TRIGGER handle_streaks_updated_at
  BEFORE UPDATE ON public.streaks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to calculate streak
CREATE OR REPLACE FUNCTION calculate_streak(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  last_session_date DATE;
  current_streak INTEGER := 0;
BEGIN
  -- Get the last session date
  SELECT DATE(completed_at)
  INTO last_session_date
  FROM public.focus_sessions
  WHERE user_id = user_uuid AND completed = true
  ORDER BY completed_at DESC
  LIMIT 1;

  -- If no sessions or last session older than yesterday, reset streak
  IF last_session_date IS NULL OR last_session_date < CURRENT_DATE - INTERVAL '1 day' THEN
    RETURN 0;
  END IF;

  -- Calculate current streak
  WITH consecutive_days AS (
    SELECT 
      DATE(completed_at) as session_date,
      ROW_NUMBER() OVER (ORDER BY DATE(completed_at) DESC) as row_num
    FROM (
      SELECT DISTINCT DATE(completed_at) as completed_at
      FROM public.focus_sessions
      WHERE user_id = user_uuid AND completed = true
      AND completed_at >= CURRENT_DATE - INTERVAL '30 days'
    ) distinct_dates
  )
  SELECT COUNT(*)
  INTO current_streak
  FROM consecutive_days
  WHERE session_date >= CURRENT_DATE - (row_num - 1);

  RETURN current_streak;
END;
$$ LANGUAGE plpgsql;