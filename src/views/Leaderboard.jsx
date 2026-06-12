import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Trophy, Star, CheckCircle, Crown } from 'lucide-react';

const Leaderboard = () => {
  const { users } = useAppContext();

  const masters = users
    .filter(u => u.role === 'usta')
    .sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.completedJobs - a.completedJobs;
    });

  const medalColors = ['#f59e0b', '#9ca3af', '#b45309'];
  const medalEmoji = ['🥇', '🥈', '🥉'];

  return (
    <div className="container section">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <Trophy size={48} style={{ color: 'var(--warning)' }} />
        </div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Usta Liderlik Tablosu</h1>
        <p className="text-muted">Müşterilerimizden en yüksek puanı alan ve en çok iş tamamlayan güvenilir ustalarımız.</p>
      </div>

      {/* Top 3 Podium */}
      {masters.length >= 3 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '2.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {[masters[1], masters[0], masters[2]].map((master, displayIdx) => {
            const realIdx = displayIdx === 0 ? 1 : displayIdx === 1 ? 0 : 2;
            return (
              <div key={master.id} style={{
                textAlign: 'center',
                padding: '1.5rem 1rem',
                background: 'var(--card-bg)',
                borderRadius: 'var(--radius-lg)',
                border: `1px solid ${realIdx === 0 ? 'rgba(245,158,11,0.4)' : 'var(--border-color)'}`,
                minWidth: '140px',
                boxShadow: realIdx === 0 ? '0 0 30px rgba(245,158,11,0.15)' : 'none',
                transform: realIdx === 0 ? 'scale(1.08)' : 'none',
                transition: 'all 0.3s'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{medalEmoji[realIdx]}</div>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%', margin: '0 auto 0.75rem',
                  background: realIdx === 0 ? 'linear-gradient(135deg,#fbbf24,#f59e0b)' : 'var(--gradient-primary)',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.25rem', fontWeight: '800'
                }}>
                  {master.name.charAt(0)}
                </div>
                <Link to={`/usta/${master.id}`} style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-heading)' }}>
                  {master.name.split(' ')[0]}
                </Link>
                <div style={{ color: 'var(--success)', fontWeight: '700', fontSize: '1.125rem', marginTop: '0.25rem' }}>
                  <Star size={14} fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle' }} /> {master.rating}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {master.completedJobs} iş
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', maxWidth: '700px', margin: '0 auto' }}>
        {masters.map((master, index) => (
          <div
            key={master.id}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1rem 1.5rem',
              borderBottom: index < masters.length - 1 ? '1px solid var(--border-color)' : 'none',
              transition: 'background 0.2s',
              background: index === 0 ? 'rgba(245,158,11,0.05)' : 'transparent'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
            onMouseLeave={e => e.currentTarget.style.background = index === 0 ? 'rgba(245,158,11,0.05)' : 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: index < 3 ? medalColors[index] : 'var(--bg-tertiary)',
                color: index < 3 ? '#fff' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: '700', fontSize: '0.9rem', flexShrink: 0,
                border: index >= 3 ? '1px solid var(--border-color)' : 'none'
              }}>
                {index < 3 ? medalEmoji[index] : index + 1}
              </div>
              <div>
                <Link to={`/usta/${master.id}`} style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-heading)' }}>
                  {master.name}
                </Link>
                {master.badges && master.badges.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                    {master.badges.slice(0, 2).map((b, i) => (
                      <span key={i} style={{ fontSize: '0.65rem', background: 'var(--warning-light)', color: 'var(--warning)', padding: '0.125rem 0.5rem', borderRadius: '9999px' }}>
                        {b}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success)', fontWeight: '800', fontSize: '1.25rem' }}>
                  <Star size={16} fill="currentColor" /> {master.rating}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Puan Ort.</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '800', fontSize: '1.125rem' }}>
                  <CheckCircle size={16} style={{ color: 'var(--primary-color)' }} /> {master.completedJobs}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Tamamlanan</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
