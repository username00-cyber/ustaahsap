import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { User, Star, Store, CheckCircle, Image as ImageIcon, MessageSquare, Camera } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';

const Profile = () => {
  const { currentUser, jobs, offers, addPortfolioItem, updateProfile } = useAppContext();
  const [portDesc, setPortDesc] = React.useState('');
  const [pendingPortImg, setPendingPortImg] = React.useState(null);

  if (!currentUser) return <Navigate to="/" />;

  const isUsta   = currentUser.role === 'usta';
  const isDukkan = currentUser.role === 'dukkan';

  const stat1 = isUsta
    ? offers.filter(o => o.ustaId === currentUser.id).length
    : isDukkan ? (currentUser.products?.length || 0)
    : jobs.filter(j => j.createdBy === currentUser.id).length;
  const stat1Label = isUsta ? 'Verilen Teklif' : isDukkan ? 'Listelenen Ürün' : 'Açılan İş';

  const stat2 = isUsta
    ? (currentUser.completed_jobs || currentUser.completedJobs || 0)
    : jobs.filter(j => j.createdBy === currentUser.id && (j.status === 'Kapalı' || j.status === 'Tamamlandı')).length;
  const stat2Label = isUsta ? 'Tamamlanan İş' : isDukkan ? 'Bağlı Ustalar' : 'Anlaşılan/Biten İş';

  const handleAddPortfolio = (e) => {
    e.preventDefault();
    if (!pendingPortImg) return alert('Lütfen önce bir görsel yükleyin.');
    addPortfolioItem(currentUser.id, { url: pendingPortImg, description: portDesc });
    setPendingPortImg(null);
    setPortDesc('');
  };

  const handleAvatarUpload = (url) => {
    if (url && updateProfile) updateProfile(currentUser.id, { avatar_url: url });
  };

  const roleLabel = isUsta ? '⚒️ Usta Hesabı' : isDukkan ? '🏪 Dükkan Hesabı' : '👤 Müşteri Hesabı';

  return (
    <div className="container section" style={{ maxWidth: '860px' }}>
      {/* ─── Profile Card ─── */}
      <div className="card" style={{ marginBottom: '1.5rem', overflow: 'hidden', padding: 0 }}>
        <div style={{ height: '110px', background: 'var(--gradient-primary)', position: 'relative' }} />
        <div style={{ padding: '0 1.5rem 1.5rem', textAlign: 'center', marginTop: '-3.5rem' }}>

          {/* Avatar — tıklanabilir yükleme */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
            <div style={{
              width: '90px', height: '90px', borderRadius: '50%',
              border: '4px solid var(--card-bg)',
              boxShadow: 'var(--shadow-md)',
              overflow: 'hidden',
              background: 'var(--bg-tertiary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {currentUser.avatar_url
                ? <img src={currentUser.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : isDukkan ? <Store size={44} style={{ color: 'var(--primary-color)' }} />
                : <User size={44} style={{ color: 'var(--primary-color)' }} />
              }
            </div>
            {/* Kamera ikonlu yükleme overlay */}
            <div style={{ position: 'absolute', bottom: 0, right: 0 }}>
              <ImageUpload
                currentUrl={null}
                onUpload={handleAvatarUpload}
                folder="avatars"
                size="sm"
                label=""
              />
            </div>
          </div>

          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{currentUser.name}</h2>
          <p className="text-muted text-sm" style={{ marginBottom: '0.75rem' }}>@{currentUser.email?.split('@')[0]}</p>
          <span className="badge badge-open">{roleLabel}</span>

          {isUsta && currentUser.badges?.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.375rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
              {currentUser.badges.map((badge, idx) => (
                <span key={idx} className="badge badge-vip">{badge}</span>
              ))}
            </div>
          )}

          {(isUsta || isDukkan) && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', marginTop: '0.75rem', color: 'var(--success)', fontWeight: '700', fontSize: '1.125rem' }}>
              <Star size={20} fill="currentColor" /> {currentUser.rating?.toFixed(1) || '0.0'} Puan
            </div>
          )}

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-color)' }}>{stat1}</div>
              <div className="text-muted text-sm">{stat1Label}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                {isUsta && <CheckCircle size={20} />} {stat2}
              </div>
              <div className="text-muted text-sm">{stat2Label}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Usta: Portfolyo + Yorumlar ─── */}
      {isUsta && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Portfolyo */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ImageIcon size={18} style={{ color: 'var(--primary-color)' }} /> Portfolyo Yönetimi
            </h3>
            <form onSubmit={handleAddPortfolio} style={{ marginBottom: '1.25rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              {/* Görsel yükleme */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <ImageUpload
                  currentUrl={pendingPortImg}
                  onUpload={setPendingPortImg}
                  folder="portfolio"
                  size="lg"
                  label="Fotoğraf Yükle"
                />
              </div>
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <input type="text" className="form-control" placeholder="Kısa Açıklama (ör: Parke döşeme – İstanbul)" value={portDesc} onChange={e => setPortDesc(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary btn-block text-sm">Portfolyoya Ekle</button>
            </form>

            {currentUser.portfolio?.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                {currentUser.portfolio.map((item, idx) => (
                  <div key={idx} style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', position: 'relative' }}>
                    <img src={item.url} alt="portfolyo" style={{ width: '100%', height: '90px', objectFit: 'cover', display: 'block' }} />
                    {item.description && (
                      <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        background: 'rgba(0,0,0,0.65)', color: 'white',
                        fontSize: '0.6rem', padding: '0.2rem 0.4rem'
                      }}>{item.description}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-sm" style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                Henüz portfolyo görseli eklenmedi.
              </p>
            )}
          </div>

          {/* Yorumlar */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={18} style={{ color: 'var(--warning)' }} /> Aldığım Yorumlar
            </h3>
            {currentUser.reviews?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
                {currentUser.reviews.map((rev, idx) => (
                  <div key={idx} style={{ padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--primary-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                      <strong style={{ fontSize: '0.85rem' }}>{rev.author_name || rev.author}</strong>
                      <span style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Star size={12} fill="currentColor" /> {rev.rating}
                      </span>
                    </div>
                    <p className="text-muted text-sm">{rev.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-sm text-center" style={{ padding: '2rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                Henüz yorum almadınız. İşleri tamamladıkça yorumlarınız burada listelenecektir.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
