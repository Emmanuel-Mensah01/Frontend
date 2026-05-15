import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const MicIcon = ({ size = 28, color = '#C8A96B' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="9" y="2" width="6" height="12" rx="3" stroke={color} strokeWidth="1.5"/>
    <path d="M5 10a7 7 0 0 0 14 0M12 19v3M9 22h6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const PenIcon = ({ size = 22, color = '#C8A96B' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const StopIcon = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="6" y="6" width="12" height="12" rx="2" fill="#ff6b6b" stroke="#ff6b6b" strokeWidth="1"/>
  </svg>
);

export default function SubmissionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentRef = searchParams.get('reference') || searchParams.get('trxref') || searchParams.get('ref');

  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [verifyError, setVerifyError] = useState('');
  const [mode, setMode] = useState('text');
  const [dreamText, setDreamText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const submitter = JSON.parse(localStorage.getItem('dream_submitter') || '{"name":"Anonymous","phone":"0000000000","email":""}');

  useEffect(() => {
    if (!paymentRef) {
      setVerifyError('No payment reference found. Please complete payment first.');
      setVerifying(false);
      return;
    }
    if (paymentRef.startsWith('DEV-')) {
      setVerified(true);
      setVerifying(false);
      return;
    }
    const verify = async () => {
      try {
        const res = await api.get(`/payments/verify/${paymentRef}`);
        if (res.data.success) setVerified(true);
        else setVerifyError('Payment could not be verified.');
      } catch {
        setVerifyError('Payment verification failed. Please contact support.');
      } finally {
        setVerifying(false);
      }
    };
    verify();
  }, [paymentRef]);

  const getMimeType = () => {
    const types = ['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/aac'];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mimeType = getMimeType();
      const mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const mimeUsed = mr.mimeType || mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mimeUsed });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start(100);
      setRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch {
      setError('Microphone access denied. Please allow microphone access and try again.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    clearInterval(timerRef.current);
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const getFileExtension = (blob) => {
    if (!blob) return 'webm';
    if (blob.type.includes('mp4')) return 'mp4';
    if (blob.type.includes('ogg')) return 'ogg';
    if (blob.type.includes('aac')) return 'aac';
    return 'webm';
  };

  const handleSubmit = async () => {
    if (mode === 'text' && !dreamText.trim()) return setError('Please describe your dream.');
    if (mode === 'audio' && !audioBlob) return setError('Please record your dream first.');
    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('submitterName', submitter.name || 'Anonymous');
      formData.append('submitterPhone', submitter.phone || '0000000000');
      formData.append('submitterEmail', submitter.email || '');
      formData.append('type', mode);
      formData.append('paymentReference', paymentRef);
      formData.append('paymentAmount', '50');
      if (mode === 'text') {
        formData.append('textContent', dreamText);
      } else {
        const ext = getFileExtension(audioBlob);
        formData.append('audio', audioBlob, `dream-recording.${ext}`);
      }
      const res = await api.post('/submissions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        localStorage.removeItem('dream_submitter');
        navigate(`/confirmation?ref=${paymentRef}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (verifying) return (
    <div style={{ minHeight: '100vh', background: 'var(--midnight)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', border: '1.5px solid var(--gold)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: 'rgba(200,169,107,0.5)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', letterSpacing: '0.05em' }}>Verifying your offering...</p>
    </div>
  );

  if (verifyError) return (
    <div style={{ minHeight: '100vh', background: 'var(--midnight)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <div style={{ width: 60, height: 60, borderRadius: '50%', border: '1px solid rgba(200,169,107,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#C8A96B" strokeWidth="1.5"/>
          <path d="M12 8v4M12 16h.01" stroke="#C8A96B" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <h2 style={{ color: 'var(--cream)', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', marginBottom: '0.75rem' }}>Payment Issue</h2>
      <p style={{ color: 'rgba(248,247,244,0.4)', fontFamily: 'DM Sans, sans-serif', maxWidth: 300, marginBottom: '2rem', lineHeight: 1.7 }}>{verifyError}</p>
      <button className="btn-outline" onClick={() => navigate('/offering')} style={{ maxWidth: 240 }}>Try Again</button>
    </div>
  );

  return (
    <div className="page" style={{ background: 'var(--midnight)' }}>
      <div style={{
        position: 'fixed', bottom: -100, left: -100,
        width: 400, height: 400, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(200,169,107,0.04) 0%, transparent 70%)',
      }} />

      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}
          style={{ textAlign: 'center', marginBottom: '2rem' }}
        >
          <span className="section-label">Step 2 of 2</span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 6vw, 2.5rem)', color: 'var(--cream)', marginTop: '0.5rem', lineHeight: 1.2 }}>
            Share Your <span style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Dream</span>
          </h1>
          <p style={{ color: 'rgba(248,247,244,0.35)', fontSize: '0.85rem', marginTop: '0.5rem', lineHeight: 1.6 }}>
            Describe exactly what you saw or experienced.
          </p>
        </motion.div>

        {/* Mode toggle */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}
        >
          {[
            { key: 'text', icon: <PenIcon color={mode === 'text' ? '#C8A96B' : 'rgba(248,247,244,0.3)'} />, label: 'Write it', sub: 'Type your dream' },
            { key: 'audio', icon: <MicIcon color={mode === 'audio' ? '#C8A96B' : 'rgba(248,247,244,0.3)'} />, label: 'Record it', sub: 'Speak your dream' },
          ].map((opt) => (
            <button key={opt.key} onClick={() => { setMode(opt.key); setError(''); }}
              style={{
                padding: '1.1rem 0.75rem',
                borderRadius: '1rem',
                border: `1px solid ${mode === opt.key ? 'rgba(200,169,107,0.5)' : 'rgba(200,169,107,0.1)'}`,
                background: mode === opt.key ? 'rgba(200,169,107,0.08)' : 'transparent',
                cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.4rem' }}>{opt.icon}</div>
              <div style={{ color: mode === opt.key ? 'var(--gold)' : 'rgba(248,247,244,0.4)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', fontWeight: 500 }}>{opt.label}</div>
              <div style={{ color: 'rgba(248,247,244,0.2)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', marginTop: '0.1rem' }}>{opt.sub}</div>
            </button>
          ))}
        </motion.div>

        {/* Text mode */}
        {mode === 'text' && (
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2}>
            <div className="card" style={{ marginBottom: '1rem' }}>
              <label style={{ color: 'rgba(200,169,107,0.6)', fontSize: '0.7rem', letterSpacing: '0.12em', display: 'block', marginBottom: '0.75rem' }}>
                DESCRIBE YOUR DREAM
              </label>
              <textarea
                className="input-field"
                placeholder="I was standing in a place where..."
                value={dreamText}
                onChange={(e) => { setDreamText(e.target.value); setError(''); }}
                rows={8}
                style={{ resize: 'vertical', lineHeight: 1.8 }}
              />
              <p style={{ color: 'rgba(248,247,244,0.15)', fontSize: '0.7rem', marginTop: '0.5rem' }}>
                {dreamText.length} characters · Be as detailed as possible
              </p>
            </div>
          </motion.div>
        )}

        {/* Audio mode */}
        {mode === 'audio' && (
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2}>
            <div className="card" style={{ textAlign: 'center', marginBottom: '1rem', padding: '2rem 1.5rem' }}>
              {!audioBlob ? (
                <>
                  <button
                    onClick={recording ? stopRecording : startRecording}
                    style={{
                      width: 90, height: 90, borderRadius: '50%',
                      border: `1.5px solid ${recording ? 'rgba(255,107,107,0.6)' : 'rgba(200,169,107,0.4)'}`,
                      background: recording ? 'rgba(255,107,107,0.08)' : 'rgba(200,169,107,0.06)',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 1.5rem',
                      transition: 'all 0.3s',
                      animation: recording ? 'pulse-rec 1.5s infinite' : 'none',
                    }}
                  >
                    {recording ? <StopIcon size={28} /> : <MicIcon size={28} />}
                  </button>

                  {recording ? (
                    <div>
                      <p style={{ color: '#ff8080', fontFamily: 'DM Sans, sans-serif', fontSize: '1.1rem', fontWeight: 500, letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                        {formatTime(recordingTime)}
                      </p>
                      <p style={{ color: 'rgba(248,247,244,0.3)', fontSize: '0.8rem' }}>Recording — tap to stop</p>
                    </div>
                  ) : (
                    <div>
                      <p style={{ color: 'rgba(200,169,107,0.6)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Tap to begin recording</p>
                      <p style={{ color: 'rgba(248,247,244,0.2)', fontSize: '0.75rem' }}>Speak clearly · Up to 10 minutes</p>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    border: '1px solid rgba(50,200,120,0.3)',
                    background: 'rgba(50,200,120,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 0.75rem',
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="#32c878" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p style={{ color: 'rgba(50,200,120,0.8)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Dream recorded </p>
<p style={{ color: 'rgba(200,169,107,0.5)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', marginBottom: '1rem' }}>
  {formatTime(recordingTime)} recorded
</p>
                  <button onClick={() => { setAudioBlob(null); setAudioUrl(''); setRecordingTime(0); }}
                    style={{ background: 'none', border: 'none', color: 'rgba(248,247,244,0.25)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Record again
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ background: 'rgba(255,100,100,0.06)', border: '1px solid rgba(255,100,100,0.15)', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: '#ff8080', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.5 }}
          >
            {error}
          </motion.div>
        )}

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3}>
          <button className="btn-gold" onClick={handleSubmit} disabled={submitting}
            style={{ fontSize: '1rem', padding: '1.2rem', boxShadow: '0 8px 32px rgba(200,169,107,0.12)' }}
          >
            {submitting ? 'Submitting...' : 'Submit My Dream'}
          </button>
        </motion.div>

        <motion.p variants={fadeUp} initial="hidden" animate="show" custom={4}
          style={{ textAlign: 'center', color: 'rgba(248,247,244,0.15)', fontSize: '0.72rem', marginTop: '1rem', letterSpacing: '0.03em' }}
        >
          Your dream is private and handled with spiritual care
        </motion.p>

      </div>
    </div>
  );
}