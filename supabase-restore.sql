-- ============================================
-- Bloom IL - Full Database Restoration Script
-- Extracted from backup: db_cluster-31-08-2025
-- ============================================

-- =====================
-- 1. CREATE TABLES
-- =====================

-- Locations table
CREATE TABLE public.locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  intensity DECIMAL(3, 2) NOT NULL DEFAULT 0.0 CHECK (intensity >= 0.0 AND intensity <= 1.0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  waze_url TEXT
);

-- Users table
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facebook_id TEXT UNIQUE NOT NULL,
  facebook_username TEXT NOT NULL,
  display_name TEXT NOT NULL,
  profile_photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bloom reports table
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
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  flower_ids uuid[],
  CONSTRAINT bloom_reports_facebook_post_url_unique UNIQUE (facebook_post_url)
);

-- Flowers table
CREATE TABLE public.flowers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon_url TEXT,
  description TEXT,
  bloom_season TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  bloom_start_month INTEGER CHECK (bloom_start_month >= 1 AND bloom_start_month <= 12),
  bloom_end_month INTEGER CHECK (bloom_end_month >= 1 AND bloom_end_month <= 12),
  bloom_start_day INTEGER CHECK (bloom_start_day >= 1 AND bloom_start_day <= 31),
  bloom_end_day INTEGER CHECK (bloom_end_day >= 1 AND bloom_end_day <= 31)
);

-- Flowers per location table
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

-- Flower location reactions table
CREATE TABLE public.flower_location_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flower_id UUID NOT NULL REFERENCES public.flowers(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  user_ip TEXT NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(flower_id, location_id, user_ip)
);

-- Profiles table
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  facebook_id text,
  facebook_username text,
  display_name text,
  profile_photo_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- =====================
-- 2. INDEXES
-- =====================

CREATE INDEX idx_bloom_reports_location_id ON public.bloom_reports(location_id);
CREATE INDEX idx_bloom_reports_user_id ON public.bloom_reports(user_id);
CREATE INDEX idx_bloom_reports_post_date ON public.bloom_reports(post_date DESC);
CREATE INDEX idx_locations_coordinates ON public.locations(latitude, longitude);
CREATE INDEX idx_users_facebook_id ON public.users(facebook_id);
CREATE INDEX idx_flowers_per_location_location_id ON public.flowers_per_location(location_id);
CREATE INDEX idx_flowers_per_location_flower_id ON public.flowers_per_location(flower_id);
CREATE INDEX idx_flowers_name ON public.flowers(name);

-- =====================
-- 3. FUNCTIONS
-- =====================

-- Calculate flower intensity based on multiple factors
CREATE OR REPLACE FUNCTION calculate_flower_intensity(p_flower_id UUID, p_location_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  report_count INTEGER;
  facebook_likes INTEGER;
  website_likes INTEGER;
  website_dislikes INTEGER;
  total_intensity NUMERIC;
BEGIN
  SELECT COUNT(*) INTO report_count
  FROM public.bloom_reports br
  WHERE br.location_id = p_location_id
  AND p_flower_id::TEXT = ANY(br.flower_types);

  SELECT COALESCE(SUM(br.likes_count), 0) INTO facebook_likes
  FROM public.bloom_reports br
  WHERE br.location_id = p_location_id
  AND p_flower_id::TEXT = ANY(br.flower_types);

  SELECT COUNT(*) INTO website_likes
  FROM public.flower_location_reactions flr
  WHERE flr.flower_id = p_flower_id
  AND flr.location_id = p_location_id
  AND flr.reaction_type = 'like';

  SELECT COUNT(*) INTO website_dislikes
  FROM public.flower_location_reactions flr
  WHERE flr.flower_id = p_flower_id
  AND flr.location_id = p_location_id
  AND flr.reaction_type = 'dislike';

  total_intensity :=
    (report_count * 0.5) +
    (facebook_likes * 0.3) +
    (website_likes * 0.2) -
    (website_dislikes * 0.1);

  total_intensity := LEAST(total_intensity / 10.0, 1.0);
  total_intensity := GREATEST(total_intensity, 0.0);

  RETURN total_intensity;
END;
$$ LANGUAGE plpgsql;

-- Update location intensity trigger function
CREATE OR REPLACE FUNCTION public.update_location_intensity()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  flower_record RECORD;
  avg_intensity NUMERIC := 0.0;
  flower_count INTEGER := 0;
BEGIN
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

  UPDATE public.locations
  SET intensity = avg_intensity,
      updated_at = now()
  WHERE id = COALESCE(NEW.location_id, OLD.location_id);

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Update flower intensity on reaction
CREATE OR REPLACE FUNCTION update_flower_intensity_on_reaction()
RETURNS TRIGGER AS $$
BEGIN
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

-- Handle new user registration (auto-create profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    facebook_id,
    facebook_username,
    display_name,
    profile_photo_url
  )
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'provider_id',
    new.raw_user_meta_data ->> 'user_name',
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN new;
END;
$$;

-- =====================
-- 4. TRIGGERS
-- =====================

CREATE TRIGGER trigger_update_location_intensity
  AFTER INSERT OR UPDATE OR DELETE ON public.bloom_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_location_intensity();

CREATE TRIGGER trigger_update_location_intensity_from_flowers
  AFTER INSERT OR UPDATE OR DELETE ON public.flowers_per_location
  FOR EACH ROW
  EXECUTE FUNCTION update_location_intensity();

CREATE TRIGGER trigger_update_flower_intensity_on_reaction
  AFTER INSERT OR UPDATE OR DELETE ON public.flower_location_reactions
  FOR EACH ROW EXECUTE FUNCTION update_flower_intensity_on_reaction();

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================
-- 5. ROW LEVEL SECURITY
-- =====================

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bloom_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flowers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flowers_per_location ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flower_location_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Anyone can view locations" ON public.locations FOR SELECT USING (true);
CREATE POLICY "Anyone can view users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Anyone can view bloom reports" ON public.bloom_reports FOR SELECT USING (true);
CREATE POLICY "Anyone can view flowers" ON public.flowers FOR SELECT USING (true);
CREATE POLICY "Anyone can view flowers per location" ON public.flowers_per_location FOR SELECT USING (true);
CREATE POLICY "Anyone can view flower reactions" ON public.flower_location_reactions FOR SELECT USING (true);

-- Authenticated user policies
CREATE POLICY "Authenticated users can manage locations" ON public.locations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create reports" ON public.bloom_reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own reports" ON public.bloom_reports FOR UPDATE USING (user_id IN (SELECT id FROM public.users WHERE facebook_id = auth.uid()::text));
CREATE POLICY "Users can manage their own profile" ON public.users FOR ALL USING (auth.uid()::text = facebook_id OR auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage flowers" ON public.flowers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage flowers per location" ON public.flowers_per_location FOR ALL USING (auth.role() = 'authenticated');

-- Reaction policies (anonymous)
CREATE POLICY "Anyone can add flower reactions" ON public.flower_location_reactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own reactions" ON public.flower_location_reactions FOR UPDATE USING (true);

-- Profile policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================
-- 6. SEED DATA
-- =====================

-- Users
INSERT INTO public.users (facebook_id, facebook_username, display_name, profile_photo_url) VALUES
('123456789', 'sarahbloom', 'שרה כהן', 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face'),
('987654321', 'danflowers', 'דן לוי', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'),
('456789123', 'mayabloom', 'מיה אברהם', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'),
('789123456', 'tomernature', 'תומר דוד', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face');

-- Locations
INSERT INTO public.locations (name, description, latitude, longitude, intensity) VALUES
('גן סאקר, ירושלים', 'פארק מרכזי בירושלים עם פריחה עשירה', 31.7683, 35.2137, 0.8),
('פארק הירקון, תל אביב', 'פארק גדול לאורך נהר הירקון', 32.1133, 34.8072, 0.6),
('גן לאומי כרמל, חיפה', 'יער כרמל עם מגוון פרחי בר', 32.7357, 35.0818, 0.9),
('שמורת עין גדי', 'נחל עין גדי עם צמחייה מדברית', 31.4619, 35.3897, 0.4),
('רמת הגולן', 'מרחבי הגולן עם פריחת אביב מרהיבה', 33.1208, 35.7725, 0.7),
('עמק יזרעאל', 'עמק חקלאי עם פריחת פרחי בר', 32.6181, 35.3069, 0.5);

-- Flowers
INSERT INTO public.flowers (name, icon_url, description, bloom_season) VALUES
('שקדיות', 'https://images.unsplash.com/photo-1521543662143-3896140fe5b8?w=50&h=50&fit=crop', 'פרחי שקד ורודים עדינים', 'חורף-אביב'),
('כלניות', 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=50&h=50&fit=crop', 'פרחים אדומים עזים', 'אביב'),
('דודאים', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=50&h=50&fit=crop', 'פרחי בר סגולים', 'אביב'),
('רקפות', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=50&h=50&fit=crop', 'פרחים אדומים קטנים', 'אביב-קיץ'),
('סחלבים', 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=50&h=50&fit=crop', 'פרחי יער עדינים', 'אביב'),
('אמיגדלוס', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=50&h=50&fit=crop', 'שקדי בר', 'חורף-אביב'),
('פרחי בר', 'https://images.unsplash.com/photo-1463288889890-a56b2853c40f?w=50&h=50&fit=crop', 'מגוון פרחי שדה', 'אביב-קיץ'),
('צבעונים', 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=50&h=50&fit=crop', 'פרחים צבעוניים', 'אביב');

-- Flowers per location
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

-- Bloom reports
INSERT INTO public.bloom_reports (
  location_id, user_id, facebook_post_url, facebook_post_id,
  title, description, images, flower_types, likes_count, post_date
) VALUES
(
  (SELECT id FROM public.locations WHERE name = 'גן סאקר, ירושלים'),
  (SELECT id FROM public.users WHERE facebook_username = 'sarahbloom'),
  'https://facebook.com/sarahbloom/posts/123',
  '123456_789012',
  'פריחה מדהימה בגן סאקר!',
  'הולכת בגן סאקר הבוקר וראיתי פריחה כל כך יפה של שקדיות ואמיגדלוס. הצבעים פשוט מרהיבים!',
  ARRAY['https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400&h=300&fit=crop'],
  ARRAY['שקדיות', 'אמיגדלוס', 'פרחי אביב'],
  45,
  NOW() - INTERVAL '2 days'
),
(
  (SELECT id FROM public.locations WHERE name = 'פארק הירקון, תל אביב'),
  (SELECT id FROM public.users WHERE facebook_username = 'danflowers'),
  'https://facebook.com/danflowers/posts/456',
  '456789_012345',
  'רוקדים עם הפרחים בהירקון',
  'יום מושלם לטיול בפארק הירקון. הכלניות והדודאים פרחו במלוא הדרם!',
  ARRAY['https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop'],
  ARRAY['כלניות', 'דודאים', 'פרחי שדה'],
  32,
  NOW() - INTERVAL '1 day'
),
(
  (SELECT id FROM public.locations WHERE name = 'גן לאומי כרמל, חיפה'),
  (SELECT id FROM public.users WHERE facebook_username = 'mayabloom'),
  'https://facebook.com/mayabloom/posts/789',
  '789012_345678',
  'כרמל בפריחה מלאה!',
  'הטיול בכרמל היום היה פשוט קסום. הרקפות והסחלבים פרחו והכל צבוע באדום ובסגול',
  ARRAY['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'],
  ARRAY['רקפות', 'סחלבים', 'פרחי יער'],
  67,
  NOW() - INTERVAL '3 hours'
),
(
  (SELECT id FROM public.locations WHERE name = 'רמת הגולן'),
  (SELECT id FROM public.users WHERE facebook_username = 'tomernature'),
  'https://facebook.com/tomernature/posts/101',
  '101112_131415',
  'גולן פורח במלוא הדרו!',
  'נסיעה ברמת הגולן חשפה נופים מדהימים של פריחת בר. הקפים פרחו בכל הצבעים',
  ARRAY['https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=300&fit=crop'],
  ARRAY['פרחי בר', 'קפים', 'צבעונים'],
  28,
  NOW() - INTERVAL '5 hours'
),
(
  (SELECT id FROM public.locations WHERE name = 'עמק יזרעאל'),
  (SELECT id FROM public.users WHERE facebook_username = 'sarahbloom'),
  'https://facebook.com/sarahbloom/posts/456',
  '456789_101112',
  'עמק יזרעאל כולו אדום!',
  'נסיעה בעמק יזרעאל הציגה שטיח אדום של כלניות שמשתרע עד האופק',
  ARRAY['https://images.unsplash.com/photo-1463288889890-a56b2853c40f?w=400&h=300&fit=crop'],
  ARRAY['כלניות', 'פרחי שדה'],
  51,
  NOW() - INTERVAL '1 hour'
);
