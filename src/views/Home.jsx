import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, MapPin, Star, Zap, Shield, TrendingUp,
  Users, Store, CheckCircle, ArrowRight, Hammer,
  Clock, Award, MessageSquare
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

/* ── küçük yardımcı: sayaç animasyonu ── */
const AnimatedNumber = ({ target }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const step = Math.ceil(target / 40);
    const id = setInterval(() => {
      setVal(v => {
        if (v + step >= target) { clearInterval(id); return target; }
        return v + step;
      });
    }, 30);
    return () => clearInterval(id);
  }, [target]);
  return <>{val}</>;
};

const Home = ({ onLoginClick }) => {
  const { jobs, users, currentUser } = useAppContext();
  const [cityFilter, setCityFilter] = useState('');

  const openJobs  = jobs.filter(j => j.status === 'Açık');
  const masters   = users.filter(u => u.role === 'usta');
  const shops     = users.filter(u => u.role === 'dukkan');

  const filteredJobs = cityFilter
    ? openJobs.filter(j => j.location === cityFilter)
    : openJobs;

  const features = [
    {
      icon: <Shield size={28} />,
      color: 'var(--primary-color)',
      bg: 'rgba(99,102,241,0.12)',
      title: 'Güvenilir & Doğrulanmış',
      desc: 'Her usta puan sistemi, tamamlanan iş sayısı ve topluluk yorumları ile değerlendirilir. Sahte usta yok.'
    },
    {
      icon: <TrendingUp size={28} />,
      color: 'var(--success)',
      bg: 'rgba(16,185,129,0.12)',
      title: 'Akıllı Fiyat Tahmini',
      desc: 'İlan verirken metrekare ve iş tipine göre otomatik bütçe önerisi alırsınız. Fahiş fiyata son.'
    },
    {
      icon: <MessageSquare size={28} />,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.12)',
      title: 'Anlık Mesajlaşma',
      desc: 'İş ilanınız üzerinden usta ile doğrudan mesajlaşın. Tüm iletişim platform içinde, güvende.'
    },
    {
      icon: <Store size={28} />,
      color: 'var(--secondary-color)',
      bg: 'rgba(139,92,246,0.12)',
      title: 'Entegre Mağaza',
      desc: 'Zemin kaplama, boya, yapı malzemesi — doğrudan onaylı mağazalardan sepete ekle, ustana yönlendir.'
    },
    {
      icon: <Award size={28} />,
      color: '#ec4899',
      bg: 'rgba(236,72,153,0.12)',
      title: 'Rozet & Başarım',
      desc: 'Ustalar tamamladıkları her iş için rozet kazanır. Hangi ustanın ne kadar deneyimli olduğu şeffaf.'
    },
    {
      icon: <Users size={28} />,
      color: '#06b6d4',
      bg: 'rgba(6,182,212,0.12)',
      title: 'Topluluk Forumu',
      desc: 'Tadilat, dekorasyon ve yapı malzemeleri hakkında fikir alın. Binlerce deneyimli kullanıcı yanıtlıyor.'
    },
  ];

  const steps = [
    { num: '01', title: 'İlan Ver', desc: 'İşini tanımla, bütçeni belirle, konumunu ekle. 2 dakika sürer.' },
    { num: '02', title: 'Teklif Al', desc: 'Yakınındaki ustalar tekliflerini sunar, fiyatları ve puanları karşılaştır.' },
    { num: '03', title: 'İşini Yaptır', desc: 'Uygun ustayı seç, mesajlaş, işi tamamla ve değerlendir.' },
  ];

  const testimonials = [
    { name: 'Selin K.', role: 'Müşteri', rating: 5, text: 'Parke döşettirmek için 3 farklı ustadan teklif aldım. En uygun fiyatlıyı seçtim ve iş harikaydı!', avatar: 'S' },
    { name: 'Mehmet Usta', role: 'Usta', rating: 5, text: 'Platformdan ayda 8-10 iş alıyorum. Müşteri bulmak için artık hiç uğraşmıyorum.', avatar: 'M' },
    { name: 'Ayşe Y.', role: 'Müşteri', rating: 5, text: 'Hem usta buldum hem de malzemeyi platform üzerinden aldım. Çok pratik!', avatar: 'A' },
  ];

  return (
    <>
      {/* ══════════════ HERO ══════════════ */}
      <section className="hero-section" style={{ paddingBottom: '5rem' }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>

          {/* Etiket */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '999px', padding: '0.35rem 1rem', marginBottom: '1.5rem',
            fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: '600'
          }}>
            <Zap size={13} /> Türkiye'nin Usta Bulma Platformu
          </div>

          <h1 className="hero-title" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.15, marginBottom: '1.25rem' }}>
            Eviniz İçin<br />
            <span className="gradient-text">Güvenilir Ustanı</span><br />
            Saniyeler İçinde Bul
          </h1>
          <p className="hero-subtitle" style={{ maxWidth: '540px', margin: '0 auto 2rem', fontSize: '1.05rem', lineHeight: 1.7 }}>
            İlan ver, onlarca ustadan teklif al, en iyisini seç. Tadilattan parkeye, boyadan elektriğe — her işte yanındayız.
          </p>

          <div className="hero-cta" style={{ gap: '1rem', flexWrap: 'wrap' }}>
            {!currentUser ? (
              <>
                <button onClick={onLoginClick} className="btn btn-primary btn-glow" style={{ padding: '0.875rem 2.25rem', fontSize: '1rem' }}>
                  <Zap size={18} /> Ücretsiz Başla
                </button>
                <Link to="/shops" className="btn btn-secondary" style={{ padding: '0.875rem 2.25rem', fontSize: '1rem' }}>
                  <Store size={18} /> Mağazaları Gör
                </Link>
              </>
            ) : (
              <>
                {currentUser.role === 'musteri' && (
                  <Link to="/customer" className="btn btn-primary btn-glow" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
                    <Zap size={18} /> İlan Ver
                  </Link>
                )}
                {currentUser.role === 'usta' && (
                  <Link to="/master" className="btn btn-primary btn-glow" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
                    <Hammer size={18} /> İş İlanlarını Gör
                  </Link>
                )}
                {currentUser.role === 'dukkan' && (
                  <Link to="/shop-panel" className="btn btn-primary btn-glow" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
                    <Store size={18} /> Mağazamı Yönet
                  </Link>
                )}
                <Link to="/community" className="btn btn-secondary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
                  <Users size={18} /> Topluluk
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="hero-stats" style={{ marginTop: '3.5rem', gap: '3rem', flexWrap: 'wrap' }}>
            {[
              { val: masters.length > 0 ? masters.length : 120, suffix: '+', label: 'Aktif Usta' },
              { val: openJobs.length > 0 ? openJobs.length : 340, suffix: '', label: 'Açık İlan' },
              { val: shops.length > 0 ? shops.length : 28, suffix: '+', label: 'Onaylı Mağaza' },
              { val: 98, suffix: '%', label: 'Memnuniyet' },
            ].map((s, i) => (
              <div key={i} className="hero-stat">
                <div className="hero-stat-value" style={{ fontSize: '2rem' }}>
                  <AnimatedNumber target={s.val} />{s.suffix}
                </div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ NASIL ÇALIŞIR ══════════════ */}
      <section style={{ background: 'var(--bg-secondary)', padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Nasıl Çalışır?</h2>
            <p className="text-muted" style={{ maxWidth: '480px', margin: '0 auto' }}>
              3 basit adımda, evinizin her türlü ihtiyacına çözüm bulun.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
            {steps.map((s, i) => (
              <div key={i} style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: 'var(--gradient-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  fontSize: '1.5rem', fontWeight: '800', color: 'white',
                  boxShadow: '0 8px 32px rgba(99,102,241,0.3)'
                }}>{s.num}</div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>{s.title}</h3>
                <p className="text-muted text-sm" style={{ lineHeight: 1.7 }}>{s.desc}</p>
                {i < steps.length - 1 && (
                  <ArrowRight
                    size={20}
                    style={{
                      position: 'absolute', top: '1.5rem', right: '-1rem',
                      color: 'var(--primary-color)', opacity: 0.4,
                      display: window.innerWidth > 640 ? 'block' : 'none'
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ ÖZELLİKLER ══════════════ */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Neden UstaSeç?</h2>
            <p className="text-muted" style={{ maxWidth: '480px', margin: '0 auto' }}>
              Sektördeki en kapsamlı usta-müşteri ekosistemi.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {features.map((f, i) => (
              <div key={i} className="card card-glow" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: 'var(--radius-md)',
                  background: f.bg, color: f.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {f.icon}
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.4rem' }}>{f.title}</h4>
                  <p className="text-muted text-sm" style={{ lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ AKTİF İLANLAR ══════════════ */}
      <section style={{ background: 'var(--bg-secondary)', padding: '5rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--primary-color)' }}>⚡</span> Canlı İlanlar
              </h2>
              <p className="text-muted text-sm">{openJobs.length} iş ilanı sizi bekliyor</p>
            </div>
            <select
              className="form-control"
              style={{ width: 'auto', minWidth: '160px' }}
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
            >
              <option value="">Tüm Konumlar</option>
              <option value="İstanbul">İstanbul</option>
              <option value="Ankara">Ankara</option>
              <option value="İzmir">İzmir</option>
              <option value="Merkez">Merkez</option>
              <option value="Artova">Artova</option>
            </select>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="card text-center" style={{ padding: '3.5rem' }}>
              <Search size={48} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: '1rem' }} />
              <h3 style={{ marginBottom: '0.5rem' }}>Henüz ilan yok</h3>
              <p className="text-muted text-sm">İlk ilanı açan sen ol!</p>
              {!currentUser && (
                <button onClick={onLoginClick} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                  İlan Ver
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {filteredJobs.slice(0, 6).map(job => (
                <Link key={job.id} to={`/job/${job.id}`} style={{ textDecoration: 'none' }}>
                  <div className={`card ${job.isVip ? 'job-card-vip' : 'job-card'}`} style={{ height: '100%', cursor: 'pointer', transition: 'transform 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span className={`badge ${job.isVip ? 'badge-vip' : 'badge-open'}`}>
                          {job.isVip ? '⭐ VIP' : 'AÇIK'}
                        </span>
                        {job.details?.area && (
                          <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                            {job.details.area} m²
                          </span>
                        )}
                      </div>
                      <span style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--success)' }}>₺{job.budget}</span>
                    </div>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.4rem' }}>{job.title}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
                      {job.description?.slice(0, 80)}{job.description?.length > 80 ? '...' : ''}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'auto' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={11} /> {job.location}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={11} /> {new Date(job.created_at).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════ EN İYİ USTALAR ══════════════ */}
      {masters.length > 0 && (
        <section style={{ padding: '5rem 0' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>🏆 En İyi Ustalar</h2>
                <p className="text-muted text-sm">Puan ve yorumlara göre sıralanmış</p>
              </div>
              <Link to="/leaderboard" className="btn btn-ghost text-sm">Tümünü Gör →</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
              {masters.sort((a, b) => b.rating - a.rating).slice(0, 4).map((master, i) => (
                <Link to={`/usta/${master.id}`} key={master.id} className="card card-glow" style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                      background: i === 0 ? 'linear-gradient(135deg,#fbbf24,#f59e0b)' : 'var(--gradient-primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: '700', fontSize: '1.1rem',
                      overflow: 'hidden'
                    }}>
                      {master.avatar_url
                        ? <img src={master.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : master.name?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{master.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success)', fontSize: '0.8rem' }}>
                        <Star size={12} fill="currentColor" /> {master.rating?.toFixed(1) || '0.0'}
                        <span style={{ color: 'var(--text-muted)' }}>({master.completed_jobs || 0} iş)</span>
                      </div>
                    </div>
                    {i === 0 && <span className="badge badge-vip" style={{ marginLeft: 'auto', fontSize: '0.6rem' }}>👑 #1</span>}
                  </div>
                  {master.badges?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {master.badges.slice(0, 2).map((b, bi) => (
                        <span key={bi} className="badge" style={{ fontSize: '0.6rem', background: 'rgba(255,255,255,0.06)' }}>{b}</span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════ TESTİMONIALS ══════════════ */}
      <section style={{ background: 'var(--bg-secondary)', padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Kullanıcılarımız Ne Diyor?</h2>
            <p className="text-muted text-sm">Gerçek deneyimler, gerçek insanlar</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {testimonials.map((t, i) => (
              <div key={i} className="card card-glow" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {[...Array(t.rating)].map((_, si) => (
                    <Star key={si} size={14} fill="var(--warning)" color="var(--warning)" />
                  ))}
                </div>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-body)', fontStyle: 'italic' }}>
                  "{t.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: 'auto' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'var(--gradient-primary)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '700', fontSize: '0.9rem', flexShrink: 0
                  }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>{t.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.role}</div>
                  </div>
                  <CheckCircle size={16} style={{ color: 'var(--success)', marginLeft: 'auto' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CTA BANNER ══════════════ */}
      {!currentUser && (
        <section style={{ padding: '5rem 0' }}>
          <div className="container">
            <div style={{
              background: 'var(--gradient-primary)',
              borderRadius: 'var(--radius-xl)',
              padding: '3.5rem 2rem',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(99,102,241,0.35)'
            }}>
              <h2 style={{ fontSize: '2rem', color: 'white', marginBottom: '0.75rem' }}>
                Hemen Başlamak İster misiniz?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2rem', fontSize: '1rem' }}>
                Ücretsiz hesap açın, dakikalar içinde ilanınızı verin.
              </p>
              <button onClick={onLoginClick} className="btn" style={{
                background: 'white', color: 'var(--primary-color)',
                fontWeight: '700', padding: '0.875rem 2.5rem', fontSize: '1rem',
                borderRadius: 'var(--radius-full)'
              }}>
                Ücretsiz Kayıt Ol <ArrowRight size={18} style={{ display: 'inline', marginLeft: '0.25rem' }} />
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default Home;
