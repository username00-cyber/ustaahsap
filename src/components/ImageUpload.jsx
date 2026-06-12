import React, { useState, useRef } from 'react';
import { Upload, X, Image, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

/**
 * Reusable image upload component using Supabase Storage.
 * Props:
 *   currentUrl  – existing image URL (to preview)
 *   onUpload    – callback(url) called after successful upload
 *   folder      – storage folder (e.g. 'avatars', 'portfolio', 'products')
 *   size        – 'sm' | 'md' | 'lg'  (preview size)
 *   label       – optional label string
 */
const ImageUpload = ({ currentUrl, onUpload, folder = 'misc', size = 'md', label = 'Fotoğraf Yükle' }) => {
  const [preview, setPreview] = useState(currentUrl || null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const sizes = {
    sm: { width: '80px', height: '80px', fontSize: '0.65rem' },
    md: { width: '120px', height: '120px', fontSize: '0.7rem' },
    lg: { width: '100%', height: '180px', fontSize: '0.75rem' },
  };
  const sz = sizes[size] || sizes.md;

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Lütfen bir görsel dosyası seçin (jpg, png, webp).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Dosya 5 MB\'den büyük olamaz.');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(fileName);

      setPreview(publicUrl);
      onUpload(publicUrl);
    } catch (err) {
      alert('Yükleme hatası: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const onInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const clear = (e) => {
    e.stopPropagation();
    setPreview(null);
    onUpload(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div
      onClick={() => !uploading && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      style={{
        position: 'relative',
        width: sz.width,
        height: sz.height,
        borderRadius: size === 'lg' ? 'var(--radius-lg)' : '50%',
        border: dragging
          ? '2px dashed var(--primary-color)'
          : '2px dashed var(--border-color)',
        background: preview ? 'transparent' : 'var(--bg-tertiary)',
        cursor: uploading ? 'wait' : 'pointer',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'border-color 0.2s, background 0.2s',
        flexShrink: 0,
      }}
    >
      {preview ? (
        <>
          <img
            src={preview}
            alt="Önizleme"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <button
            onClick={clear}
            style={{
              position: 'absolute', top: '4px', right: '4px',
              background: 'rgba(0,0,0,0.6)', border: 'none',
              borderRadius: '50%', width: '20px', height: '20px',
              cursor: 'pointer', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={12} />
          </button>
        </>
      ) : uploading ? (
        <Loader size={22} style={{ color: 'var(--primary-color)', animation: 'spin 1s linear infinite' }} />
      ) : (
        <>
          {size === 'lg'
            ? <Image size={28} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
            : <Upload size={18} style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }} />
          }
          <span style={{ fontSize: sz.fontSize, color: 'var(--text-muted)', textAlign: 'center', padding: '0 0.5rem' }}>
            {size === 'lg' ? 'Sürükle bırak veya tıkla' : label}
          </span>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={onInputChange}
      />
    </div>
  );
};

export default ImageUpload;
