
export interface BloomReport {
  id: string;
  location_id: string;
  user_id: string;
  facebook_post_url: string;
  facebook_post_id?: string;
  title: string;
  description?: string;
  images: string[];
  flower_types: string[];
  likes_count: number;
  post_date: string;
  created_at: string;
  updated_at: string;
  
  // Joined data from related tables
  location: {
    id: string;
    name: string;
    description?: string;
    latitude: number;
    longitude: number;
    intensity: number;
  };
  user: {
    id: string;
    facebook_id: string;
    facebook_username: string;
    display_name: string;
    profile_photo_url?: string;
  };
}

export interface Location {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  intensity: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  facebook_id: string;
  facebook_username: string;
  display_name: string;
  profile_photo_url?: string;
  created_at: string;
  updated_at: string;
}
