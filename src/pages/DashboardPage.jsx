import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

// ─── Animation Variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  pending:     { bg: 'rgba(255,180,50,0.08)',  border: 'rgba(255,180,50,0.25)',  text: '#ffb432' },
  in_review:   { bg: 'rgba(100,150,255,0.08)', border: 'rgba(100,150,255,0.25)', text: '#6496ff' },
  interpreted: { bg: 'rgba(50,200,120,0.08)',  border: 'rgba(50,200,120,0.25)',  text: '#32c878' },
};
const STATUS_LABELS = {
  pending: 'Pending',
  in_review: 'In Review',
  interpreted: 'Interpreted',
};

// ─── Decorative Ornament Divider ──────────────────────────────────────────────
const OrnamentLine = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.5rem 0 1.75rem' }}>
    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(200,169,107,0.2))' }} />
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"
        stroke="rgba(200,169,107,0.35)" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, rgba(200,169,107,0.2))' }} />
  </div>
);

// ─── Section Label ────────────────────────────────────────────────────────────
const SectionLabel = ({ children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
    <div style={{ width: 3, height: 16, background: 'var(--gold)', borderRadius: 2, opacity: 0.5 }} />
    <span style={{
      color: 'rgba(200,169,107,0.55)', fontSize: '0.65rem',
      letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif',
    }}>
      {children}
    </span>
  </div>
);

// ─── Content Upload Section (all logic preserved) ─────────────────────────────
function ContentUploadSection() {
  const [form, setForm] = useState({ title: '', description: '', type: 'teaching', duration: '' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [contents, setContents] = useState([]);
  const [loadingContent, setLoadingContent] = useState(true);

  useEffect(() => { fetchContent(); }, []);

  const fetchContent = async () => {
    try {
      const res = await api.get('/content');
      setContents(res.data.content || []);
    } catch {}
    finally { setLoadingContent(false); }
  };

  const handleUpload = async () => {
    if (!form.title || !file) return setError('Title and media file are required.');
    setUploading(true);
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('type', form.type);
      formData.append('duration', form.duration);
      formData.append('media', file);
      await api.post('/content', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess('Content uploaded successfully!');
      setForm({ title: '', description: '', type: 'teaching', duration: '' });
      setFile(null);
      fetchContent();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.');
    } finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this content?')) return;
    try {
      await api.delete(`/content/${id}`);
      setContents(prev => prev.filter(c => c._id !== id));
    } catch { setError('Failed to delete.'); }
  };

  return (
    <div>
      <SectionLabel>Upload New Content</SectionLabel>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

          {/* Type selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {['teaching', 'prayer'].map((t) => (
              <button key={t} onClick={() => setForm({ ...form, type: t })}
                style={{
                  padding: '0.65rem',
                  borderRadius: '0.875rem',
                  border: `1px solid ${form.type === t ? 'rgba(200,169,107,0.5)' : 'rgba(200,169,107,0.12)'}`,
                  background: form.type === t ? 'rgba(200,169,107,0.1)' : 'transparent',
                  color: form.type === t ? 'var(--gold)' : 'rgba(248,247,244,0.3)',
                  fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem',
                  cursor: 'pointer', transition: 'all 0.2s',
                  textTransform: 'capitalize', letterSpacing: '0.04em',
                }}
              >
                {t === 'teaching' ? 'Teaching' : 'Prayer'}
              </button>
            ))}
          </div>

          <input className="input-field" placeholder="Title *"
            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input className="input-field" placeholder="Description (optional)"
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input className="input-field" placeholder="Duration e.g. 12 mins (optional)"
            value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })}
          />

          {/* File input */}
          <div
            onClick={() => document.getElementById('content-file').click()}
            style={{
              border: '1px dashed rgba(200,169,107,0.22)',
              borderRadius: '1rem', padding: '1.5rem',
              textAlign: 'center', cursor: 'pointer',
              background: 'rgba(200,169,107,0.02)',
            }}
          >
            <input id="content-file" type="file"
              accept="video/*,audio/*"
              style={{ display: 'none' }}
              onChange={(e) => setFile(e.target.files[0])}
            />
            {file ? (
              <p style={{ color: 'var(--gold)', fontSize: '0.84rem', fontFamily: 'DM Sans, sans-serif' }}>✓ {file.name}</p>
            ) : (
              <div>
                <p style={{ color: 'rgba(200,169,107,0.4)', fontSize: '0.82rem', fontFamily: 'DM Sans, sans-serif' }}>Tap to select video or audio file</p>
                <p style={{ color: 'rgba(248,247,244,0.15)', fontSize: '0.7rem', marginTop: '0.3rem' }}>MP4 · MOV · MP3 · WAV</p>
              </div>
            )}
          </div>

          {error   && <p style={{ color: '#ff8080',  fontSize: '0.82rem', fontFamily: 'DM Sans, sans-serif' }}>{error}</p>}
          {success && <p style={{ color: '#32c878',  fontSize: '0.82rem', fontFamily: 'DM Sans, sans-serif' }}>{success}</p>}

          <button className="btn-gold" onClick={handleUpload} disabled={uploading}
            style={{ opacity: uploading ? 0.7 : 1 }}
          >
            {uploading ? 'Uploading...' : 'Upload Content'}
          </button>
        </div>
      </div>

      {/* Published list */}
      <SectionLabel>Published Content ({contents.length})</SectionLabel>

      {loadingContent ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid var(--gold)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
        </div>
      ) : contents.length === 0 ? (
        <p style={{ color: 'rgba(248,247,244,0.18)', fontSize: '0.82rem', fontFamily: 'DM Sans, sans-serif', fontStyle: 'italic', textAlign: 'center', padding: '1.5rem' }}>
          No content uploaded yet
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {contents.map((c) => (
            <div key={c._id} className="card" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ color: 'rgba(200,169,107,0.38)', fontSize: '0.6rem', letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif' }}>
                    {c.type} · {c.mediaType}
                  </span>
                  <p style={{ color: 'var(--cream)', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.05rem', marginTop: '0.2rem' }}>{c.title}</p>
                  {c.duration && (
                    <p style={{ color: 'rgba(248,247,244,0.2)', fontSize: '0.7rem', marginTop: '0.15rem', fontFamily: 'DM Sans, sans-serif' }}>{c.duration}</p>
                  )}
                </div>
                <button onClick={() => handleDelete(c._id)}
                  style={{
                    background: 'rgba(255,100,100,0.05)', border: '1px solid rgba(255,100,100,0.15)',
                    borderRadius: '0.5rem', padding: '0.3rem 0.7rem',
                    color: 'rgba(255,128,128,0.6)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const MicIcon = ({ color = '#C8A96B' }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="9" y="2" width="6" height="12" rx="3" stroke={color} strokeWidth="1.5"/>
    <path d="M5 10a7 7 0 0 0 14 0M12 19v3M9 22h6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const PenIcon = ({ color = '#C8A96B' }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState('list');

  const [responseMode, setResponseMode] = useState('text');
  const [responseText, setResponseText] = useState('');
  const [responding, setResponding] = useState(false);
  const [responseError, setResponseError] = useState('');

  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const fetchSubmissions = async () => {
    try {
      const params = filter !== 'all' && filter !== 'content' ? `?status=${filter}` : '';
      const res = await api.get(`/submissions${params}`);
      setSubmissions(res.data.submissions || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (filter !== 'content') fetchSubmissions();
    else setLoading(false);
  }, [filter]);

  const handleLogout = () => {
    localStorage.removeItem('pastor_token');
    localStorage.removeItem('pastor_name');
    navigate('/login');
  };

  const openDetail = async (sub) => {
    setSelected(sub);
    setView('detail');
    setResponseText('');
    setResponseMode('text');
    setAudioBlob(null);
    setAudioUrl('');
    setResponseError('');
    if (sub.status === 'pending') {
      try {
        await api.patch(`/submissions/${sub._id}/status`, { status: 'in_review' });
        setSubmissions((prev) => prev.map((s) => s._id === sub._id ? { ...s, status: 'in_review' } : s));
      } catch {}
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
  const mimeUsed = mr.mimeType || 'audio/webm';
  const blob = new Blob(chunksRef.current, { type: mimeUsed });
  setAudioBlob(blob);
  const reader = new FileReader();
  reader.onloadend = () => setAudioUrl(reader.result);
  reader.readAsDataURL(blob);
  stream.getTracks().forEach((t) => t.stop());
};
      mr.start();
      setRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch { setResponseError('Microphone access denied.'); }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    clearInterval(timerRef.current);
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const submitResponse = async () => {
    if (responseMode === 'text' && !responseText.trim()) return setResponseError('Please type your interpretation.');
    if (responseMode === 'audio' && !audioBlob) return setResponseError('Please record your interpretation.');
    setResponding(true);
    setResponseError('');
    try {
      const formData = new FormData();
      formData.append('type', responseMode);
      if (responseMode === 'text') formData.append('textContent', responseText);
      else formData.append('audio', audioBlob, 'interpretation.webm');
      await api.post(`/interpretations/${selected._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSubmissions((prev) => prev.map((s) => s._id === selected._id ? { ...s, status: 'interpreted' } : s));
      setSelected((prev) => ({ ...prev, status: 'interpreted' }));
      setView('list');
    } catch (err) {
      setResponseError(err.response?.data?.message || 'Failed to send interpretation.');
    } finally { setResponding(false); }
  };

  const pending     = submissions.filter((s) => s.status === 'pending').length;
  const inReview    = submissions.filter((s) => s.status === 'in_review').length;
  const interpreted = submissions.filter((s) => s.status === 'interpreted').length;
  const awaitingCount = pending + inReview;

  // ── DETAIL VIEW ──────────────────────────────────────────────────────────────
  if (view === 'detail' && selected) {
    return (
      <div className="page" style={{ background: 'var(--midnight)' }}>
        <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>

          <motion.button
            variants={fadeUp} initial="hidden" animate="show" custom={0}
            onClick={() => setView('list')}
            style={{
              background: 'none', border: 'none',
              color: 'rgba(200,169,107,0.4)',
              fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem',
              cursor: 'pointer', marginBottom: '1.75rem',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              letterSpacing: '0.04em',
            }}
          >
            ← Return to the Queue
          </motion.button>

          {/* Detail header */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0} style={{ marginBottom: '1.25rem' }}>
            <span style={{ color: 'rgba(200,169,107,0.38)', fontSize: '0.62rem', letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif' }}>
              Dream · Under Discernment
            </span>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(1.6rem, 5vw, 2rem)',
              color: 'var(--cream)', marginTop: '0.25rem', lineHeight: 1.15,
            }}>
              {selected.submitterName}'s{' '}
              <span style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Dream</span>
            </h2>
          </motion.div>

          {/* Submitter card */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1} className="card" style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <p style={{ color: 'var(--gold)', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.25rem', marginBottom: '0.2rem' }}>
                  {selected.submitterName}
                </p>
                <p style={{ color: 'rgba(248,247,244,0.3)', fontSize: '0.78rem', fontFamily: 'DM Sans, sans-serif' }}>{selected.submitterPhone}</p>
                {selected.submitterEmail && (
                  <p style={{ color: 'rgba(248,247,244,0.2)', fontSize: '0.72rem', fontFamily: 'DM Sans, sans-serif' }}>{selected.submitterEmail}</p>
                )}
              </div>
              <div style={{
                padding: '0.28rem 0.8rem', borderRadius: '2rem',
                background: STATUS_COLORS[selected.status]?.bg,
                border: `1px solid ${STATUS_COLORS[selected.status]?.border}`,
                color: STATUS_COLORS[selected.status]?.text,
                fontSize: '0.68rem', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.05em',
              }}>
                {STATUS_LABELS[selected.status]}
              </div>
            </div>

            {/* Meta chips */}
            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
              {[
                { label: 'TYPE',     value: selected.type },
                { label: 'OFFERING', value: `GHS ${selected.paymentAmount}` },
                { label: 'DATE',     value: new Date(selected.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  background: 'rgba(200,169,107,0.05)',
                  border: '1px solid rgba(200,169,107,0.1)',
                  borderRadius: '0.625rem', padding: '0.4rem 0.85rem',
                }}>
                  <p style={{ color: 'rgba(200,169,107,0.4)', fontSize: '0.58rem', letterSpacing: '0.14em', fontFamily: 'DM Sans, sans-serif' }}>{label}</p>
                  <p style={{ color: 'var(--cream)', fontSize: '0.8rem', textTransform: 'capitalize', fontFamily: 'DM Sans, sans-serif', marginTop: '0.1rem' }}>{value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Dream content */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2} className="card" style={{ marginBottom: '1.5rem' }}>
            <SectionLabel>The Dream</SectionLabel>
            {selected.type === 'text' ? (
              <p style={{ color: 'var(--cream)', lineHeight: 1.85, fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem' }}>
                {selected.textContent}
              </p>
            ) : (
              <div>
                <audio controls src={selected.audioUrl} style={{ width: '100%', borderRadius: '0.75rem' }} />
                <p style={{ color: 'rgba(248,247,244,0.22)', fontSize: '0.72rem', marginTop: '0.6rem', textAlign: 'center', fontFamily: 'DM Sans, sans-serif' }}>
                  Press play to hear the dream
                </p>
              </div>
            )}
          </motion.div>

          {/* Response */}
          {selected.status !== 'interpreted' ? (
            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3}>
              <SectionLabel>Prophetic Response</SectionLabel>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
               {[
  { key: 'text', icon: <PenIcon color={responseMode === 'text' ? '#C8A96B' : 'rgba(248,247,244,0.3)'} />, label: 'Type response' },
  { key: 'audio', icon: <MicIcon color={responseMode === 'audio' ? '#C8A96B' : 'rgba(248,247,244,0.3)'} />, label: 'Record response' },
].map((opt) => (
  <button key={opt.key} onClick={() => { setResponseMode(opt.key); setResponseError(''); }}
    style={{
      padding: '1.1rem 0.75rem',
      borderRadius: '1rem',
      border: `1px solid ${responseMode === opt.key ? 'rgba(200,169,107,0.5)' : 'rgba(200,169,107,0.1)'}`,
      background: responseMode === opt.key ? 'rgba(200,169,107,0.08)' : 'transparent',
      cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.4rem' }}>{opt.icon}</div>
    <div style={{ color: responseMode === opt.key ? 'var(--gold)' : 'rgba(248,247,244,0.4)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', fontWeight: 500 }}>{opt.label}</div>
  </button>
))}
                 
              </div>

              {responseMode === 'text' && (
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <textarea
                    className="input-field"
                    placeholder="Speak the word of the Lord over this dream..."
                    value={responseText}
                    onChange={(e) => { setResponseText(e.target.value); setResponseError(''); }}
                    rows={7}
                    style={{ resize: 'vertical', lineHeight: 1.8, fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem' }}
                  />
                  {responseText.length > 0 && (
                    <p style={{ color: 'rgba(248,247,244,0.15)', fontSize: '0.7rem', marginTop: '0.5rem', fontFamily: 'DM Sans, sans-serif' }}>
                      {responseText.length} characters
                    </p>
                  )}
                </div>
              )}

              {responseMode === 'audio' && (
                <div className="card" style={{ textAlign: 'center', marginBottom: '1rem', padding: '2rem 1.5rem' }}>
                  {!audioUrl ? (
                    <>
                      <button
                        onClick={recording ? stopRecording : startRecording}
                        style={{
                          width: 80, height: 80, borderRadius: '50%',
                          border: `1.5px solid ${recording ? 'rgba(255,107,107,0.6)' : 'rgba(200,169,107,0.4)'}`,
                          background: recording ? 'rgba(255,107,107,0.08)' : 'rgba(200,169,107,0.06)',
                          cursor: 'pointer', margin: '0 auto 1.25rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '2rem', transition: 'all 0.3s',
                          animation: recording ? 'pulse-rec 1.5s infinite' : 'none',
                        }}
                      >
                       {recording ? (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="6" y="6" width="12" height="12" rx="2" fill="rgba(255,107,107,0.8)"/>
  </svg>
) : (
  <MicIcon size={24} color="rgba(200,169,107,0.7)" />
)}
                      </button>
                      <style>{`@keyframes pulse-rec{0%,100%{box-shadow:0 0 0 0 rgba(255,107,107,0.3)}50%{box-shadow:0 0 0 14px rgba(255,107,107,0)}}`}</style>
                      {recording ? (
                        <div>
                          <p style={{ color: '#ff8080', fontFamily: 'DM Sans, sans-serif', fontSize: '1.1rem', fontWeight: 500, letterSpacing: '0.06em' }}>● {formatTime(recordingTime)}</p>
                          <p style={{ color: 'rgba(248,247,244,0.22)', fontSize: '0.74rem', marginTop: '0.25rem' }}>Recording — tap to stop</p>
                        </div>
                      ) : (
                        <div>
                          <p style={{ color: 'rgba(200,169,107,0.5)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem' }}>Tap to begin recording</p>
                          <p style={{ color: 'rgba(248,247,244,0.18)', fontSize: '0.72rem', marginTop: '0.25rem' }}>Speak clearly into the microphone</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <p style={{ color: '#32c878', fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', marginBottom: '0.75rem' }}>✓ Interpretation recorded</p>
                      <audio controls src={audioUrl} style={{ width: '100%', borderRadius: '0.75rem', marginBottom: '0.75rem' }} />
                      <button onClick={() => { setAudioBlob(null); setAudioUrl(''); }}
                        style={{ background: 'none', border: 'none', color: 'rgba(248,247,244,0.22)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Re-record
                      </button>
                    </>
                  )}
                </div>
              )}

              {responseError && (
                <div style={{ background: 'rgba(255,100,100,0.06)', border: '1px solid rgba(255,100,100,0.15)', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: '#ff8080', fontSize: '0.82rem', marginBottom: '1rem', fontFamily: 'DM Sans, sans-serif' }}>
                  {responseError}
                </div>
              )}

              <button className="btn-gold" onClick={submitResponse} disabled={responding}
                style={{ opacity: responding ? 0.7 : 1, boxShadow: '0 8px 32px rgba(200,169,107,0.15)', fontSize: '0.95rem' }}
              >
                {responding ? 'Sending Interpretation...' : 'Release the Word ✨'}
              </button>
            </motion.div>
          ) : (
            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3}>
              <div className="card" style={{ background: 'rgba(50,200,120,0.04)', border: '1px solid rgba(50,200,120,0.18)', textAlign: 'center', padding: '2rem' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', border: '1px solid rgba(50,200,120,0.25)', background: 'rgba(50,200,120,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M20 6L9 17l-5-5" stroke="#32c878" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
</div>
                <p style={{ color: '#32c878', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem' }}>
                  The Word Has Been Released
                </p>
                {selected.interpretation?.type === 'text' && (
                  <p style={{ color: 'rgba(248,247,244,0.28)', fontSize: '0.85rem', marginTop: '0.75rem', lineHeight: 1.7, fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif' }}>
                    "{selected.interpretation.textContent?.slice(0, 140)}..."
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // ── LIST VIEW ────────────────────────────────────────────────────────────────
  return (
    <div className="page" style={{ background: 'var(--midnight)' }}>

      {/* Ambient orb */}
      <div style={{
        position: 'fixed', top: -150, right: -150,
        width: 500, height: 500, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(200,169,107,0.04) 0%, transparent 70%)',
      }} />

      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>

        {/* ── CEREMONIAL HEADER ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0} style={{ marginBottom: '0.25rem' }}>

          {/* Top row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{
              color: 'rgba(200,169,107,0.38)', fontSize: '0.6rem',
              letterSpacing: '0.24em', textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif',
            }}>
              Prophetic Administration
            </span>
            <button
              onClick={handleLogout}
              style={{
                background: 'none', border: 'none',
                color: 'rgba(248,247,244,0.18)',
                fontFamily: 'DM Sans, sans-serif', fontSize: '0.74rem',
                cursor: 'pointer', letterSpacing: '0.04em', transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,128,128,0.55)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(248,247,244,0.18)'}
            >
              Sign out
            </button>
          </div>

          {/* Main title */}
          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(2.2rem, 8vw, 3rem)',
            color: 'var(--cream)', lineHeight: 1.05, letterSpacing: '-0.01em',
          }}>
            The{' '}
            <span style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Inner Chamber</span>
          </h1>

          {/* Dynamic subtitle */}
          <p style={{
            color: 'rgba(248,247,244,0.22)', fontSize: '0.82rem',
            fontFamily: 'DM Sans, sans-serif', marginTop: '0.45rem', letterSpacing: '0.025em',
          }}>
            {awaitingCount > 0
              ? `${awaitingCount} dream${awaitingCount === 1 ? '' : 's'} awaiting discernment`
              : interpreted > 0
              ? `${interpreted} dream${interpreted === 1 ? '' : 's'} interpreted · the queue is clear`
              : 'No submissions yet · the chamber is still'}
          </p>
        </motion.div>

        {/* Ornament */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}>
          <OrnamentLine />
        </motion.div>

        {/* ── STATS ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', marginBottom: '1.5rem' }}
        >
          {[
            { label: 'Awaiting',   value: pending,     color: '#ffb432' },
            { label: 'Discerning', value: inReview,    color: '#6496ff' },
            { label: 'Fulfilled',  value: interpreted, color: '#32c878' },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: 'rgba(255,255,255,0.015)',
              border: '1px solid rgba(200,169,107,0.08)',
              borderRadius: '1.25rem', padding: '1.1rem 0.5rem', textAlign: 'center',
            }}>
              <p style={{ color: stat.color, fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', lineHeight: 1, fontWeight: 300 }}>
                {stat.value}
              </p>
              <p style={{ color: 'rgba(248,247,244,0.28)', fontSize: '0.62rem', marginTop: '0.3rem', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* ── FILTER TABS ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3}
          style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}
        >
         {[
  { key: 'all',         label: 'All Dreams' },
  { key: 'pending',     label: 'Pending' },
  { key: 'interpreted', label: 'Interpreted' },
  { key: 'content',     label: 'Content' },
].map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              style={{
                padding: '0.4rem 1rem', borderRadius: '2rem', whiteSpace: 'nowrap',
                border: `1px solid ${filter === key ? 'rgba(200,169,107,0.45)' : 'rgba(200,169,107,0.1)'}`,
                background: filter === key ? 'rgba(200,169,107,0.1)' : 'transparent',
                color: filter === key ? 'var(--gold)' : 'rgba(248,247,244,0.22)',
                fontFamily: 'DM Sans, sans-serif', fontSize: '0.76rem',
                cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.03em',
              }}
            >
              {label}
            </button>
          ))}
        </motion.div>

        {/* ── CONTENT TAB ── */}
        {filter === 'content' && (
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4}>
            <ContentUploadSection />
          </motion.div>
        )}

        {/* ── SUBMISSIONS LIST ── */}
        {filter !== 'content' && (
          <>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid rgba(200,169,107,0.35)', borderTopColor: 'transparent', animation: 'spin 0.9s linear infinite', margin: '0 auto 1rem' }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                <p style={{ color: 'rgba(200,169,107,0.28)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', letterSpacing: '0.06em' }}>
                  Summoning the queue...
                </p>
              </div>
            ) : submissions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ marginBottom: '1rem', opacity: 0.35, display: 'flex', justifyContent: 'center' }}>
  <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
    <path d="M30 19.5A12 12 0 1 1 16.5 6a9 9 0 0 0 13.5 13.5z"
      fill="none" stroke="rgba(200,169,107,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
</div>
                <p style={{ color: 'rgba(248,247,244,0.18)', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem' }}>
                  The chamber is still
                </p>
                <p style={{ color: 'rgba(248,247,244,0.1)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.74rem', marginTop: '0.4rem' }}>
                  No submissions in this category
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {submissions.map((sub, i) => (
                  <motion.div
                    key={sub._id}
                    variants={fadeUp} initial="hidden" animate="show" custom={i}
                    onClick={() => openDetail(sub)}
                    style={{
                      background: 'rgba(255,255,255,0.018)',
                      border: '1px solid rgba(200,169,107,0.1)',
                      borderRadius: '1.25rem',
                      padding: '1.1rem 1.25rem',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s, background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(200,169,107,0.28)';
                      e.currentTarget.style.background = 'rgba(200,169,107,0.025)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(200,169,107,0.1)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.018)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        {/* Name + type icon */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                          {sub.type === 'audio' ? (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                              <rect x="9" y="2" width="6" height="12" rx="3" stroke="rgba(200,169,107,0.45)" strokeWidth="1.5"/>
                              <path d="M5 10a7 7 0 0 0 14 0M12 19v3M9 22h6" stroke="rgba(200,169,107,0.45)" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          ) : (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="rgba(200,169,107,0.45)" strokeWidth="1.5" strokeLinecap="round"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="rgba(200,169,107,0.45)" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          )}
                          <p style={{ color: 'var(--cream)', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', lineHeight: 1 }}>
                            {sub.submitterName}
                          </p>
                        </div>

                        {/* Meta */}
                        <p style={{ color: 'rgba(248,247,244,0.2)', fontSize: '0.71rem', marginBottom: '0.45rem', fontFamily: 'DM Sans, sans-serif' }}>
                          {sub.submitterPhone} · GHS {sub.paymentAmount} · {new Date(sub.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>

                        {/* Preview */}
                        {sub.type === 'text' && sub.textContent && (
                          <p style={{ color: 'rgba(248,247,244,0.28)', fontSize: '0.77rem', lineHeight: 1.55, fontFamily: 'DM Sans, sans-serif' }}>
                            {sub.textContent.slice(0, 90)}…
                          </p>
                        )}
                        {sub.type === 'audio' && (
                          <p style={{ color: 'rgba(200,169,107,0.28)', fontSize: '0.72rem', fontFamily: 'DM Sans, sans-serif', fontStyle: 'italic' }}>
                            Audio dream · tap to listen
                          </p>
                        )}
                      </div>

                      {/* Status + arrow */}
                      <div style={{ marginLeft: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.6rem' }}>
                        <div style={{
                          padding: '0.22rem 0.65rem', borderRadius: '2rem',
                          background: STATUS_COLORS[sub.status]?.bg,
                          border: `1px solid ${STATUS_COLORS[sub.status]?.border}`,
                          color: STATUS_COLORS[sub.status]?.text,
                          fontSize: '0.61rem', whiteSpace: 'nowrap',
                          fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.05em',
                        }}>
                          {STATUS_LABELS[sub.status]}
                        </div>
                        <span style={{ color: 'rgba(200,169,107,0.22)', fontSize: '0.85rem' }}>→</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Refresh */}
            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <button
                onClick={fetchSubmissions}
                style={{
                  background: 'none', border: 'none',
                  color: 'rgba(200,169,107,0.25)',
                  fontFamily: 'DM Sans, sans-serif', fontSize: '0.76rem',
                  cursor: 'pointer', letterSpacing: '0.08em', transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(200,169,107,0.55)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(200,169,107,0.25)'}
              >
                ↻  Refresh the Queue
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}