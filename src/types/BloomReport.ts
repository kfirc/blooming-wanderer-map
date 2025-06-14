
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

export interface Flower {
  id: string;
  name: string;
  icon_url?: string;
  description?: string;
  bloom_season?: string;
  bloom_start_month?: number;
  bloom_end_month?: number;
  bloom_start_day?: number;
  bloom_end_day?: number;
  created_at: string;
  updated_at: string;
}

export interface FlowerPerLocation {
  id: string;
  location_id: string;
  flower_id: string;
  intensity: number;
  last_updated: string;
  created_at: string;
  updated_at: string;
  
  // Joined data
  flower: Flower;
}

export interface FlowerReaction {
  id: string;
  flower_id: string;
  location_id: string;
  user_ip: string;
  reaction_type: 'like' | 'dislike';
  created_at: string;
}
