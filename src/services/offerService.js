import { supabase } from '../lib/supabase';

export const offerService = {
  async getAllOffers() {
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createOffer(jobId, ustaId, ustaName, price) {
    const { data, error } = await supabase
      .from('offers')
      .insert({
        job_id: jobId,
        usta_id: ustaId,
        usta_name: ustaName,
        price: Number(price),
        status: 'Beklemede',
        negotiation_round: 1,
        negotiation_history: [],
        last_actor: 'usta',
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Karşı teklif gönder
  async counterOffer(offerId, newPrice, message, byRole) {
    // Mevcut teklifi çek
    const { data: existing } = await supabase
      .from('offers')
      .select('*')
      .eq('id', offerId)
      .single();

    if (!existing) throw new Error('Teklif bulunamadı');

    const currentRound = existing.negotiation_round || 1;
    const history = Array.isArray(existing.negotiation_history) ? existing.negotiation_history : [];

    // Geçmişe ekle
    const newHistory = [
      ...history,
      {
        by: byRole,
        price: newPrice,
        message: message || '',
        at: new Date().toISOString(),
        round: currentRound,
      },
    ];

    const { data, error } = await supabase
      .from('offers')
      .update({
        counter_price: Number(newPrice),
        counter_message: message || '',
        negotiation_round: currentRound + 1,
        negotiation_history: newHistory,
        last_actor: byRole,
        status: 'Pazarlıkta',
      })
      .eq('id', offerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Teklifi kabul et (job da kapanır)
  async acceptOffer(offerId, jobId, ustaId) {
    // Teklifi kabul edildi yap
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

    // İşi kapat
    await supabase
      .from('jobs')
      .update({ status: 'Kapalı', selected_usta: ustaId })
      .eq('id', jobId);
  },

  // Teklifi reddet
  async rejectOffer(offerId) {
    const { error } = await supabase
      .from('offers')
      .update({ status: 'Reddedildi' })
      .eq('id', offerId);
    if (error) throw error;
  },
};
