import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Crown, CheckCircle, Shield, Star, CreditCard, Lock, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';

const VipSubscription = () => {
  const { currentUser, refreshData } = useAppContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  // Ödeme formu state
  const [cardNo, setCardNo] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  if (!currentUser) return <Navigate to="/" />;

  if (currentUser.isVip) {
    return (
      <div className="container section text-center" style={{ paddingTop: '5rem' }}>
        <Crown size={64} style={{ color: 'var(--warning)', marginBottom: '1rem' }} />
        <h2>Tebrikler, VIP Üyesiniz!</h2>
        <p className="text-muted">Ayrıcalıklı hizmetlerin tadını çıkarın.</p>
        <button className="btn btn-primary mt-4" onClick={() => navigate(-1)}>Geri Dön</button>
      </div>
    );
  }

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simüle edilmiş ödeme süreci (1.5 saniye)
    setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('users')
          .update({ isVip: true })
          .eq('id', currentUser.id);

        if (error) throw error;

        await refreshData?.();
        alert('Ödeme başarılı! Artık VIP üyesiniz.');
        navigate('/profile');
      } catch (err) {
        alert('Hata oluştu: ' + err.message);
      } finally {
        setLoading(false);
        setShowPayment(false);
      }
    }, 1500);
  };

  return (
    <div className="container section" style={{ maxWidth: '800px' }}>
      <div className="text-center" style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'var(--warning-light)', color: 'var(--warning)', marginBottom: '1rem' }}>
          <Crown size={40} />
        </div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>UstaAhşap <span style={{ color: 'var(--warning)' }}>VIP</span> Ayrıcalığı</h1>
        <p className="text-muted">Sadece en iyiler için özel olarak tasarlandı.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        
        {/* Avantajlar: Müşteri */}
        <div className="card" style={{ borderTop: '4px solid var(--secondary-color)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Star size={20} style={{ color: 'var(--secondary-color)' }} /> Müşteriler İçin
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <CheckCircle size={16} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '2px' }} />
              <span>İlanlarınız <b style={{ color: 'var(--warning)' }}>VIP</b> etiketiyle yayınlanır ve üst sıralarda yer alır.</span>
            </li>
            <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <CheckCircle size={16} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '2px' }} />
              <span>Sadece +4.0 puanlı ve deneyimli seçkin ustalar teklif verebilir.</span>
            </li>
            <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <CheckCircle size={16} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '2px' }} />
              <span>Platform komisyonlarında ekstra indirim fırsatları.</span>
            </li>
          </ul>
        </div>

        {/* Avantajlar: Usta */}
        <div className="card" style={{ borderTop: '4px solid var(--primary-color)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Zap size={20} style={{ color: 'var(--primary-color)' }} /> Ustalar İçin
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <CheckCircle size={16} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '2px' }} />
              <span>Yüksek bütçeli özel <b style={{ color: 'var(--warning)' }}>VIP</b> ilanlara teklif verme ayrıcalığı.</span>
            </li>
            <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <CheckCircle size={16} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '2px' }} />
              <span>Profilinizde "Seçkin VIP Usta" rozeti gösterilir.</span>
            </li>
            <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <CheckCircle size={16} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '2px' }} />
              <span>Müşteri aramalarında her zaman bir adım öne çıkarsınız.</span>
            </li>
          </ul>
        </div>
      </div>

      {!showPayment ? (
        <div className="card text-center" style={{ padding: '2rem', background: 'var(--gradient-primary)', color: 'white' }}>
          <h2 style={{ marginBottom: '0.5rem' }}>Hemen VIP Üye Ol</h2>
          <div style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem' }}>
            149<span style={{ fontSize: '1.5rem' }}>.99₺</span>
            <span style={{ fontSize: '1rem', fontWeight: '400', opacity: 0.8 }}> / aylık</span>
          </div>
          <p style={{ opacity: 0.9, marginBottom: '2rem' }}>İstediğiniz zaman iptal edebilirsiniz. Gizli ücret yok.</p>
          <button 
            className="btn" 
            style={{ background: 'white', color: 'var(--primary-color)', fontSize: '1.1rem', padding: '0.75rem 2rem', fontWeight: 'bold' }}
            onClick={() => setShowPayment(true)}
          >
            Ayrıcalıklara Katıl
          </button>
        </div>
      ) : (
        <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <CreditCard size={20} /> Güvenli Ödeme
          </h3>
          <form onSubmit={handlePayment}>
            <div className="form-group">
              <label className="form-label">Kart Numarası</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="4321 1234 5678 9012"
                maxLength={19}
                value={cardNo}
                onChange={e => setCardNo(e.target.value)}
                required 
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Son Kullanma (AA/YY)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="12/25"
                  maxLength={5}
                  value={expiry}
                  onChange={e => setExpiry(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">CVV</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="123"
                  maxLength={3}
                  value={cvv}
                  onChange={e => setCvv(e.target.value)}
                  required 
                />
              </div>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <Lock size={14} /> 256-bit SSL sertifikası ile korunmaktadır. Ödemeniz iyzico altyapısıyla gerçekleşir.
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowPayment(false)}>İptal</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
                {loading ? 'İşleniyor...' : '149.99 ₺ Öde ve Onayla'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default VipSubscription;
