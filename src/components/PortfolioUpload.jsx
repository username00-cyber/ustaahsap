import React, { useState } from 'react';
import { Upload, X, Plus, Loader } from 'lucide-react';
import { storageService } from '../services/storageService';
import { supabase } from '../lib/supabase';

/**
 * Portfolio fotoğraf yükleme bileşeni
 * Props:
 *   userId    - kullanıcı ID
 *   photos    - mevcut portfolio fotoğrafları [{id, image_url, title}]
 *   editable  - true ise yükleme/silme butonları göster
 *   onRefresh - yükleme/silme sonrası yenile
 */
export default function PortfolioUpload({ userId, photos = [], editable = false, onRefresh }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [titleInput, setTitleInput] = useState('');

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) { setError('Sadece resim yükleyebilirsiniz.'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('Dosya 10 MB\'dan küçük olmalı.'); return; }
    if (photos.length >= 12) { setError('Maksimum 12 fotoğraf yükleyebilirsiniz.'); return; }

    setError('');
    setUploading(true);

    try {
      const publicUrl = await storageService.uploadPortfolioPhoto(userId, file);

      await supabase.from('portfolio').insert({
        user_id: userId,
        image_url: publicUrl,
        title: titleInput || 'Portfolyo Fotoğrafı',
      });

      setTitleInput('');
      onRefresh?.();
    } catch (err) {
      console.error('Portfolio yükleme hatası:', err.message);
      setError('Yükleme başarısız. Supabase "portfolio" bucket\'ını kontrol edin.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (photo) => {
    try {
      await supabase.from('portfolio').delete().eq('id', photo.id);
      onRefresh?.();
    } catch (err) {
      console.error('Silme hatası:', err.message);
    }
  };

  return (
    <div className="portfolio-section">
      {/* Fotoğraf Grid */}
      <div className="portfolio-grid">
        {photos.map(photo => (
          <div key={photo.id} className="portfolio-item">
            <img
              src={photo.image_url}
              alt={photo.title || 'Portfolio'}
              className="portfolio-img"
              onError={e => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150"><rect fill="%23221C16" width="200" height="150"/><text fill="%238A7B6D" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="14">Yüklenemedi</text></svg>'; }}
            />
            {photo.title && (
              <div className="portfolio-label">{photo.title}</div>
            )}
            {editable && (
              <button
                className="portfolio-delete"
                onClick={() => handleDelete(photo)}
                title="Sil"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}

        {/* Yükleme Butonu */}
        {editable && photos.length < 12 && (
          <label className={`portfolio-upload-btn ${uploading ? 'uploading' : ''}`}>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleUpload}
              disabled={uploading}
            />
            {uploading ? (
              <Loader size={24} className="spin" />
            ) : (
              <>
                <Plus size={24} />
                <span>Fotoğraf Ekle</span>
              </>
            )}
          </label>
        )}
      </div>

      {/* Başlık Input */}
      {editable && (
        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            className="form-control"
            style={{ maxWidth: '240px', fontSize: '0.82rem', padding: '0.4rem 0.7rem' }}
            placeholder="Sonraki fotoğraf başlığı (isteğe bağlı)"
            value={titleInput}
            onChange={e => setTitleInput(e.target.value)}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{photos.length}/12 fotoğraf</span>
        </div>
      )}

      {error && (
        <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.5rem' }}>{error}</p>
      )}
    </div>
  );
}
