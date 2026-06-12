import { supabase } from '../lib/supabase';

// ─── Supabase Storage fotoğraf yükleme servisi ───────────────────────────────
export const storageService = {
  /**
   * Profil fotoğrafı yükle
   * bucket: 'avatars' (Supabase'de public bucket oluşturulmalı)
   */
  async uploadAvatar(userId, file) {
    const ext = file.name.split('.').pop();
    const path = `${userId}/avatar.${ext}`;

    // Varsa üstüne yaz
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Portfolio fotoğrafı yükle
   * bucket: 'portfolio' (Supabase'de public bucket oluşturulmalı)
   */
  async uploadPortfolioPhoto(userId, file) {
    const ext = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from('portfolio')
      .upload(fileName, file, { contentType: file.type });

    if (error) throw error;

    const { data } = supabase.storage.from('portfolio').getPublicUrl(fileName);
    return data.publicUrl;
  },

  /**
   * İlan görseli yükle
   */
  async uploadJobImage(jobId, file) {
    const ext = file.name.split('.').pop();
    const fileName = `${jobId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from('jobs')
      .upload(fileName, file, { contentType: file.type });

    if (error) throw error;

    const { data } = supabase.storage.from('jobs').getPublicUrl(fileName);
    return data.publicUrl;
  },

  /**
   * Dosyayı Storage'dan sil
   */
  async deleteFile(bucket, path) {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
  },
};
