import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

// SVG Icons
const MoonIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <path d="M30 19.5A12 12 0 1 1 16.5 6a9 9 0 0 0 13.5 13.5z"
      fill="none" stroke="#C8A96B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SeedIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M12 22V12M12 12C12 7 7 3 2 3c0 5 4 9 10 9zM12 12c0-5 5-9 10-9-1 5-5 9-10 9z"
      stroke="#C8A96B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MicIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="9" y="2" width="6" height="12" rx="3" stroke="#C8A96B" strokeWidth="1.5"/>
    <path d="M5 10a7 7 0 0 0 14 0M12 19v3M9 22h6" stroke="#C8A96B" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const StarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"
      stroke="#C8A96B" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="page" style={{ background: 'var(--midnight)', position: 'relative', overflow: 'hidden' }}>

      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 300, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(ellipse, rgba(200,169,107,0.07) 0%, transparent 70%)',
      }} />

      {/* Header — secret pastor login */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}
        style={{ display: 'flex', justifyContent: 'center', paddingTop: '2.5rem', paddingBottom: '0.5rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 32, height: 1, background: 'rgba(200,169,107,0.3)' }} />
          <span
            className="section-label"
            style={{ color: 'rgba(200,169,107,0.6)', cursor: 'default', userSelect: 'none' }}
            onClick={() => navigate('/login')}
          >
            The Dream Prophet
          </span>
          <div style={{ width: 32, height: 1, background: 'rgba(200,169,107,0.3)' }} />
        </div>
      </motion.div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 1.5rem', textAlign: 'center' }}>

        {/* Moon icon */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1} style={{ marginBottom: '2rem' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            border: '1px solid rgba(200,169,107,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
            background: 'radial-gradient(circle, rgba(200,169,107,0.08) 0%, transparent 70%)',
          }}>
            <MoonIcon />
          </div>
        </motion.div>

        <motion.h1 variants={fadeUp} initial="hidden" animate="show" custom={2}
          style={{ fontSize: 'clamp(2.8rem, 8vw, 4rem)', color: 'var(--cream)', lineHeight: 1.15, marginBottom: '1rem' }}
        >
          Your Dreams<br />
          <span style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Carry Messages</span>
        </motion.h1>

        <motion.p variants={fadeUp} initial="hidden" animate="show" custom={3}
          style={{ color: 'rgba(248,247,244,0.45)', fontSize: '1rem', lineHeight: 1.7, maxWidth: 280, marginBottom: '2rem' }}
        >
          Receive a personal spiritual interpretation of your dream from the Prophet.
        </motion.p>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4}
          style={{ width: '100%', maxWidth: 320, marginBottom: '0.75rem' }}
        >
          <button className="btn-gold" onClick={() => navigate('/offering')}
            style={{ fontSize: '1.1rem', padding: '1.25rem', boxShadow: '0 8px 32px rgba(200,169,107,0.15)' }}
          >
            Begin Submission
          </button>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={5}
          style={{ width: '100%', maxWidth: 320, marginBottom: '1.25rem' }}
        >
          <button onClick={() => navigate('/find')}
            style={{
              width: '100%', background: 'transparent',
              border: '1px solid rgba(200,169,107,0.2)',
              borderRadius: '1rem', padding: '0.9rem',
              color: 'rgba(200,169,107,0.55)',
              fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem',
              cursor: 'pointer', transition: 'all 0.3s', letterSpacing: '0.02em',
            }}
          >
            Check My Interpretation
          </button>
        </motion.div>

        
         {/* Teachings & Prayers */}
           <motion.div variants={fadeUp} initial="hidden" animate="show" custom={6}
             style={{ width: '100%', maxWidth: 320, marginBottom: '1.25rem' }}
>
  <button onClick={() => navigate('/teachings')}
    style={{
      width: '100%', background: 'transparent',
      border: '1px solid rgba(200,169,107,0.2)',
      borderRadius: '1rem', padding: '0.9rem',
      color: 'rgba(200,169,107,0.55)',
      fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem',
      cursor: 'pointer', transition: 'all 0.3s', letterSpacing: '0.02em',
    }}
  >
     Prophetic Teachings &amp; Prayers
  </button>
</motion.div>
<motion.p variants={fadeUp} initial="hidden" animate="show" custom={6}
          style={{ color: 'rgba(248,247,244,0.15)', fontSize: '0.72rem', letterSpacing: '0.05em' }}
        >
          Private · Confidential · Spiritually guided
        </motion.p>
      </div>
     

      {/* How it works */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={7}
        style={{ padding: '0 1.5rem 4rem' }}
      >
        <div className="divider">
          <div className="divider-line" />
          <span className="divider-text">How it works</span>
          <div className="divider-line" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', maxWidth: 360, margin: '0 auto' }}>
          {[
            { step: '01', icon: <SeedIcon />, label: 'Sow a seed' },
            { step: '02', icon: <MicIcon />, label: 'Share your dream' },
            { step: '03', icon: <StarIcon />, label: 'Receive interpretation' },
          ].map((item) => (
            <div key={item.step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem' }}>
              <div style={{
                width: 52, height: 52, borderRadius: '1rem',
                border: '1px solid rgba(200,169,107,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(200,169,107,0.04)',
              }}>
                {item.icon}
              </div>
              <span style={{ color: 'rgba(200,169,107,0.3)', fontSize: '0.6rem', letterSpacing: '0.2em' }}>{item.step}</span>
              <span style={{ color: 'rgba(248,247,244,0.4)', fontSize: '0.75rem', lineHeight: 1.4 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}