import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { User, Store, Hammer, AtSign, Lock, ArrowRight } from 'lucide-react';

const AuthModal = ({ type, onClose, onSwitch }) => {
  const { login, register } = useAppContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('musteri');
  
  // SMS Simülasyonu için State'ler
  const [step, setStep] = useState('form');
  const [smsCode, setSmsCode] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '');
    if (!cleanUsername) return alert('Kullanıcı adı boş olamaz.');
    const fakeEmail = `${cleanUsername}@ustasec.app`;

    if (type === 'login') {
      const success = await login(fakeEmail, password);
      if (success) {
        onClose();
        window.location.reload();
      }
    } else {
      if (!phone || phone.length < 10) return alert('Lütfen geçerli bir telefon numarası girin.');
      setStep('sms');
    }
  };

  const handleSmsSubmit = async (e) => {
    e.preventDefault();
    if (smsCode !== '123456') {
      alert('Hatalı kod! Lütfen test kodu olan 123456\'yı girin.');
      return;
    }

    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '');
    const fakeEmail = `${cleanUsername}@ustasec.app`;
    
    const success = await register(name, fakeEmail, password, role);
    if (success) {
      onClose();
      window.location.reload();
    }
  };

  const roleOptions = [
    { value: 'musteri', label: 'Müşteri', desc: 'İş ilanı verin', icon: <User size={18} /> },
    { value: 'usta', label: 'Usta', desc: 'Hizmet verin', icon: <Hammer size={18} /> },
    { value: 'dukkan', label: 'Dükkan', desc: 'Ürün satın', icon: <Store size={18} /> }
  ];

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 2000 }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 0 30px rgba(99, 102, 241, 0.3)'
          }}>
            {type === 'login' ? <Lock size={24} color="white" /> : <User size={24} color="white" />}
          </div>
          <h2 style={{ fontSize: '1.375rem', marginBottom: '0.25rem' }}>
            {step === 'sms' ? 'Telefon Doğrulama' : type === 'login' ? 'Hoş Geldiniz' : 'Hesap Oluşturun'}
          </h2>
          <p className="text-muted text-sm">
            {step === 'sms' 
              ? 'Lütfen telefonunuza gönderilen doğrulama kodunu girin.' 
              : type === 'login' ? 'UstaAhşap hesabınıza giriş yapın' : 'UstaAhşap platformuna katılın'}
          </p>
        </div>

        {step === 'sms' ? (
          <form onSubmit={handleSmsSubmit}>
            <div style={{ textAlign: 'center', background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                <b style={{ color: 'var(--text-heading)' }}>{phone}</b> numarasına SMS gönderildi.
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: '600' }}>
                Test Ortamı SMS Kodu: 123456
              </div>
            </div>

            <div className="form-group">
              <label className="form-label text-center" style={{ display: 'block' }}>6 Haneli Doğrulama Kodu</label>
              <input
                type="text"
                className="form-control"
                placeholder="123456"
                value={smsCode}
                onChange={e => setSmsCode(e.target.value.replace(/[^0-9]/g, ''))}
                maxLength={6}
                required
                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem', padding: '1rem' }}
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" style={{ padding: '0.75rem', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Doğrula ve Kayıt Ol <ArrowRight size={16} />
            </button>
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button type="button" className="btn btn-ghost" style={{ fontSize: '0.8rem' }} onClick={() => setStep('form')}>
                Geri Dön ve Bilgileri Düzenle
              </button>
            </div>
          </form>
        ) : (
        <>
        <form onSubmit={handleSubmit}>
          {type === 'register' && (
            <>
              <div className="form-group">
                <label className="form-label">Ad Soyad</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Adınız Soyadınız"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Telefon Numarası</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="05XX XXX XX XX"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  required
                  maxLength={11}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Kullanıcı Adı</label>
            <div style={{ position: 'relative' }}>
              <AtSign size={16} style={{
                position: 'absolute', left: '0.75rem', top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-muted)'
              }} />
              <input
                type="text"
                className="form-control"
                placeholder="kullanici_adi"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                style={{ paddingLeft: '2.25rem' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Şifre</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {type === 'register' && (
            <div className="form-group">
              <label className="form-label">Hesap Türü</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {roleOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    style={{
                      flex: 1, padding: '0.75rem 0.5rem',
                      borderRadius: 'var(--radius-md)',
                      border: role === opt.value ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                      background: role === opt.value ? 'var(--primary-light)' : 'var(--bg-tertiary)',
                      cursor: 'pointer', textAlign: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.25rem', color: role === opt.value ? 'var(--primary-color)' : 'var(--text-muted)' }}>
                      {opt.icon}
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-heading)' }}>{opt.label}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block" style={{ padding: '0.75rem', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            {type === 'login' ? 'Giriş Yap' : 'Kayıt Ol'} <ArrowRight size={16} />
          </button>
        </form>

        {type === 'login' && (
          <div style={{
            marginTop: '1rem', padding: '0.75rem',
            background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
            fontSize: '0.7rem', color: 'var(--text-muted)'
          }}>
            <strong style={{ color: 'var(--text-heading)' }}>Demo Hesaplar:</strong><br />
            <span>Müşteri: <b>mustafayilmaz</b> / Demo1234!</span><br />
            <span>Usta: <b>ahmetusta</b> / Demo1234!</span><br />
            <span>Dükkan: <b>gopparke</b> / Demo1234!</span>
          </div>
        )}

        <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.8rem' }}>
          {type === 'login' ? (
            <p className="text-muted">Hesabınız yok mu? <a href="#" onClick={(e) => { e.preventDefault(); onSwitch('register'); }} style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Kayıt Olun</a></p>
          ) : (
            <p className="text-muted">Zaten üye misiniz? <a href="#" onClick={(e) => { e.preventDefault(); onSwitch('login'); }} style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Giriş Yapın</a></p>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
