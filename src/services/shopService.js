import { supabase } from '../lib/supabase';

export const shopService = {
  async getProducts(shopId) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getAllProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async addProduct(shopId, product) {
    const { data, error } = await supabase
      .from('products')
      .insert({
        shop_id: shopId,
        name: product.name,
        price: Number(product.price),
        unit: product.unit || 'm2',
        description: product.description,
        image: product.image || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=400',
        options: product.options || { colors: [], sizes: [] }
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};
