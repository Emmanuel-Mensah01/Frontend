import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.12 },
  }),
};

export default function FindInterpretationPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedRefs, setSavedRefs] = useState([]);

  useEffect(() => {
    // Load any saved references from localStorage
    const saved = JSON.parse(localStorage.getItem('dream_references') || '[]');
    setSavedRefs(saved);
  }, []);

  const handleFindByReference = () => {
    if (!reference.trim()) return setError('Please enter your reference number.');
    navigate(`/check/${reference.trim()}`);
  };

  const handleFindByPhone = async () => {
    if (!phone.trim()) return setError('Please enter your phone number.');
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/submissions/find?phone=${phone.trim()}`);
      if (res.data.reference) {
        navigate(`/check/${res.data.reference}`);
      } else {
        setError('No interpreted dream found for this phone number yet.');
      }
    } catch {
      setError('No interpreted dream found for this phone number yet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ background: 'var(--midnight)' }}>
      <div style={{
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 300, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(ellipse, rgba(200,169,107,0.06) 0%, transparent 70%)',
      }} />

      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>

        {/* Back */}
        <motion.button variants={fadeUp} initial="hidden" animate="show" custom={0}
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', color: 'rgba(200,169,107,0.5)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '1.5rem' }}
        >
          ← Back
        </motion.button>

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}
          style={{ textAlign: 'center', marginBottom: '2rem' }}
        >  <div style={{
  width: 64, height: 64, borderRadius: '50%',
  border: '1px solid rgba(200,169,107,0.2)',
  background: 'rgba(200,169,107,0.06)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  margin: '0 auto 1.25rem',
}}>
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="8" stroke="#C8A96B" strokeWidth="1.5"/>
    <path d="M21 21l-4.35-4.35" stroke="#C8A96B" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
</div>
          <span className="section-label">Find Your Word</span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 6vw, 2.5rem)', color: 'var(--cream)', marginTop: '0.5rem', lineHeight: 1.2 }}>
            Retrieve Your <span style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Interpretation</span>
          </h1>
          <p style={{ color: 'rgba(248,247,244,0.35)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Use your reference number or phone number to find your dream interpretation.
          </p>
        </motion.div>

        {/* Saved references from this device */}
        {savedRefs.length > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2}
            style={{ marginBottom: '1.5rem' }}
          >
            <p style={{ color: 'rgba(200,169,107,0.6)', fontSize: '0.7rem', letterSpacing: '0.15em', marginBottom: '0.75rem' }}>
              SAVED ON THIS DEVICE
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {savedRefs.map((ref) => (
                <button key={ref}
                  onClick={() => navigate(`/check/${ref}`)}
                  style={{
                    background: 'rgba(200,169,107,0.06)',
                    border: '1px solid rgba(200,169,107,0.15)',
                    borderRadius: '0.875rem',
                    padding: '0.875rem 1rem',
                    color: 'var(--gold)',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(200,169,107,0.4)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(200,169,107,0.15)'}
                >
                  <span>{ref}</span>
                  <span style={{ opacity: 0.5 }}>→</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Find by reference */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3}
          className="card" style={{ marginBottom: '1rem' }}
        >
          <label style={{ color: 'rgba(200,169,107,0.7)', fontSize: '0.75rem', letterSpacing: '0.08em', display: 'block', marginBottom: '0.75rem' }}>
            ENTER REFERENCE NUMBER
          </label>
          <input
            className="input-field"
            type="text"
            placeholder="e.g. DREAM-ABC123"
            value={reference}
            onChange={(e) => { setReference(e.target.value); setError(''); }}
            style={{ marginBottom: '0.75rem' }}
          />
          <button className="btn-gold" onClick={handleFindByReference}
            style={{ fontSize: '0.95rem', padding: '1rem' }}
          >
            Find by Reference →
          </button>
        </motion.div>

        {/* Divider */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4}
          className="divider"
        >
          <div className="divider-line" />
          <span className="divider-text">or</span>
          <div className="divider-line" />
        </motion.div>

        {/* Find by phone */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={5}
          className="card" style={{ marginBottom: '1rem' }}
        >
          <label style={{ color: 'rgba(200,169,107,0.7)', fontSize: '0.75rem', letterSpacing: '0.08em', display: 'block', marginBottom: '0.75rem' }}>
            ENTER YOUR PHONE NUMBER
          </label>
          <input
            className="input-field"
            type="tel"
            placeholder="e.g. 0244123456"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setError(''); }}
            style={{ marginBottom: '0.75rem' }}
          />
          <button className="btn-primary" onClick={handleFindByPhone} disabled={loading}
            style={{ fontSize: '0.95rem', padding: '1rem', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Searching...' : 'Find by Phone →'}
          </button>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ background: 'rgba(255,100,100,0.08)', border: '1px solid rgba(255,100,100,0.2)', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: '#ff8080', fontSize: '0.85rem' }}
          >
            {error}
          </motion.div>
        )}

        {/* Help note */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={6}
          style={{ marginTop: '1.5rem', textAlign: 'center' }}
        >
          <p style={{ color: 'rgba(248,247,244,0.2)', fontSize: '0.75rem', lineHeight: 1.6 }}>
            Your reference number was shown on the confirmation page after submission. If you need help, contact the church directly.
          </p>
        </motion.div>

      </div>
    </div>
  );
}