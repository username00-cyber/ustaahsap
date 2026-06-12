import React, { useState } from 'react';
import { MessageSquare, Check, X, TrendingDown, TrendingUp, Clock, AlertCircle } from 'lucide-react';

const MAX_ROUNDS = 3;

export default function NegotiationPanel({ offer, currentUser, job, onCounter, onAccept, onReject }) {
  const [showCounter, setShowCounter] = useState(false);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterMessage, setCounterMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!offer) return null;

  const history = Array.isArray(offer.negotiation_history) ? offer.negotiation_history : [];
  const round = offer.negotiation_round || 1;
  const lastActor = offer.last_actor || 'usta';
  const status = offer.status || 'Beklemede';

  // Kim hareket edebilir?
  const isUsta = currentUser?.role === 'usta';
  const isMusteri = currentUser?.role === 'musteri';
  const myTurn = (isMusteri && lastActor === 'usta') || (isUsta && lastActor === 'musteri');
  const canCounter = myTurn && round < MAX_ROUNDS && status === 'Pazarlıkta';
  const canAccept = myTurn && (status === 'Beklemede' || status === 'Pazarlıkta');
  const isFinished = status === 'Kabul Edildi' || status === 'Reddedildi' || status === 'Sona Erdi';

  const handleCounter = async () => {
    if (!counterPrice || Number(counterPrice) <= 0) return;
    setSubmitting(true);
    await onCounter(offer.id, Number(counterPrice), counterMessage);
    setShowCounter(false);
    setCounterPrice('');
    setCounterMessage('');
    setSubmitting(false);
  };

  const handleAccept = async () => {
    setSubmitting(true);
    await onAccept(offer.id, offer.job_id, offer.usta_id);
    setSubmitting(false);
  };

  const handleReject = async () => {
    setSubmitting(true);
    await onReject(offer.id);
    setSubmitting(false);
  };

  const currentPrice = offer.counter_price || offer.price;

  return (
    <div className="negotiation-panel">
      {/* Başlık */}
      <div className="neg-header">
        <MessageSquare size={18} />
        <span>Teklif Pazarlığı</span>
        <span className={`neg-status status-${status.toLowerCase().replace(/ /g, '-')}`}>
          {status}
        </span>
      </div>

      {/* Tur göstergesi */}
      {!isFinished && (
        <div className="neg-rounds">
          {[1, 2, 3].map(r => (
            <div key={r} className={`neg-round-dot ${r < round ? 'done' : r === round ? 'current' : ''}`}>
              {r < round ? '✓' : r}
            </div>
          ))}
          <span className="neg-rounds-label">
            {isFinished ? 'Tamamlandı' : `${round}. tur${round === MAX_ROUNDS ? ' (son)' : ''}`}
          </span>
        </div>
      )}

      {/* Fiyat gösterimi */}
      <div className="neg-price-display">
        <div className="neg-original-price">
          <span>İlk Teklif</span>
          <strong>{offer.price?.toLocaleString('tr-TR')} TL</strong>
        </div>
        {offer.counter_price && offer.counter_price !== offer.price && (
          <div className="neg-current-price">
            <span>Güncel Teklif</span>
            <strong className="price-green">{offer.counter_price.toLocaleString('tr-TR')} TL</strong>
            {offer.counter_price < offer.price
              ? <TrendingDown size={16} className="trend-down" />
              : <TrendingUp size={16} className="trend-up" />
            }
          </div>
        )}
      </div>

      {/* Pazarlık Geçmişi */}
      {history.length > 0 && (
        <div className="neg-history">
          <h4>Pazarlık Geçmişi</h4>
          {history.map((h, i) => (
            <div key={i} className={`neg-history-item ${h.by === 'usta' ? 'by-usta' : 'by-musteri'}`}>
              <div className="neg-history-who">
                <span className="who-badge">{h.by === 'usta' ? '⚒️ Usta' : '👤 Müşteri'}</span>
                <span className="neg-history-time">
                  <Clock size={12} /> {new Date(h.at).toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                </span>
              </div>
              <div className="neg-history-price">{h.price?.toLocaleString('tr-TR')} TL</div>
              {h.message && <div className="neg-history-msg">"{h.message}"</div>}
            </div>
          ))}
        </div>
      )}

      {/* Aksiyon Butonları */}
      {!isFinished && canAccept && !showCounter && (
        <div className="neg-actions">
          {myTurn ? (
            <>
              <button
                className="btn btn-success neg-btn"
                onClick={handleAccept}
                disabled={submitting}
              >
                <Check size={16} /> {currentPrice?.toLocaleString('tr-TR')} TL'yi Kabul Et
              </button>
              {round < MAX_ROUNDS && (
                <button
                  className="btn btn-warning neg-btn"
                  onClick={() => setShowCounter(true)}
                >
                  <MessageSquare size={16} /> Karşı Teklif Ver
                </button>
              )}
              <button
                className="btn btn-outline-danger neg-btn"
                onClick={handleReject}
                disabled={submitting}
              >
                <X size={16} /> Reddet
              </button>
            </>
          ) : (
            <div className="neg-waiting">
              <AlertCircle size={16} />
              <span>Karşı tarafın hareketi bekleniyor...</span>
            </div>
          )}
        </div>
      )}

      {/* Karşı Teklif Formu */}
      {showCounter && (
        <div className="neg-counter-form">
          <h4>Karşı Teklifiniz</h4>
          <div className="neg-field">
            <label>Teklif Fiyatı (TL)</label>
            <input
              type="number"
              value={counterPrice}
              onChange={e => setCounterPrice(e.target.value)}
              placeholder="Örn: 8500"
              autoFocus
            />
            <div className="neg-hint">
              {round === MAX_ROUNDS - 1 && (
                <span className="neg-last-round-warning">⚠️ Bu son pazarlık turunuz!</span>
              )}
            </div>
          </div>
          <div className="neg-field">
            <label>Mesaj (isteğe bağlı)</label>
            <textarea
              value={counterMessage}
              onChange={e => setCounterMessage(e.target.value)}
              placeholder="Fiyatı neden önerdiğinizi açıklayın..."
              rows={2}
            />
          </div>
          <div className="neg-counter-btns">
            <button className="btn btn-ghost" onClick={() => setShowCounter(false)}>İptal</button>
            <button
              className="btn btn-primary"
              onClick={handleCounter}
              disabled={submitting || !counterPrice}
            >
              {submitting ? 'Gönderiliyor...' : 'Karşı Teklif Gönder'}
            </button>
          </div>
        </div>
      )}

      {/* Sonuç */}
      {isFinished && (
        <div className={`neg-result ${status === 'Kabul Edildi' ? 'result-accepted' : 'result-rejected'}`}>
          {status === 'Kabul Edildi' ? (
            <><Check size={20} /> Anlaşma sağlandı! {currentPrice?.toLocaleString('tr-TR')} TL</>
          ) : (
            <><X size={20} /> Teklif {status.toLowerCase()}.</>
          )}
        </div>
      )}
    </div>
  );
}
