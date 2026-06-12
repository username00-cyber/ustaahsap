import { supabase } from '../lib/supabase';

export const communityService = {
  async getPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async addPost(authorId, content, image) {
    const { data, error } = await supabase
      .from('posts')
      .insert({ author_id: authorId, content, image: image || null })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getLikedPostIds(userId) {
    const { data, error } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('user_id', userId);
    if (error) return [];
    return (data || []).map(r => r.post_id);
  },

  async toggleLike(postId, userId, isLiked) {
    if (isLiked) {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId);
      await supabase.from('posts').update({ likes_count: supabase.rpc('decrement', { x: 1 }) }).eq('id', postId);
      // Raw update
      const { data: post } = await supabase.from('posts').select('likes_count').eq('id', postId).single();
      await supabase.from('posts').update({ likes_count: Math.max(0, (post?.likes_count || 1) - 1) }).eq('id', postId);
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
      const { data: post } = await supabase.from('posts').select('likes_count').eq('id', postId).single();
      await supabase.from('posts').update({ likes_count: (post?.likes_count || 0) + 1 }).eq('id', postId);
    }
  },

  async getComments(postId) {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async getAllComments() {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async addComment(postId, authorId, authorName, text) {
    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: postId, author_id: authorId, author_name: authorName, text })
      .select()
      .single();
    if (error) throw error;

    // Yorum sayısını güncelle
    const { data: post } = await supabase.from('posts').select('comments_count').eq('id', postId).single();
    await supabase.from('posts').update({ comments_count: (post?.comments_count || 0) + 1 }).eq('id', postId);

    return data;
  },

  // FRIENDS
  async getFriends(userId) {
    const { data, error } = await supabase
      .from('friends')
      .select('friend_id')
      .eq('user_id', userId);
    if (error) return [];
    return (data || []).map(r => r.friend_id);
  },

  async getFriendRequests(userId) {
    const { data, error } = await supabase
      .from('friend_requests')
      .select('from_id')
      .eq('to_id', userId);
    if (error) return [];
    return (data || []).map(r => r.from_id);
  },

  async sendFriendRequest(fromId, toId) {
    const { error } = await supabase
      .from('friend_requests')
      .insert({ from_id: fromId, to_id: toId });
    if (error && !error.message.includes('unique')) throw error;
  },

  async acceptFriendRequest(fromId, toId) {
    // İsteği sil
    await supabase.from('friend_requests').delete().eq('from_id', fromId).eq('to_id', toId);
    // İki yönlü arkadaşlık ekle
    await supabase.from('friends').insert([
      { user_id: fromId, friend_id: toId },
      { user_id: toId, friend_id: fromId }
    ]);
  },

  async rejectFriendRequest(fromId, toId) {
    await supabase.from('friend_requests').delete().eq('from_id', fromId).eq('to_id', toId);
  }
};
