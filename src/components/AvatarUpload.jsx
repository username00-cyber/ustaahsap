import React, { useState, useRef } from 'react';
import { Camera, Loader } from 'lucide-react';
import { storageService } from '../services/storageService';
import { supabase } from '../lib/supabase';

/**
 * Avatar / profil fotoğrafı yükleme bileşeni
 * Props:
 *   userId     - kullanıcı ID'si
 *   currentUrl - mevcut fotoğraf URL'si (varsa)
 *   name       - kullanıcı adı (ilk harf için)
 *   size       - 'sm' | 'md' | 'lg' (default: 'md')
 *   onUpdate   - yeni URL ile çağrılır
 *   editable   - düzenleme modu (default: false)
 */
export default function AvatarUpload({ userId, currentUrl, name, size = 'md', onUpdate, editable = false }) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentUrl || null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const sizeMap = {
    sm: { box: 40, font: '1rem', iconSize: 12 },
    md: { box: 72, font: '1.5rem', iconSize: 16 },
    lg: { box: 110, font: '2rem', iconSize: 20 },
  };
  const s = sizeMap[size] || sizeMap.md;

  const handleClick = () => {
    if (!editable || uploading) return;
    inputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasyon
    if (!file.type.startsWith('image/')) {
      setError('Sadece resim dosyası yükleyebilirsiniz.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Dosya 5 MB\'dan küçük olmalı.');
      return;
    }

    setError('');
    setUploading(true);

    // Önizleme göster
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    try {
      const publicUrl = await storageService.uploadAvatar(userId, file);

      // Profili güncelle
      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      setPreviewUrl(publicUrl);
      onUpdate?.(publicUrl);
    } catch (err) {
      console.error('Avatar yükleme hatası:', err.message);
      setError('Yükleme başarısız. Supabase Storage bucket\'ı kontrol edin.');
      setPreviewUrl(currentUrl || null); // geri al
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
      <div
        onClick={handleClick}
        style={{
          width: s.box, height: s.box, borderRadius: '50%',
          background: previewUrl ? 'transparent' : 'var(--gradient-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: s.font, fontWeight: 700, color: 'white',
          position: 'relative', cursor: editable ? 'pointer' : 'default',
          overflow: 'hidden',
          border: '2px solid var(--border-color)',
          transition: 'opacity 0.2s',
          opacity: uploading ? 0.6 : 1,
        }}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => setPreviewUrl(null)}
          />
        ) : (
          <span>{name?.charAt(0)?.toUpperCase() || '?'}</span>
        )}

        {/* Overlay for edit */}
        {editable && !uploading && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0, transition: 'opacity 0.2s',
          }}
            className="avatar-overlay"
          >
            <Camera size={s.iconSize} color="white" />
          </div>
        )}

        {uploading && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Loader size={s.iconSize} color="white" className="spin" />
          </div>
        )}
      </div>

      {editable && (
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      )}

      {editable && !uploading && (
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={handleClick}>
          Fotoğraf değiştir
        </span>
      )}

      {error && (
        <span style={{ fontSize: '0.7rem', color: 'var(--danger)', maxWidth: s.box * 2, textAlign: 'center' }}>
          {error}
        </span>
      )}
    </div>
  );
}
