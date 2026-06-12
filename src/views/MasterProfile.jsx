import React, { useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Star, CheckCircle, Image as ImageIcon, Store, MessageSquare, Trophy, Send, X, Camera } from 'lucide-react';
import AvatarUpload from '../components/AvatarUpload';
import PortfolioUpload from '../components/PortfolioUpload';
import { supabase } from '../lib/supabase';

const MasterProfile = () => {
  const { id } = useParams();
  const { users, currentUser, sendDirectMessage, refreshData } = useAppContext();
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [msgText, setMsgText] = useState('');
  const [sent, setSent] = useState(false);

  const master = users.find(u => u.id === id && u.role === 'usta');
  const shop = master?.shopId ? users.find(u => u.id === master.shopId) : null;
  const isOwner = currentUser?.id === id;

  if (!master) return <Navigate to="/" />;

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentUser) { alert('Mesaj göndermek için giriş yapmalısınız.'); return; }
    if (!msgText.trim()) return;
    try {
      if (sendDirectMessage) await sendDirectMessage(master.id, msgText.trim());
      setSent(true);
      setMsgText('');
      setTimeout(() => { setSent(false); setShowMsgModal(false); }, 2000);
    } catch (err) {
      alert('Mesaj gönderilemedi: ' + err.message);
    }
  };

  // Portfolio: Supabase'den portfolyo
  const portfolioPhotos = (master.portfolio || []).map(p => ({
    id: p.id,
    image_url: p.url || p.image_url,
    title: p.description || p.title || '',
  }));

  return (
    <div className="container section" style={{ maxWidth: '800px' }}>
      {/* Profile Header */}
      <div className="card" style={{ marginBottom: '1.5rem', overflow: 'hidden', padding: 0 }}>
        {/* Banner */}
        <div style={{
          height: '130px',
          background: 'var(--gradient-wood)',
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(200,130,58,0.04) 0px, rgba(200,130,58,0.04) 1px, transparent 1px, transparent 8px)',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(200,130,58,0.2) 0%, transparent 60%)'
          }} />
        </div>

        <div style={{ padding: '0 1.5rem 1.5rem', marginTop: '-40px' }}>
          {/* Avatar */}
          <div style={{ marginBottom: '1rem' }}>
            <AvatarUpload
              userId={master.id}
              currentUrl={master.avatar_url}
              name={master.name}
              size="lg"
              editable={isOwner}
              onUpdate={() => refreshData?.()}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {master.name}
                {master.completed_jobs >= 10 && <span className="badge badge-vip" style={{ fontSize: '0.65rem' }}>⭐ Deneyimli</span>}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontWeight: '600' }}>
                <Star size={16} fill="currentColor" /> {master.rating?.toFixed(1) || '0.0'} puan
                <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>
                  · {master.completed_jobs || master.completedJobs || 0} iş tamamlandı
                </span>
              </div>
              {shop && (
                <Link to={`/dukkan/${shop.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--secondary-color)' }}>
                  <Store size={14} /> {shop.name} mağazasına bağlı
                </Link>
              )}
            </div>
            {currentUser && currentUser.id !== master.id && (
              <button className="btn btn-primary" onClick={() => setShowMsgModal(true)}>
                <MessageSquare size={16} /> Mesaj Gönder
              </button>
            )}
          </div>

          {/* Badges */}
          {master.badges?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '1rem' }}>
              {master.badges.map((b, i) => (
                <span key={i} className="badge badge-vip">{b}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Portfolio */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ImageIcon size={18} style={{ color: 'var(--primary-color)' }} />
          Önceki İşleri (Portfolyo)
          {isOwner && (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: 'auto' }}>
              <Camera size={12} style={{ display: 'inline', marginRight: 4 }} />
              Fotoğraf ekleyebilirsiniz
            </span>
          )}
        </h3>

        {isOwner ? (
          <PortfolioUpload
            userId={master.id}
            photos={portfolioPhotos}
            editable={true}
            onRefresh={() => refreshData?.()}
          />
        ) : portfolioPhotos.length > 0 ? (
          <PortfolioUpload
            userId={master.id}
            photos={portfolioPhotos}
            editable={false}
          />
        ) : (
          <p className="text-muted text-sm">Henüz fotoğraf eklenmemiş.</p>
        )}
      </div>

      {/* Reviews */}
      <div className="card">
        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Trophy size={18} style={{ color: 'var(--warning)' }} /> Müşteri Yorumları
        </h3>
        {master.reviews?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {master.reviews.map(rev => (
              <div key={rev.id} style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--primary-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong style={{ fontSize: '0.9rem' }}>{rev.author_name || rev.author}</strong>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success)', fontSize: '0.85rem', fontWeight: '700' }}>
                    <Star size={12} fill="currentColor" /> {rev.rating}
                  </span>
                </div>
                <p className="text-muted text-sm">{rev.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted text-sm text-center" style={{ padding: '1rem' }}>Henüz yorum yapılmamış.</p>
        )}
      </div>

      {/* Mesaj Modal */}
      {showMsgModal && (
        <div className="modal-overlay" onClick={() => setShowMsgModal(false)} style={{ zIndex: 2000 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare size={18} style={{ color: 'var(--primary-color)' }} />
                {master.name}'e Mesaj
              </h3>
              <button onClick={() => setShowMsgModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--success)' }}>
                <CheckCircle size={40} style={{ marginBottom: '0.75rem' }} />
                <p style={{ fontWeight: '600' }}>Mesajınız gönderildi!</p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage}>
                <div className="form-group">
                  <label className="form-label">Mesajınız</label>
                  <textarea
                    className="form-control" rows={4}
                    placeholder={`${master.name} ile iletişime geçin...`}
                    value={msgText}
                    onChange={e => setMsgText(e.target.value)}
                    required autoFocus style={{ resize: 'vertical' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '0.5rem' }}>
                  <Send size={16} /> Gönder
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterProfile;
