import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import MakeOfferModal from '../components/MakeOfferModal';
import ChatModal from '../components/ChatModal';
import { MapPin, CheckCircle, MessageSquare, Ruler, Sofa, Layers, Star, Crown, AlertCircle } from 'lucide-react';

const JobDetailsBadges = ({ details, showFullAddress, location }) => {
  if (!details) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
      <MapPin size={14} /> {location}
    </div>
  );
  const displayAddress = showFullAddress ? details.fullAddress : `${location} (Açık Adres Anlaşınca Görünür)`;
  return (
    <div style={{ marginTop: '0.75rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
        {details.area && (
          <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Ruler size={12} /> {details.area} m²
          </span>
        )}
        {details.isFurnished && (
          <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Sofa size={12} /> {details.isFurnished === 'eşyalı' ? 'Eşyalı' : 'Boş'}
          </span>
        )}
        {details.hasSkirting && (
          <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Layers size={12} /> Süpürgelik
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <MapPin size={14} /> {displayAddress}
      </div>
    </div>
  );
};

const MasterPanel = () => {
  const { currentUser, jobs, offers, users, respondToShopJob } = useAppContext();
  const [selectedJob, setSelectedJob] = useState(null);
  const [chatData, setChatData] = useState(null);

  if (!currentUser || currentUser.role !== 'usta') {
    return <Navigate to="/" />;
  }

  const isVipMaster = (currentUser.rating >= 4.0 && (currentUser.completedJobs || currentUser.completed_jobs) >= 30) || currentUser.isVip;

  const isJobVip = (job) => {
    const creator = users.find(u => u.id === job.createdBy || u.id === job.created_by);
    return creator?.isVip === true || creator?.is_vip === true;
  };

  const openJobs = jobs.filter(j => j.status === 'Açık' && !isJobVip(j));
  const vipJobs = jobs.filter(j => j.status === 'Açık' && isJobVip(j));
  const myOffers = offers.filter(o => o.ustaId === currentUser.id);
  const shopJobsToRespond = jobs.filter(j => j.selectedUsta === currentUser.id && j.status === 'Mağaza İstedi');
  const acceptedJobs = jobs.filter(j => j.selectedUsta === currentUser.id && j.status !== 'Mağaza İstedi' && j.status !== 'Reddedildi' && j.status !== 'Açık');

  const renderJobCard = (job, isVip = false) => {
    const hasOffered = myOffers.find(o => o.jobId === job.id);
    return (
      <div key={job.id} className={`card ${isVip ? 'job-card-vip' : 'job-card'}`} style={{ marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontWeight: '700', fontSize: '1rem' }}>{job.title}</span>
            {isVip && <span className="badge badge-vip"><Crown size={10} /> VIP</span>}
          </div>
          <span style={{ color: 'var(--success)', fontWeight: '700' }}>₺{job.budget}</span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.5rem 0' }}>{job.description}</p>
        <JobDetailsBadges details={job.details} showFullAddress={false} location={job.location} />
        {hasOffered ? (
          <div style={{ textAlign: 'center', padding: '0.625rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginTop: '0.75rem', color: 'var(--success)' }}>
            ✓ Teklif Verildi: ₺{hasOffered.price}
          </div>
        ) : (
          <button className="btn btn-primary btn-block" style={{ marginTop: '0.75rem' }} onClick={() => setSelectedJob(job)}>
            Teklif Ver
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="container section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem' }}>⚡ Usta Paneli</h2>
          <p className="text-muted text-sm">Hoş geldin, {currentUser.name}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span className="badge badge-open"><Star size={12} /> {currentUser.rating}</span>
          <span className="badge badge-closed"><CheckCircle size={12} /> {currentUser.completedJobs} İş</span>
        </div>
      </div>

      {/* Mağazadan Gelen İş Talepleri */}
      {shopJobsToRespond.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', color: 'var(--warning)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} /> Mağazadan Gelen İstekler ({shopJobsToRespond.length})
          </h3>
          {shopJobsToRespond.map(job => {
            const shop = users.find(u => u.id === job.createdBy);
            return (
              <div key={job.id} className="card" style={{ borderLeft: '3px solid var(--warning)', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '700' }}>{job.title}</span>
                  <span style={{ color: 'var(--success)', fontWeight: '700' }}>₺{job.budget}</span>
                </div>
                <p className="text-sm text-muted" style={{ margin: '0.5rem 0' }}>{job.description}</p>
                <p className="text-sm" style={{ marginBottom: '0.75rem' }}>Gönderen Mağaza: <b>{shop?.name}</b></p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-success" style={{ flex: 1 }} onClick={() => respondToShopJob(job.id, true)}>
                    <CheckCircle size={16} /> Kabul Et
                  </button>
                  <button className="btn btn-outline-danger" style={{ flex: 1 }} onClick={() => respondToShopJob(job.id, false)}>
                    Reddet
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Kabul Edilen İşler */}
      {acceptedJobs.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', color: 'var(--success)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={20} /> Kabul Ettiğim İşler
          </h3>
          {acceptedJobs.map(job => {
            const customer = users.find(u => u.id === job.createdBy);
            const offerPrice = offers.find(o => o.jobId === job.id && o.ustaId === currentUser.id)?.price;
            return (
              <div key={job.id} className="card" style={{ borderLeft: '3px solid var(--success)', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '700' }}>{job.title}</span>
                  <span style={{ color: 'var(--success)' }}>Anlaşılan: ₺{offerPrice || job.budget}</span>
                </div>
                <p className="text-sm text-muted" style={{ margin: '0.5rem 0' }}>{job.description}</p>
                <div style={{ fontSize: '0.85rem', padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem' }}>
                  <b>Müşteri:</b> {customer?.name}<br />
                  <b>Adres:</b> {job.location} / {job.details?.fullAddress}
                </div>
                <button className="btn btn-outline btn-block" onClick={() => setChatData({ jobId: job.id, ustaId: currentUser.id })}>
                  <MessageSquare size={16} /> Müşteriye Mesaj Gönder
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* VIP İlanlar */}
      {isVipMaster && vipJobs.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Crown size={20} style={{ color: 'var(--warning)' }} /> VIP İlanlar
            <span className="badge badge-vip">Sadece Deneyimli Ustalar</span>
          </h3>
          {vipJobs.map(job => renderJobCard(job, true))}
        </div>
      )}

      {!isVipMaster && vipJobs.length > 0 && (
        <div className="card" style={{ borderLeft: '3px solid var(--warning)', marginBottom: '2rem', opacity: 0.7 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)' }}>
            <Crown size={20} />
            <span style={{ fontWeight: '700' }}>{vipJobs.length} VIP İlan Mevcut</span>
          </div>
          <p className="text-sm text-muted" style={{ marginTop: '0.5rem' }}>
            VIP ilanları görmek için en az 4.0 puan ve 30 tamamlanmış iş gerekir veya VIP üye olmanız gerekir.
            Mevcut puanınız: {currentUser.rating} | İş: {currentUser.completedJobs || currentUser.completed_jobs || 0}
          </p>
        </div>
      )}

      {/* Normal İlanlar */}
      <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        Yeni İş İlanları
      </h3>
      {openJobs.length === 0 ? (
        <div className="card text-center" style={{ padding: '2rem' }}>
          <p className="text-muted">Şu an açık ilan bulunmuyor.</p>
        </div>
      ) : (
        openJobs.map(job => renderJobCard(job))
      )}

      {selectedJob && <MakeOfferModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
      {chatData && <ChatModal jobId={chatData.jobId} ustaId={chatData.ustaId} onClose={() => setChatData(null)} />}
    </div>
  );
};

export default MasterPanel;
