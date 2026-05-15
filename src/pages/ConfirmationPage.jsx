import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};
const StarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"
      stroke="#C8A96B" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');

  // ← ADD THIS RIGHT HERE inside the function, before the return
  useEffect(() => {
    if (ref) {
      const saved = JSON.parse(localStorage.getItem('dream_references') || '[]');
      if (!saved.includes(ref)) {
        saved.push(ref);
        localStorage.setItem('dream_references', JSON.stringify(saved));
      }
    }
  }, [ref]);


  return (
    <div className="page" style={{ background: 'var(--midnight)', alignItems: 'center', justifyContent: 'center' }}>

      {/* Gold orb */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 500, height: 500, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(200,169,107,0.06) 0%, transparent 70%)',
      }} />

      <div className="container" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>

        {/* Success icon */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}
          style={{ marginBottom: '2rem' }}
        >
          <div style={{
            width: 100, height: 100, borderRadius: '50%',
            border: '1px solid rgba(200,169,107,0.3)',
            background: 'radial-gradient(circle, rgba(200,169,107,0.12) 0%, transparent 70%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto', fontSize: '3rem',
          }}>
            <StarIcon />
          </div>
        </motion.div>

        {/* Message */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}>
          <span className="section-label">Dream Submitted</span>
          <h1 style={{
            fontSize: 'clamp(2rem, 7vw, 3rem)',
            color: 'var(--cream)', marginTop: '0.5rem', lineHeight: 1.2, marginBottom: '1rem',
          }}>
            Your Dream has
            <br /><span style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Been Received</span>
          </h1>
          <p style={{ color: 'rgba(248,247,244,0.4)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: 300, margin: '0 auto' }}>
            The Prophet will review and interpret your dream. You will be contacted within <strong style={{ color: 'rgba(248,247,244,0.6)' }}>24–48 hours</strong>.
          </p>
        </motion.div>

        {/* Reference */}
        {ref && (
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2}
            style={{ margin: '2rem 0' }}
          >
            <div style={{
              background: 'rgba(200,169,107,0.05)',
              border: '1px solid rgba(200,169,107,0.15)',
              borderRadius: '1rem',
              padding: '1rem 1.5rem',
            }}>
              <p style={{ color: 'rgba(200,169,107,0.5)', fontSize: '0.7rem', letterSpacing: '0.15em', marginBottom: '0.4rem' }}>
                YOUR REFERENCE NUMBER
              </p>
              <p style={{ color: 'var(--gold)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.95rem', fontWeight: 500, letterSpacing: '0.05em' }}>
                {ref}
              </p>
              <p style={{ color: 'rgba(248,247,244,0.25)', fontSize: '0.7rem', marginTop: '0.4rem' }}>
                Save this to check your interpretation later
              </p>
            </div>
          </motion.div>
        )}

        {/* Check interpretation button */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3}
          style={{ marginBottom: '1rem' }}
        >
          <button className="btn-gold"
            onClick={() => navigate(`/check/${ref}`)}
            style={{ boxShadow: '0 8px 32px rgba(200,169,107,0.15)' }}
          >
            Check My Interpretation
          </button>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4}>
          <button className="btn-outline" onClick={() => navigate('/')}>
            Return Home
          </button>
        </motion.div>

        {/* Scripture */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={5}
          style={{ marginTop: '2.5rem' }}
        >
          <p style={{
            color: 'rgba(200,169,107,0.35)', fontSize: '0.85rem',
            fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif',
            lineHeight: 1.7,
          }}>
            "For God speaks in one way, and in two, though man does not perceive it. In a dream, in a vision of the night..."
          </p>
          <p style={{ color: 'rgba(200,169,107,0.2)', fontSize: '0.7rem', marginTop: '0.4rem' }}>Job 33:14–15</p>
        </motion.div>

      </div>
    </div>
  );
}