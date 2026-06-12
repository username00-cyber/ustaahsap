import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Calculator, MapPin, Ruler, Sofa, Layers, Zap } from 'lucide-react';

const CreateJobModal = ({ onClose }) => {
  const { createJob } = useAppContext();
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('İstanbul');
  const [fullAddress, setFullAddress] = useState('');
  const [area, setArea] = useState('');
  const [isFurnished, setIsFurnished] = useState('boş');
  const [hasSkirting, setHasSkirting] = useState(false);
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [recommendedPrice, setRecommendedPrice] = useState(0);
  const [useSmartPrice, setUseSmartPrice] = useState(false);

  useEffect(() => {
    const m2 = Number(area);
    if (m2 > 0) {
      let price = m2 * 150;
      if (isFurnished === 'eşyalı') price *= 1.20;
      if (hasSkirting) price += m2 * 30;
      const final = Math.round(price);
      setRecommendedPrice(final);
      if (useSmartPrice && budget !== final.toString()) setBudget(final.toString());
    } else {
      setRecommendedPrice(0);
      if (useSmartPrice && budget !== '') setBudget('');
    }
  }, [area, isFurnished, hasSkirting, useSmartPrice]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const details = { area, isFurnished, hasSkirting, fullAddress };
    const isVip = Number(budget) >= 5000;
    createJob(title, description, budget, location, isVip, details);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.25rem' }}>📋 Yeni İş İlanı</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Temel Bilgiler */}
          <div className="form-group">
            <label className="form-label">İş Başlığı</label>
            <input type="text" className="form-control" placeholder="Örn: Salon parke döşeme" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Detaylı Açıklama</label>
            <textarea className="form-control" rows="3" placeholder="Yapılacak işi detaylıca anlatın..." value={description} onChange={e => setDescription(e.target.value)} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Şehir</label>
              <select className="form-control" value={location} onChange={e => setLocation(e.target.value)}>
                <option>İstanbul</option>
                <option>Ankara</option>
                <option>İzmir</option>
                <option>Bursa</option>
                <option>Merkez</option>
                <option>Artova</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Açık Adres</label>
              <input type="text" className="form-control" placeholder="Mahalle, Sokak No" value={fullAddress} onChange={e => setFullAddress(e.target.value)} required />
            </div>
          </div>

          {/* Akıllı Fiyat Hesaplayıcı */}
          <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Calculator size={16} style={{ color: 'var(--primary-color)' }} /> Akıllı Fiyat Hesaplayıcı
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={useSmartPrice} onChange={e => setUseSmartPrice(e.target.checked)} />
                Önerilen fiyatı kullan
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.7rem' }}>Alan (m²)</label>
                <input type="number" className="form-control" placeholder="50" value={area} onChange={e => setArea(e.target.value)} />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.7rem' }}>Mekan</label>
                <select className="form-control" value={isFurnished} onChange={e => setIsFurnished(e.target.value)}>
                  <option value="boş">Boş</option>
                  <option value="eşyalı">Eşyalı</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.625rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={hasSkirting} onChange={e => setHasSkirting(e.target.checked)} />
                  Süpürgelik
                </label>
              </div>
            </div>
            {recommendedPrice > 0 && (
              <div style={{ marginTop: '0.75rem', padding: '0.625rem', background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                <Zap size={14} style={{ color: 'var(--primary-color)', display: 'inline', marginRight: '0.25rem' }} />
                <span style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Önerilen Bütçe: ₺{recommendedPrice.toLocaleString('tr-TR')}</span>
                {Number(budget) >= 5000 && <span className="badge badge-vip" style={{ marginLeft: '0.5rem', fontSize: '0.6rem' }}>⭐ VIP İlan</span>}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Bütçe (₺)</label>
            <input type="number" className="form-control" placeholder="Örn: 5000" value={budget} onChange={e => setBudget(e.target.value)} required />
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-glow" style={{ padding: '0.75rem', fontSize: '0.95rem' }}>
            <Zap size={18} /> İlanı Yayınla
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateJobModal;
