import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import JobWizard from '../components/JobWizard';
import { Plus, Star, Clock, CheckCircle, ChevronRight } from 'lucide-react';

const CustomerPanel = () => {
  const { currentUser, jobs, offers, completeAndRateJob, createJob } = useAppContext();
  const [showWizard, setShowWizard] = useState(false);
  const [ratingJobId, setRatingJobId] = useState(null);

  const [scores, setScores] = useState({ speed: 5, quality: 5 });
  const [reviewText, setReviewText] = useState('');

  if (!currentUser || currentUser.role !== 'musteri') return <Navigate to="/" />;

  const myJobs = jobs.filter(j => j.createdBy === currentUser.id);
  const openCount = myJobs.filter(j => j.status === 'Açık').length;
  const closedCount = myJobs.filter(j => j.status === 'Kapalı').length;
  const doneCount = myJobs.filter(j => j.status === 'Tamamlandı').length;

  const handleRateSubmit = (jobId) => {
    completeAndRateJob(jobId, scores, reviewText);
    setRatingJobId(null);
    setReviewText('');
    setScores({ speed: 5, quality: 5 });
  };

  const statusColor = (status) => {
    if (status === 'Açık') return 'var(--primary-color)';
    if (status === 'Tamamlandı') return 'var(--text-muted)';
    return 'var(--success)';
  };

  const statusLabel = (status) =>
    status === 'Kapalı' ? 'Usta ile Anlaşıldı' : status;

  return (
    <div className="container section">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem' }}>📋 İş İlanlarım</h2>
          <p className="text-muted text-sm">Hoş geldin, {currentUser.name}</p>
        </div>
        <button className="btn btn-primary btn-glow" onClick={() => setShowWizard(true)}>
          <Plus size={18} /> Yeni İlan Ver
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Açık İlan', value: openCount, icon: <Clock size={20} />, color: 'var(--primary-color)' },
          { label: 'Anlaşılan', value: closedCount, icon: <CheckCircle size={20} />, color: 'var(--warning)' },
          { label: 'Tamamlanan', value: doneCount, icon: <Star size={20} />, color: 'var(--success)' }
        ].map(stat => (
          <div key={stat.label} className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
            <div style={{ color: stat.color, marginBottom: '0.5rem' }}>{stat.icon}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: stat.color }}>{stat.value}</div>
            <div className="text-muted text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Job List */}
      {myJobs.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <Plus size={48} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: '1rem' }} />
          <p className="text-muted">Henüz bir iş ilanı vermediniz.</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowWizard(true)}>
            İlk İlanınızı Verin
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {myJobs.map(job => {
            const jobOffers = offers.filter(o => o.jobId === job.id);
            return (
              <div key={job.id} className={`card ${job.isVip ? 'job-card-vip' : 'job-card'}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.7rem', color: statusColor(job.status), textTransform: 'uppercase' }}>
                      {statusLabel(job.status)}
                    </span>
                    {job.isVip && <span className="badge badge-vip">⭐ VIP</span>}
                  </div>
                  <span style={{ fontWeight: '700', color: 'var(--success)' }}>₺{job.budget}</span>
                </div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>{job.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{job.description}</p>

                {/* Rating Form */}
                {job.status === 'Kapalı' && ratingJobId !== job.id && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <button className="btn btn-success btn-block" onClick={() => setRatingJobId(job.id)}>
                      <Star size={16} /> İşi Tamamla & Ustayı Puanla
                    </button>
                  </div>
                )}

                {ratingJobId === job.id && (
                  <div style={{ marginTop: '1rem', padding: '1.25rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                    <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Ustayı Puanla (1-5)</h4>
                    {[
                      { key: 'quality', label: 'İş Kalitesi' },
                      { key: 'speed', label: 'Hız' }
                    ].map(s => (
                      <div key={s.key} style={{ marginBottom: '0.75rem' }}>
                        <label className="form-label">{s.label}: <strong style={{ color: 'var(--primary-color)' }}>{scores[s.key]}</strong></label>
                        <input type="range" min="1" max="5" step="0.5" value={scores[s.key]}
                          onChange={e => setScores({ ...scores, [s.key]: e.target.value })}
                          style={{ width: '100%', accentColor: 'var(--primary-color)' }} />
                      </div>
                    ))}
                    <div style={{ marginBottom: '1rem' }}>
                      <label className="form-label">Yorumunuz:</label>
                      <textarea className="form-control" rows="2" value={reviewText}
                        onChange={e => setReviewText(e.target.value)} placeholder="Usta hakkında düşünceleriniz..." />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-success" style={{ flex: 1 }} onClick={() => handleRateSubmit(job.id)}>Kaydet</button>
                      <button className="btn btn-secondary" onClick={() => setRatingJobId(null)}>İptal</button>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {job.status === 'Tamamlandı'
                      ? <span style={{ color: 'var(--success)', fontWeight: '600' }}>⭐ Puan: {job.finalScore?.toFixed(1)} / 5</span>
                      : `${jobOffers.length} usta teklif verdi`}
                  </span>
                  {(job.status === 'Açık' || job.status === 'Kapalı') && (
                    <Link to={`/job/${job.id}`} className="btn btn-ghost text-sm">
                      Detaylar <ChevronRight size={14} />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showWizard && (
        <JobWizard
          onSubmit={async (data) => {
            await createJob(
              data.title, data.description, data.budget, data.location,
              false, {}, null, null,
              data.category, data.area_m2, data.extra_options, data.estimated_price
            );
            setShowWizard(false);
          }}
          onCancel={() => setShowWizard(false)}
        />
      )}
    </div>
  );
};

export default CustomerPanel;
