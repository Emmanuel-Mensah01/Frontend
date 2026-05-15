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

const LockIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="11" width="18" height="11" rx="2" stroke="#C8A96B" strokeWidth="1.5"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#C8A96B" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) return setError('Please enter email and password.');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      if (res.data.success && res.data.user.role === 'pastor') {
        localStorage.setItem('pastor_token', res.data.token);
        localStorage.setItem('pastor_name', res.data.user.name);
        navigate('/dashboard');
      } else {
        setError('Access restricted to the Pastor only.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className="page" style={{ background: 'var(--midnight)', alignItems: 'center', justifyContent: 'center' }}>

      <div style={{
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 300, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(ellipse, rgba(200,169,107,0.06) 0%, transparent 70%)',
      }} />

      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}
          style={{ textAlign: 'center', marginBottom: '2.5rem' }}
        >
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            border: '1px solid rgba(200,169,107,0.2)',
            background: 'rgba(200,169,107,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}>
            <LockIcon />
          </div>
          <span className="section-label">Pastor Access</span>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--cream)', marginTop: '0.5rem' }}>
            Welcome <span style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Back</span>
          </h1>
          <p style={{ color: 'rgba(248,247,244,0.3)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Sign in to access your dashboard
          </p>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}
          className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}
        >
          <div>
            <label style={{ color: 'rgba(200,169,107,0.6)', fontSize: '0.7rem', letterSpacing: '0.12em', display: 'block', marginBottom: '0.4rem' }}>
              EMAIL ADDRESS
            </label>
            <input className="input-field" type="email" name="email"
              placeholder="pastor@church.com"
              value={form.email} onChange={handleChange} onKeyDown={handleKeyDown}
            />
          </div>
          <div>
            <label style={{ color: 'rgba(200,169,107,0.6)', fontSize: '0.7rem', letterSpacing: '0.12em', display: 'block', marginBottom: '0.4rem' }}>
              PASSWORD
            </label>
            <input className="input-field" type="password" name="password"
              placeholder="Enter your password"
              value={form.password} onChange={handleChange} onKeyDown={handleKeyDown}
            />
          </div>
          {error && (
            <div style={{ background: 'rgba(255,100,100,0.06)', border: '1px solid rgba(255,100,100,0.15)', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: '#ff8080', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2}>
          <button className="btn-gold" onClick={handleLogin} disabled={loading}
            style={{ opacity: loading ? 0.7 : 1, boxShadow: '0 8px 32px rgba(200,169,107,0.12)' }}
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3}
          style={{ textAlign: 'center', marginTop: '2rem' }}
        >
          <button onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', color: 'rgba(200,169,107,0.35)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', cursor: 'pointer' }}
          >
            ← Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  );
}