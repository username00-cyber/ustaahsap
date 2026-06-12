import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { DollarSign } from 'lucide-react';

const MakeOfferModal = ({ job, onClose }) => {
  const { createOffer } = useAppContext();
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = createOffer(job.id, price);
    if (success) {
      onClose();
    } else {
      setError('Bu işe zaten teklif verdiniz!');
    }
  };

  const diff = price && job.budget ? ((Number(price) - Number(job.budget)) / Number(job.budget) * 100).toFixed(0) : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.25rem' }}>💰 Teklif Ver</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {/* Job Summary */}
        <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', borderLeft: '3px solid var(--primary-color)' }}>
          <p className="text-muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>İş Detayı</p>
          <p style={{ fontWeight: '700', marginBottom: '0.25rem' }}>{job.title}</p>
          <p className="text-muted text-sm" style={{ marginBottom: '0.5rem' }}>{job.description}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
            <span className="text-muted">Müşteri Bütçesi:</span>
            <span style={{ fontWeight: '700', color: 'var(--success)' }}>₺{job.budget}</span>
          </div>
        </div>

        {error && (
          <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Teklif Fiyatınız (₺)</label>
            <div style={{ position: 'relative' }}>
              <DollarSign size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="number"
                className="form-control"
                placeholder="Örn: 5000"
                value={price}
                onChange={e => setPrice(e.target.value)}
                style={{ paddingLeft: '2.25rem' }}
                required
              />
            </div>
            {diff !== null && (
              <p style={{ fontSize: '0.75rem', marginTop: '0.375rem', color: Number(diff) > 0 ? 'var(--warning)' : 'var(--success)', fontWeight: '600' }}>
                {Number(diff) > 0 ? `⚠️ Bütçenin %${diff} üzerinde` : `✓ Bütçenin %${Math.abs(Number(diff))} altında`}
              </p>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-block" style={{ padding: '0.75rem', marginTop: '0.25rem' }}>
            Teklifi Gönder
          </button>
        </form>
      </div>
    </div>
  );
};

export default MakeOfferModal;
