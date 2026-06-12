import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Settings, Plus, Box, Send, Clock, CheckCircle, XCircle } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';

const ShopPanel = () => {
  const { currentUser, users, jobs, addProductToShop, createJob, forwardShopJobToUsta } = useAppContext();

  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [productImage, setProductImage] = useState('');
  const [colors, setColors] = useState([]);
  const [tempColorName, setTempColorName] = useState('');
  const [tempColorHex, setTempColorHex] = useState('#c4a35a');
  const [sizes, setSizes] = useState([]);
  const [tempSizeName, setTempSizeName] = useState('');
  const [tempSizePrice, setTempSizePrice] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobBudget, setJobBudget] = useState('');
  const [targetUsta, setTargetUsta] = useState('');
  const [activeTab, setActiveTab] = useState('jobs');

  if (!currentUser || currentUser.role !== 'dukkan') return <Navigate to="/" />;

  const assignedMasters = users.filter(u => u.role === 'usta' && u.shopId === currentUser.id);
  const mySentJobs = jobs.filter(j => j.createdBy === currentUser.id && j.selectedUsta);
  const customerRequests = jobs.filter(j => j.targetShopId === currentUser.id && j.status === 'Mağazaya Atandı');

  const handleAddColor = () => {
    if (!tempColorName) return;
    setColors([...colors, { id: 'c' + Date.now(), name: tempColorName, hex: tempColorHex }]);
    setTempColorName('');
  };

  const handleAddSize = () => {
    if (!tempSizeName) return;
    setSizes([...sizes, { id: 's' + Date.now(), name: tempSizeName, priceOffset: Number(tempSizePrice || 0) }]);
    setTempSizeName('');
    setTempSizePrice('');
  };

  const handleProductSubmit = (e) => {
    e.preventDefault();
    const newProduct = {
      name: productName,
      price: Number(productPrice),
      description: productDesc,
      image: productImage || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=400',
      options: { colors, sizes }
    };
    addProductToShop(currentUser.id, newProduct);
    setProductName(''); setProductPrice(''); setProductDesc(''); setProductImage('');
    setColors([]); setSizes([]);
    alert('Ürün vitrine eklendi! ✅');
  };

  const handleSendJob = (e) => {
    e.preventDefault();
    if (!targetUsta) { alert('Lütfen bir usta seçin!'); return; }
    createJob(jobTitle, jobDesc, jobBudget, 'Belirtilen Adres', false, {}, targetUsta);
    alert('İş başarıyla ustanıza iletildi! ✅');
    setJobTitle(''); setJobDesc(''); setJobBudget(''); setTargetUsta('');
  };

  const tabs = [
    { id: 'jobs', label: '📦 İş Yönetimi' },
    { id: 'products', label: '🛍️ Ürün Yönetimi' },
  ];

  return (
    <div className="container section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings size={28} style={{ color: 'var(--primary-color)' }} /> Dükkan Paneli
          </h1>
          <p className="text-muted text-sm">{currentUser.name}</p>
        </div>
      </div>

      {/* Pending customer requests banner */}
      {customerRequests.length > 0 && (
        <div className="card" style={{ marginBottom: '2rem', borderLeft: '3px solid var(--warning)', background: 'var(--warning-light)' }}>
          <h3 style={{ color: 'var(--warning)', fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🔔 Bekleyen Müşteri Kurulum Talepleri ({customerRequests.length})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {customerRequests.map(job => {
              const customerName = users.find(u => u.id === job.createdBy)?.name || 'Müşteri';
              return (
                <div key={job.id} style={{ background: 'var(--card-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{customerName}</span>
                    <span style={{ color: 'var(--success)', fontWeight: '700' }}>₺{job.budget}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{job.description?.substring(0, 80)}...</p>
                  <label className="form-label" style={{ fontSize: '0.7rem' }}>Yönlendirilecek Usta:</label>
                  <select className="form-control" style={{ marginBottom: '0.5rem', fontSize: '0.8rem' }} id={`fwd-${job.id}`}>
                    <option value="">Seçiniz...</option>
                    {assignedMasters.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <button
                    className="btn btn-primary btn-block btn-sm"
                    onClick={() => {
                      const el = document.getElementById(`fwd-${job.id}`);
                      if (el?.value) { forwardShopJobToUsta(job.id, el.value); alert('Yönlendirildi! ✅'); }
                      else alert('Lütfen usta seçin!');
                    }}
                  >
                    <Send size={14} /> Ustama Yönlendir
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem', borderBottom: '2px solid var(--border-color)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1.25rem', background: 'transparent', border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--primary-color)' : '2px solid transparent',
              marginBottom: '-2px', cursor: 'pointer', fontWeight: activeTab === tab.id ? '700' : '500',
              color: activeTab === tab.id ? 'var(--primary-color)' : 'var(--text-muted)',
              fontFamily: 'inherit', fontSize: '0.875rem', transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── JOBS TAB ── */}
      {activeTab === 'jobs' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Send Job Form */}
          <div className="card" style={{ border: '2px solid var(--primary-color)' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}>
              <Send size={20} /> Ustama İş Yönlendir
            </h2>
            <p className="text-muted text-sm" style={{ marginBottom: '1rem' }}>Dükkanınıza bağlı ustalarınıza özel iş gönderin.</p>
            <form onSubmit={handleSendJob}>
              <div className="form-group">
                <label className="form-label">İş Başlığı</label>
                <input type="text" className="form-control" value={jobTitle} onChange={e => setJobTitle(e.target.value)} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Ücret (₺)</label>
                  <input type="number" className="form-control" value={jobBudget} onChange={e => setJobBudget(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Usta Seç</label>
                  <select className="form-control" value={targetUsta} onChange={e => setTargetUsta(e.target.value)} required>
                    <option value="">Seçiniz...</option>
                    {assignedMasters.length === 0 && <option disabled>Bağlı usta yok</option>}
                    {assignedMasters.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Detaylar</label>
                <textarea className="form-control" rows="3" value={jobDesc} onChange={e => setJobDesc(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary btn-block">
                <Send size={16} /> Gönder
              </button>
            </form>
          </div>

          {/* Sent Jobs */}
          <div className="card" style={{ background: 'var(--bg-tertiary)' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Gönderilen İşler</h2>
            {mySentJobs.length === 0 ? (
              <p className="text-muted text-sm text-center" style={{ padding: '2rem' }}>Henüz özel iş göndermediniz.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', maxHeight: '320px', overflowY: 'auto' }}>
                {mySentJobs.map(job => {
                  const ustaName = users.find(u => u.id === job.selectedUsta)?.name || '?';
                  const isAccepted = job.status === 'Kabul Edildi' || job.status === 'Kapalı';
                  const isRejected = job.status === 'Reddedildi';
                  return (
                    <div key={job.id} style={{ padding: '0.75rem', background: 'var(--card-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>{job.title}</span>
                        <span style={{
                          fontSize: '0.7rem', fontWeight: '700', padding: '0.125rem 0.5rem',
                          borderRadius: '9999px',
                          background: isAccepted ? 'var(--success-light)' : isRejected ? 'var(--danger-light)' : 'var(--warning-light)',
                          color: isAccepted ? 'var(--success)' : isRejected ? 'var(--danger)' : 'var(--warning)'
                        }}>
                          {isAccepted ? <CheckCircle size={10} style={{ display: 'inline', marginRight: '2px' }} /> :
                            isRejected ? <XCircle size={10} style={{ display: 'inline', marginRight: '2px' }} /> :
                              <Clock size={10} style={{ display: 'inline', marginRight: '2px' }} />}
                          {job.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Usta: {ustaName}</span>
                        <span style={{ color: 'var(--success)', fontWeight: '600' }}>₺{job.budget}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PRODUCTS TAB ── */}
      {activeTab === 'products' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Add Product Form */}
          <div className="card">
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={20} style={{ color: 'var(--primary-color)' }} /> Yeni Ürün Ekle
            </h2>
            <form onSubmit={handleProductSubmit}>
              <div className="form-group">
                <label className="form-label">Ürün Adı</label>
                <input type="text" className="form-control" value={productName} onChange={e => setProductName(e.target.value)} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Taban Fiyat (₺)</label>
                  <input type="number" className="form-control" value={productPrice} onChange={e => setProductPrice(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Ürün Görseli</label>
                  <ImageUpload
                    currentUrl={productImage || null}
                    onUpload={setProductImage}
                    folder="products"
                    size="lg"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Açıklama</label>
                <textarea className="form-control" rows="2" value={productDesc} onChange={e => setProductDesc(e.target.value)} required />
              </div>

              {/* Colors */}
              <div style={{ marginBottom: '1rem', padding: '0.875rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <label className="form-label">🎨 Renk Seçenekleri</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.5rem' }}>
                  {colors.map(c => (
                    <span key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'var(--card-bg)', borderRadius: '9999px', border: '1px solid var(--border-color)' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: c.hex }} /> {c.name}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" placeholder="Renk Adı" className="form-control" value={tempColorName} onChange={e => setTempColorName(e.target.value)} style={{ flex: 1 }} />
                  <input type="color" className="form-control" value={tempColorHex} onChange={e => setTempColorHex(e.target.value)} style={{ width: '48px', padding: '0.25rem' }} />
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddColor}>Ekle</button>
                </div>
              </div>

              {/* Sizes */}
              <div style={{ marginBottom: '1rem', padding: '0.875rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <label className="form-label">📐 Ölçü Seçenekleri</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.5rem' }}>
                  {sizes.map(s => (
                    <span key={s.id} className="badge badge-pending">{s.name} (+₺{s.priceOffset})</span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" placeholder="Ölçü (örn: 120x15cm)" className="form-control" value={tempSizeName} onChange={e => setTempSizeName(e.target.value)} style={{ flex: 1 }} />
                  <input type="number" placeholder="Fark ₺" className="form-control" value={tempSizePrice} onChange={e => setTempSizePrice(e.target.value)} style={{ width: '80px' }} />
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddSize}>Ekle</button>
                </div>
              </div>

              <button type="submit" className="btn btn-success btn-block">
                <Box size={18} /> Ürünü Vitrine Taşı
              </button>
            </form>
          </div>

          {/* Products List */}
          <div className="card" style={{ background: 'var(--bg-tertiary)' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Mevcut Ürünlerim</h2>
            {currentUser.products && currentUser.products.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '480px', overflowY: 'auto' }}>
                {currentUser.products.map(p => (
                  <div key={p.id} style={{ padding: '0.75rem', background: 'var(--card-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <img src={p.image} style={{ width: '56px', height: '48px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} alt={p.name} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '700', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.description?.substring(0, 40)}...</div>
                      <div style={{ color: 'var(--success)', fontWeight: '700', fontSize: '0.875rem', marginTop: '0.125rem' }}>₺{p.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-sm text-center" style={{ padding: '2rem' }}>Vitrinize henüz ürün eklemediniz.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPanel;
