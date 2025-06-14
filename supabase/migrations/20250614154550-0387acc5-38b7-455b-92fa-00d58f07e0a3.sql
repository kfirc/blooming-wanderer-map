
-- Insert sample users
INSERT INTO public.users (facebook_id, facebook_username, display_name, profile_photo_url) VALUES
('123456789', 'sarahbloom', 'שרה כהן', 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face'),
('987654321', 'danflowers', 'דן לוי', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'),
('456789123', 'mayabloom', 'מיה אברהם', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'),
('789123456', 'tomernature', 'תומר דוד', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face');

-- Insert sample locations across Israel
INSERT INTO public.locations (name, description, latitude, longitude, intensity) VALUES
('גן סאקר, ירושלים', 'פארק מרכזי בירושלים עם פריחה עשירה', 31.7683, 35.2137, 0.8),
('פארק הירקון, תל אביב', 'פארק גדול לאורך נהר הירקון', 32.1133, 34.8072, 0.6),
('גן לאומי כרמל, חיפה', 'יער כרמל עם מגוון פרחי בר', 32.7357, 35.0818, 0.9),
('שמורת עין גדי', 'נחל עין גדי עם צמחייה מדברית', 31.4619, 35.3897, 0.4),
('רמת הגולן', 'מרחבי הגולן עם פריחת אביב מרהיבה', 33.1208, 35.7725, 0.7),
('עמק יזרעאל', 'עמק חקלאי עם פריחת פרחי בר', 32.6181, 35.3069, 0.5);

-- Insert sample bloom reports
INSERT INTO public.bloom_reports (
  location_id, 
  user_id, 
  facebook_post_url, 
  facebook_post_id,
  title, 
  description, 
  images, 
  flower_types, 
  likes_count, 
  post_date
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
