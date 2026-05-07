import axios from 'axios';

// In dev: reads from .env → VITE_API_URL=http://localhost:8083
// In prod: reads from .env.production or Vercel env vars → VITE_API_URL=https://spit-backend.onrender.com
export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8083';
const BASE = `${BASE_URL}/api`;

const http = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
});

// ── Auth ──────────────────────────────────────────────────
export const AuthAPI = {
  // Returns { id, email, fullName, role }
  login: (email, password) => http.post('/auth/login', { email, password }).then(r => r.data),
};

// ── Passengers ────────────────────────────────────────────
export const PassengerAPI = {
  // Returns full Passenger object with travel, preferences, recommendations
  getAll:    ()         => http.get('/passengers').then(r => r.data),
  getById:   (id)       => http.get(`/passengers/${id}`).then(r => r.data),
  create:    (data)     => http.post('/passengers', data).then(r => r.data),
  update:    (id, data) => http.put(`/passengers/${id}`, data).then(r => r.data),
  delete:    (id)       => http.delete(`/passengers/${id}`).then(r => r.data),
  updatePhoto: async (id, file) => {
    const fd = new FormData();
    fd.append('photo', file);
    const res = await fetch(`${BASE}/passengers/${id}/photo`, { method: 'POST', body: fd });
    return res.json();
  },
  getStats:  ()         => http.get('/stats').then(r => r.data),
  // Returns updated full Passenger object
  recommend: (id)       => http.post('/recommendations', { passengerId: id }).then(r => r.data),
  getRecs:   (id)       => http.get(`/recommendations/passenger/${id}`).then(r => r.data),
  // Returns full Passenger object (id, firstName, lastName, email, travel, preferences, recommendations)
  loginPassenger: (email, password) => http.post('/passengers/login', { email, password }).then(r => r.data),
  follow:   (id, followerId) => http.post(`/passengers/${id}/follow/${followerId}`).then(r => r.data),
  unfollow: (id, followerId) => http.delete(`/passengers/${id}/follow/${followerId}`).then(r => r.data),
  getFollowers: (id) => http.get(`/passengers/${id}/followers`).then(r => r.data),
  getFollowing: (id) => http.get(`/passengers/${id}/following`).then(r => r.data),
};

// ── Posts ──────────────────────────────────────────────────
export const PostAPI = {
  getAll:    ()           => http.get('/posts').then(r => r.data),
  getByAuthor: (id)       => http.get(`/posts/author/${id}`).then(r => r.data),
  // multipart/form-data — use native fetch, not axios
  create: async ({ content, destination, authorId, authorName, authorInitials, authorColor, imageFile }) => {
    const fd = new FormData();
    fd.append('content',        content);
    fd.append('authorId',       authorId);
    fd.append('authorName',     authorName);
    fd.append('authorInitials', authorInitials || '??');
    fd.append('authorColor',    authorColor    || '#4A919E');
    if (destination) fd.append('destination', destination);
    if (imageFile)   fd.append('image', imageFile);
    const res = await fetch(`${BASE_URL}/api/posts`, { method: 'POST', body: fd });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Post failed'); }
    return res.json();
  },
  like: (id, passengerId) => http.post(`/posts/${id}/like`, { passengerId }).then(r => r.data),
  delete: (id) => http.delete(`/posts/${id}`).then(r => r.data),
  update: (id, content) => http.put(`/posts/${id}`, { content }).then(r => r.data),
};

// ── Stories ────────────────────────────────────────────────
export const StoryAPI = {
  getAll: () => http.get('/stories').then(r => r.data),
  create: async (authorId, file) => {
    const fd = new FormData();
    fd.append('authorId', authorId);
    fd.append('image', file);
    const res = await fetch(`${BASE_URL}/api/stories`, { method: 'POST', body: fd });
    return res.json();
  },
  delete: (id) => http.delete(`/stories/${id}`).then(r => r.data),
};

// ── Comments ──────────────────────────────────────────────
export const CommentAPI = {
  getByPost: (postId) => http.get(`/comments/post/${postId}`).then(r => r.data),
  add:    (postId, authorId, content) => http.post('/comments', { postId, authorId, content }).then(r => r.data),
  delete: (id)                        => http.delete(`/comments/${id}`).then(r => r.data),
  update: (id, content)               => http.put(`/comments/${id}`, { content }).then(r => r.data),
  like:   (id, passengerId)           => http.post(`/comments/${id}/like`, { passengerId }).then(r => r.data),
};

// ── Replies ────────────────────────────────────────────────
export const ReplyAPI = {
  getByComment: (commentId) => http.get(`/replies/comment/${commentId}`).then(r => r.data),
  add: (commentId, authorId, content) => http.post('/replies', { commentId, authorId, content }).then(r => r.data),
  delete: (id) => http.delete(`/replies/${id}`).then(r => r.data),
};

// ── Chatbot ────────────────────────────────────────────────
export const ChatbotAPI = {
  ask: (message) => http.post('/chatbot/ask', { message }).then(r => r.data),
};

// ── Messages ────────────────────────────────────────────────
export const MessageAPI = {
  getConversation: (u1, u2) => http.get(`/messages/${u1}/${u2}`).then(r => r.data),
  send: (senderId, receiverId, content, type = 'TEXT', mediaUrl = null) => http.post('/messages', { senderId, receiverId, content, type, mediaUrl }).then(r => r.data),
  upload: (senderId, receiverId, file, type) => {
    const formData = new FormData();
    formData.append('senderId', senderId);
    formData.append('receiverId', receiverId);
    formData.append('file', file);
    formData.append('type', type);
    return http.post('/messages/upload', formData).then(r => r.data);
  },
  delete: (id) => http.delete(`/messages/${id}`).then(r => r.data),
  update: (id, content) => http.put(`/messages/${id}`, { content }).then(r => r.data),
};

// ── Notifications ──────────────────────────────────────────
export const NotificationAPI = {
  getByUser: (userId) => http.get(`/notifications/user/${userId}`).then(r => r.data),
  markRead:  (id)     => http.put(`/notifications/${id}/read`).then(r => r.data),
};

export const UserAPI = {
  getAll:  ()         => http.get('/users').then(r => r.data),
  getById: (id)       => http.get(`/users/${id}`).then(r => r.data),
  create:  (data)     => http.post('/users', data).then(r => r.data),
  update:  (id, data) => http.put(`/users/${id}`, data).then(r => r.data),
  delete:  (id)       => http.delete(`/users/${id}`).then(r => r.data),
  count:   ()         => http.get('/users/count').then(r => r.data),
};
