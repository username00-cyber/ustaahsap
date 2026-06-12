import React, { useState } from 'react';
import { CATEGORIES, calculateEstimatedPrice } from '../data/categories';
import { ChevronRight, ChevronLeft, Calculator, MapPin, FileText, Layers } from 'lucide-react';

const STEPS = ['Kategori', 'Detaylar', 'Ek Bilgiler', 'Özet'];

export default function JobWizard({ onSubmit, onCancel }) {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState('');
  const [area, setArea] = useState('');
  const [answers, setAnswers] = useState({});
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [useEstimate, setUseEstimate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const cat = CATEGORIES.find(c => c.id === category);
  const estimate = cat && area > 0
    ? calculateEstimatedPrice(category, Number(area), answers)
    : null;

  const handleAnswerChange = (qId, value) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const canNext = () => {
    if (step === 0) return !!category;
    if (step === 1) return area > 0 && title.trim() && location.trim();
    if (step === 2) return true;
    return true;
  };

  const handleNext = () => {
    if (step === 1 && useEstimate && estimate) {
      setBudget(String(estimate.estimated));
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const finalBudget = useEstimate && estimate ? estimate.estimated : Number(budget);
    await onSubmit({
      title: title || `${cat?.label} — ${area} ${cat?.unit}`,
      description,
      budget: finalBudget,
      location,
      category,
      area_m2: Number(area),
      extra_options: answers,
      estimated_price: estimate?.estimated || 0,
    });
    setSubmitting(false);
  };

  return (
    <div className="wizard-overlay">
      <div className="wizard-modal">
        {/* Header */}
        <div className="wizard-header">
          <h2>İş İlanı Oluştur</h2>
          <div className="wizard-steps">
            {STEPS.map((s, i) => (
              <div key={s} className={`wizard-step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
                <span className="wizard-step-num">{i < step ? '✓' : i + 1}</span>
                <span className="wizard-step-label">{s}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="wizard-body">
          {/* ADIM 0: KATEGORİ SEÇ */}
          {step === 0 && (
            <div className="wizard-categories">
              <h3><Layers size={18} /> Hangi hizmeti almak istiyorsunuz?</h3>
              <div className="cat-grid">
                {CATEGORIES.map(c => (
                  <button
                    key={c.id}
                    className={`cat-card ${category === c.id ? 'selected' : ''}`}
                    onClick={() => {
                      setCategory(c.id);
                      setTitle(c.label);
                      setAnswers({});
                    }}
                  >
                    <span className="cat-emoji">{c.emoji}</span>
                    <span className="cat-label">{c.label}</span>
                    <span className="cat-price">{c.minPrice}–{c.maxPrice} TL/{c.unit}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ADIM 1: ALAN & TEMEL BİLGİLER */}
          {step === 1 && cat && (
            <div className="wizard-details">
              <h3><FileText size={18} /> İş Detayları</h3>
              <div className="wizard-field">
                <label>Başlık</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder={cat.label}
                />
              </div>
              <div className="wizard-field">
                <label>{cat.emoji} {cat.unit === 'm²' ? 'Kaç metrekare?' : cat.unit === 'adet' ? 'Kaç adet?' : 'Kaç basamak?'}</label>
                <div className="wizard-input-row">
                  <input
                    type="number"
                    min="1"
                    value={area}
                    onChange={e => setArea(e.target.value)}
                    placeholder={`Örn: ${cat.unit === 'm²' ? '50' : '5'}`}
                  />
                  <span className="wizard-unit">{cat.unit}</span>
                </div>
              </div>
              <div className="wizard-field">
                <label><MapPin size={14} /> Konum</label>
                <input
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="İlçe, Şehir"
                />
              </div>
              <div className="wizard-field">
                <label>Ek Açıklama (isteğe bağlı)</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Özel notlar, istekler..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* ADIM 2: EK SORULAR */}
          {step === 2 && cat && (
            <div className="wizard-questions">
              <h3><Calculator size={18} /> Fiyatı Etkileyen Detaylar</h3>
              <p className="wizard-hint">Bu sorular piyasaya göre otomatik fiyat tahmini oluşturmak için kullanılır.</p>

              {cat.questions.map(q => (
                <div key={q.id} className="wizard-question">
                  <div className="q-label">
                    {q.label}
                    <span className="q-hint">{q.hint}</span>
                  </div>

                  {q.type === 'boolean' && (
                    <div className="q-toggle-row">
                      <button
                        className={`q-toggle ${answers[q.id] === true ? 'active-yes' : ''}`}
                        onClick={() => handleAnswerChange(q.id, true)}
                      >
                        ✅ Evet
                        {q.priceImpact.type === 'percent' && (
                          <span className="q-price-tag">+%{q.priceImpact.value}</span>
                        )}
                        {q.priceImpact.type === 'fixed_per_m2' && (
                          <span className="q-price-tag">+{q.priceImpact.value}TL/m²</span>
                        )}
                      </button>
                      <button
                        className={`q-toggle ${answers[q.id] === false ? 'active-no' : ''}`}
                        onClick={() => handleAnswerChange(q.id, false)}
                      >
                        ❌ Hayır
                      </button>
                    </div>
                  )}

                  {q.type === 'select' && (
                    <div className="q-select-row">
                      {q.options.map(opt => (
                        <button
                          key={opt.value}
                          className={`q-option ${answers[q.id] === opt.value ? 'selected' : ''}`}
                          onClick={() => handleAnswerChange(q.id, opt.value)}
                        >
                          {opt.label}
                          {opt.priceImpact?.value > 0 && (
                            <span className="q-price-tag">+%{opt.priceImpact.value}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Anlık Fiyat Tahmini */}
              {estimate && area > 0 && (
                <div className="price-estimate-box">
                  <div className="pe-header">
                    <Calculator size={20} />
                    <span>Akıllı Fiyat Tahmini</span>
                  </div>
                  <div className="pe-range">
                    <span className="pe-min">{estimate.min.toLocaleString('tr-TR')} TL</span>
                    <span className="pe-sep">—</span>
                    <span className="pe-max">{estimate.max.toLocaleString('tr-TR')} TL</span>
                  </div>
                  <div className="pe-estimated">
                    Önerilen: <strong>{estimate.estimated.toLocaleString('tr-TR')} TL</strong>
                  </div>
                  <div className="pe-note">
                    * {area} {cat.unit} × piyasa birim fiyatı × seçilen seçenekler
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ADIM 3: ÖZET & BÜTÇE */}
          {step === 3 && cat && (
            <div className="wizard-summary">
              <h3>İlan Özeti</h3>
              <div className="summary-card">
                <div className="sc-row"><span>Hizmet</span><strong>{cat.emoji} {cat.label}</strong></div>
                <div className="sc-row"><span>Alan/Miktar</span><strong>{area} {cat.unit}</strong></div>
                <div className="sc-row"><span>Konum</span><strong>{location}</strong></div>
                {estimate && (
                  <div className="sc-row">
                    <span>Tahmini Fiyat</span>
                    <strong className="price-green">{estimate.estimated.toLocaleString('tr-TR')} TL</strong>
                  </div>
                )}
              </div>

              <div className="wizard-field">
                <label>Bütçeniz (TL)</label>
                <div className="budget-row">
                  <input
                    type="number"
                    value={budget}
                    onChange={e => { setBudget(e.target.value); setUseEstimate(false); }}
                    placeholder="Teklif beklenen tutar"
                  />
                  {estimate && (
                    <button
                      className={`btn-use-estimate ${useEstimate ? 'active' : ''}`}
                      onClick={() => { setUseEstimate(true); setBudget(String(estimate.estimated)); }}
                    >
                      Tahmini kullan
                    </button>
                  )}
                </div>
                <p className="field-hint">Ustalar bu bütçeye göre teklif verecek, pazarlık yapabilirsiniz.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Butonlar */}
        <div className="wizard-footer">
          <button className="btn btn-ghost" onClick={step === 0 ? onCancel : () => setStep(s => s - 1)}>
            {step === 0 ? 'İptal' : <><ChevronLeft size={16} /> Geri</>}
          </button>
          {step < 3 ? (
            <button
              className="btn btn-primary btn-glow"
              onClick={handleNext}
              disabled={!canNext()}
            >
              İleri <ChevronRight size={16} />
            </button>
          ) : (
            <button
              className="btn btn-primary btn-glow"
              onClick={handleSubmit}
              disabled={submitting || (!budget && !useEstimate)}
            >
              {submitting ? 'Yayınlanıyor...' : '🚀 İlanı Yayınla'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
