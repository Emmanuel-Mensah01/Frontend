import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const SeedIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M12 22V12M12 12C12 7 7 3 2 3c0 5 4 9 10 9zM12 12c0-5 5-9 10-9-1 5-5 9-10 9z"
      stroke="#C8A96B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function OfferingPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', email: '', amount: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return setError('Please enter your name.');
    if (!form.phone.trim()) return setError('Please enter your phone number.');
    if (!form.amount || Number(form.amount) < 50) return setError('Minimum offering is GHS 50.');

    setLoading(true);

    // Save submitter info
    localStorage.setItem('dream_submitter', JSON.stringify({
      name: form.name,
      phone: form.phone,
      email: form.email,
    }));

    try {
      const res = await api.post('/payments/initialize', {
        name: form.name,
        phone: form.phone,
        email: form.email,
        amount: Number(form.amount),
      });

      if (res.data.success) {
        window.location.href = res.data.authorizationUrl;
      }
    } catch (err) {
      // DEV FALLBACK — bypass payment if Paystack not configured
      const isDev = import.meta.env.DEV;
      if (isDev) {
        const devRef = `DEV-${Date.now()}`;
        navigate(`/submission?ref=${devRef}`);
        return;
      }
      setError(err.response?.data?.message || 'Payment service unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const quickAmounts = [50, 100, 200, 500];

  return (
    <div className="page" style={{ background: 'var(--midnight)' }}>

      {/* Gold orb */}
      <div style={{
        position: 'fixed', top: -100, right: -100,
        width: 400, height: 400, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(200,169,107,0.06) 0%, transparent 70%)',
      }} />

      {/* Back button */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}
        style={{ padding: '1.5rem 1.5rem 0' }}
      >
        <button onClick={() => navigate('/')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(200,169,107,0.6)', fontSize: '0.85rem',
            fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '0.4rem',
          }}
        >
          ← Back
        </button>
      </motion.div>

      <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}
          style={{ textAlign: 'center', marginBottom: '2rem' }}
        >
       <div
  style={{
    width: 72,
    height: 72,
    borderRadius: '50%',
    border: '1px solid rgba(200,169,107,0.18)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.2rem',
    background: 'radial-gradient(circle, rgba(200,169,107,0.06) 0%, transparent 70%)',
  }}
>
  <SeedIcon />
</div>
          <span className="section-label">Step 1 of 2</span>
          <h1 style={{
            fontSize: 'clamp(2rem, 7vw, 2.8rem)',
            color: 'var(--cream)', marginTop: '0.5rem', lineHeight: 1.2,
          }}>
            Sow Your <span style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Seed</span>
          </h1>
          <p style={{ color: 'rgba(248,247,244,0.4)', fontSize: '0.9rem', marginTop: '0.75rem', lineHeight: 1.6 }}>
            Your offering supports the ministry and unlocks your dream submission.
          </p>
        </motion.div>

        {/* Form card */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2} className="card"
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >

          {/* Name */}
          <div>
            <label style={{ color: 'rgba(200,169,107,0.7)', fontSize: '0.75rem', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>
              YOUR NAME
            </label>
            <input
              className="input-field"
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          {/* Phone */}
          <div>
            <label style={{ color: 'rgba(200,169,107,0.7)', fontSize: '0.75rem', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>
              PHONE NUMBER
            </label>
            <input
              className="input-field"
              type="tel"
              name="phone"
              placeholder="e.g. 0244123456"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          {/* Email (optional) */}
          <div>
            <label style={{ color: 'rgba(200,169,107,0.7)', fontSize: '0.75rem', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>
              EMAIL <span style={{ color: 'rgba(200,169,107,0.35)', fontWeight: 300 }}>(optional)</span>
            </label>
            <input
              className="input-field"
              type="email"
              name="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          {/* Amount */}
          <div>
            <label style={{ color: 'rgba(200,169,107,0.7)', fontSize: '0.75rem', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>
              OFFERING AMOUNT <span style={{ color: 'rgba(200,169,107,0.5)' }}>(min. GHS 50)</span>
            </label>

            {/* Quick select amounts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {quickAmounts.map((amt) => (
                <button key={amt}
                  onClick={() => setForm({ ...form, amount: String(amt) })}
                  style={{
                    padding: '0.6rem',
                    borderRadius: '0.75rem',
                    border: `1px solid ${form.amount === String(amt) ? 'var(--gold)' : 'rgba(200,169,107,0.2)'}`,
                    background: form.amount === String(amt) ? 'rgba(200,169,107,0.15)' : 'transparent',
                    color: form.amount === String(amt) ? 'var(--gold)' : 'rgba(248,247,244,0.4)',
                    fontSize: '0.85rem',
                    fontFamily: 'DM Sans, sans-serif',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {amt}
                </button>
              ))}
            </div>

            <input
              className="input-field"
              type="number"
              name="amount"
              placeholder="Or enter custom amount"
              value={form.amount}
              onChange={handleChange}
              min="50"
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(255,100,100,0.08)',
              border: '1px solid rgba(255,100,100,0.2)',
              borderRadius: '0.75rem',
              padding: '0.75rem 1rem',
              color: '#ff8080',
              fontSize: '0.85rem',
            }}>
              {error}
            </div>
          )}
        </motion.div>

        {/* Info note */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3}
          style={{ margin: '1.25rem 0', textAlign: 'center' }}
        >
          <p style={{ color: 'rgba(248,247,244,0.25)', fontSize: '0.75rem', lineHeight: 1.6 }}>
            🔒 Secured by Paystack · Mobile Money supported
          </p>
        </motion.div>

        {/* Submit */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4}>
          <button className="btn-gold" onClick={handleSubmit} disabled={loading}
            style={{
              fontSize: '1.05rem', padding: '1.2rem',
              boxShadow: '0 8px 32px rgba(200,169,107,0.15)',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Processing...' : 'Proceed to Offering →'}
          </button>
        </motion.div>

        {/* Spiritual note */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={5}
          style={{ marginTop: '1.5rem' }}
        >
          <div style={{
            background: 'rgba(200,169,107,0.04)',
            border: '1px solid rgba(200,169,107,0.1)',
            borderRadius: '1rem',
            padding: '1rem 1.25rem',
            textAlign: 'center',
          }}>
            <p style={{ color: 'rgba(200,169,107,0.5)', fontSize: '0.8rem', lineHeight: 1.7, fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif' }}>
              "Honour the LORD with your wealth and with the firstfruits of all your produce."
            </p>
            <p style={{ color: 'rgba(200,169,107,0.3)', fontSize: '0.7rem', marginTop: '0.4rem' }}>Proverbs 3:9</p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}