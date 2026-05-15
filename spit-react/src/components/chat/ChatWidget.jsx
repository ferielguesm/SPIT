import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../hooks/useWebSocket';
import { PassengerAPI } from '../../api';

export default function ChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friends, setFriends] = useState([]);
  const [messages, setMessages] = useState({}); // { friendId: [msg] }
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef(null);

  const { send } = useWebSocket(user ? `/topic/chat/${user.id}` : null, (msg) => {
    // Determine which "chat" this belongs to
    const otherId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
    setMessages(prev => ({
      ...prev,
      [otherId]: [...(prev[otherId] || []), msg]
    }));
  });

  useEffect(() => {
    if (isOpen && user) {
      // Load all passengers as potential "chat partners" for demo
      PassengerAPI.getAll().then(data => {
        setFriends(data.filter(p => p.id !== user.id));
      });
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, selectedFriend]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !selectedFriend) return;

    const msg = {
      senderId: user.id,
      senderName: user.firstName,
      receiverId: selectedFriend.id,
      content: inputText,
      timestamp: Date.now()
    };

    send('/app/chat.send', msg);
    setInputText('');
  };

  if (!user) return null;

  return (
    <div style={{ position: 'relative', fontFamily: 'Inter, sans-serif' }}>
      {/* ── Chat Bubble / Navbar Button ── */}
      <button onClick={() => setIsOpen(!isOpen)} title="Chat"
        style={{
          width: 56, height: 56, borderRadius: '16px',
          background: isOpen ? 'rgba(36,70,212,0.4)' : 'rgba(36,70,212,0.2)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--glass-border)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: isOpen ? 'white' : 'rgba(255,255,255,0.7)',
          boxShadow: '0 4px 16px var(--glass-shadow)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(36,70,212,0.4)'; e.currentTarget.style.color = 'white'; }}
        onMouseLeave={e => { e.currentTarget.style.background = isOpen ? 'rgba(36,70,212,0.4)' : 'rgba(36,70,212,0.2)'; e.currentTarget.style.color = isOpen ? 'white' : 'rgba(255,255,255,0.7)'; }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>forum</span>
      </button>

      {/* ── Chat Window ── */}
      {isOpen && (
        <div style={{
          position: 'absolute', top: '70px', right: 0,
          width: '380px', height: '520px', background: 'var(--surface)',
          borderRadius: '24px', border: '1px solid var(--border)',
          boxShadow: '0 16px 48px var(--glass-shadow)', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          backdropFilter: 'blur(20px)',
        }}>
          {/* Header */}
          <div style={{ padding: '16px 20px', background: 'var(--primary-grad)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {selectedFriend ? (
                <button onClick={() => setSelectedFriend(null)} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: 'white' }}>
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
              ) : (
                <span className="material-symbols-outlined" style={{ color: 'white' }}>chat</span>
              )}
              <span style={{ fontWeight: 800, fontSize: '15px', color: 'white' }}>
                {selectedFriend ? selectedFriend.firstName : 'Messages'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {selectedFriend && (
                <button onClick={() => setSelectedFriend(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                </button>
              )}
              {!selectedFriend && (
                <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>expand_more</span>
                </button>
              )}
            </div>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }} ref={scrollRef}>
            {!selectedFriend ? (
              /* Friend List */
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted)', marginBottom: '12px', padding: '0 8px' }}>Suggested Friends</div>
                {friends.map(f => (
                  <div key={f.id} onClick={() => setSelectedFriend(f)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '10px', borderRadius: '12px', cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: '14px', background: 'rgba(36,70,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 800 }}>
                      {(f.firstName || 'P')[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{f.firstName} {f.lastName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{f.nationality} · {f.travel?.destination}</div>
                    </div>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--border)' }}>chevron_right</span>
                  </div>
                ))}
              </div>
            ) : (
              /* Chat Thread */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(messages[selectedFriend.id] || []).map((m, i) => {
                  const isMe = m.senderId === user.id;
                  return (
                    <div key={i} style={{
                      alignSelf: isMe ? 'flex-end' : 'flex-start',
                      maxWidth: '80%', padding: '10px 14px',
                      borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: isMe ? 'var(--primary-grad)' : 'var(--surface2)',
                      color: isMe ? 'white' : 'var(--text)',
                      fontSize: '13px', lineHeight: 1.5,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                      {m.content}
                    </div>
                  );
                })}
                {(messages[selectedFriend.id] || []).length === 0 && (
                  <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--muted)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '40px', opacity: 0.3 }}>waving_hand</span>
                    <div style={{ fontSize: '13px', marginTop: '8px' }}>Say hi to {selectedFriend.firstName}!</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {selectedFriend && (
            <form onSubmit={handleSend} style={{ padding: '16px', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.05)', display: 'flex', gap: '10px' }}>
              <input
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Type a message..."
                style={{
                  flex: 1, background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: '12px', padding: '10px 14px', fontSize: '13px',
                  color: 'var(--text)', outline: 'none'
                }}
              />
              <button type="submit"
                style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: 'var(--primary)', color: 'white', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                <span className="material-symbols-outlined">send</span>
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
