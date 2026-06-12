import { supabase } from '../lib/supabase';
import { profileService } from './profileService';

export const jobService = {
  async getAllJobs() {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createJob(userId, { title, description, budget, location, isVip, details, targetUstaId, targetShopId, category, area_m2, extra_options, estimated_price }) {
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        title,
        description,
        budget: Number(budget),
        location,
        is_vip: isVip || false,
        created_by: userId,
        details: details || {},
        selected_usta: targetUstaId || null,
        target_shop_id: targetShopId || null,
        status: targetUstaId ? 'Mağaza İstedi' : targetShopId ? 'Mağazaya Atandı' : 'Açık',
        category: category || 'Genel',
        area_m2: Number(area_m2) || 0,
        extra_options: extra_options || {},
        estimated_price: Number(estimated_price) || 0,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateJobStatus(jobId, status, extraFields = {}) {
    const { data, error } = await supabase
      .from('jobs')
      .update({ status, ...extraFields })
      .eq('id', jobId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async acceptOffer(jobId, offerId, ustaId) {
    // Kabul edilen teklifi güncelle
    await supabase
      .from('offers')
      .update({ status: 'Kabul Edildi' })
      .eq('id', offerId);

    // Diğer teklifleri reddet
    await supabase
      .from('offers')
      .update({ status: 'Reddedildi' })
      .eq('job_id', jobId)
      .neq('id', offerId);

    // İşi kapat ve ustayı ata
    await supabase
      .from('jobs')
      .update({ status: 'Kapalı', selected_usta: ustaId })
      .eq('id', jobId);
  },

  async completeJob(jobId, ustaId, scores, reviewText, authorName) {
    const finalScore = (Number(scores.speed) + Number(scores.quality)) / 2;
    
    await supabase
      .from('jobs')
      .update({ status: 'Tamamlandı', final_score: finalScore, review_text: reviewText })
      .eq('id', jobId);

    // Review ekle
    await profileService.addReview(ustaId, authorName, finalScore, reviewText);

    // Badge kontrolü
    const { data: profile } = await supabase
      .from('profiles')
      .select('completed_jobs, rating, badges')
      .eq('id', ustaId)
      .single();

    if (profile) {
      const newCount = (profile.completed_jobs || 0) + 1;
      let badges = [...(profile.badges || [])];
      if (newCount >= 10 && !badges.includes('🏅 Altın Usta')) badges.push('🏅 Altın Usta');
      if (newCount >= 5 && !badges.includes('⭐ 5+ İş')) badges.push('⭐ 5+ İş');
      if ((profile.rating || 0) >= 4.5 && !badges.includes('💎 Premium Usta')) badges.push('💎 Premium Usta');
      await supabase.from('profiles').update({ badges }).eq('id', ustaId);
    }
  },

  async respondToShopJob(jobId, accepted) {
    await supabase
      .from('jobs')
      .update({ status: accepted ? 'Kapalı' : 'Reddedildi' })
      .eq('id', jobId);
  },

  async forwardShopJobToUsta(jobId, ustaId) {
    await supabase
      .from('jobs')
      .update({ selected_usta: ustaId, status: 'Mağaza İstedi' })
      .eq('id', jobId);
  }
};
