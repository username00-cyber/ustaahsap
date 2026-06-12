import { supabase } from '../lib/supabase';

export const messageService = {
  async getMessages(jobId, ustaId) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('job_id', jobId)
      .eq('usta_id', ustaId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async getAllMessages() {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async sendMessage(jobId, ustaId, senderId, text) {
    const { data, error } = await supabase
      .from('messages')
      .insert({ job_id: jobId, usta_id: ustaId, sender_id: senderId, text })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getDirectMessages(userId) {
    const { data, error } = await supabase
      .from('direct_messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async sendDirectMessage(senderId, receiverId, text) {
    const { data, error } = await supabase
      .from('direct_messages')
      .insert({ sender_id: senderId, receiver_id: receiverId, text })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Real-time subscription for messages
  subscribeToMessages(jobId, ustaId, callback) {
    return supabase
      .channel(`messages-${jobId}-${ustaId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `job_id=eq.${jobId}`
      }, callback)
      .subscribe();
  },

  // Real-time subscription for DMs
  subscribeToDMs(userId, callback) {
    return supabase
      .channel(`dms-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'direct_messages',
        filter: `receiver_id=eq.${userId}`
      }, callback)
      .subscribe();
  }
};
