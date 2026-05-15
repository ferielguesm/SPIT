import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { PassengerAPI, PostAPI, StoryAPI, CommentAPI, NotificationAPI } from '../../api';
import { useWebSocket } from '../../hooks/useWebSocket';
import { BASE_URL as API_BASE } from '../../api';

const DEST_EMOJI = { 'Tozeur':'🏜️','Douz':'🐪','Carthage':'🏛️','Kairouan':'🕌','Hammamet':'🏖️','Djerba':'🌊','Tunis':'🏙️','Sfax':'🍴','Tabarka':'🤿','Gammarth':'💎','Sidi Bou Said':'🎨','La Marsa':'☕','Nabeul':'🏺','Monastir':'⛵','Ain Draham':'🌲' };
const COLORS = ['#833ab4','#fd1d1d','#fcb045','#4A919E','#166874','#212E53','#505d85'];

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

function Avatar({ src, initials, color, size = 40, ring = false, ringColor = '#833ab4' }) {
  const [imgError, setImgError] = useState(false);
  const style = {
    width: size, height: size, borderRadius: '50%', flexShrink: 0,
    background: color || '#4A919E',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', fontWeight: 700, fontSize: size * 0.35,
    overflow: 'hidden',
    boxSizing: 'border-box',
    border: ring ? `2.5px solid ${ringColor}` : '2.5px solid transparent',
    outline: ring ? `2px solid var(--surface)` : 'none',
  };
  const imgSrc = src ? (src.startsWith('http') ? src : `${API_BASE}${src}`) : null;
  return (
    <div style={style}>
      {imgSrc && !imgError
        ? <img src={imgSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImgError(true)} />
        : <span style={{ fontSize: size * 0.35, fontWeight: 700, lineHeight: 1 }}>{initials || '?'}</span>
      }
    </div>
  );
}

// ── Stories Row ────────────────────────────────────────────
function StoriesRow({ currentPassenger, passengerId }) {
  const [stories, setStories] = useState([]);
  const [viewing, setViewing] = useState(null);
  const [viewIdx, setViewIdx] = useState(0);
  const fileRef = useRef();

  useEffect(() => {
    StoryAPI.getAll().then(d => setStories(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const grouped = stories.reduce((acc, s) => {
    const key = s.authorId;
    if (!acc[key]) acc[key] = { authorId: s.authorId, authorName: s.authorName, authorProfileImageUrl: s.authorProfileImageUrl, items: [] };
    acc[key].items.push(s);
    return acc;
  }, {});
  const groups = Object.values(grouped);

  const uploadStory = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const s = await StoryAPI.create(passengerId, file);
      setStories(prev => [s, ...prev]);
      toast.success('Story posted!');
    } catch { toast.error('Could not post story'); }
    e.target.value = '';
  };

  const openStory = (group, idx = 0) => { setViewing(group); setViewIdx(idx); };
  const closeStory = () => setViewing(null);
  const nextStory = () => {
    if (viewIdx < viewing.items.length - 1) setViewIdx(i => i + 1);
    else {
      const gi = groups.findIndex(g => g.authorId === viewing.authorId);
      if (gi < groups.length - 1) { setViewing(groups[gi + 1]); setViewIdx(0); }
      else closeStory();
    }
  };

  const myInitials = ((currentPassenger?.firstName || '') + ' ' + (currentPassenger?.lastName || '')).trim().split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

  return (
    <>
      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', padding: '16px 0', scrollbarWidth: 'none' }}>
        {/* Add story */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', flexShrink: 0 }} onClick={() => fileRef.current.click()}>
          <div style={{ position: 'relative' }}>
            <Avatar src={currentPassenger?.profileImageUrl} initials={myInitials} color="#4A919E" size={56} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, borderRadius: '50%', background: '#4A919E', border: '2px solid var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 700 }}>+</div>
          </div>
          <span style={{ fontSize: 11, color: 'var(--text)', fontWeight: 500, maxWidth: 60, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Your story</span>
          <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={uploadStory} />
        </div>

        {groups.map((g, i) => {
          const init = (g.authorName || '?').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
          return (
            <div key={g.authorId} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', flexShrink: 0 }} onClick={() => openStory(g)}>
              <Avatar src={g.authorProfileImageUrl} initials={init} color={COLORS[i % COLORS.length]} size={56} ring ringColor={COLORS[i % COLORS.length]} />
              <span style={{ fontSize: 11, color: 'var(--text)', fontWeight: 500, maxWidth: 60, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{(g.authorName || '').split(' ')[0]}</span>
            </div>
          );
        })}
      </div>

      {/* Story viewer */}
      {viewing && (
        <div onClick={closeStory} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative', width: 360, maxHeight: '90vh', borderRadius: 16, overflow: 'hidden', background: '#111' }}>
            {/* Progress bars */}
            <div style={{ position: 'absolute', top: 8, left: 8, right: 8, display: 'flex', gap: 4, zIndex: 10 }}>
              {viewing.items.map((_, i) => (
                <div key={i} style={{ flex: 1, height: 2, borderRadius: 2, background: i < viewIdx ? 'white' : i === viewIdx ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)' }} />
              ))}
            </div>
            {/* Author */}
            <div style={{ position: 'absolute', top: 20, left: 12, right: 12, display: 'flex', alignItems: 'center', gap: 10, zIndex: 10 }}>
              <Avatar src={viewing.authorProfileImageUrl} initials={(viewing.authorName || '?').substring(0, 2).toUpperCase()} size={36} />
              <span style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>{viewing.authorName}</span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginLeft: 'auto' }}>{timeAgo(viewing.items[viewIdx]?.createdAt)}</span>
            </div>
            <img src={viewing.items[viewIdx]?.imageUrl ? `${API_BASE}${viewing.items[viewIdx].imageUrl}` : ''} alt="" style={{ width: '100%', maxHeight: '90vh', objectFit: 'cover', display: 'block' }} />
            {viewing.items[viewIdx]?.caption && (
              <div style={{ position: 'absolute', bottom: 20, left: 12, right: 12, color: 'white', fontSize: 14, fontWeight: 600, textShadow: '0 1px 4px rgba(0,0,0,0.8)', textAlign: 'center' }}>{viewing.items[viewIdx].caption}</div>
            )}
            <button onClick={closeStory} style={{ position: 'absolute', top: 16, right: 12, background: 'none', border: 'none', color: 'white', fontSize: 22, cursor: 'pointer', zIndex: 10 }}>✕</button>
            <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
              <div style={{ flex: 1, cursor: 'pointer' }} onClick={e => { e.stopPropagation(); if (viewIdx > 0) setViewIdx(i => i - 1); }} />
              <div style={{ flex: 1, cursor: 'pointer' }} onClick={e => { e.stopPropagation(); nextStory(); }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Post Composer ──────────────────────────────────────────
function PostComposer({ passenger, passengerId }) {
  const [text, setText] = useState('');
  const [imageFile, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dest, setDest] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleImage = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setImage(f);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(f);
  };

  const removeImage = () => { setImage(null); setPreview(null); if (fileRef.current) fileRef.current.value = ''; };

  const submit = async () => {
    if (!text.trim() && !imageFile) return;
    setLoading(true);
    try {
      const name = `${passenger?.firstName || ''} ${passenger?.lastName || ''}`.trim() || 'Traveller';
      const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
      const color = COLORS[passengerId % COLORS.length] || '#4A919E';
      await PostAPI.create({ content: text, destination: dest || passenger?.travel?.destination || '', authorId: passengerId, authorName: name, authorInitials: initials, authorColor: color, imageFile });
      setText(''); setImage(null); setPreview(null); setDest('');
      if (fileRef.current) fileRef.current.value = '';
    } catch (e) { toast.error(e.message || 'Could not post'); }
    finally { setLoading(false); }
  };

  const name = `${passenger?.firstName || ''}`.trim() || 'Traveller';
  const initials = name.substring(0, 2).toUpperCase();
  const avatarColor = COLORS[(passengerId || 0) % COLORS.length] || '#4A919E';

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <Avatar src={passenger?.profileImageUrl} initials={initials} color={avatarColor} size={38} />
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={`Share your Tunisia experience, ${name}…`}
          rows={2}
          style={{ flex: 1, background: 'var(--surface2)', border: 'none', borderRadius: 20, padding: '10px 16px', fontSize: 14, color: 'var(--text)', resize: 'none', outline: 'none', fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}
          onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) submit(); }}
        />
      </div>

      {preview && (
        <div style={{ position: 'relative', marginTop: 10, borderRadius: 10, overflow: 'hidden', maxHeight: 280 }}>
          <img src={preview} alt="" style={{ width: '100%', maxHeight: 280, objectFit: 'cover', display: 'block' }} />
          <button onClick={removeImage} style={{ position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer', color: 'white', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
      )}

      {dest && (
        <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(74,145,158,0.1)', border: '1px solid rgba(74,145,158,0.25)', borderRadius: 999, padding: '3px 10px', fontSize: 12, color: '#4A919E', fontWeight: 600 }}>
          📍 {dest}
          <button onClick={() => setDest('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4A919E', padding: 0, lineHeight: 1, fontSize: 14 }}>×</button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} id="post-img-inp" />
          <label htmlFor="post-img-inp" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 8, cursor: 'pointer', color: 'var(--muted)', fontSize: 13, fontWeight: 600 }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#4A919E' }}>photo_camera</span> Photo
          </label>
          <button onClick={() => { const d = prompt('Tag a destination:', passenger?.travel?.destination || ''); if (d) setDest(d.trim()); }}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 8, cursor: 'pointer', color: 'var(--muted)', fontSize: 13, fontWeight: 600, background: 'none', border: 'none' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#f59e0b' }}>location_on</span> Location
          </button>
        </div>
        <button onClick={submit} disabled={loading || (!text.trim() && !imageFile)}
          style={{ padding: '8px 20px', borderRadius: 8, background: (text.trim() || imageFile) ? '#4A919E' : 'var(--surface2)', color: (text.trim() || imageFile) ? 'white' : 'var(--muted)', border: 'none', cursor: (text.trim() || imageFile) ? 'pointer' : 'default', fontSize: 13, fontWeight: 700, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Posting…' : 'Post'}
        </button>
      </div>
    </div>
  );
}

// ── Reply Section ──────────────────────────────────────────
function ReplySection({ commentId, passengerId, passenger, visible }) {
  const [replies, setReplies] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchReplies = useCallback(async () => {
    try {
      const d = await ReplyAPI.getByComment(commentId);
      setReplies(Array.isArray(d) ? d : []);
    } catch { /* silent */ }
  }, [commentId]);

  useEffect(() => {
    if (visible && commentId) fetchReplies();
  }, [commentId, visible, fetchReplies]);

  // Real-time reply updates
  useWebSocket(`/topic/comments/${commentId}/replies`, (newReply) => {
    setReplies(prev => prev.some(r => r.id === newReply.id) ? prev : [...prev, newReply]);
  });

  const submit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const newReply = await ReplyAPI.add(commentId, passengerId, text);
      setReplies(prev => prev.some(r => r.id === newReply.id) ? prev : [...prev, newReply]);
      setText('');
    } catch { toast.error('Could not post reply'); }
    finally { setLoading(false); }
  };

  const remove = async (id) => {
    try {
      await ReplyAPI.delete(id);
      setReplies(prev => prev.filter(r => r.id !== id));
    } catch { toast.error('Could not delete reply'); }
  };

  if (!visible) return null;

  return (
    <div style={{ marginLeft: 36, marginTop: 12, borderLeft: '2px solid var(--border)', paddingLeft: 16, animation: 'slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {replies.map((r, i) => (
          <div key={r.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', animation: `fadeIn 0.3s ease ${i * 0.05}s both` }}>
            <Avatar src={r.authorProfileImageUrl} initials={(r.authorName || '?').substring(0, 2).toUpperCase()} size={28} />
            <div style={{ flex: 1 }}>
              <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, var(--glass-bg) 100%)', backdropFilter: 'blur(16px)', border: '1px solid var(--glass-border)', borderRadius: '0 16px 16px 16px', padding: '10px 16px', display: 'inline-block', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
                <span style={{ fontSize: 12, fontWeight: 900, color: 'var(--primary)', marginRight: 8 }}>{r.authorName}</span>
                <span style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{r.content}</span>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8, paddingLeft: 4, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>{timeAgo(r.createdAt)}</span>
                {r.authorId == passengerId && (
                  <button onClick={() => remove(r.id)} className="comment-action delete" style={{ cursor: 'pointer' }}>
                    <span className="material-symbols-outlined">delete</span> Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 14, alignItems: 'center' }}>
        <input 
          autoFocus
          value={text} onChange={e => setText(e.target.value)}
          placeholder="Write a reply…"
          style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 20, padding: '8px 16px', fontSize: 12, color: 'var(--text)', outline: 'none', transition: 'all 0.2s' }}
          onKeyDown={e => { if (e.key === 'Enter') submit(); }}
        />
        {text.trim() && (
          <button onClick={submit} disabled={loading} style={{ background: 'var(--primary-grad)', color: 'white', border: 'none', borderRadius: 12, padding: '8px 16px', fontSize: 11, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(74, 145, 158, 0.3)' }}>
            {loading ? '…' : 'Reply'}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Comment Section ────────────────────────────────────────
function CommentSection({ postId, passengerId, passenger, visible, user }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  const fetchComments = useCallback(async () => {
    try {
      const d = await CommentAPI.getByPost(postId);
      setComments(Array.isArray(d) ? d : []);
    } catch { /* silent */ }
  }, [postId]);

  useEffect(() => {
    if (visible) fetchComments();
  }, [visible, fetchComments]);

  // Real-time: new comments
  useWebSocket(`/topic/posts/${postId}/comments`, (newComment) => {
    setComments(prev => prev.some(c => c.id === newComment.id) ? prev : [...prev, newComment]);
  });

  // Real-time: comment updates (likes, edits)
  useWebSocket(`/topic/posts/${postId}/comments/update`, (updated) => {
    setComments(prev => prev.map(c => c.id === updated.id ? updated : c));
  });

  // Real-time: comment deletion
  useWebSocket(`/topic/posts/${postId}/comments/delete`, (deletedId) => {
    setComments(prev => prev.filter(c => c.id !== deletedId));
  });

  const submit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const newComment = await CommentAPI.add(postId, passengerId, text);
      setComments(prev => prev.some(c => c.id === newComment.id) ? prev : [...prev, newComment]);
      setText('');
    } catch { toast.error('Could not post comment'); }
    finally { setLoading(false); }
  };

  const handleLikeComment = async (id) => {
    try {
      const updated = await CommentAPI.like(id, passengerId);
      setComments(prev => prev.map(c => c.id === id ? updated : c));
    } catch { /* silent */ }
  };

  const remove = async (id) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await CommentAPI.delete(id);
      setComments(prev => prev.filter(c => c.id !== id));
      toast.success('Comment deleted');
    } catch { toast.error('Could not delete'); }
  };

  const saveEdit = async (id) => {
    if (!editText.trim()) return;
    try {
      const updated = await CommentAPI.update(id, editText);
      setComments(prev => prev.map(c => c.id === id ? updated : c));
      setEditId(null);
    } catch { toast.error('Could not update'); }
  };

  const initials = (passenger?.firstName || 'P').substring(0, 1).toUpperCase();

  if (!visible) return null;

  return (
    <div style={{ padding: '0 16px 24px', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.02)', animation: 'slideDown 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      <div style={{ maxHeight: 500, overflowY: 'auto', marginBottom: 16, paddingRight: 6, paddingTop: 12 }}>
        {comments.map((c, i) => {
          const isLiked = c.likedByPassengerIds?.includes(passengerId);
          return (
            <div key={c.id} style={{ marginTop: 20, animation: `slideUp 0.4s ease ${i * 0.05}s both` }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <Avatar src={c.authorProfileImageUrl} initials={(c.authorName || '?').substring(0, 2).toUpperCase()} size={36} />
                <div style={{ flex: 1 }}>
                  {editId === c.id ? (
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input value={editText} onChange={e => setEditText(e.target.value)} autoFocus
                        style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--primary)', borderRadius: 16, padding: '10px 16px', fontSize: 13, color: 'var(--text)', outline: 'none', boxShadow: '0 0 15px rgba(74, 145, 158, 0.2)' }}
                        onKeyDown={e => { if (e.key === 'Enter') saveEdit(c.id); if (e.key === 'Escape') setEditId(null); }}
                      />
                      <button onClick={() => saveEdit(c.id)} style={{ background: 'var(--primary-grad)', color: 'white', border: 'none', borderRadius: 12, padding: '0 20px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>Save</button>
                    </div>
                  ) : (
                    <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
                      <div style={{ background: 'linear-gradient(135deg, var(--glass-border) 0%, var(--glass-bg) 100%)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: '0 20px 20px 20px', padding: '14px 18px', boxShadow: '0 8px 32px var(--glass-shadow)' }}>
                        <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--primary)', marginBottom: 6 }}>{c.authorName}</div>
                        <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>{c.content}</div>
                      </div>
                      {c.likes > 0 && (
                        <div style={{ position: 'absolute', right: -12, bottom: -10, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 99, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 800, boxShadow: '0 6px 16px rgba(0,0,0,0.25)', animation: 'pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#ef4444', fontVariationSettings: "'FILL' 1" }}>favorite</span> {c.likes}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: 12, marginTop: 12, paddingLeft: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, marginRight: 4 }}>{timeAgo(c.createdAt)}</span>
                    <button onClick={() => handleLikeComment(c.id)} className={`comment-action ${isLiked ? 'liked' : ''}`} style={{ cursor: 'pointer' }}>
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                      {isLiked ? 'Liked' : 'Like'}
                    </button>
                    <button onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)} className="comment-action reply" style={{ cursor: 'pointer' }}>
                      <span className="material-symbols-outlined">reply</span> Reply
                    </button>
                    {(c.authorId == passengerId || user?.type === 'admin') && (
                      <>
                        <button onClick={() => { setEditId(c.id); setEditText(c.content); }} className="comment-action edit" style={{ cursor: 'pointer' }}>
                          <span className="material-symbols-outlined">edit</span> Edit
                        </button>
                        <button onClick={() => remove(c.id)} className="comment-action delete" style={{ cursor: 'pointer' }}>
                          <span className="material-symbols-outlined">delete</span> Delete
                        </button>
                      </>
                    )}
                  </div>

                  {replyingTo === c.id && (
                    <ReplySection 
                      commentId={c.id} 
                      passengerId={passengerId} 
                      passenger={passenger} 
                      visible={true} 
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {comments.length === 0 && <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)', fontSize: 14, fontWeight: 500 }}>No comments yet. Start the conversation!</div>}
      </div>

      <div style={{ display: 'flex', gap: 14, alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 20 }}>
        <Avatar src={passenger?.profileImageUrl} initials={initials} size={40} />
        <div style={{ flex: 1, display: 'flex', gap: 12, background: 'var(--surface2)', borderRadius: 30, padding: '12px 20px', alignItems: 'center', boxShadow: 'inset 0 2px 5px var(--glass-shadow)', border: '1px solid var(--border)', transition: 'border-color 0.3s' }}>
          <input 
            value={text} onChange={e => setText(e.target.value)}
            placeholder={`Comment as ${passenger?.firstName || 'traveller'}…`}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: 'var(--text)', fontFamily: 'Inter, sans-serif' }}
            onFocus={e => e.currentTarget.parentElement.style.borderColor = 'var(--primary)'}
            onBlur={e => e.currentTarget.parentElement.style.borderColor = 'var(--border)'}
            onKeyDown={e => { if (e.key === 'Enter') submit(); }}
          />
          {text.trim() && (
            <button onClick={submit} disabled={loading} style={{ background: 'var(--primary-grad)', color: 'white', border: 'none', borderRadius: 14, padding: '6px 18px', fontWeight: 900, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 12px rgba(74, 145, 158, 0.3)' }}>
              {loading ? '…' : 'Post'}
            </button>
          )}
        </div>
      </div>

      <style>{`
        .comment-action { 
          display: flex; 
          align-items: center; 
          gap: 6px; 
          padding: 6px 12px; 
          border-radius: 20px; 
          background: var(--glass-bg); 
          border: 1px solid var(--glass-highlight); 
          color: var(--text); 
          font-weight: 700; 
          font-size: 11px; 
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .comment-action .material-symbols-outlined { font-size: 14px; }
        .comment-action:hover { 
          background: var(--glass-border); 
          transform: translateY(-2px); 
          box-shadow: 0 4px 12px var(--glass-shadow); 
          border-color: var(--glass-border);
        }
        .comment-action.liked { 
          color: #ef4444; 
          background: rgba(239, 68, 68, 0.15); 
          border-color: rgba(239, 68, 68, 0.3);
        }
        .comment-action.liked:hover { background: rgba(239, 68, 68, 0.25); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); }
        .comment-action.reply:hover { color: var(--primary); background: rgba(74, 145, 158, 0.15); border-color: var(--primary); }
        .comment-action.edit:hover { color: #f59e0b; background: rgba(245, 158, 11, 0.15); border-color: #f59e0b; }
        .comment-action.delete:hover { color: #ef4444; background: rgba(239, 68, 68, 0.15); border-color: #ef4444; }
        
        @keyframes slideDown { from { opacity: 0; transform: translateY(-15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pop { 0% { transform: scale(0.5); } 70% { transform: scale(1.3); } 100% { transform: scale(1); } }
      `}</style>
    </div>
  );
}

// ── Post Card ──────────────────────────────────────────────
function PostCard({ post, passengerId, passenger, onLike, onDelete, onUpdate, user }) {
  const [showComments, setShowComments] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(post.content);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef();
  const isOwner = post.authorId === passengerId;
  const liked = post.likedByPassengerIds?.includes(passengerId);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const saveEdit = async () => {
    if (!editText.trim()) return;
    try {
      const updated = await PostAPI.update(post.id, editText);
      onUpdate(updated);
      setEditing(false);
      toast.success('Post updated');
    } catch { toast.error('Could not update post'); }
  };

  const imgSrc = post.imageUrl
    ? (post.imageUrl.startsWith('http') ? post.imageUrl : `${API_BASE}${post.imageUrl}`)
    : null;

  const initials = (post.authorInitials || (post.authorName || '?').substring(0, 2)).toUpperCase();

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 16, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
        <Avatar src={post.authorProfileImageUrl} initials={initials} color={post.authorColor || '#4A919E'} size={38} ring ringColor={COLORS[post.authorId % COLORS.length]} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{post.authorName}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            {timeAgo(post.createdAt)}
            {post.destination && <><span>·</span><span>📍 {post.destination}</span></>}
          </div>
        </div>
        {/* 3-dot menu */}
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button onClick={() => setShowMenu(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '4px 6px', borderRadius: 6, fontSize: 18, lineHeight: 1 }}>⋯</button>
          {showMenu && (
            <div style={{ position: 'absolute', right: 0, top: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.15)', zIndex: 50, minWidth: 140, overflow: 'hidden' }}>
              {isOwner && (
                <>
                  <button onClick={() => { setEditing(true); setShowMenu(false); }} style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span> Edit post
                  </button>
                  <button onClick={() => { onDelete(post.id); setShowMenu(false); }} style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8 }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span> Delete post
                  </button>
                </>
              )}
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); setShowMenu(false); }} style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>link</span> Copy link
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {editing ? (
        <div style={{ padding: '0 14px 12px' }}>
          <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={3} autoFocus
            style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', fontSize: 14, color: 'var(--text)', resize: 'none', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={saveEdit} style={{ padding: '7px 16px', borderRadius: 8, background: '#4A919E', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Save</button>
            <button onClick={() => { setEditing(false); setEditText(post.content); }} style={{ padding: '7px 16px', borderRadius: 8, background: 'var(--surface2)', color: 'var(--muted)', border: 'none', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          </div>
        </div>
      ) : (
        post.content && <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, padding: '0 14px 10px', margin: 0 }}>{post.content}</p>
      )}

      {/* Image */}
      {imgSrc && <img src={imgSrc} alt="post" style={{ width: '100%', maxHeight: 500, objectFit: 'cover', display: 'block' }} />}

      {/* Destination card */}
      {post.destination && DEST_EMOJI[post.destination] && (
        <div style={{ margin: '8px 14px', background: 'var(--surface2)', borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>{DEST_EMOJI[post.destination]}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{post.destination}</div>
            <div style={{ fontSize: 11, color: '#4A919E', fontWeight: 600 }}>SPIT Destination</div>
          </div>
        </div>
      )}

      {/* Like/comment counts */}
      {(post.likes > 0 || post.comments > 0) && (
        <div style={{ padding: '4px 14px', display: 'flex', gap: 12, fontSize: 12, color: 'var(--muted)' }}>
          {post.likes > 0 && <span style={{ cursor: 'pointer' }} onClick={() => onLike(post.id)}>❤️ {post.likes} {post.likes === 1 ? 'like' : 'likes'}</span>}
          {post.comments > 0 && <span style={{ cursor: 'pointer' }} onClick={() => setShowComments(v => !v)}>💬 {post.comments} {post.comments === 1 ? 'comment' : 'comments'}</span>}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', borderTop: '1px solid var(--border)' }}>
        {[
          { icon: liked ? 'favorite' : 'favorite_border', label: liked ? 'Liked' : 'Like', action: () => onLike(post.id), active: liked, color: liked ? '#ef4444' : undefined },
          { icon: 'chat_bubble_outline', label: 'Comment', action: () => setShowComments(v => !v), active: showComments },
          { icon: 'share', label: 'Share', action: () => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); } },
        ].map(({ icon, label, action, active, color }) => (
          <button key={label} onClick={action}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', background: 'none', border: 'none', cursor: 'pointer', color: color || (active ? '#4A919E' : 'var(--muted)'), fontSize: 13, fontWeight: 600, transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Comments */}
      <CommentSection postId={post.id} passengerId={passengerId} passenger={passenger} visible={showComments} user={user} />
    </div>
  );
}

// ── Right Sidebar ──────────────────────────────────────────
function RightSidebar({ passenger, passengerId, allPassengers, user }) {
  const [followed, setFollowed]     = useState(new Set());
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showAll, setShowAll]       = useState(false);

  useEffect(() => {
    if (!passengerId) return;
    NotificationAPI.getByUser(passengerId)
      .then(d => setNotifications(Array.isArray(d) ? d.slice(0, 5) : []))
      .catch(() => {});
  }, [passengerId]);

  const allSuggestions = allPassengers
    .filter(p => p.id !== passengerId && (
      p.nationality === passenger?.nationality ||
      p.travel?.destination === passenger?.travel?.destination
    ));
  const suggestions = showAll ? allSuggestions : allSuggestions.slice(0, 5);

  const toggleFollow = async (id) => {
    try {
      if (followed.has(id)) {
        await PassengerAPI.unfollow(id, passengerId);
        setFollowed(prev => { const s = new Set(prev); s.delete(id); return s; });
      } else {
        await PassengerAPI.follow(id, passengerId);
        setFollowed(prev => new Set([...prev, id]));
        toast.success('Following!');
      }
    } catch { toast.error('Could not follow'); }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const name = `${passenger?.firstName || ''} ${passenger?.lastName || ''}`.trim() || 'Traveller';
  const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

  return (
    <aside className="right-sidebar">
      {/* Current user */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Link to="/profile" style={{ textDecoration: 'none' }}>
          <Avatar src={passenger?.profileImageUrl} initials={initials} color="#4A919E" size={52} ring ringColor="#833ab4" />
        </Link>
        <div style={{ flex: 1 }}>
          <Link to="/profile" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{name}</div>
          </Link>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{passenger?.nationality} · {passenger?.travel?.destination || '—'}</div>
        </div>
        {/* Notifications bell */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowNotifs(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', position: 'relative', padding: 4 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>notifications</span>
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: 0, right: 0, width: 16, height: 16, borderRadius: '50%', background: '#ef4444', color: 'white', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unreadCount}</span>
            )}
          </button>
          {showNotifs && (
            <div style={{ position: 'absolute', right: 0, top: '100%', width: 280, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,.15)', zIndex: 50, overflow: 'hidden' }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Notifications</div>
              {notifications.length === 0
                ? <div style={{ padding: '20px', textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>No notifications yet</div>
                : notifications.map(n => (
                  <div key={n.id} onClick={() => { NotificationAPI.markRead(n.id); setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x)); }}
                    style={{ padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', background: n.read ? 'transparent' : 'rgba(74,145,158,0.06)', borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                    onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(74,145,158,0.06)'}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: n.type === 'LIKE' ? '#ef4444' : n.type === 'COMMENT' ? '#4A919E' : '#f59e0b', flexShrink: 0, marginTop: 1 }}>
                      {n.type === 'LIKE' ? 'favorite' : n.type === 'COMMENT' ? 'chat_bubble' : 'notifications'}
                    </span>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.4 }}>{n.message}</div>
                      <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{timeAgo(n.createdAt)}</div>
                    </div>
                    {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4A919E', flexShrink: 0, marginTop: 4, marginLeft: 'auto' }} />}
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>

      {/* Admin dashboard shortcut — only visible to admins */}
      {user?.type === 'admin' && (
        <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, background: 'rgba(36,70,212,0.08)', border: '1px solid rgba(36,70,212,0.2)', textDecoration: 'none', marginBottom: 16, transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(36,70,212,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(36,70,212,0.08)'}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)' }}>admin_panel_settings</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>Admin Dashboard</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>Switch to admin view</div>
          </div>
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--muted)' }}>arrow_forward</span>
        </Link>
      )}

      {/* Suggestions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Suggestions for you</span>
        {allSuggestions.length > 0 && (
          <Link to="/suggestions"
            style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', textDecoration: 'none' }}>
            See all ({allSuggestions.length})
          </Link>
        )}
      </div>

      {suggestions.length === 0
        ? <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', padding: '12px 0' }}>No suggestions yet.</div>
        : suggestions.map((s, i) => {
          const sName = `${s.firstName || s.nationality || 'P'} ${s.lastName || ''}`.trim();
          const sInit = sName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
          const isFollowing = followed.has(s.id);
          return (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <Avatar src={s.profileImageUrl} initials={sInit} color={COLORS[i % COLORS.length]} size={38} ring ringColor={COLORS[i % COLORS.length]} />
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sName}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.nationality === passenger?.nationality ? `🌍 Same nationality` : `📍 ${s.travel?.destination || '—'}`}
                </div>
              </div>
              <button onClick={() => toggleFollow(s.id)}
                style={{ fontSize: 12, fontWeight: 700, color: isFollowing ? 'var(--muted)' : '#4A919E', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', flexShrink: 0 }}>
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          );
        })
      }
    </aside>
  );
}

// ── Main Feed Page ─────────────────────────────────────────
export default function PassengerFeed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const passengerId = user?.id;

  const [passenger, setPassenger] = useState(user?.type === 'passenger' ? user : null);
  const [allPassengers, setAllPassengers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    if (!passengerId) { navigate('/login'); return; }
    PassengerAPI.getById(passengerId).then(setPassenger).catch(() => {});
    PassengerAPI.getAll().then(d => setAllPassengers(Array.isArray(d) ? d : [])).catch(() => {});
    PostAPI.getAll()
      .then(d => setPosts(Array.isArray(d) ? d : []))
      .catch(() => toast.error('Could not load posts'))
      .finally(() => setPostsLoading(false));
  }, [passengerId]);

  // WebSocket: new post
  const handleNewPost = useCallback((post) => {
    setPosts(prev => prev.some(p => p.id === post.id) ? prev : [post, ...prev]);
  }, []);

  // WebSocket: post updated (like, edit)
  const handlePostUpdate = useCallback((updated) => {
    setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
  }, []);

  // WebSocket: post deleted
  const handlePostDelete = useCallback((id) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  }, []);

  useWebSocket('/topic/feed',        handleNewPost);
  useWebSocket('/topic/feed/update', handlePostUpdate);
  useWebSocket('/topic/feed/delete', handlePostDelete);

  const handleLike = async (postId) => {
    try {
      const updated = await PostAPI.like(postId, passengerId);
      setPosts(prev => prev.map(p => p.id === postId ? updated : p));
    } catch { /* silent */ }
  };

  const handleDelete = async (postId) => {
    if (!confirm('Delete this post?')) return;
    try {
      await PostAPI.delete(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast.success('Post deleted');
    } catch (e) { toast.error(e.message); }
  };

  const handleUpdate = (updated) => {
    setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div className="feed-grid" style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px 40px' }}>

        {/* ── CENTER ── */}
        <main style={{ minWidth: 0 }}>
          {/* Stories */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
            <StoriesRow currentPassenger={passenger} passengerId={passengerId} />
          </div>

          {/* Composer */}
          {passenger && <PostComposer passenger={passenger} passengerId={passengerId} />}

          {/* Posts */}
          {postsLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ background: 'var(--surface)', borderRadius: 12, padding: 16, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--surface2)', animation: 'pulse 1.5s infinite' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 12, borderRadius: 6, background: 'var(--surface2)', marginBottom: 6, width: '40%', animation: 'pulse 1.5s infinite' }} />
                      <div style={{ height: 10, borderRadius: 6, background: 'var(--surface2)', width: '25%', animation: 'pulse 1.5s infinite' }} />
                    </div>
                  </div>
                  <div style={{ height: 200, borderRadius: 10, background: 'var(--surface2)', animation: 'pulse 1.5s infinite' }} />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div style={{ background: 'var(--surface)', borderRadius: 12, padding: '48px 20px', textAlign: 'center', border: '1px solid var(--border)', color: 'var(--muted)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, display: 'block', marginBottom: 12, color: '#4A919E' }}>travel_explore</span>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>No posts yet</div>
              <div style={{ fontSize: 13 }}>Be the first to share your Tunisia experience!</div>
            </div>
          ) : (
            posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                passengerId={passengerId}
                passenger={passenger}
                onLike={handleLike}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                user={user}
              />
            ))
          )}
        </main>

        {/* ── RIGHT SIDEBAR ── */}
        <RightSidebar
          passenger={passenger}
          passengerId={passengerId}
          allPassengers={allPassengers}
          user={user}
        />
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
      `}</style>
    </div>
  );
}
