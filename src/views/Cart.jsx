import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ShoppingCart, Trash2, CreditCard, Wrench, CheckCircle, ArrowLeft } from 'lucide-react';

const Cart = () => {
  const { cart, users, currentUser, removeFromCart, completeCheckout, createJob } = useAppContext();

  const [wantsInstallation, setWantsInstallation] = useState(false);
  const [installBudget, setInstallBudget] = useState('');
  const [installArea, setInstallArea] = useState('');
  const [installFurnished, setInstallFurnished] = useState('boş');
  const [installSkirting, setInstallSkirting] = useState(false);
  const [installAddress, setInstallAddress] = useState('');
  const [installDesc, setInstallDesc] = useState('');
  const [ordered, setOrdered] = useState(false);

  const total = cart.reduce((acc, item) => acc + ((item.finalPrice || item.price) * item.quantity), 0);

  if (ordered) {
    return (
      <div className="container section" style={{ textAlign: 'center', maxWidth: '500px' }}>
        <CheckCircle size={72} style={{ color: 'var(--success)', marginBottom: '1.5rem' }} />
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Sipariş Tamamlandı!</h2>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>
          {wantsInstallation ? 'Siparişiniz ve montaj talebiniz başarıyla iletildi.' : 'Siparişiniz başarıyla alındı.'}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/shops" className="btn btn-primary">Alışverişe Devam Et</Link>
          {wantsInstallation && <Link to="/customer" className="btn btn-secondary">İlanlarımı Gör</Link>}
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container section" style={{ textAlign: 'center' }}>
        <ShoppingCart size={72} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: '1.5rem' }} />
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Sepetiniz Boş</h2>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>İhtiyacınız olan malzemeleri mağazalardan sepetinize ekleyebilirsiniz.</p>
        <Link to="/shops" className="btn btn-primary btn-glow">Mağazaları Gez</Link>
      </div>
    );
  }

  const handleCheckout = () => {
    if (wantsInstallation) {
      if (!installBudget || !installAddress || !installArea) {
        alert('Lütfen montaj için alan, adres ve bütçeyi doldurun.');
        return;
      }
      const targetShop = users.find(u => u.role === 'dukkan' && u.products?.find(p => cart.some(ci => ci.id === p.id)));
      const details = { area: installArea, isFurnished: installFurnished, hasSkirting: installSkirting, fullAddress: installAddress };
      const title = `Montaj Talebi: ${cart.map(c => c.name).join(', ').substring(0, 40)}`;
      const fullDesc = `${installDesc}\n\nSipariş:\n` + cart.map(c => `- ${c.quantity}x ${c.name}`).join('\n');
      createJob(title, fullDesc.trim(), installBudget, 'Belirtilen Adres', false, details, null, targetShop?.id);
    }
    completeCheckout();
    setOrdered(true);
  };

  return (
    <div className="container section">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/shops" className="btn btn-ghost"><ArrowLeft size={16} /></Link>
        <h1 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShoppingCart size={28} style={{ color: 'var(--primary-color)' }} /> Sepetim
          <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: '400' }}>({cart.length} ürün)</span>
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
        {/* Left: Items + Installation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Cart Items */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {cart.map((item, idx) => (
              <div key={item.cartItemId || item.id} style={{
                display: 'flex', padding: '1rem 1.25rem', gap: '1rem', alignItems: 'center',
                borderBottom: idx < cart.length - 1 ? '1px solid var(--border-color)' : 'none'
              }}>
                <img src={item.image} alt={item.name} style={{ width: '72px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>{item.name}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {item.selectedColor && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.selectedColor.hex }} /> {item.selectedColor.name}
                      </span>
                    )}
                    {item.selectedSize && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>📐 {item.selectedSize.name}</span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                    ₺{item.finalPrice || item.price} / {item.unit || 'Adet'}
                  </p>
                </div>
                <div style={{ textAlign: 'center', minWidth: '50px' }}>
                  <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{item.quantity}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{item.unit === 'm2' ? 'm²' : 'Adet'}</div>
                </div>
                <div style={{ fontWeight: '700', color: 'var(--success)', fontSize: '1.1rem', minWidth: '70px', textAlign: 'right' }}>
                  ₺{(item.finalPrice || item.price) * item.quantity}
                </div>
                <button
                  onClick={() => removeFromCart(item.cartItemId || item.id)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '0.375rem', borderRadius: '50%', display: 'flex', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-light)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Installation CTA */}
          {currentUser && (
            <div className="card" style={{ borderLeft: '3px solid var(--primary-color)', background: wantsInstallation ? 'var(--primary-light)' : 'var(--card-bg)' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wrench size={20} style={{ color: 'var(--primary-color)' }} /> Profesyonel Montaj / İşçilik
              </h3>
              <p className="text-muted text-sm" style={{ marginBottom: '1rem' }}>
                Ürünlerinizin yetkili mağaza ustası tarafından kurulması için montaj iş ilanı açın.
              </p>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>
                <input type="checkbox" checked={wantsInstallation} onChange={e => setWantsInstallation(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                Evet, montaj istiyorum
              </label>

              {wantsInstallation && (
                <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">İşçilik Bütçesi (₺)</label>
                      <input type="number" className="form-control" value={installBudget} onChange={e => setInstallBudget(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Alan (m²)</label>
                      <input type="number" className="form-control" placeholder="50" value={installArea} onChange={e => setInstallArea(e.target.value)} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Mekan</label>
                      <select className="form-control" value={installFurnished} onChange={e => setInstallFurnished(e.target.value)}>
                        <option value="boş">Boş Mekan</option>
                        <option value="eşyalı">Eşyalı Mekan</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.625rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={installSkirting} onChange={e => setInstallSkirting(e.target.checked)} />
                        Süpürgelik İşçiliği
                      </label>
                    </div>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Açık Adres</label>
                    <input type="text" className="form-control" placeholder="Mahalle, Sokak, Kapı No" value={installAddress} onChange={e => setInstallAddress(e.target.value)} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Ekstra Notlar (Opsiyonel)</label>
                    <textarea className="form-control" rows="2" value={installDesc} onChange={e => setInstallDesc(e.target.value)} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Order Summary */}
        <div className="card" style={{ position: 'sticky', top: '80px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Sipariş Özeti</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span className="text-muted">Ara Toplam:</span>
              <span style={{ fontWeight: '600' }}>₺{total.toLocaleString('tr-TR')}</span>
            </div>
            {wantsInstallation && installBudget && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span className="text-muted">İşçilik Bütçesi:</span>
                <span style={{ fontWeight: '600' }}>₺{Number(installBudget).toLocaleString('tr-TR')}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span className="text-muted">Kargo:</span>
              <span style={{ color: 'var(--success)', fontWeight: '600' }}>Ücretsiz</span>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.125rem' }}>
              <span style={{ fontWeight: '700' }}>Toplam:</span>
              <span style={{ fontWeight: '800', color: 'var(--primary-color)' }}>
                ₺{(total + (wantsInstallation ? Number(installBudget || 0) : 0)).toLocaleString('tr-TR')}
              </span>
            </div>
          </div>
          <button onClick={handleCheckout} className="btn btn-primary btn-block btn-glow" style={{ padding: '0.875rem', fontSize: '0.95rem' }}>
            <CreditCard size={18} /> Siparişi Tamamla {wantsInstallation ? '& İlan Aç' : ''}
          </button>
          <p className="text-muted text-sm" style={{ textAlign: 'center', marginTop: '0.75rem' }}>
            🔒 Güvenli ödeme
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cart;
