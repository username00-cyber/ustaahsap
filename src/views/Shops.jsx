import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Store, Star, Box, User, ShoppingCart } from 'lucide-react';

const Shops = () => {
  const { users } = useAppContext();
  const shops = users.filter(u => u.role === 'dukkan');
  const masters = users.filter(u => u.role === 'usta');

  return (
    <div className="container section">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <Store size={48} style={{ color: 'var(--primary-color)', marginBottom: '1rem' }} />
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Mekanlar & Dükkanlar</h1>
        <p className="text-muted">Ahşap, parke ve lambri ürünlerinizi satın alın, yetkili ustalarla çalışın.</p>
      </div>

      {shops.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <p className="text-muted">Henüz kayıtlı mağaza bulunmuyor.</p>
        </div>
      ) : (
        <div className="grid">
          {shops.map(shop => {
            const shopMasters = masters.filter(m => m.shopId === shop.id);
            return (
              <div className="card card-glow" key={shop.id} style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Shop Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: 'var(--radius-md)',
                      background: 'var(--gradient-primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Store size={24} color="white" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem' }}>{shop.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--success)' }}>
                        <Star size={12} fill="currentColor" /> {shop.rating} puan
                      </div>
                    </div>
                  </div>
                </div>

                {/* Products Preview */}
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Box size={14} /> Ürünler ({shop.products?.length || 0})
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {shop.products?.slice(0, 3).map(prod => (
                      <span key={prod.id} className="badge badge-open" style={{ fontSize: '0.7rem' }}>{prod.name}</span>
                    ))}
                    {(shop.products?.length || 0) > 3 && (
                      <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                        +{shop.products.length - 3} daha
                      </span>
                    )}
                    {(!shop.products || shop.products.length === 0) && (
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>Ürün henüz eklenmemiş</span>
                    )}
                  </div>
                </div>

                {/* Masters */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <User size={14} /> Bağlı Ustalar ({shopMasters.length})
                  </h4>
                  {shopMasters.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      {shopMasters.map(m => (
                        <Link to={`/usta/${m.id}`} key={m.id} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          fontSize: '0.8rem', padding: '0.375rem 0.625rem',
                          background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)'
                        }}>
                          <span style={{ color: 'var(--text-heading)' }}>{m.name}</span>
                          <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Star size={10} fill="currentColor" /> {m.rating}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Henüz kayıtlı usta yok.</p>
                  )}
                </div>

                <Link to={`/dukkan/${shop.id}`} className="btn btn-primary btn-block" style={{ marginTop: 'auto' }}>
                  <ShoppingCart size={16} /> Mağazayı Gez & Alışveriş Yap
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Shops;
