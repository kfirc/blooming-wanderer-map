
-- Create locations table to group reports by geographic area
CREATE TABLE public.locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  intensity DECIMAL(3, 2) NOT NULL DEFAULT 0.0 CHECK (intensity >= 0.0 AND intensity <= 1.0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create users table for Facebook user data
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facebook_id TEXT UNIQUE NOT NULL,
  facebook_username TEXT NOT NULL,
  display_name TEXT NOT NULL,
  profile_photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bloom_reports table
CREATE TABLE public.bloom_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id UUID REFERENCES public.locations(id) NOT NULL,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  facebook_post_url TEXT NOT NULL,
  facebook_post_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  flower_types TEXT[] DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  post_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bloom_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (since this is a public bloom tracking app)
CREATE POLICY "Anyone can view locations" ON public.locations FOR SELECT USING (true);
CREATE POLICY "Anyone can view users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Anyone can view bloom reports" ON public.bloom_reports FOR SELECT USING (true);

-- Create policies for authenticated users to manage data
CREATE POLICY "Authenticated users can manage locations" 
  ON public.locations 
  FOR ALL 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage their own profile" 
  ON public.users 
  FOR ALL 
  USING (auth.uid()::text = facebook_id OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create reports" 
  ON public.bloom_reports 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own reports" 
  ON public.bloom_reports 
  FOR UPDATE 
  USING (user_id IN (SELECT id FROM public.users WHERE facebook_id = auth.uid()::text));

-- Create indexes for better performance
CREATE INDEX idx_bloom_reports_location_id ON public.bloom_reports(location_id);
CREATE INDEX idx_bloom_reports_user_id ON public.bloom_reports(user_id);
CREATE INDEX idx_bloom_reports_post_date ON public.bloom_reports(post_date DESC);
CREATE INDEX idx_locations_coordinates ON public.locations(latitude, longitude);
CREATE INDEX idx_users_facebook_id ON public.users(facebook_id);

-- Create function to update location intensity based on reports
CREATE OR REPLACE FUNCTION update_location_intensity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.locations 
  SET intensity = (
    SELECT COALESCE(AVG(likes_count::decimal / 100), 0.0)
    FROM public.bloom_reports 
    WHERE location_id = COALESCE(NEW.location_id, OLD.location_id)
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.location_id, OLD.location_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update location intensity
CREATE TRIGGER trigger_update_location_intensity
  AFTER INSERT OR UPDATE OR DELETE ON public.bloom_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_location_intensity();
