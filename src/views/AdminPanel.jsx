import React, { useState, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import {
  Users, Briefcase, MessageSquare, TrendingUp, Shield,
  Search, Filter, ChevronDown, ChevronUp, Eye, Ban,
  CheckCircle, XCircle, Star, Crown, BarChart2, Activity,
  Clock, Package, Hammer, ShoppingBag, AlertTriangle, Trash2,
  RefreshCw, Download, LayoutDashboard, Settings
} from 'lucide-react';

// Admin yetkili kullanıcılar (username listesi)
const ADMIN_USERNAMES = ['ahmetusta', 'admin', 'superadmin'];

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Kullanıcılar', icon: Users },
  { id: 'jobs', label: 'İlanlar', icon: Briefcase },
  { id: 'offers', label: 'Teklifler', icon: TrendingUp },
];

// ── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color, trend }) => (
  <div className="admin-stat-card">
    <div className="admin-stat-icon" style={{ background: color + '22', color }}>
      <Icon size={22} />
    </div>
    <div className="admin-stat-body">
      <div className="admin-stat-value">{value}</div>
      <div className="admin-stat-label">{label}</div>
      {sub && <div className="admin-stat-sub">{sub}</div>}
    </div>
    {trend !== undefined && (
      <div className={`admin-stat-trend ${trend >= 0 ? 'up' : 'down'}`}>
        {trend >= 0 ? <TrendingUp size={14} /> : <ChevronDown size={14} />}
        {Math.abs(trend)}%
      </div>
    )}
  </div>
);

// ── Mini Bar ─────────────────────────────────────────────────────────────────
const MiniBar = ({ label, value, max, color }) => (
  <div className="admin-mini-bar">
    <div className="admin-mini-bar-label">
      <span>{label}</span>
      <span style={{ color }}>{value}</span>
    </div>
    <div className="admin-mini-bar-track">
      <div className="admin-mini-bar-fill" style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: color }} />
    </div>
  </div>
);

// ── Role Badge ───────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const map = {
    musteri: { label: 'Müşteri', color: 'var(--secondary-color)' },
    usta: { label: 'Usta', color: 'var(--primary-color)' },
    dukkan: { label: 'Mağaza', color: 'var(--warning)' },
  };
  const r = map[role] || { label: role, color: 'var(--text-muted)' };
  return (
    <span style={{
      fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.55rem',
      borderRadius: '999px', background: r.color + '22', color: r.color,
    }}>
      {r.label}
    </span>
  );
};

// ── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    'Açık': { bg: 'var(--success-light)', color: 'var(--success)' },
    'Kapalı': { bg: 'var(--warning-light)', color: 'var(--warning)' },
    'Tamamlandı': { bg: 'var(--primary-light)', color: 'var(--primary-color)' },
    'Reddedildi': { bg: 'var(--danger-light)', color: 'var(--danger)' },
    'Beklemede': { bg: 'var(--warning-light)', color: 'var(--warning)' },
    'Kabul Edildi': { bg: 'var(--success-light)', color: 'var(--success)' },
    'Pazarlıkta': { bg: 'var(--primary-light)', color: 'var(--primary-color)' },
  };
  const s = map[status] || { bg: 'var(--bg-tertiary)', color: 'var(--text-muted)' };
  return (
    <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.55rem', borderRadius: '999px', background: s.bg, color: s.color }}>
      {status}
    </span>
  );
};

// ════════════════════════════════════════════════════════════════════════════
export default function AdminPanel() {
  const { currentUser, users, jobs, offers, refreshData } = useAppContext();
  const [tab, setTab] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [jobStatusFilter, setJobStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [expandedUser, setExpandedUser] = useState(null);

  // Admin kontrolü
  const username = currentUser?.username || currentUser?.email?.split('@')[0];
  const normalizedName = currentUser?.name?.toLowerCase().replace(/\s/g, '');
  const isAdmin = currentUser && (
    ADMIN_USERNAMES.includes(username) ||
    ADMIN_USERNAMES.includes(normalizedName) ||
    currentUser.email?.includes('admin') ||
    currentUser.email?.includes('ahmetusta') ||
    currentUser.role === 'admin'
  );
  if (!currentUser) return <Navigate to="/" />;
  if (!isAdmin) return (
    <div className="container section" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <Shield size={64} style={{ color: 'var(--danger)', marginBottom: '1rem' }} />
      <h2>Yetkisiz Erişim</h2>
      <p className="text-muted">Bu sayfaya erişim yetkiniz bulunmuyor.</p>
    </div>
  );

  // ── Dashboard İstatistikleri ─────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const ustalar = users.filter(u => u.role === 'usta');
    const musteriler = users.filter(u => u.role === 'musteri');
    const magazalar = users.filter(u => u.role === 'dukkan');
    const openJobs = jobs.filter(j => j.status === 'Açık');
    const closedJobs = jobs.filter(j => j.status === 'Kapalı');
    const completedJobs = jobs.filter(j => j.status === 'Tamamlandı');
    const acceptedOffers = offers.filter(o => o.status === 'Kabul Edildi');
    const totalRevenue = acceptedOffers.reduce((sum, o) => sum + (o.counter_price || o.price || 0), 0);
    const avgRating = ustalar.length > 0
      ? (ustalar.reduce((s, u) => s + (u.rating || 0), 0) / ustalar.length).toFixed(1)
      : '0.0';

    return {
      totalUsers, ustalar: ustalar.length, musteriler: musteriler.length,
      magazalar: magazalar.length, openJobs: openJobs.length,
      closedJobs: closedJobs.length, completedJobs: completedJobs.length,
      totalJobs: jobs.length, totalOffers: offers.length,
      acceptedOffers: acceptedOffers.length, totalRevenue, avgRating,
      topUsta: [...ustalar].sort((a, b) => (b.completed_jobs || 0) - (a.completed_jobs || 0)).slice(0, 5),
      categoryBreakdown: jobs.reduce((acc, j) => {
        const cat = j.category || 'Genel';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {}),
    };
  }, [users, jobs, offers]);

  // ── Kullanıcı filtrele / sırala ──────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    let list = [...users];
    if (roleFilter !== 'all') list = list.filter(u => u.role === roleFilter);
    if (search) list = list.filter(u =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    );
    return list;
  }, [users, roleFilter, search]);

  // ── İlan filtrele ────────────────────────────────────────────────────────
  const filteredJobs = useMemo(() => {
    let list = [...jobs];
    if (jobStatusFilter !== 'all') list = list.filter(j => j.status === jobStatusFilter);
    if (search && tab === 'jobs') list = list.filter(j =>
      j.title?.toLowerCase().includes(search.toLowerCase()) ||
      j.location?.toLowerCase().includes(search.toLowerCase())
    );
    list.sort((a, b) => {
      if (sortField === 'budget') return sortDir === 'asc' ? a.budget - b.budget : b.budget - a.budget;
      return sortDir === 'asc'
        ? new Date(a.created_at) - new Date(b.created_at)
        : new Date(b.created_at) - new Date(a.created_at);
    });
    return list;
  }, [jobs, jobStatusFilter, search, sortField, sortDir, tab]);

  // ── Aksiyon: İlanı Kapat ─────────────────────────────────────────────────
  const handleCloseJob = async (jobId) => {
    setLoading(true);
    const { error } = await supabase.from('jobs').update({ status: 'Kapalı' }).eq('id', jobId);
    if (!error) { await refreshData?.(); showMsg('✅ İlan kapatıldı.'); }
    else showMsg('❌ Hata: ' + error.message);
    setLoading(false);
  };

  // ── Aksiyon: İlanı Sil ───────────────────────────────────────────────────
  const handleDeleteJob = async (jobId) => {
    if (!confirm('Bu ilanı silmek istediğinize emin misiniz?')) return;
    setLoading(true);
    const { error } = await supabase.from('jobs').delete().eq('id', jobId);
    if (!error) { await refreshData?.(); showMsg('🗑️ İlan silindi.'); }
    else showMsg('❌ Hata: ' + error.message);
    setLoading(false);
  };

  const showMsg = (msg) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(''), 3000);
  };

  const maxCat = Math.max(...Object.values(stats.categoryBreakdown), 1);

  return (
    <div className="admin-shell">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <Shield size={20} style={{ color: 'var(--primary-color)' }} />
          <span>Admin Panel</span>
        </div>
        <nav className="admin-nav">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`admin-nav-item ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <t.icon size={18} />
              <span>{t.label}</span>
              {t.id === 'users' && <span className="admin-nav-badge">{stats.totalUsers}</span>}
              {t.id === 'jobs' && <span className="admin-nav-badge">{stats.totalJobs}</span>}
              {t.id === 'offers' && <span className="admin-nav-badge">{stats.totalOffers}</span>}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <button className="admin-refresh-btn" onClick={() => refreshData?.()} disabled={loading}>
            <RefreshCw size={15} className={loading ? 'spin' : ''} /> Yenile
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="admin-main">
        {/* Header */}
        <div className="admin-topbar">
          <div>
            <h1 className="admin-page-title">
              {TABS.find(t => t.id === tab)?.label}
            </h1>
            <p className="admin-page-sub">UstaAhşap yönetim merkezi</p>
          </div>
          {actionMsg && (
            <div className="admin-action-msg">{actionMsg}</div>
          )}
          <div className="admin-topbar-right">
            <span className="admin-user-chip">
              <Shield size={14} /> {currentUser.name}
            </span>
          </div>
        </div>

        {/* ── DASHBOARD ── */}
        {tab === 'dashboard' && (
          <div className="admin-dashboard">
            {/* Ana İstatistikler */}
            <div className="admin-stats-grid">
              <StatCard icon={Users} label="Toplam Kullanıcı" value={stats.totalUsers} color="var(--primary-color)" />
              <StatCard icon={Hammer} label="Kayıtlı Usta" value={stats.ustalar} sub={`Ort. ${stats.avgRating}★`} color="#E8A95C" />
              <StatCard icon={Package} label="Müşteri" value={stats.musteriler} color="var(--secondary-color)" />
              <StatCard icon={Briefcase} label="Toplam İlan" value={stats.totalJobs} color="var(--success)" />
              <StatCard icon={Activity} label="Açık İlan" value={stats.openJobs} color="var(--warning)" />
              <StatCard icon={CheckCircle} label="Tamamlanan" value={stats.completedJobs} color="var(--success)" />
              <StatCard icon={TrendingUp} label="Teklif Sayısı" value={stats.totalOffers} color="var(--primary-color)" />
              <StatCard icon={ShoppingBag} label="Anlaşılan İş" value={stats.acceptedOffers} color="#E8A95C" />
            </div>

            <div className="admin-two-col">
              {/* Kategori Dağılımı */}
              <div className="admin-card">
                <h3 className="admin-card-title"><BarChart2 size={16} /> İş Kategorileri</h3>
                {Object.entries(stats.categoryBreakdown).length === 0 ? (
                  <p className="text-muted text-sm">Henüz veri yok.</p>
                ) : (
                  Object.entries(stats.categoryBreakdown)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, count]) => (
                      <MiniBar key={cat} label={cat} value={count} max={maxCat} color="var(--primary-color)" />
                    ))
                )}
              </div>

              {/* En İyi Ustalar */}
              <div className="admin-card">
                <h3 className="admin-card-title"><Crown size={16} /> En Aktif Ustalar</h3>
                {stats.topUsta.length === 0 ? (
                  <p className="text-muted text-sm">Henüz veri yok.</p>
                ) : (
                  <div className="admin-top-list">
                    {stats.topUsta.map((u, i) => (
                      <div key={u.id} className="admin-top-item">
                        <span className="admin-top-rank">{i + 1}</span>
                        <div className="admin-top-avatar">
                          {u.avatar_url
                            ? <img src={u.avatar_url} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : u.name?.charAt(0)}
                        </div>
                        <div className="admin-top-info">
                          <span className="admin-top-name">{u.name}</span>
                          <span className="admin-top-sub">{u.completed_jobs || 0} iş · {u.rating?.toFixed(1) || '0.0'}★</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Son İlanlar */}
            <div className="admin-card">
              <h3 className="admin-card-title"><Clock size={16} /> Son Açılan İlanlar</h3>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Başlık</th><th>Kategori</th><th>Bütçe</th><th>Durum</th><th>Teklif</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...jobs].slice(0, 8).map(j => (
                      <tr key={j.id}>
                        <td><span className="admin-job-title">{j.title}</span></td>
                        <td><span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{j.category || 'Genel'}</span></td>
                        <td><strong style={{ color: 'var(--success)' }}>{Number(j.budget).toLocaleString('tr-TR')} ₺</strong></td>
                        <td><StatusBadge status={j.status} /></td>
                        <td><span className="admin-offer-count">{offers.filter(o => (o.jobId || o.job_id) === j.id).length}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── KULLANICILAR ── */}
        {tab === 'users' && (
          <div>
            {/* Filtreler */}
            <div className="admin-filters">
              <div className="admin-search-wrap">
                <Search size={16} />
                <input
                  className="admin-search"
                  placeholder="Ad, kullanıcı adı veya email ara..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="admin-filter-btns">
                {['all', 'musteri', 'usta', 'dukkan'].map(r => (
                  <button
                    key={r}
                    className={`admin-filter-btn ${roleFilter === r ? 'active' : ''}`}
                    onClick={() => setRoleFilter(r)}
                  >
                    {r === 'all' ? 'Tümü' : r === 'musteri' ? 'Müşteriler' : r === 'usta' ? 'Ustalar' : 'Mağazalar'}
                    <span>{r === 'all' ? stats.totalUsers : r === 'musteri' ? stats.musteriler : r === 'usta' ? stats.ustalar : stats.magazalar}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Kullanıcı Tablosu */}
            <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Kullanıcı</th><th>Rol</th><th>İstatistik</th><th>Durum</th><th>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => {
                      const userJobs = jobs.filter(j => j.createdBy === u.id || j.selectedUsta === u.id);
                      const userOffers = offers.filter(o => (o.ustaId || o.usta_id) === u.id);
                      return (
                        <React.Fragment key={u.id}>
                          <tr
                            className={`admin-user-row ${expandedUser === u.id ? 'expanded' : ''}`}
                            onClick={() => setExpandedUser(expandedUser === u.id ? null : u.id)}
                          >
                            <td>
                              <div className="admin-user-cell">
                                <div className="admin-user-avatar">
                                  {u.avatar_url
                                    ? <img src={u.avatar_url} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                    : u.name?.charAt(0)}
                                </div>
                                <div>
                                  <div className="admin-user-name">{u.name}</div>
                                  <div className="admin-user-email">@{u.username || '—'}</div>
                                </div>
                              </div>
                            </td>
                            <td><RoleBadge role={u.role} /></td>
                            <td>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                {u.role === 'usta' && <><Star size={11} style={{ display: 'inline' }} /> {u.rating?.toFixed(1) || '0.0'} · {u.completed_jobs || 0} iş</>}
                                {u.role === 'musteri' && <>{userJobs.length} ilan</>}
                                {u.role === 'dukkan' && <>{u.products?.length || 0} ürün</>}
                              </div>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.7rem', color: 'var(--success)' }}>● Aktif</span>
                            </td>
                            <td>
                              <button className="admin-icon-btn" title="Detay">
                                {expandedUser === u.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                              </button>
                            </td>
                          </tr>
                          {expandedUser === u.id && (
                            <tr className="admin-user-detail-row">
                              <td colSpan={5}>
                                <div className="admin-user-detail">
                                  <div className="admin-detail-grid">
                                    <div><span className="ad-label">ID</span><span className="ad-val">{u.id?.slice(0, 8)}...</span></div>
                                    <div><span className="ad-label">Email</span><span className="ad-val">{u.email || '—'}</span></div>
                                    <div><span className="ad-label">Rol</span><span className="ad-val">{u.role}</span></div>
                                    {u.role === 'usta' && (
                                      <>
                                        <div><span className="ad-label">Puan</span><span className="ad-val">{u.rating?.toFixed(2) || '0.00'}</span></div>
                                        <div><span className="ad-label">Teklif</span><span className="ad-val">{userOffers.length}</span></div>
                                        <div><span className="ad-label">Rozet</span><span className="ad-val">{u.badges?.join(', ') || '—'}</span></div>
                                      </>
                                    )}
                                    {u.role === 'musteri' && (
                                      <div><span className="ad-label">İlan Sayısı</span><span className="ad-val">{userJobs.length}</span></div>
                                    )}
                                  </div>
                                  {u.bio && <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>{u.bio}</p>}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="admin-table-footer">
                {filteredUsers.length} kullanıcı gösteriliyor
              </div>
            </div>
          </div>
        )}

        {/* ── İLANLAR ── */}
        {tab === 'jobs' && (
          <div>
            <div className="admin-filters">
              <div className="admin-search-wrap">
                <Search size={16} />
                <input
                  className="admin-search"
                  placeholder="İlan başlığı veya konum ara..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="admin-filter-btns">
                {['all', 'Açık', 'Kapalı', 'Tamamlandı'].map(s => (
                  <button
                    key={s}
                    className={`admin-filter-btn ${jobStatusFilter === s ? 'active' : ''}`}
                    onClick={() => setJobStatusFilter(s)}
                  >
                    {s === 'all' ? 'Tümü' : s}
                  </button>
                ))}
              </div>
              <div className="admin-sort-btns">
                <button className={`admin-sort-btn ${sortField === 'created_at' ? 'active' : ''}`} onClick={() => { setSortField('created_at'); setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }}>
                  Tarih {sortField === 'created_at' && (sortDir === 'asc' ? '↑' : '↓')}
                </button>
                <button className={`admin-sort-btn ${sortField === 'budget' ? 'active' : ''}`} onClick={() => { setSortField('budget'); setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }}>
                  Bütçe {sortField === 'budget' && (sortDir === 'asc' ? '↑' : '↓')}
                </button>
              </div>
            </div>

            <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>İlan</th><th>Kategori</th><th>Bütçe</th><th>Konum</th><th>Durum</th><th>Teklif</th><th>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.map(j => {
                      const jOffers = offers.filter(o => (o.jobId || o.job_id) === j.id);
                      const poster = users.find(u => u.id === j.createdBy);
                      return (
                        <tr key={j.id}>
                          <td>
                            <div>
                              <div className="admin-job-title">{j.title}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {poster?.name || '—'}
                              </div>
                            </div>
                          </td>
                          <td><span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{j.category || 'Genel'}</span></td>
                          <td><strong style={{ color: 'var(--success)', fontSize: '0.9rem' }}>{Number(j.budget).toLocaleString('tr-TR')} ₺</strong></td>
                          <td><span style={{ fontSize: '0.78rem' }}>{j.location || '—'}</span></td>
                          <td><StatusBadge status={j.status} /></td>
                          <td><span className="admin-offer-count">{jOffers.length}</span></td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.375rem' }}>
                              {j.status === 'Açık' && (
                                <button
                                  className="admin-icon-btn warning"
                                  title="Kapat"
                                  onClick={() => handleCloseJob(j.id)}
                                  disabled={loading}
                                >
                                  <XCircle size={15} />
                                </button>
                              )}
                              <button
                                className="admin-icon-btn danger"
                                title="Sil"
                                onClick={() => handleDeleteJob(j.id)}
                                disabled={loading}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="admin-table-footer">
                {filteredJobs.length} ilan gösteriliyor · Toplam bütçe: {filteredJobs.reduce((s, j) => s + Number(j.budget || 0), 0).toLocaleString('tr-TR')} ₺
              </div>
            </div>
          </div>
        )}

        {/* ── TEKLİFLER ── */}
        {tab === 'offers' && (
          <div>
            <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Usta</th><th>İlan</th><th>İlk Teklif</th><th>Son Fiyat</th><th>Tur</th><th>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...offers].slice(0, 50).map(o => {
                      const job = jobs.find(j => j.id === (o.jobId || o.job_id));
                      return (
                        <tr key={o.id}>
                          <td><span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{o.usta_name || '—'}</span></td>
                          <td><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{job?.title?.slice(0, 40) || '—'}</span></td>
                          <td><strong style={{ color: 'var(--primary-color)' }}>{Number(o.price).toLocaleString('tr-TR')} ₺</strong></td>
                          <td>
                            {o.counter_price
                              ? <strong style={{ color: o.counter_price < o.price ? 'var(--success)' : 'var(--danger)' }}>{Number(o.counter_price).toLocaleString('tr-TR')} ₺</strong>
                              : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
                            }
                          </td>
                          <td>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              {o.negotiation_round || 1}. tur
                            </span>
                          </td>
                          <td><StatusBadge status={o.status || 'Beklemede'} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="admin-table-footer">
                {offers.length} teklif · {stats.acceptedOffers} kabul edildi
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
