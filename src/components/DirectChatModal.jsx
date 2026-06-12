import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Send, X, User } from 'lucide-react';

const DirectChatModal = ({ targetUserId, onClose }) => {
  const { currentUser, users, directMessages, sendDirectMessage } = useAppContext();
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  const targetUser = users.find(u => u.id === targetUserId);

  // Filter messages between these two users
  const chatMessages = directMessages.filter(m => 
    (m.senderId === currentUser.id && m.receiverId === targetUserId) ||
    (m.senderId === targetUserId && m.receiverId === currentUser.id)
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendDirectMessage(targetUserId, text);
    setText('');
  };

  if (!targetUser) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 2000 }}>
      <div className="modal-content md:!rounded-xl" onClick={e => e.stopPropagation()} style={{ 
        maxWidth: '500px', 
        display: 'flex', 
        flexDirection: 'column', 
        height: 'var(--chat-h, 80vh)', 
        padding: 0,
        margin: 0,
        borderRadius: '0' 
      }}>
        
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
               {targetUser.name.charAt(0)}
             </div>
             <div>
               <h3 className="font-bold">{targetUser.name}</h3>
               <span className="text-xs text-muted">{targetUser.role === 'usta' ? 'Usta' : targetUser.role === 'dukkan' ? 'Mağaza' : 'Müşteri'}</span>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors border-none bg-transparent cursor-pointer"><X size={20}/></button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
          {chatMessages.length === 0 ? (
            <div className="text-center text-muted my-auto flex flex-col items-center">
              <User size={40} className="mb-2 opacity-50"/>
              <p>Sohbet geçmişi yok.</p>
              <p className="text-xs">Mesaj göndererek sohbeti başlatın.</p>
            </div>
          ) : (
            chatMessages.map(msg => {
              const isMine = msg.senderId === currentUser.id;
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[70%] p-3 rounded-2xl ${isMine ? 'bg-primary text-white' : 'bg-white border'}`}
                    style={{
                      borderBottomRightRadius: isMine ? '4px' : '16px',
                      borderBottomLeftRadius: isMine ? '16px' : '4px'
                    }}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <span className={`text-[10px] block mt-1 text-right ${isMine ? 'text-blue-100' : 'text-gray-400'}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-white rounded-b-lg">
          <form className="flex gap-2" onSubmit={handleSend}>
            <input 
              type="text" 
              className="form-control flex-1" 
              placeholder="Bir mesaj yazın..." 
              value={text} 
              onChange={e => setText(e.target.value)}
            />
            <button type="submit" className="btn btn-primary px-4 bg-primary text-white border-none cursor-pointer rounded-md">
              <Send size={18}/>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default DirectChatModal;
