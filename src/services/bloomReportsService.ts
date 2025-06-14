
import { supabase } from '@/integrations/supabase/client';
import { BloomReport, Location, User, Flower, FlowerPerLocation } from '@/types/BloomReport';

export const bloomReportsService = {
  // Fetch all bloom reports with location and user data
  async getAllReports(): Promise<BloomReport[]> {
    const { data, error } = await supabase
      .from('bloom_reports')
      .select(`
        *,
        location:locations(*),
        user:users(*)
      `)
      .order('post_date', { ascending: false });

    if (error) {
      console.error('Error fetching bloom reports:', error);
      throw error;
    }

    return data || [];
  },

  // Fetch recent reports (last 7 days)
  async getRecentReports(): Promise<BloomReport[]> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('bloom_reports')
      .select(`
        *,
        location:locations(*),
        user:users(*)
      `)
      .gte('post_date', oneWeekAgo.toISOString())
      .order('post_date', { ascending: false });

    if (error) {
      console.error('Error fetching recent bloom reports:', error);
      throw error;
    }

    return data || [];
  },

  // Fetch all locations
  async getLocations(): Promise<Location[]> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }

    return data || [];
  },

  // Fetch all flowers
  async getFlowers(): Promise<Flower[]> {
    const { data, error } = await supabase
      .from('flowers')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching flowers:', error);
      throw error;
    }

    return data || [];
  },

  // Fetch flowers for a specific location
  async getFlowersForLocation(locationId: string): Promise<FlowerPerLocation[]> {
    const { data, error } = await supabase
      .from('flowers_per_location')
      .select(`
        *,
        flower:flowers(*)
      `)
      .eq('location_id', locationId)
      .order('intensity', { ascending: false });

    if (error) {
      console.error('Error fetching flowers for location:', error);
      throw error;
    }

    return data || [];
  },

  // Add flower reaction (like/dislike)
  async addFlowerReaction(flowerId: string, locationId: string, reactionType: 'like' | 'dislike'): Promise<void> {
    // Get user's IP address (simplified approach)
    const userIp = await this.getUserIp();

    const { error } = await supabase
      .from('flower_location_reactions')
      .upsert({
        flower_id: flowerId,
        location_id: locationId,
        user_ip: userIp,
        reaction_type: reactionType
      }, {
        onConflict: 'flower_id,location_id,user_ip'
      });

    if (error) {
      console.error('Error adding flower reaction:', error);
      throw error;
    }
  },

  // Get flower reactions for a specific flower at a location
  async getFlowerReactions(flowerId: string, locationId: string): Promise<{likes: number, dislikes: number, userReaction?: 'like' | 'dislike'}> {
    const userIp = await this.getUserIp();

    // Get total likes and dislikes
    const { data: reactions, error } = await supabase
      .from('flower_location_reactions')
      .select('reaction_type, user_ip')
      .eq('flower_id', flowerId)
      .eq('location_id', locationId);

    if (error) {
      console.error('Error fetching flower reactions:', error);
      throw error;
    }

    const likes = reactions?.filter(r => r.reaction_type === 'like').length || 0;
    const dislikes = reactions?.filter(r => r.reaction_type === 'dislike').length || 0;
    const userReaction = reactions?.find(r => r.user_ip === userIp)?.reaction_type as 'like' | 'dislike' | undefined;

    return { likes, dislikes, userReaction };
  },

  // Helper function to get user IP (simplified)
  async getUserIp(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error getting user IP:', error);
      // Fallback to a random identifier stored in localStorage
      let userIdentifier = localStorage.getItem('user_identifier');
      if (!userIdentifier) {
        userIdentifier = Math.random().toString(36).substring(2, 15);
        localStorage.setItem('user_identifier', userIdentifier);
      }
      return userIdentifier;
    }
  },

  // Create a new location
  async createLocation(location: Omit<Location, 'id' | 'created_at' | 'updated_at'>): Promise<Location> {
    const { data, error } = await supabase
      .from('locations')
      .insert([location])
      .select()
      .single();

    if (error) {
      console.error('Error creating location:', error);
      throw error;
    }

    return data;
  },

  // Create a new user
  async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      throw error;
    }

    return data;
  },

  // Create a new bloom report
  async createReport(report: Omit<BloomReport, 'id' | 'created_at' | 'updated_at' | 'location' | 'user'>): Promise<BloomReport> {
    const { data, error } = await supabase
      .from('bloom_reports')
      .insert([report])
      .select(`
        *,
        location:locations(*),
        user:users(*)
      `)
      .single();

    if (error) {
      console.error('Error creating bloom report:', error);
      throw error;
    }

    return data;
  },

  // Update likes count for a report
  async updateLikesCount(reportId: string, likesCount: number): Promise<void> {
    const { error } = await supabase
      .from('bloom_reports')
      .update({ likes_count: likesCount })
      .eq('id', reportId);

    if (error) {
      console.error('Error updating likes count:', error);
      throw error;
    }
  }
};
