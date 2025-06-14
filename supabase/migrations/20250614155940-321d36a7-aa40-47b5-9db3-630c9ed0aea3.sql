
-- Create flowers table to store flower types information
CREATE TABLE public.flowers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon_url TEXT,
  description TEXT,
  bloom_season TEXT, -- e.g., "spring", "summer", "fall", "winter" or "spring-summer"
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create flowers_per_location table to connect locations with specific flowers and their intensities
CREATE TABLE public.flowers_per_location (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE NOT NULL,
  flower_id UUID REFERENCES public.flowers(id) ON DELETE CASCADE NOT NULL,
  intensity DECIMAL(3, 2) NOT NULL DEFAULT 0.0 CHECK (intensity >= 0.0 AND intensity <= 1.0),
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(location_id, flower_id)
);

-- Insert sample flowers
INSERT INTO public.flowers (name, icon_url, description, bloom_season) VALUES
('שקדיות', 'https://images.unsplash.com/photo-1521543662143-3896140fe5b8?w=50&h=50&fit=crop', 'פרחי שקד ורודים עדינים', 'חורף-אביב'),
('כלניות', 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=50&h=50&fit=crop', 'פרחים אדומים עזים', 'אביב'),
('דודאים', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=50&h=50&fit=crop', 'פרחי בר סגולים', 'אביב'),
('רקפות', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=50&h=50&fit=crop', 'פרחים אדומים קטנים', 'אביב-קיץ'),
('סחלבים', 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=50&h=50&fit=crop', 'פרחי יער עדינים', 'אביב'),
('אמיגדלוס', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=50&h=50&fit=crop', 'שקדי בר', 'חורף-אביב'),
('פרחי בר', 'https://images.unsplash.com/photo-1463288889890-a56b2853c40f?w=50&h=50&fit=crop', 'מגוון פרחי שדה', 'אביב-קיץ'),
('צבעונים', 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=50&h=50&fit=crop', 'פרחים צבעוניים', 'אביב');

-- Insert sample flowers per location based on existing data
INSERT INTO public.flowers_per_location (location_id, flower_id, intensity) 
SELECT 
  l.id as location_id,
  f.id as flower_id,
  CASE 
    WHEN l.name = 'גן סאקר, ירושלים' AND f.name IN ('שקדיות', 'אמיגדלוס') THEN 0.8
    WHEN l.name = 'פארק הירקון, תל אביב' AND f.name IN ('כלניות', 'דודאים') THEN 0.6
    WHEN l.name = 'גן לאומי כרמל, חיפה' AND f.name IN ('רקפות', 'סחלבים') THEN 0.9
    WHEN l.name = 'רמת הגולן' AND f.name IN ('פרחי בר', 'צבעונים') THEN 0.7
    WHEN l.name = 'עמק יזרעאל' AND f.name = 'כלניות' THEN 0.5
    WHEN l.name = 'שמורת עין גדי' AND f.name = 'פרחי בר' THEN 0.4
    ELSE NULL
  END as intensity
FROM public.locations l
CROSS JOIN public.flowers f
WHERE CASE 
    WHEN l.name = 'גן סאקר, ירושלים' AND f.name IN ('שקדיות', 'אמיגדלוס') THEN TRUE
    WHEN l.name = 'פארק הירקון, תל אביב' AND f.name IN ('כלניות', 'דודאים') THEN TRUE
    WHEN l.name = 'גן לאומי כרמל, חיפה' AND f.name IN ('רקפות', 'סחלבים') THEN TRUE
    WHEN l.name = 'רמת הגולן' AND f.name IN ('פרחי בר', 'צבעונים') THEN TRUE
    WHEN l.name = 'עמק יזרעאל' AND f.name = 'כלניות' THEN TRUE
    WHEN l.name = 'שמורת עין גדי' AND f.name = 'פרחי בר' THEN TRUE
    ELSE FALSE
  END;

-- Enable Row Level Security
ALTER TABLE public.flowers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flowers_per_location ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can view flowers" ON public.flowers FOR SELECT USING (true);
CREATE POLICY "Anyone can view flowers per location" ON public.flowers_per_location FOR SELECT USING (true);

-- Create policies for authenticated users to manage data
CREATE POLICY "Authenticated users can manage flowers" 
  ON public.flowers 
  FOR ALL 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage flowers per location" 
  ON public.flowers_per_location 
  FOR ALL 
  USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX idx_flowers_per_location_location_id ON public.flowers_per_location(location_id);
CREATE INDEX idx_flowers_per_location_flower_id ON public.flowers_per_location(flower_id);
CREATE INDEX idx_flowers_name ON public.flowers(name);

-- Update the existing trigger function to calculate location intensity based on flowers
CREATE OR REPLACE FUNCTION update_location_intensity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.locations 
  SET intensity = (
    SELECT COALESCE(AVG(intensity), 0.0)
    FROM public.flowers_per_location 
    WHERE location_id = COALESCE(NEW.location_id, OLD.location_id)
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.location_id, OLD.location_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update location intensity when flowers_per_location changes
CREATE TRIGGER trigger_update_location_intensity_from_flowers
  AFTER INSERT OR UPDATE OR DELETE ON public.flowers_per_location
  FOR EACH ROW
  EXECUTE FUNCTION update_location_intensity();
