import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Heart, MessageCircle, Share2, Send, UserPlus, Users, MessageSquare, Check, X, Camera, Globe } from 'lucide-react';
import DirectChatModal from '../components/DirectChatModal';
import { Navigate } from 'react-router-dom';

const Community = () => {
  const {
    posts, users, currentUser, toggleLikePost, sendDirectMessage,
    sendFriendRequest, acceptFriendRequest, rejectFriendRequest, addPost, addCommentToPost, comments
  } = useAppContext();

  const [activeTab, setActiveTab] = useState('feed');
  const [newPost, setNewPost] = useState('');
  const [postImage, setPostImage] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [chatUserTarget, setChatUserTarget] = useState(null);
  const [shareModalFor, setShareModalFor] = useState(null);
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [tempComment, setTempComment] = useState('');

  if (!currentUser) return <Navigate to="/" />;

  const myFriends = currentUser.friends || [];
  const myFriendRequests = currentUser.friendRequests || [];

  const suggestedPeople = users.filter(u =>
    u.id !== currentUser.id &&
    !myFriends.includes(u.id) &&
    !myFriendRequests.includes(u.id) &&
    !(u.friendRequests || []).includes(currentUser.id)
  );

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim() && !postImage.trim()) return;
    await addPost(newPost, postImage.trim() ? postImage : null);
    setNewPost('');
    setPostImage('');
    setShowImageInput(false);
  };

  const handleForwardPost = (friendId, post) => {
    sendDirectMessage(friendId, `Sana bir gönderi ilettim: "${post.content.substring(0, 60)}..."`);
    setShareModalFor(null);
    setChatUserTarget(friendId);
  };

  const tabs = [
    { id: 'feed', icon: <Globe size={18} />, label: 'Zaman Akışı' },
    { id: 'network', icon: <Users size={18} />, label: 'Ağım' },
    { id: 'messages', icon: <MessageSquare size={18} />, label: 'Mesajlar' },
  ];

  return (
    <div style={{ background: 'var(--bg-color)', minHeight: '100vh', paddingBottom: '3rem' }}>
      {/* Tab Bar */}
      <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: '56px', zIndex: 50 }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, padding: '1rem', background: 'transparent', border: 'none', cursor: 'pointer',
                borderBottom: activeTab === tab.id ? '3px solid var(--primary-color)' : '3px solid transparent',
                color: activeTab === tab.id ? 'var(--primary-color)' : 'var(--text-muted)',
                fontWeight: activeTab === tab.id ? '700' : '500', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                fontSize: '0.875rem', transition: 'all 0.2s'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1.5rem 1rem' }}>

        {/* ── FEED TAB ── */}
        {activeTab === 'feed' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Compose */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <form onSubmit={handlePost}>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder={`Aklında ne var, ${currentUser.name.split(' ')[0]}?`}
                  value={newPost}
                  onChange={e => setNewPost(e.target.value)}
                  style={{ resize: 'none', marginBottom: '0.75rem' }}
                />
                {showImageInput && (
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Resim URL (https://...)"
                    value={postImage}
                    onChange={e => setPostImage(e.target.value)}
                    style={{ marginBottom: '0.75rem' }}
                  />
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${showImageInput ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setShowImageInput(!showImageInput)}
                  >
                    <Camera size={15} /> Görsel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    <Send size={15} /> Paylaş
                  </button>
                </div>
              </form>
            </div>

            {/* Posts */}
            {posts.map(post => {
              const author = users.find(u => u.id === post.author_id);
              const hasLiked = (post.liked_by || []).includes(currentUser.id);
              const postDate = post.created_at ? new Date(post.created_at).toLocaleDateString('tr-TR') : 'Az önce';
              const postComments = comments.filter(c => c.post_id === post.id);

              return (
                <div className="card" key={post.id} style={{ padding: 0, overflow: 'hidden' }}>
                  {/* Post Header */}
                  <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                      background: 'var(--gradient-primary)', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700'
                    }}>
                      {author?.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{author?.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {author?.role === 'usta' ? '⚒️ Usta' : author?.role === 'dukkan' ? '🏪 Mağaza' : '👤 Müşteri'} · {postDate}
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div style={{ padding: '1rem 1.25rem' }}>
                    <p style={{ whiteSpace: 'pre-line', lineHeight: '1.6', fontSize: '0.9rem' }}>{post.content}</p>
                  </div>
                  {post.image && (
                    <img src={post.image} alt="Post" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} />
                  )}

                  {/* Actions */}
                  <div style={{ padding: '0.625rem 1.25rem', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', background: 'var(--bg-tertiary)' }}>
                    <button
                      onClick={() => toggleLikePost(post.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.375rem',
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: hasLiked ? 'var(--danger)' : 'var(--text-muted)',
                        fontSize: '0.8rem', fontWeight: '600', padding: '0.375rem 0.625rem',
                        borderRadius: 'var(--radius-sm)', transition: 'all 0.2s', fontFamily: 'inherit'
                      }}
                    >
                      <Heart size={16} fill={hasLiked ? 'currentColor' : 'none'} /> {post.likes}
                    </button>
                    <button
                      onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.375rem',
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: activeCommentPost === post.id ? 'var(--primary-color)' : 'var(--text-muted)',
                        fontSize: '0.8rem', fontWeight: '600', padding: '0.375rem 0.625rem',
                        borderRadius: 'var(--radius-sm)', transition: 'all 0.2s', fontFamily: 'inherit'
                      }}
                    >
                      <MessageCircle size={16} /> {post.comments}
                    </button>
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={() => setShareModalFor(shareModalFor === post.id ? null : post.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.375rem',
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600',
                          padding: '0.375rem 0.625rem', borderRadius: 'var(--radius-sm)',
                          transition: 'all 0.2s', fontFamily: 'inherit'
                        }}
                      >
                        <Share2 size={16} /> Paylaş
                      </button>
                      {shareModalFor === post.id && (
                        <div style={{
                          position: 'absolute', right: 0, bottom: '100%', marginBottom: '0.5rem',
                          width: '180px', background: 'var(--card-bg)', border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-md)', padding: '0.5rem', boxShadow: 'var(--shadow-lg)', zIndex: 10
                        }}>
                          <p style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', padding: '0.25rem 0.5rem', marginBottom: '0.25rem' }}>Arkadaşlara Gönder:</p>
                          {myFriends.length === 0 && (
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0.5rem' }}>Henüz arkadaşınız yok.</p>
                          )}
                          {myFriends.map(fId => (
                            <button
                              key={fId}
                              onClick={() => handleForwardPost(fId, post)}
                              style={{
                                width: '100%', textAlign: 'left', padding: '0.5rem 0.625rem',
                                background: 'transparent', border: 'none', cursor: 'pointer',
                                fontSize: '0.8rem', color: 'var(--text-main)', borderRadius: 'var(--radius-sm)',
                                fontFamily: 'inherit', transition: 'background 0.2s'
                              }}
                              onMouseEnter={e => e.target.style.background = 'var(--bg-tertiary)'}
                              onMouseLeave={e => e.target.style.background = 'transparent'}
                            >
                              {users.find(u => u.id === fId)?.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comments */}
                  {activeCommentPost === post.id && (
                    <div style={{ borderTop: '1px solid var(--border-color)', padding: '1rem 1.25rem', background: 'var(--bg-color)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1rem', maxHeight: '200px', overflowY: 'auto' }}>
                        {postComments.length === 0 && (
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>İlk yorumu sen yap!</p>
                        )}
                        {postComments.map(com => (
                          <div key={com.id} style={{ display: 'flex', gap: '0.625rem', fontSize: '0.8rem' }}>
                            <div style={{
                              width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                              background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', fontWeight: '700', fontSize: '0.7rem', color: 'var(--primary-color)'
                            }}>
                              {com.author_name?.charAt(0)}
                            </div>
                            <div style={{ background: 'var(--bg-tertiary)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', flex: 1 }}>
                              <span style={{ fontWeight: '700', display: 'block', fontSize: '0.75rem' }}>{com.author_name}</span>
                              <p style={{ marginTop: '0.125rem' }}>{com.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Bir yorum yaz..."
                          value={tempComment}
                          onChange={e => setTempComment(e.target.value)}
                          style={{ fontSize: '0.85rem' }}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              addCommentToPost(post.id, tempComment);
                              setTempComment('');
                            }
                          }}
                        />
                        <button
                          className="btn btn-primary"
                          style={{ padding: '0 0.875rem' }}
                          onClick={() => { addCommentToPost(post.id, tempComment); setTempComment(''); }}
                        >
                          <Send size={15} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── NETWORK TAB ── */}
        {activeTab === 'network' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            {/* Friend Requests */}
            {myFriendRequests.length > 0 && (
              <div className="card" style={{ gridColumn: '1 / -1', borderLeft: '3px solid var(--warning)' }}>
                <h4 style={{ marginBottom: '0.75rem', color: 'var(--warning)', fontSize: '0.9rem' }}>
                  🔔 Arkadaşlık İstekleri ({myFriendRequests.length})
                </h4>
                {myFriendRequests.map(fromId => {
                  const u = users.find(x => x.id === fromId);
                  return (
                    <div key={fromId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                      <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{u?.name}</span>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <button onClick={() => acceptFriendRequest(fromId)} className="btn btn-success btn-sm">
                          <Check size={14} />
                        </button>
                        <button onClick={() => rejectFriendRequest(fromId)} className="btn btn-outline-danger btn-sm">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Friends */}
            <div className="card">
              <h4 style={{ fontWeight: '700', marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Arkadaşlarım ({myFriends.length})
              </h4>
              {myFriends.length === 0 ? (
                <p className="text-muted text-sm">Henüz arkadaşınız yok.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {myFriends.map(fId => {
                    const u = users.find(x => x.id === fId);
                    return (
                      <div key={fId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.625rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{u?.name}</span>
                        <button onClick={() => setChatUserTarget(fId)} className="btn btn-ghost btn-sm">
                          <MessageSquare size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Suggestions */}
            <div className="card">
              <h4 style={{ fontWeight: '700', marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Tanıyor Olabilirsin
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {suggestedPeople.slice(0, 5).map(u => (
                  <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.625rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                    <div>
                      <span style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block' }}>{u.name}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {u.role === 'usta' ? '⚒️ Usta' : u.role === 'dukkan' ? '🏪 Mağaza' : '👤 Müşteri'}
                      </span>
                    </div>
                    <button onClick={() => sendFriendRequest(u.id)} className="btn btn-primary btn-sm">
                      <UserPlus size={14} />
                    </button>
                  </div>
                ))}
                {suggestedPeople.length === 0 && (
                  <p className="text-muted text-sm">Öneri bulunamadı.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── MESSAGES TAB ── */}
        {activeTab === 'messages' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', fontWeight: '700', fontSize: '0.9rem' }}>
              💬 Mesajlarım
            </div>
            {myFriends.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p className="text-muted text-sm">Mesajlaşmak için önce arkadaş edinin.</p>
              </div>
            ) : (
              myFriends.map(fId => {
                const u = users.find(x => x.id === fId);
                return (
                  <button
                    key={fId}
                    onClick={() => setChatUserTarget(fId)}
                    style={{
                      width: '100%', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)',
                      textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.875rem',
                      background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                      background: 'var(--gradient-primary)', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700'
                    }}>
                      {u?.name.charAt(0)}
                    </div>
                    <div>
                      <span style={{ fontWeight: '700', display: 'block', fontSize: '0.9rem', color: 'var(--text-heading)' }}>{u?.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {u?.role === 'usta' ? '⚒️ Usta' : u?.role === 'dukkan' ? '🏪 Mağaza' : '👤 Müşteri'}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {chatUserTarget && (
        <DirectChatModal targetUserId={chatUserTarget} onClose={() => setChatUserTarget(null)} />
      )}
    </div>
  );
};

export default Community;
