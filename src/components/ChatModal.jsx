import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';
import { Send, X } from 'lucide-react';

const ChatModal = ({ jobId, ustaId, onClose }) => {
  const { currentUser, users } = useAppContext();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const getUser = (id) => users.find(u => u.id === id);

  // ── İlk mesajları çek ──
  useEffect(() => {
    if (!jobId || !ustaId) return;

    const fetchMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('job_id', jobId)
        .eq('usta_id', ustaId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data.map(mapMsg));
      }
      setLoading(false);
    };

    fetchMessages();

    // ── Real-time subscription ──
    const channel = supabase
      .channel(`chat-${jobId}-${ustaId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `job_id=eq.${jobId}`,
      }, (payload) => {
        const msg = payload.new;
        if (msg.usta_id === ustaId) {
          setMessages(prev => {
            // Duplicate kontrolü
            if (prev.find(m => m.id === msg.id)) return prev;
            return [...prev, mapMsg(msg)];
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId, ustaId]);

  const mapMsg = (msg) => ({
    id: msg.id,
    senderId: msg.sender_id,
    text: msg.text,
    time: new Date(msg.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
  });

  // ── Scroll to bottom ──
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Focus input on open ──
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !currentUser || sending) return;

    setSending(true);
    setText('');

    const { data, error } = await supabase
      .from('messages')
      .insert({
        job_id: jobId,
        usta_id: ustaId,
        sender_id: currentUser.id,
        text: trimmed,
      })
      .select()
      .single();

    if (!error && data) {
      setMessages(prev => {
        if (prev.find(m => m.id === data.id)) return prev;
        return [...prev, mapMsg(data)];
      });
    } else if (error) {
      console.error('Mesaj gönderilemedi:', error.message);
      setText(trimmed); // geri koy
    }

    setSending(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const otherUser = getUser(currentUser?.id === ustaId ? null : ustaId);

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div
        className="chat-modal"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-avatar">
              {otherUser?.name?.charAt(0) || '💬'}
            </div>
            <div>
              <div className="chat-name">{otherUser?.name || 'Sohbet'}</div>
              <div className="chat-status">● Çevrimiçi</div>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Mesajlar */}
        <div className="chat-body">
          {loading ? (
            <div className="chat-loading">Yükleniyor...</div>
          ) : messages.length === 0 ? (
            <div className="chat-empty">
              <span>👋</span>
              <p>Henüz mesaj yok. Merhaba diyerek başlayın!</p>
            </div>
          ) : (
            messages.map(msg => {
              const isMine = msg.senderId === currentUser?.id;
              return (
                <div key={msg.id} className={`chat-bubble-wrap ${isMine ? 'mine' : 'theirs'}`}>
                  <div className={`chat-bubble ${isMine ? 'bubble-mine' : 'bubble-theirs'}`}>
                    <span className="bubble-text">{msg.text}</span>
                    <span className="bubble-time">{msg.time}</span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <form className="chat-input-row" onSubmit={handleSend}>
          <input
            ref={inputRef}
            type="text"
            className="chat-input"
            placeholder="Mesaj yazın... (Enter ile gönder)"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending}
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={!text.trim() || sending}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
