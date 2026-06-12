import React, { useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { MapPin, ArrowLeft, MessageSquare, Star, Crown } from 'lucide-react';
import ChatModal from '../components/ChatModal';
import NegotiationPanel from '../components/NegotiationPanel';
import { getCategoryById } from '../data/categories';

const JobDetail = () => {
  const { id } = useParams();
  const { jobs, offers, users, currentUser, acceptOffer, counterOffer, rejectOffer } = useAppContext();
  const [chatData, setChatData] = useState(null);

  const job = jobs.find(j => j.id === id);

  if (!currentUser || currentUser.role !== 'musteri') return <Navigate to="/" />;
  if (!job) return <div className="container section">İş bulunamadı.</div>;
  if (job.createdBy !== currentUser.id) return <Navigate to="/customer" />;

  const jobOffers = offers.filter(o => (o.jobId || o.job_id) === job.id);
  const cat = job.category ? getCategoryById(job.category) : null;

  return (
    <div className="container section">
      <Link to="/customer" className="btn btn-ghost" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
        <ArrowLeft size={16} /> Geri Dön
      </Link>

      {/* Job Info Card */}
      <div className={`card ${job.isVip ? 'job-card-vip' : 'job-card'}`} style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
              {job.isVip && <span className="badge badge-vip"><Crown size={10} /> VIP</span>}
              <span className={`badge ${job.status === 'Açık' ? 'badge-open' : job.status === 'Tamamlandı' ? 'badge-closed' : 'badge-pending'}`}>
                {job.status === 'Kapalı' ? 'Usta ile Anlaşıldı' : job.status}
              </span>
            </div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{job.title}</h1>
            <p className="text-muted">{job.description}</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.85rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                <MapPin size={14} /> {job.location}
              </span>
              <span style={{ fontWeight: '700', color: 'var(--success)' }}>₺{job.budget}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Kategori Bilgisi */}
      {cat && (
        <div className="job-category-bar" style={{ marginBottom: '1.5rem' }}>
          <span className="cat-emoji-sm">{cat.emoji}</span>
          <span><strong>{cat.label}</strong>{job.area_m2 > 0 && ` — ${job.area_m2} ${cat.unit}`}</span>
          {job.estimated_price > 0 && (
            <span className="cat-estimate">
              Piyasa tahmini: <strong>{Number(job.estimated_price).toLocaleString('tr-TR')} TL</strong>
            </span>
          )}
        </div>
      )}

      {/* Offers */}
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
        Gelen Teklifler <span style={{ color: 'var(--primary-color)' }}>({jobOffers.length})</span>
      </h3>

      {jobOffers.length === 0 ? (
        <div className="card text-center" style={{ padding: '2.5rem' }}>
          <p className="text-muted">Henüz bu iş için teklif veren usta olmadı.</p>
        </div>
      ) : (
        <div className="grid">
          {jobOffers.map(offer => {
            const ustaId = offer.ustaId || offer.usta_id;
            const usta = users.find(u => u.id === ustaId);
            return (
              <div className="card card-glow" key={offer.id}>
                {/* Usta Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: 'var(--gradient-primary)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '700', fontSize: '1.125rem', flexShrink: 0
                  }}>
                    {offer.usta_name?.charAt(0) || usta?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <Link to={`/usta/${ustaId}`} style={{ fontWeight: '700', color: 'var(--text-heading)' }}>
                      {offer.usta_name || usta?.name || 'Bilinmeyen Usta'}
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--success)', marginTop: '0.125rem' }}>
                      <Star size={12} fill="currentColor" /> {usta?.rating || 0}
                      <span className="text-muted" style={{ marginLeft: '0.25rem' }}>({usta?.completed_jobs || 0} iş)</span>
                    </div>
                  </div>
                </div>

                {usta?.badges && usta.badges.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.75rem' }}>
                    {usta.badges.map((b, i) => (
                      <span key={i} className="badge badge-vip" style={{ fontSize: '0.6rem' }}>{b}</span>
                    ))}
                  </div>
                )}

                {/* Pazarlık Paneli */}
                <NegotiationPanel
                  offer={offer}
                  currentUser={currentUser}
                  job={job}
                  onCounter={(offerId, price, msg) => counterOffer(offerId, price, msg)}
                  onAccept={(offerId, jobId, uid) => acceptOffer(offerId, jobId, uid)}
                  onReject={(offerId) => rejectOffer(offerId)}
                />

                <button
                  className="btn btn-ghost text-sm"
                  style={{ marginTop: '0.75rem', width: '100%' }}
                  onClick={() => setChatData({ jobId: job.id, ustaId })}
                >
                  <MessageSquare size={14} /> Mesajlaş
                </button>
              </div>
            );
          })}
        </div>
      )}

      {chatData && <ChatModal jobId={chatData.jobId} ustaId={chatData.ustaId} onClose={() => setChatData(null)} />}
    </div>
  );
};

export default JobDetail;
