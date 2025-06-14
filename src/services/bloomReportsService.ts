
import { supabase } from '@/integrations/supabase/client';
import { BloomReport, Location, User } from '@/types/BloomReport';

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
