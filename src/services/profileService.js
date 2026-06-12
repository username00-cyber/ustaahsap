import { supabase } from '../lib/supabase';

export const profileService = {
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  async getAllProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    if (error) throw error;
    return data || [];
  },

  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getPortfolio(userId) {
    const { data, error } = await supabase
      .from('portfolio')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async addPortfolioItem(userId, url, description) {
    const { data, error } = await supabase
      .from('portfolio')
      .insert({ user_id: userId, url, description })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getReviews(ustaId) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('usta_id', ustaId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async addReview(ustaId, authorName, rating, text) {
    const { data, error } = await supabase
      .from('reviews')
      .insert({ usta_id: ustaId, author_name: authorName, rating, text })
      .select()
      .single();
    if (error) throw error;

    // Rating ortalamasını güncelle
    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('usta_id', ustaId);

    if (allReviews && allReviews.length > 0) {
      const avg = allReviews.reduce((s, r) => s + Number(r.rating), 0) / allReviews.length;
      await supabase
        .from('profiles')
        .update({
          rating: Number(avg.toFixed(1)),
          completed_jobs: allReviews.length
        })
        .eq('id', ustaId);
    }

    return data;
  },

  async addBadge(ustaId, badge) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('badges')
      .eq('id', ustaId)
      .single();
    
    const current = profile?.badges || [];
    if (!current.includes(badge)) {
      await supabase
        .from('profiles')
        .update({ badges: [...current, badge] })
        .eq('id', ustaId);
    }
  }
};
