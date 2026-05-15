import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1 },
  }),
};

const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="#C8A96B" strokeWidth="1.5"/>
    <path d="M10 8l6 4-6 4V8z" fill="#C8A96B"/>
  </svg>
);

const VideoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="6" width="15" height="12" rx="2" stroke="#C8A96B" strokeWidth="1.5"/>
    <path d="M17 9l5-3v12l-5-3V9z" stroke="#C8A96B" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

const AudioIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect x="9" y="2" width="6" height="12" rx="3" stroke="#C8A96B" strokeWidth="1.5"/>
    <path d="M5 10a7 7 0 0 0 14 0M12 19v3M9 22h6" stroke="#C8A96B" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const PrayerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L8 8H3l4 4-1.5 6L12 15l6.5 3L17 12l4-4h-5L12 2z"
      stroke="#C8A96B" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

function MediaCard({ item, index }) {
  const [playing, setPlaying] = useState(false);

  return (
    <motion.div
      variants={fadeUp} initial="hidden" animate="show" custom={index}
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(200,169,107,0.12)',
        borderRadius: '1.25rem',
        overflow: 'hidden',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(200,169,107,0.3)'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(200,169,107,0.12)'}
    >
      {/* Media player */}
      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem' }}>
        {item.mediaType === 'video' ? (
          <video
            controls
            src={item.mediaUrl}
            style={{ width: '100%', borderRadius: '0.75rem', maxHeight: 220, background: '#000' }}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />
        ) : (
          <div style={{ padding: '1rem 0' }}>
            <audio
              controls
              src={item.mediaUrl}
              style={{ width: '100%', borderRadius: '0.75rem' }}
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '1.1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          {item.mediaType === 'video' ? <VideoIcon /> : <AudioIcon />}
          <span style={{ color: 'rgba(200,169,107,0.5)', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            {item.mediaType} {item.type === 'teaching' ? 'Teaching' : 'Prayer'}
          </span>
        </div>
        <h3 style={{
          color: 'var(--cream)', fontFamily: 'Cormorant Garamond, serif',
          fontSize: '1.15rem', lineHeight: 1.3, marginBottom: '0.4rem',
        }}>
          {item.title}
        </h3>
        {item.description && (
          <p style={{ color: 'rgba(248,247,244,0.35)', fontSize: '0.8rem', lineHeight: 1.6 }}>
            {item.description}
          </p>
        )}
        {item.duration && (
          <p style={{ color: 'rgba(200,169,107,0.35)', fontSize: '0.7rem', marginTop: '0.5rem' }}>
            {item.duration}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function TeachingsPage() {
  const navigate = useNavigate();
  const [teachings, setTeachings] = useState([]);
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await api.get('/content');
        const all = res.data.content || [];
        setTeachings(all.filter(c => c.type === 'teaching'));
        setPrayers(all.filter(c => c.type === 'prayer'));
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  return (
    <div className="page" style={{ background: 'var(--midnight)' }}>

      {/* Gold orb */}
      <div style={{
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 300, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(ellipse, rgba(200,169,107,0.06) 0%, transparent 70%)',
      }} />

      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>

        {/* Back */}
        <motion.button
          variants={fadeUp} initial="hidden" animate="show" custom={0}
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', color: 'rgba(200,169,107,0.5)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '1.5rem', padding: 0 }}
        >
          ← Back
        </motion.button>

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}
          style={{ textAlign: 'center', marginBottom: '2.5rem' }}
        >
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            border: '1px solid rgba(200,169,107,0.2)',
            background: 'rgba(200,169,107,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L8 8H2l5 4-2 7 7-4 7 4-2-7 5-4h-6L12 2z"
                stroke="#C8A96B" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="section-label">Free Resources</span>
          <h1 style={{ fontSize: 'clamp(2rem, 7vw, 3rem)', color: 'var(--cream)', marginTop: '0.5rem', lineHeight: 1.2 }}>
            Teachings &amp; <span style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Prayers</span>
          </h1>
          <p style={{ color: 'rgba(248,247,244,0.35)', fontSize: '0.9rem', marginTop: '0.75rem', lineHeight: 1.7, maxWidth: 300, margin: '0.75rem auto 0' }}>
            Prophetic teachings and prayers on dreams by  Prophet Ebenezer Amuah Free for all.
          </p>
        </motion.div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid var(--gold)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          </div>
        ) : (
          <>
            {/* Teachings Section */}
            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2}
              style={{ marginBottom: '2.5rem' }}
            >
              <div className="divider" style={{ marginBottom: '1.5rem' }}>
                <div className="divider-line" />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <VideoIcon />
                  <span className="divider-text">Dream Teachings</span>
                </div>
                <div className="divider-line" />
              </div>

              {teachings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(248,247,244,0.2)', fontSize: '0.85rem' }}>
                  Teachings coming soon
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {teachings.map((item, i) => (
                    <MediaCard key={item._id} item={item} index={i} />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Prayers Section */}
            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3}>
              <div className="divider" style={{ marginBottom: '1.5rem' }}>
                <div className="divider-line" />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <PrayerIcon />
                  <span className="divider-text">Dream Prayers</span>
                </div>
                <div className="divider-line" />
              </div>

              {prayers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(248,247,244,0.2)', fontSize: '0.85rem' }}>
                  Prayers coming soon
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {prayers.map((item, i) => (
                    <MediaCard key={item._id} item={item} index={i} />
                  ))}
                </div>
              )}
            </motion.div>

            {/* CTA */}
            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4}
              style={{ marginTop: '3rem', textAlign: 'center' }}
            >
              <div style={{
                background: 'rgba(200,169,107,0.04)',
                border: '1px solid rgba(200,169,107,0.1)',
                borderRadius: '1.25rem',
                padding: '1.5rem',
                marginBottom: '1.25rem',
              }}>
                <p style={{ color: 'rgba(200,169,107,0.6)', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', fontStyle: 'italic', lineHeight: 1.7 }}>
                  "For God speaks in one way, and in two, though man does not perceive it. In a dream..."
                </p>
                <p style={{ color: 'rgba(200,169,107,0.3)', fontSize: '0.7rem', marginTop: '0.5rem' }}>Job 33:14</p>
              </div>
              <button className="btn-gold" onClick={() => navigate('/offering')}
                style={{ boxShadow: '0 8px 32px rgba(200,169,107,0.12)' }}
              >
                Submit Your Dream
              </button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}