import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PassengerAPI, MessageAPI } from '../../api';
import { useWebSocket } from '../../hooks/useWebSocket';
import { toast } from 'react-hot-toast';
import { BASE_URL as API_BASE } from '../../api';

const EMOJIS = ['❤️', '😂', '🔥', '✈️', '🇹🇳', '🌟', '🌍', '🕌', '🏖️', '📸'];

export default function PassengerMessenger() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeCall, setActiveCall] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const scrollRef = useRef();
  const fileInputRef = useRef();
  const audioRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useWebSocket(selectedUser ? `/topic/messages/${user.id}/${selectedUser.id}` : null, (msg) => {
    setMessages(prev => [...prev, msg]);
  });

  useEffect(() => { loadContacts(); }, []);
  useEffect(() => { if (selectedUser) loadConversation(); }, [selectedUser]);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  const loadContacts = async () => {
    try {
      const all = await PassengerAPI.getAll();
      setContacts(all.filter(p => p.id !== user.id));
    } catch (e) { } finally { setLoading(false); }
  };

  const loadConversation = async () => {
    try {
      const data = await MessageAPI.getConversation(user.id, selectedUser.id);
      setMessages(data);
    } catch (e) { setMessages([]); }
  };

  const handleSend = async (e, text = null, type = 'TEXT', mediaUrl = null) => {
    if (e) e.preventDefault();
    const content = text || newMessage;
    if (!content.trim() && !mediaUrl && type === 'TEXT') return;
    try {
      await MessageAPI.send(user.id, selectedUser.id, content, type, mediaUrl);
      if (!text) setNewMessage('');
    } catch (e) { toast.error('Neural transmission failed'); }
  };

  const shareLocation = () => {
    if (!navigator.geolocation) return toast.error('GPS offline');
    navigator.geolocation.getCurrentPosition(pos => {
      const loc = `${pos.coords.latitude},${pos.coords.longitude}`;
      handleSend(null, loc, 'LOCATION');
      toast.success('Coordinates shared');
    });
  };

  const uploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await MessageAPI.upload(user.id, selectedUser.id, file, 'IMAGE');
      toast.success('Image synchronized');
    } catch (e) { toast.error('Upload failed'); }
  };

  const startCall = (type) => {
    setActiveCall(type);
    handleSend(null, `Initiated ${type} call`, 'CALL_LOG');
  };

  const endCall = () => {
    handleSend(null, `Ended ${activeCall} call`, 'CALL_LOG');
    setActiveCall(null);
  };

  // --- Voice Message Logic ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      audioRecorderRef.current.ondataavailable = e => audioChunksRef.current.push(e.data);
      audioRecorderRef.current.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], 'vocal.webm', { type: 'audio/webm' });
        await MessageAPI.upload(user.id, selectedUser.id, file, 'VOCAL');
        toast.success('Voice message sent');
      };
      audioRecorderRef.current.start();
      setIsRecording(true);
    } catch (e) { toast.error('Mic access denied'); }
  };

  const stopRecording = () => {
    if (audioRecorderRef.current) audioRecorderRef.current.stop();
    setIsRecording(false);
  };

  const glass = { background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px' };

  if (loading) return <div style={{ height: '100vh', background: '#0a0a12' }}></div>;

  return (
    <div style={{ height: 'calc(100vh - 85px)', background: 'radial-gradient(circle at bottom right, #1a1a2e, #0a0a12)', padding: '30px', color: '#fff', fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        .contact-card { transition: 0.3s; cursor: pointer; padding: 15px; borderRadius: 15px; display: flex; gap: 15px; alignItems: center; margin-bottom: 5px; }
        .contact-card:hover, .contact-card.active { background: rgba(79, 172, 254, 0.15); transform: translateX(8px); }
        .msg-bubble { max-width: 65%; padding: 14px 20px; borderRadius: 20px; margin-bottom: 12px; position: relative; }
        .msg-sender { align-self: flex-end; background: linear-gradient(135deg, #4facfe, #00f2fe); color: white; border-radius: 20px 20px 4px 20px; }
        .msg-receiver { align-self: flex-start; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px 20px 20px 4px; }
        .msg-call-log { align-self: center; background: rgba(255,255,255,0.05); padding: 8px 20px; borderRadius: 30px; font-size: 11px; fontWeight: 900; letterSpacing: 1px; color: #4facfe; border: 1px solid rgba(79, 172, 254, 0.2); }
        .msg-img { width: 100%; borderRadius: 12px; marginBottom: 10px; cursor: pointer; }
        .action-btn { width: 44px; height: 44px; borderRadius: 12px; background: rgba(255,255,255,0.05); display: flex; alignItems: center; justifyContent: center; cursor: pointer; transition: 0.3s; }
        .action-btn:hover { background: #4facfe; transform: translateY(-3px); }
        .recording-pulse { animation: pulse 1.5s infinite; color: #ef4444 !important; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
      `}</style>

      <div style={{ maxWidth: '1400px', margin: '0 auto', height: '100%', display: 'grid', gridTemplateColumns: '380px 1fr', gap: '30px' }}>
        
        {/* CONTACTS */}
        <div style={{ ...glass, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
           <div style={{ padding: '30px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '3px' }}>NEURAL LINKS</h2>
              <span className="material-symbols-outlined" style={{ color: '#4facfe' }}>radar</span>
           </div>
           <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
              {contacts.map(c => (
                <div key={c.id} onClick={() => setSelectedUser(c)} className={`contact-card ${selectedUser?.id === c.id ? 'active' : ''}`}>
                   <div style={{ width: 48, height: 48, borderRadius: '15px', border: '2px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                      {c.profileImageUrl ? <img src={`${API_BASE}${c.profileImageUrl}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: '#4facfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>{c.firstName[0]}</div>}
                   </div>
                   <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: '15px' }}>{c.firstName}</div><div style={{ fontSize: '11px', opacity: 0.4 }}>{c.nationality}</div></div>
                </div>
              ))}
           </div>
        </div>

        {/* CHAT */}
        <div style={{ ...glass, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
           {selectedUser ? (
             <>
               <div style={{ padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                     <div style={{ width: 46, height: 46, borderRadius: '50%', border: '3px solid #4facfe', overflow: 'hidden' }}>{selectedUser.profileImageUrl && <img src={`${API_BASE}${selectedUser.profileImageUrl}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}</div>
                     <div style={{ fontWeight: 900, fontSize: '18px' }}>{selectedUser.firstName}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '15px' }}>
                     <div className="action-btn" onClick={() => startCall('voice')}><span className="material-symbols-outlined">call</span></div>
                     <div className="action-btn" onClick={() => startCall('video')}><span className="material-symbols-outlined">videocam</span></div>
                  </div>
               </div>

               <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '40px', display: 'flex', flexDirection: 'column' }}>
                  {messages.map(m => (
                    m.type === 'CALL_LOG' ? (
                      <div key={m.id} className="msg-call-log"><span className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle', marginRight: '8px' }}>history</span>{m.content} • {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    ) : (
                      <div key={m.id} className={`msg-bubble ${m.senderId === user.id ? 'msg-sender' : 'msg-receiver'}`}>
                         {m.type === 'IMAGE' && <img src={`${API_BASE}${m.mediaUrl}`} className="msg-img" />}
                         {m.type === 'LOCATION' && (
                           <div style={{ marginBottom: '10px', borderRadius: '12px', overflow: 'hidden' }}>
                              <img src={`https://static-maps.yandex.ru/1.x/?ll=${m.content.split(',')[1]},${m.content.split(',')[0]}&z=13&l=map&size=300,150`} style={{ width: '100%' }} />
                              <a href={`https://www.google.com/maps?q=${m.content}`} target="_blank" style={{ color: 'white', fontSize: '10px', fontWeight: 900, textDecoration: 'none', display: 'block', marginTop: '5px' }}>OPEN NAVIGATION</a>
                           </div>
                         )}
                         {m.type === 'VOCAL' && <audio src={`${API_BASE}${m.mediaUrl}`} controls style={{ width: '200px', height: '32px' }} />}
                         <div>{m.content === '[Media]' ? '' : m.content}</div>
                      </div>
                    )
                  ))}
               </div>

               <div style={{ padding: '20px 40px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                     {EMOJIS.map(e => <span key={e} onClick={() => handleSend(null, e)} style={{ cursor: 'pointer', fontSize: '20px' }}>{e}</span>)}
                     <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                        <span className="material-symbols-outlined action-btn" onClick={shareLocation} style={{ fontSize: '20px' }}>location_on</span>
                        <span className="material-symbols-outlined action-btn" onClick={() => fileInputRef.current.click()} style={{ fontSize: '20px' }}>image</span>
                        <span className={`material-symbols-outlined action-btn ${isRecording ? 'recording-pulse' : ''}`} onClick={isRecording ? stopRecording : startRecording} style={{ fontSize: '20px' }}>{isRecording ? 'stop_circle' : 'mic'}</span>
                        <input type="file" ref={fileInputRef} onChange={uploadFile} style={{ display: 'none' }} />
                     </div>
                  </div>
                  <form onSubmit={handleSend} style={{ display: 'flex', gap: '20px' }}>
                     <input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type encrypted message..." style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: 'none', padding: '18px 25px', borderRadius: '20px', color: '#fff', fontSize: '15px', outline: 'none' }} />
                     <button type="submit" style={{ background: '#4facfe', color: '#fff', border: 'none', borderRadius: '18px', width: '60px', height: '60px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="material-symbols-outlined">send</span></button>
                  </form>
               </div>
             </>
           ) : (
             <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.1 }}><h1>SELECT LINK</h1></div>
           )}
        </div>
      </div>

      {activeCall && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <div style={{ width: '600px', padding: '50px', ...glass, textAlign: 'center' }}>
              <div style={{ width: 100, height: 100, borderRadius: '50%', border: '4px solid #4facfe', margin: '0 auto 30px' }}></div>
              <h2>{activeCall.toUpperCase()} LINK ACTIVE</h2>
              <button onClick={endCall} style={{ marginTop: '40px', background: '#ef4444', color: 'white', border: 'none', padding: '15px 40px', borderRadius: '30px', fontWeight: 900, cursor: 'pointer' }}>END TRANSMISSION</button>
           </div>
        </div>
      )}
    </div>
  );
}
