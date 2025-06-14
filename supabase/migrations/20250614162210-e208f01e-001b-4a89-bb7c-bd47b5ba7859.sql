
-- Create table for flower likes/dislikes at specific locations
CREATE TABLE public.flower_location_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flower_id UUID NOT NULL REFERENCES public.flowers(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  user_ip TEXT NOT NULL, -- Using IP for anonymous reactions
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(flower_id, location_id, user_ip) -- One reaction per flower per location per user
);

-- Add bloom dates to flowers table
ALTER TABLE public.flowers 
ADD COLUMN bloom_start_month INTEGER CHECK (bloom_start_month >= 1 AND bloom_start_month <= 12),
ADD COLUMN bloom_end_month INTEGER CHECK (bloom_end_month >= 1 AND bloom_end_month <= 12),
ADD COLUMN bloom_start_day INTEGER CHECK (bloom_start_day >= 1 AND bloom_start_day <= 31),
ADD COLUMN bloom_end_day INTEGER CHECK (bloom_end_day >= 1 AND bloom_end_day <= 31);

-- Enable RLS on the new table
ALTER TABLE public.flower_location_reactions ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read reactions (for calculating totals)
CREATE POLICY "Anyone can view flower reactions" 
  ON public.flower_location_reactions 
  FOR SELECT 
  TO public
  USING (true);

-- Allow anyone to insert reactions (anonymous voting)
CREATE POLICY "Anyone can add flower reactions" 
  ON public.flower_location_reactions 
  FOR INSERT 
  TO public
  WITH CHECK (true);

-- Allow users to update their own reactions
CREATE POLICY "Users can update their own reactions" 
  ON public.flower_location_reactions 
  FOR UPDATE 
  TO public
  USING (true);

-- Create function to calculate flower intensity based on multiple factors
CREATE OR REPLACE FUNCTION calculate_flower_intensity(p_flower_id UUID, p_location_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  report_count INTEGER;
  facebook_likes INTEGER;
  website_likes INTEGER;
  website_dislikes INTEGER;
  total_intensity NUMERIC;
BEGIN
  -- Count reports for this flower at this location
  SELECT COUNT(*) INTO report_count
  FROM public.bloom_reports br
  WHERE br.location_id = p_location_id
  AND p_flower_id::TEXT = ANY(br.flower_types);
  
  -- Sum Facebook likes from reports
  SELECT COALESCE(SUM(br.likes_count), 0) INTO facebook_likes
  FROM public.bloom_reports br
  WHERE br.location_id = p_location_id
  AND p_flower_id::TEXT = ANY(br.flower_types);
  
  -- Count website likes for this flower at this location
  SELECT COUNT(*) INTO website_likes
  FROM public.flower_location_reactions flr
  WHERE flr.flower_id = p_flower_id 
  AND flr.location_id = p_location_id 
  AND flr.reaction_type = 'like';
  
  -- Count website dislikes
  SELECT COUNT(*) INTO website_dislikes
  FROM public.flower_location_reactions flr
  WHERE flr.flower_id = p_flower_id 
  AND flr.location_id = p_location_id 
  AND flr.reaction_type = 'dislike';
  
  -- Calculate weighted intensity (reports count more, then facebook likes, then website reactions)
  total_intensity := 
    (report_count * 0.5) + 
    (facebook_likes * 0.3) + 
    (website_likes * 0.2) - 
    (website_dislikes * 0.1);
    
  -- Normalize to 0-1 scale (cap at reasonable maximum)
  total_intensity := LEAST(total_intensity / 10.0, 1.0);
  total_intensity := GREATEST(total_intensity, 0.0);
  
  RETURN total_intensity;
END;
$$ LANGUAGE plpgsql;

-- Update the existing trigger function to use the new calculation
CREATE OR REPLACE FUNCTION public.update_location_intensity()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  flower_record RECORD;
  avg_intensity NUMERIC := 0.0;
  flower_count INTEGER := 0;
BEGIN
  -- Calculate average intensity across all flowers at this location
  FOR flower_record IN 
    SELECT DISTINCT fpl.flower_id 
    FROM public.flowers_per_location fpl 
    WHERE fpl.location_id = COALESCE(NEW.location_id, OLD.location_id)
  LOOP
    avg_intensity := avg_intensity + calculate_flower_intensity(flower_record.flower_id, COALESCE(NEW.location_id, OLD.location_id));
    flower_count := flower_count + 1;
  END LOOP;
  
  IF flower_count > 0 THEN
    avg_intensity := avg_intensity / flower_count;
  END IF;
  
  -- Update location intensity
  UPDATE public.locations 
  SET intensity = avg_intensity,
      updated_at = now()
  WHERE id = COALESCE(NEW.location_id, OLD.location_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for flower reactions to update intensities
CREATE OR REPLACE FUNCTION update_flower_intensity_on_reaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the flowers_per_location intensity
  UPDATE public.flowers_per_location
  SET intensity = calculate_flower_intensity(
    COALESCE(NEW.flower_id, OLD.flower_id), 
    COALESCE(NEW.location_id, OLD.location_id)
  ),
  updated_at = now()
  WHERE flower_id = COALESCE(NEW.flower_id, OLD.flower_id)
  AND location_id = COALESCE(NEW.location_id, OLD.location_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_flower_intensity_on_reaction
  AFTER INSERT OR UPDATE OR DELETE ON public.flower_location_reactions
  FOR EACH ROW EXECUTE FUNCTION update_flower_intensity_on_reaction();
