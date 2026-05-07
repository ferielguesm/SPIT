

import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { PassengerAPI, PostAPI, CommentAPI } from '../../api';
import { BASE_URL as API } from '../../api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const LANDMARKS = [
  { id: 1, name: 'Sidi Bou Said',   cat: 'Culture',   emoji: '\u{1F3A8}', lat: 36.8702, lng: 10.3413, rating: 4.8, reviews: 12400, hours: 'Open 24/7',   color: '#a78bfa', desc: 'Iconic blue-and-white village above the Mediterranean.', tips: 'Visit at sunset. Try bambalouni at the main square.', image: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600&q=80' },
  { id: 2, name: 'Carthage Ruins',  cat: 'History',   emoji: '\u{1F3DB}\uFE0F', lat: 36.8565, lng: 10.3340, rating: 4.6, reviews: 8900,  hours: '8:00-19:00', color: '#f59e0b', desc: 'Ancient heart of the Carthaginian Empire.', tips: 'Combine with Bardo Museum for a full day.', image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&q=80' },
  { id: 3, name: 'El Jem',          cat: 'History',   emoji: '\u{1F3FA}', lat: 35.2964, lng: 10.7061, rating: 4.9, reviews: 15200, hours: '8:00-18:00', color: '#f97316', desc: 'One of the best-preserved Roman colosseums in the world.', tips: 'Visit early morning to avoid crowds.', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
  { id: 4, name: 'Hammamet Beach',  cat: 'Beach',     emoji: '\u{1F3D6}\uFE0F', lat: 36.4000, lng: 10.6000, rating: 4.5, reviews: 21000, hours: 'Open 24/7',   color: '#06b6d4', desc: 'Crystal-clear Mediterranean waters and golden sands.', tips: 'Northern beach near the medina is less crowded.', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80' },
  { id: 5, name: 'Sahara - Douz',   cat: 'Adventure', emoji: '\u{1F42A}', lat: 33.4663, lng: 9.0203,  rating: 4.9, reviews: 9800,  hours: 'Best at dawn', color: '#eab308', desc: 'Gateway to the Sahara - dunes, camel treks, starry skies.', tips: 'Book a 2-day camel trek to sleep under the stars.', image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&q=80' },
  { id: 6, name: 'Djerba Island',   cat: 'Beach',     emoji: '\u{1F30A}', lat: 33.8075, lng: 10.8451, rating: 4.7, reviews: 18300, hours: 'Open 24/7',   color: '#10b981', desc: 'The Island of Dreams - beaches, flamingos, ancient synagogues.', tips: 'Rent a bicycle to explore the island.', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80' },
  { id: 7, name: 'Kairouan Medina', cat: 'Culture',   emoji: '\u{1F54C}', lat: 35.6781, lng: 10.0963, rating: 4.7, reviews: 7600,  hours: '8:00-20:00', color: '#8b5cf6', desc: 'Fourth holiest city in Islam. UNESCO-listed medina.', tips: 'Try makroudh - Kairouan is famous for it.', image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=600&q=80' },
  { id: 8, name: 'Tabarka',         cat: 'Adventure', emoji: '\u{1F93F}', lat: 36.9544, lng: 8.7576,  rating: 4.6, reviews: 4200,  hours: 'Open 24/7',   color: '#0ea5e9', desc: "Diver's paradise - coral reefs, Genoese fortress, jazz festival.", tips: 'Dive season May-October. Needles rock formations at sunset.', image: 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=600&q=80' },
];

const CAT_COLORS = { Culture: '#a78bfa', History: '#f59e0b', Beach: '#06b6d4', Adventure: '#10b981' };

function makeMarkerIcon(color, emoji, active) {
  const size = active ? 48 : 40;
  const border = active ? '3px solid white' : '2px solid rgba(255,255,255,0.6)';
  const fontSize = active ? 18 : 15;
  return L.divIcon({
    className: '',
    html: '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:50% 50% 50% 0;background:' + color + ';transform:rotate(-45deg);border:' + border + ';box-shadow:0 4px 16px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;cursor:pointer"><span style="transform:rotate(45deg);font-size:' + fontSize + 'px;line-height:1">' + emoji + '</span></div>',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  });
}

function makeLiveIcon() {
  return L.divIcon({
    className: '',
    html: '<div style="position:relative;width:22px;height:22px"><div style="position:absolute;inset:0;border-radius:50%;background:rgba(59,130,246,0.35);animation:livePulse 1.5s ease-out infinite"></div><div style="position:absolute;inset:4px;border-radius:50%;background:#3b82f6;border:2px solid white;box-shadow:0 2px 10px rgba(59,130,246,0.7)"></div></div>',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

// Ã¢â€â‚¬Ã¢â€â‚¬ Edit Profile Modal Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
function EditProfileModal({ profile, onClose, onSave }) {
  const [form, setForm] = useState({
    firstName:   profile.firstName   || '',
    lastName:    profile.lastName    || '',
    bio:         profile.bio         || '',
    nationality: profile.nationality || '',
  });
  const [photoFile, setPhotoFile]     = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving]           = useState(false);
  const fileRef = useRef();

  const handlePhoto = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setPhotoFile(f);
    const r = new FileReader();
    r.onload = ev => setPhotoPreview(ev.target.result);
    r.readAsDataURL(f);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (photoFile) await PassengerAPI.updatePhoto(profile.id, photoFile);
      await PassengerAPI.update(profile.id, {
        firstName:   form.firstName,
        lastName:    form.lastName,
        bio:         form.bio,
        nationality: form.nationality,
      });
      const full = await PassengerAPI.getById(profile.id);
      onSave(full);
      toast.success('Profile updated!');
      onClose();
    } catch { toast.error('Could not save changes'); }
    finally { setSaving(false); }
  };

  const avatarSrc = photoPreview || (profile.profileImageUrl ? API + profile.profileImageUrl : null);

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 460, color: 'var(--text)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Edit Profile</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>x</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileRef.current.click()}>
            <div style={{ width: 96, height: 96, borderRadius: '50%', overflow: 'hidden', background: 'var(--surface2)', border: '3px solid rgba(79,172,254,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 900 }}>
              {avatarSrc
                ? <img src={avatarSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : (form.firstName[0] || '?').toUpperCase()}
            </div>
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: '#4facfe', border: '2px solid #1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>+</div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
          <span style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>Tap to change photo</span>
        </div>

        {[
          { label: 'First Name',   key: 'firstName' },
          { label: 'Last Name',    key: 'lastName' },
          { label: 'Nationality',  key: 'nationality' },
        ].map(({ label, key }) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{label}</label>
            <input
              value={form[key]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: 10, padding: '11px 14px', fontSize: 14, color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = 'rgba(79,172,254,0.5)'}
              onBlur={e => e.target.style.borderColor = 'var(--input-border)'}
            />
          </div>
        ))}

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Bio</label>
          <textarea
            value={form.bio}
            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            rows={3}
            maxLength={150}
            placeholder="Tell your story..."
            style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: 10, padding: '11px 14px', fontSize: 14, color: 'var(--text)', outline: 'none', resize: 'none', fontFamily: 'Inter,sans-serif', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = 'rgba(79,172,254,0.5)'}
            onBlur={e => e.target.style.borderColor = 'var(--input-border)'}
          />
          <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{form.bio.length}/150</div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ flex: 2, padding: '12px', borderRadius: 10, background: 'linear-gradient(135deg,#4facfe,#00f2fe)', border: 'none', color: 'white', fontSize: 14, fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Ã¢â€â‚¬Ã¢â€â‚¬ New Post Modal Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
function NewPostModal({ passenger, passengerId, onClose, onCreated }) {
  const [text, setText]         = useState('');
  const [imageFile, setImage]   = useState(null);
  const [preview, setPreview]   = useState(null);
  const [dest, setDest]         = useState('');
  const [loading, setLoading]   = useState(false);
  const fileRef = useRef();

  const handleImage = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setImage(f);
    const r = new FileReader();
    r.onload = ev => setPreview(ev.target.result);
    r.readAsDataURL(f);
  };

  const submit = async () => {
    if (!text.trim() && !imageFile) return;
    setLoading(true);
    try {
      const name = ((passenger?.firstName || '') + ' ' + (passenger?.lastName || '')).trim() || 'Traveller';
      const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
      const post = await PostAPI.create({
        content: text,
        destination: dest || passenger?.travel?.destination || '',
        authorId: passengerId,
        authorName: name,
        authorInitials: initials,
        authorColor: '#4facfe',
        imageFile,
      });
      onCreated(post);
      toast.success('Post shared!');
      onClose();
    } catch (e) { toast.error(e.message || 'Could not post'); }
    finally { setLoading(false); }
  };

  const canPost = text.trim() || imageFile;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 460, color: 'var(--text)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>New Post</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 22, cursor: 'pointer' }}>x</button>
        </div>

        <div
          onClick={() => fileRef.current.click()}
          style={{ width: '100%', aspectRatio: '1', borderRadius: 14, overflow: 'hidden', background: 'var(--input-bg)', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 16, position: 'relative' }}
        >
          {preview
            ? <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : (
              <div style={{ textAlign: 'center', color: 'var(--muted)', pointerEvents: 'none' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 48, display: 'block', marginBottom: 8, color: 'var(--muted)' }}>add_photo_alternate</span>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)' }}>Click to add photo</div>
                <div style={{ fontSize: 12, marginTop: 4, color: 'var(--muted)' }}>JPG, PNG, GIF up to 10MB</div>
              </div>
            )
          }
          {preview && (
            <button
              onClick={e => { e.stopPropagation(); setImage(null); setPreview(null); fileRef.current.value = ''; }}
              style={{ position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: '2px solid rgba(255,255,255,0.3)', cursor: 'pointer', color: 'var(--text)', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, zIndex: 10 }}
            >x</button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={3}
          placeholder="Write a caption..."
          style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', fontSize: 14, color: 'var(--text)', resize: 'none', outline: 'none', fontFamily: 'Inter,sans-serif', boxSizing: 'border-box', marginBottom: 12 }}
        />

        <input
          value={dest}
          onChange={e => setDest(e.target.value)}
          placeholder="Tag a destination (optional)"
          style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 12px', fontSize: 13, color: 'var(--text)', outline: 'none', boxSizing: 'border-box', marginBottom: 20 }}
        />

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={submit} disabled={loading || !canPost}
            style={{ flex: 2, padding: '12px', borderRadius: 10, border: 'none', color: 'var(--text)', fontSize: 14, fontWeight: 800, cursor: (loading || !canPost) ? 'not-allowed' : 'pointer',
              background: canPost ? 'linear-gradient(135deg,#4facfe,#00f2fe)' : 'rgba(255,255,255,0.1)',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s',
            }}>
            {loading ? 'Sharing...' : 'Share'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Ã¢â€â‚¬Ã¢â€â‚¬ Post Detail Modal Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
function PostModal({ post, passengerId, passenger, onClose, onDelete, onUpdate }) {
  const [comments, setComments]   = useState([]);
  const [commentText, setCommentText] = useState('');
  const [editing, setEditing]     = useState(false);
  const [editText, setEditText]   = useState(post.content);
  const imgSrc = post.imageUrl ? (post.imageUrl.startsWith('http') ? post.imageUrl : API + post.imageUrl) : null;

  useEffect(() => {
    CommentAPI.getByPost(post.id).then(d => setComments(Array.isArray(d) ? d : [])).catch(() => {});
  }, [post.id]);

  const addComment = async () => {
    if (!commentText.trim()) return;
    try {
      const c = await CommentAPI.add(post.id, passengerId, commentText);
      setComments(prev => [...prev, c]);
      setCommentText('');
    } catch { toast.error('Could not post comment'); }
  };

  const deleteComment = async (id) => {
    try { await CommentAPI.delete(id); setComments(prev => prev.filter(c => c.id !== id)); }
    catch { toast.error('Could not delete'); }
  };

  const saveEdit = async () => {
    try {
      const updated = await PostAPI.update(post.id, editText);
      onUpdate(updated);
      setEditing(false);
      toast.success('Post updated');
    } catch { toast.error('Could not update'); }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ display: 'flex', background: 'var(--surface)', borderRadius: 16, overflow: 'hidden', maxWidth: 900, width: '100%', maxHeight: '90vh', border: '1px solid var(--border)' }}>

        {/* Image */}
        {imgSrc && (
          <div style={{ flex: '0 0 55%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={imgSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: '90vh' }} />
          </div>
        )}

        {/* Right panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#4facfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0, overflow: 'hidden' }}>
              {passenger?.profileImageUrl
                ? <img src={API + passenger.profileImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : (passenger?.firstName?.[0] || '?').toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{passenger?.firstName} {passenger?.lastName}</div>
              {post.destination && <div style={{ fontSize: 11, color: 'var(--muted)' }}>@ {post.destination}</div>}
            </div>
            {post.authorId === passengerId && (
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => setEditing(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 15, padding: 4 }} title="Edit">Edit</button>
                <button onClick={() => { onDelete(post.id); onClose(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 15, padding: 4 }} title="Delete">Del</button>
              </div>
            )}
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 20, padding: 4, marginLeft: 4 }}>x</button>
          </div>

          {/* Caption */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            {editing ? (
              <div>
                <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={3} autoFocus
                  style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: 8, padding: '8px 10px', fontSize: 13, color: 'var(--text)', resize: 'none', outline: 'none', fontFamily: 'Inter,sans-serif', boxSizing: 'border-box' }} />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button onClick={saveEdit} style={{ padding: '6px 14px', borderRadius: 8, background: '#4facfe', border: 'none', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Save</button>
                  <button onClick={() => { setEditing(false); setEditText(post.content); }} style={{ padding: '6px 14px', borderRadius: 8, background: 'var(--surface2)', border: 'none', color: 'var(--muted)', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>{post.content}</p>
            )}
          </div>

          {/* Comments */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
            {comments.map(c => (
              <div key={c.id} style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#4facfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                  {(c.authorName || '?')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginRight: 6 }}>{c.authorName}</span>
                  <span style={{ fontSize: 13, color: 'var(--text)' }}>{c.content}</span>
                  {c.authorId === passengerId && (
                    <button onClick={() => deleteComment(c.id)} style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 11, padding: 0 }}>Delete</button>
                  )}
                </div>
              </div>
            ))}
            {comments.length === 0 && <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginTop: 20 }}>No comments yet</p>}
          </div>

          {/* Stats */}
          <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--muted)', display: 'flex', gap: 16 }}>
            <span>{post.likes} likes</span>
            <span>{comments.length} comments</span>
          </div>

          {/* Add comment */}
          <div style={{ display: 'flex', gap: 8, padding: '12px 16px', borderTop: '1px solid var(--border)', alignItems: 'center' }}>
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 13, color: 'var(--text)', fontFamily: 'Inter,sans-serif' }}
              onKeyDown={e => { if (e.key === 'Enter') addComment(); }}
            />
            {commentText.trim() && (
              <button onClick={addComment} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4facfe', fontWeight: 700, fontSize: 13, padding: 0 }}>Post</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// â”€â”€ Followers / Following Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function FollowersModal({ mode, profileId, currentUserId, onClose, onProfileUpdate }) {
  const [list, setList]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [removing, setRemoving] = useState(null);
  const COLORS = ['#2446D4','#4A919E','#166874','#833ab4','#10b981','#f59e0b'];

  useEffect(() => {
    setLoading(true);
    const req = mode === 'followers'
      ? PassengerAPI.getFollowers(profileId)
      : PassengerAPI.getFollowing(profileId);
    req.then(d => setList(Array.isArray(d) ? d : []))
       .catch(() => toast.error('Could not load list'))
       .finally(() => setLoading(false));
  }, [mode, profileId]);

  const handleRemove = async (person) => {
    if (!confirm('Remove ' + (person.firstName || person.nationality) + '?')) return;
    setRemoving(person.id);
    try {
      if (mode === 'followers') {
        await PassengerAPI.unfollow(profileId, person.id);
      } else {
        await PassengerAPI.unfollow(person.id, profileId);
      }
      setList(prev => prev.filter(p => p.id !== person.id));
      const updated = await PassengerAPI.getById(profileId);
      onProfileUpdate(updated);
      toast.success('Removed');
    } catch { toast.error('Could not remove'); }
    finally { setRemoving(null); }
  };

  const handleFollow = async (person) => {
    try {
      await PassengerAPI.follow(person.id, currentUserId);
      toast.success('Following ' + (person.firstName || person.nationality) + '!');
    } catch { toast.error('Could not follow'); }
  };

  const filtered = list.filter(p => {
    const q = search.toLowerCase();
    return (p.firstName || '').toLowerCase().includes(q) ||
           (p.lastName  || '').toLowerCase().includes(q) ||
           (p.nationality || '').toLowerCase().includes(q);
  });

  const title = mode === 'followers' ? 'Followers' : 'Following';

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:20, width:'100%', maxWidth:440, maxHeight:'80vh', display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 24px 64px rgba(0,0,0,0.4)' }}>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 20px', borderBottom:'1px solid var(--border)' }}>
          <h2 style={{ fontSize:17, fontWeight:800, color:'var(--text)', margin:0 }}>
            {title} <span style={{ fontSize:13, fontWeight:500, color:'var(--muted)' }}>({list.length})</span>
          </h2>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--muted)', fontSize:20, lineHeight:1, padding:4, borderRadius:6 }}
            onMouseEnter={e => e.currentTarget.style.color='var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color='var(--muted)'}>x</button>
        </div>

        <div style={{ padding:'12px 20px', borderBottom:'1px solid var(--border)' }}>
          <div style={{ position:'relative' }}>
            <span className="material-symbols-outlined" style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', fontSize:16, color:'var(--muted)', pointerEvents:'none' }}>search</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={'Search ' + title.toLowerCase() + '...'}
              style={{ width:'100%', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:10, padding:'8px 12px 8px 34px', fontSize:13, color:'var(--text)', outline:'none', boxSizing:'border-box' }}
              onFocus={e => e.target.style.borderColor='#4facfe'}
              onBlur={e => e.target.style.borderColor='var(--border)'} />
          </div>
        </div>

        <div style={{ flex:1, overflowY:'auto' }}>
          {loading ? (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:48 }}>
              <div style={{ width:28, height:28, border:'3px solid var(--border)', borderTopColor:'#4facfe', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'48px 20px', color:'var(--muted)' }}>
              <span className="material-symbols-outlined" style={{ fontSize:40, display:'block', marginBottom:10, color:'var(--border)' }}>
                {mode === 'followers' ? 'group' : 'person_search'}
              </span>
              <div style={{ fontSize:14, fontWeight:600, color:'var(--text)', marginBottom:4 }}>
                {search ? 'No results' : (mode === 'followers' ? 'No followers yet' : 'Not following anyone yet')}
              </div>
              {!search && <div style={{ fontSize:12 }}>{mode === 'followers' ? 'Share your profile to get followers.' : 'Discover people on the feed.'}</div>}
            </div>
          ) : filtered.map((person, i) => {
            const name = ((person.firstName || '') + ' ' + (person.lastName || '')).trim() || person.nationality || 'Traveller';
            const initials = name.split(' ').map(w => w[0]).join('').substring(0,2).toUpperCase();
            const avatarSrc = person.profileImageUrl ? 'http://localhost:8089' + person.profileImageUrl : null;
            const isRemoving = removing === person.id;
            const isMe = person.id === currentUserId;
            return (
              <div key={person.id}
                style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 20px', borderBottom:'1px solid var(--border)', transition:'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background='var(--surface2)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                <div style={{ width:44, height:44, borderRadius:'50%', background:COLORS[i%COLORS.length], display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:16, flexShrink:0, overflow:'hidden', border:'2px solid var(--border)' }}>
                  {avatarSrc ? <img src={avatarSrc} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => { e.target.style.display='none'; }} /> : initials}
                </div>
                <div style={{ flex:1, overflow:'hidden' }}>
                  <div style={{ fontSize:14, fontWeight:700, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {name}{isMe && <span style={{ marginLeft:6, fontSize:10, color:'#4facfe', fontWeight:600 }}>You</span>}
                  </div>
                  <div style={{ fontSize:11, color:'var(--muted)' }}>
                    {person.nationality && <span>{'ðŸŒ ' + person.nationality}</span>}
                    {person.travel?.destination && <span style={{ marginLeft:8 }}>{'ðŸ“ ' + person.travel.destination}</span>}
                  </div>
                </div>
                {!isMe && (
                  <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                    {mode === 'followers' && (
                      <button onClick={() => handleFollow(person)}
                        style={{ padding:'5px 12px', borderRadius:8, background:'rgba(79,172,254,0.1)', border:'1px solid rgba(79,172,254,0.25)', color:'#4facfe', fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background='#4facfe'; e.currentTarget.style.color='white'; }}
                        onMouseLeave={e => { e.currentTarget.style.background='rgba(79,172,254,0.1)'; e.currentTarget.style.color='#4facfe'; }}>
                        Follow
                      </button>
                    )}
                    <button onClick={() => handleRemove(person)} disabled={isRemoving}
                      style={{ padding:'5px 12px', borderRadius:8, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#ef4444', fontSize:12, fontWeight:700, cursor:isRemoving?'not-allowed':'pointer', opacity:isRemoving?0.6:1, transition:'all 0.15s' }}
                      onMouseEnter={e => { if(!isRemoving){e.currentTarget.style.background='#ef4444';e.currentTarget.style.color='white';} }}
                      onMouseLeave={e => { e.currentTarget.style.background='rgba(239,68,68,0.08)';e.currentTarget.style.color='#ef4444'; }}>
                      {isRemoving ? '...' : 'Remove'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function PassengerProfile() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [posts, setPosts]             = useState([]);
  const [activeTab, setActiveTab]     = useState('posts');
  const [showEdit, setShowEdit]           = useState(false);
  const [showNewPost, setShowNewPost]     = useState(false);
  const [openPost, setOpenPost]           = useState(null);
  const [showFollowers, setShowFollowers] = useState(null); // 'followers' | 'following' | null

  // Map
  const [selected, setSelected]         = useState(LANDMARKS[0]);
  const [userPos, setUserPos]           = useState(null);
  const [routeInfo, setRouteInfo]       = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [catFilter, setCatFilter]       = useState('All');
  const mapRef     = useRef(null);
  const mapInst    = useRef(null);
  const liveMarker = useRef(null);
  const routeLayer = useRef(null);
  const markerMap  = useRef({});
  const watchId    = useRef(null);

  useEffect(() => {
    if (!user?.id) { navigate('/login'); return; }
    Promise.all([PassengerAPI.getById(user.id), PostAPI.getByAuthor(user.id)])
      .then(([p, ps]) => { setProfile(p); setPosts(Array.isArray(ps) ? ps : []); })
      .catch(() => toast.error('Could not load profile'))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  // Map init
  useEffect(() => {
    if (activeTab !== 'map') return;
    if (mapInst.current) return;
    const t = setTimeout(() => {
      if (!mapRef.current) return;
      const map = L.map(mapRef.current, { zoomControl: false }).setView([34.5, 9.5], 7);
      mapInst.current = map;
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      LANDMARKS.forEach(place => {
        const m = L.marker([place.lat, place.lng], { icon: makeMarkerIcon(place.color, place.emoji, false) })
          .addTo(map).on('click', () => handleSelectPlace(place));
        markerMap.current[place.id] = m;
      });
      if (navigator.geolocation) {
        watchId.current = navigator.geolocation.watchPosition(
          pos => {
            const { latitude: lat, longitude: lng } = pos.coords;
            setUserPos({ lat, lng });
            if (!liveMarker.current) {
              liveMarker.current = L.marker([lat, lng], { icon: makeLiveIcon(), zIndexOffset: 1000 })
                .addTo(map).bindTooltip('You are here', { direction: 'top' });
            } else { liveMarker.current.setLatLng([lat, lng]); }
          },
          () => setUserPos({ lat: 36.8, lng: 10.18 }),
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
        );
      }
    }, 150);
    return () => {
      clearTimeout(t);
      if (watchId.current != null) { navigator.geolocation.clearWatch(watchId.current); watchId.current = null; }
      if (mapInst.current) { mapInst.current.remove(); mapInst.current = null; }
      markerMap.current = {};
      liveMarker.current = null;
    };
  }, [activeTab]);

  const handleSelectPlace = useCallback((place) => {
    setSelected(place);
    setRouteInfo(null);
    if (mapInst.current) mapInst.current.flyTo([place.lat, place.lng], 13, { duration: 1.2 });
    Object.entries(markerMap.current).forEach(([id, m]) => {
      const lm = LANDMARKS.find(l => l.id === parseInt(id));
      if (lm) m.setIcon(makeMarkerIcon(parseInt(id) === place.id ? '#ffffff' : lm.color, lm.emoji, parseInt(id) === place.id));
    });
  }, []);

  const drawRoute = useCallback(async () => {
    if (!userPos || !selected || !mapInst.current) { toast.error('Location not available'); return; }
    setRouteLoading(true);
    try {
      const url = 'https://router.project-osrm.org/route/v1/driving/' + userPos.lng + ',' + userPos.lat + ';' + selected.lng + ',' + selected.lat + '?overview=full&geometries=geojson';
      const data = await fetch(url).then(r => r.json());
      if (data.code !== 'Ok' || !data.routes?.length) throw new Error();
      const route = data.routes[0];
      const distKm = (route.distance / 1000).toFixed(1);
      const durMin = Math.round(route.duration / 60);
      setRouteInfo({ distance: distKm, duration: durMin });
      if (routeLayer.current) routeLayer.current.remove();
      routeLayer.current = L.geoJSON(route.geometry, { style: { color: '#4facfe', weight: 4, opacity: 0.85, dashArray: '8 4' } }).addTo(mapInst.current);
      mapInst.current.fitBounds(routeLayer.current.getBounds(), { padding: [60, 60] });
      toast.success(distKm + ' km - ~' + durMin + ' min');
    } catch { toast.error('Could not calculate route'); }
    finally { setRouteLoading(false); }
  }, [userPos, selected]);

  const handleSaveProfile = (updated) => {
    setProfile(updated);
    login({ ...user, ...updated, type: 'passenger' });
  };

  const handleDeletePost = async (id) => {
    if (!confirm('Delete this post?')) return;
    try { await PostAPI.delete(id); setPosts(prev => prev.filter(p => p.id !== id)); toast.success('Deleted'); }
    catch { toast.error('Could not delete'); }
  };

  const handleUpdatePost = (updated) => setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));

  if (loading || !profile) return (
    <div style={{ height: 'calc(100vh - 85px)', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, border: '4px solid var(--border)', borderTopColor: '#4facfe', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 500 }}>Loading profileâ€¦</div>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  );

  const avatarSrc = profile.profileImageUrl ? API + profile.profileImageUrl : null;
  const filteredLandmarks = catFilter === 'All' ? LANDMARKS : LANDMARKS.filter(l => l.cat === catFilter);

  return (
    <div style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 85px)', color: 'var(--text)', fontFamily: 'Inter,sans-serif' }}>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ HEADER Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <div style={{ maxWidth: 935, margin: '0 auto', padding: '32px 20px 0' }}>
        <div style={{ display: 'flex', gap: 60, alignItems: 'flex-start', marginBottom: 28 }}>

          {/* Avatar with gradient ring */}
          <div style={{ flexShrink: 0 }}>
            <div style={{ width: 150, height: 150, borderRadius: '50%', padding: 3, background: 'linear-gradient(45deg,#833ab4,#fd1d1d,#fcb045)' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '4px solid var(--bg)', overflow: 'hidden', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, fontWeight: 900 }}>
                {avatarSrc
                  ? <img src={avatarSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : (profile.firstName?.[0] || '?').toUpperCase()}
              </div>
            </div>
          </div>

          {/* Info */}
          <div style={{ flex: 1, paddingTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 22, fontWeight: 400, margin: 0 }}>{profile.firstName} {profile.lastName}</h1>
              <button onClick={() => setShowEdit(true)}
                style={{ padding: '7px 20px', borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--input-border)', color: 'var(--text)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Edit profile
              </button>
              <button onClick={() => setShowNewPost(true)}
                style={{ padding: '7px 20px', borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--input-border)', color: 'var(--text)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                + New post
              </button>
            </div>

            <div style={{ display: 'flex', gap: 40, marginBottom: 16 }}>
              {[
                { val: posts.length,                label: 'posts',     onClick: null },
                { val: profile.followersCount || 0, label: 'followers', onClick: () => setShowFollowers('followers') },
                { val: profile.followingCount || 0, label: 'following', onClick: () => setShowFollowers('following') },
              ].map(({ val, label, onClick }) => (
                <div key={label}
                  onClick={onClick}
                  style={{ fontSize: 15, cursor: onClick ? 'pointer' : 'default', transition: 'opacity 0.15s' }}
                  onMouseEnter={e => { if (onClick) e.currentTarget.style.opacity = '0.7'; }}
                  onMouseLeave={e => { if (onClick) e.currentTarget.style.opacity = '1'; }}>
                  <strong style={{ fontWeight: 700 }}>{val}</strong>{' '}
                  <span style={{ color: 'var(--muted)' }}>{label}</span>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{profile.firstName} {profile.lastName}</div>
            <div style={{ fontSize: 12, color: '#4facfe', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 4 }}>
              {(profile.nationality || '').toUpperCase()} EXPLORER
            </div>
            {profile.bio && <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{profile.bio}</div>}
            {profile.travel?.destination && (
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
                @ {profile.travel.destination} - {profile.travel.duration} days - {profile.travel.budget}
              </div>
            )}
          </div>
        </div>

        {/* Ã¢â€â‚¬Ã¢â€â‚¬ STORIES ROW Ã¢â€â‚¬Ã¢â€â‚¬ */}
        <div style={{ display: 'flex', gap: 20, paddingBottom: 24, borderBottom: '1px solid var(--border)', overflowX: 'auto', scrollbarWidth: 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', flexShrink: 0 }} onClick={() => setShowNewPost(true)}>
            <div style={{ width: 66, height: 66, borderRadius: '50%', background: 'var(--input-bg)', border: '2px dashed rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>+</div>
            <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>Nouveau</span>
          </div>
          {posts.filter(p => p.imageUrl).slice(0, 8).map((p, i) => (
            <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', flexShrink: 0 }} onClick={() => setOpenPost(p)}>
              <div style={{ width: 66, height: 66, borderRadius: '50%', padding: 2, background: 'linear-gradient(45deg,#833ab4,#fd1d1d,#fcb045)' }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '2px solid var(--bg)', overflow: 'hidden' }}>
                  <img src={API + p.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500, maxWidth: 66, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>
                {p.destination || ('Post ' + (i + 1))}
              </span>
            </div>
          ))}
        </div>

        {/* Ã¢â€â‚¬Ã¢â€â‚¬ TABS Ã¢â€â‚¬Ã¢â€â‚¬ */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 0, borderBottom: '1px solid var(--border)' }}>
          {[
            { id: 'posts', icon: 'grid_on',        label: 'Posts' },
            { id: 'saved', icon: 'bookmark_border', label: 'Saved' },
            { id: 'map',   icon: 'map',             label: 'Explore' },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '14px 24px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: activeTab === t.id ? 'white' : 'rgba(255,255,255,0.4)', borderTop: activeTab === t.id ? '1px solid white' : '1px solid transparent', transition: 'all 0.2s' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ POSTS GRID Ã¢â€â‚¬Ã¢â€â‚¬ */}
      {activeTab === 'posts' && (
        <div style={{ maxWidth: 935, margin: '0 auto', padding: '4px 20px 40px' }}>
          {posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>+</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Share your first photo</div>
              <div style={{ fontSize: 14 }}>When you share photos, they will appear here.</div>
              <button onClick={() => setShowNewPost(true)} style={{ marginTop: 20, padding: '10px 24px', borderRadius: 8, background: '#4facfe', border: 'none', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Share a photo</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 3, marginTop: 4 }}>
              {posts.map(p => (
                <div key={p.id} style={{ position: 'relative', paddingBottom: '100%', overflow: 'hidden', cursor: 'pointer', background: 'var(--surface)' }} onClick={() => setOpenPost(p)}>
                  {p.imageUrl
                    ? <img src={API + p.imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                        onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
                        onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
                    : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, textAlign: 'center' }}>{p.content}</div>
                  }
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, opacity: 0, transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.45)'; e.currentTarget.style.opacity = '1'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0)'; e.currentTarget.style.opacity = '0'; }}>
                    <span style={{ color: 'var(--text)', fontWeight: 700, fontSize: 15 }}>{p.likes} likes</span>
                    <span style={{ color: 'var(--text)', fontWeight: 700, fontSize: 15 }}>{p.comments} comments</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ SAVED Ã¢â€â‚¬Ã¢â€â‚¬ */}
      {activeTab === 'saved' && (
        <div style={{ maxWidth: 935, margin: '0 auto', padding: '80px 20px', textAlign: 'center', color: 'var(--muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>B</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Save posts</div>
          <div style={{ fontSize: 14 }}>Save photos and videos that you want to see again.</div>
        </div>
      )}

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ MAP Ã¢â€â‚¬Ã¢â€â‚¬ */}
      {activeTab === 'map' && (
        <div style={{ maxWidth: 935, margin: '0 auto', padding: '20px 20px 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16, height: 600 }}>
            <div style={{ borderRadius: 16, overflow: 'hidden', position: 'relative', border: '1px solid var(--border)' }}>
              <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
              <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 1000, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['All', 'Culture', 'History', 'Beach', 'Adventure'].map(cat => (
                  <button key={cat} onClick={() => setCatFilter(cat)}
                    style={{ padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none', background: catFilter === cat ? (CAT_COLORS[cat] || '#4facfe') : 'rgba(10,10,18,0.85)', color: catFilter === cat ? 'white' : 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)' }}>
                    {cat}
                  </button>
                ))}
              </div>
              <button onClick={() => { if (userPos && mapInst.current) mapInst.current.flyTo([userPos.lat, userPos.lng], 14, { duration: 1 }); }}
                style={{ position: 'absolute', bottom: 56, right: 12, zIndex: 1000, width: 38, height: 38, borderRadius: 10, background: 'rgba(10,10,18,0.9)', border: '1px solid var(--input-border)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
                @
              </button>
              <div style={{ position: 'absolute', bottom: 12, left: 12, zIndex: 1000, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(10,10,18,0.85)', backdropFilter: 'blur(8px)', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 10px', fontSize: 11 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: userPos ? '#22c55e' : '#ef4444', boxShadow: userPos ? '0 0 5px #22c55e' : 'none' }} />
                <span style={{ color: 'var(--muted)', fontWeight: 600 }}>{userPos ? (userPos.lat.toFixed(3) + ', ' + userPos.lng.toFixed(3)) : 'Locating...'}</span>
              </div>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              <div style={{ height: 160, borderRadius: 12, overflow: 'hidden', marginBottom: 16, position: 'relative', flexShrink: 0 }}>
                <img src={selected.image} alt={selected.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 40%,rgba(0,0,0,0.7) 100%)' }} />
                <span style={{ position: 'absolute', top: 8, left: 8, background: CAT_COLORS[selected.cat] || '#4facfe', color: 'var(--text)', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999 }}>{selected.cat}</span>
                <span style={{ position: 'absolute', bottom: 8, right: 8, fontSize: 24 }}>{selected.emoji}</span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{selected.name}</h3>
              <div style={{ color: '#fbbf24', fontSize: 13, marginBottom: 8 }}>{'*'.repeat(Math.floor(selected.rating))} <span style={{ color: 'var(--muted)', fontSize: 11 }}>({selected.reviews.toLocaleString()})</span></div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10 }}>{selected.hours}</div>
              <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 12 }}>{selected.desc}</p>
              <div style={{ background: 'rgba(79,172,254,0.08)', border: '1px solid rgba(79,172,254,0.2)', borderRadius: 8, padding: '8px 12px', marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#4facfe', marginBottom: 3 }}>TIP</div>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, margin: 0 }}>{selected.tips}</p>
              </div>
              {routeInfo && (
                <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: '10px 12px', marginBottom: 12, display: 'flex', gap: 16, justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center' }}><div style={{ fontSize: 18, fontWeight: 900, color: '#22c55e' }}>{routeInfo.distance} km</div><div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 700 }}>DISTANCE</div></div>
                  <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
                  <div style={{ textAlign: 'center' }}><div style={{ fontSize: 18, fontWeight: 900, color: '#22c55e' }}>{routeInfo.duration} min</div><div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 700 }}>BY CAR</div></div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <button onClick={drawRoute} disabled={routeLoading}
                  style={{ flex: 1, background: 'linear-gradient(135deg,#4facfe,#00f2fe)', border: 'none', padding: '11px', borderRadius: 10, color: 'white', fontWeight: 800, cursor: routeLoading ? 'not-allowed' : 'pointer', fontSize: 12, opacity: routeLoading ? 0.7 : 1 }}>
                  {routeLoading ? 'Calculating...' : 'Get Directions'}
                </button>
                <button onClick={() => { if (mapInst.current) mapInst.current.flyTo([selected.lat, selected.lng], 14, { duration: 1 }); }}
                  style={{ width: 42, background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 8 }}>ALL DESTINATIONS</div>
                {filteredLandmarks.map(place => (
                  <div key={place.id} onClick={() => handleSelectPlace(place)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s', background: selected.id === place.id ? (place.color + '20') : 'transparent', border: selected.id === place.id ? ('1px solid ' + place.color + '40') : '1px solid transparent' }}
                    onMouseEnter={e => { if (selected.id !== place.id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                    onMouseLeave={e => { if (selected.id !== place.id) e.currentTarget.style.background = 'transparent'; }}>
                    <span style={{ fontSize: 16 }}>{place.emoji}</span>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: selected.id === place.id ? place.color : 'rgba(255,255,255,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{place.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--muted)' }}>{place.cat}</div>
                    </div>
                    <span style={{ fontSize: 10, color: '#fbbf24', fontWeight: 700 }}>{selected.rating}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showEdit    && <EditProfileModal profile={profile} onClose={() => setShowEdit(false)} onSave={handleSaveProfile} />}
      {showNewPost && <NewPostModal passenger={profile} passengerId={user.id} onClose={() => setShowNewPost(false)} onCreated={p => setPosts(prev => [p, ...prev])} />}
      {openPost    && <PostModal post={openPost} passengerId={user.id} passenger={profile} onClose={() => setOpenPost(null)} onDelete={id => { handleDeletePost(id); setOpenPost(null); }} onUpdate={handleUpdatePost} />}
      {showFollowers && <FollowersModal mode={showFollowers} profileId={profile.id} currentUserId={user.id} onClose={() => setShowFollowers(null)} onProfileUpdate={updated => setProfile(updated)} />}

      <style>{'@keyframes livePulse{0%{transform:scale(1);opacity:0.8}100%{transform:scale(2.5);opacity:0}} @keyframes spin{to{transform:rotate(360deg)}} .leaflet-container{background:var(--bg)!important} .leaflet-control-attribution{display:none!important}'}</style>
    </div>
  );
}



