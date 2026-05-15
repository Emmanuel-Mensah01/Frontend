import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.12 },
  }),
};

const StarIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"
      stroke="#C8A96B" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="#C8A96B" strokeWidth="1.5"/>
    <path d="M12 6v6l4 2" stroke="#C8A96B" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export default function InterpretationPage() {
  const { reference } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/interpretations/check/${reference}`);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'No interpretation found yet.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [reference]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--midnight)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', border: '1.5px solid var(--gold)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div className="page" style={{ background: 'var(--midnight)' }}>
      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}
          style={{ textAlign: 'center', marginBottom: '2rem' }}
        >
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            border: `1px solid ${error ? 'rgba(200,169,107,0.2)' : 'rgba(200,169,107,0.3)'}`,
            background: `${error ? 'rgba(200,169,107,0.04)' : 'rgba(200,169,107,0.08)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}>
            {error ? <ClockIcon /> : <StarIcon />}
          </div>

          <span className="section-label">{error ? 'Pending' : 'Your Interpretation'}</span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 6vw, 2.5rem)', color: 'var(--cream)', marginTop: '0.5rem', lineHeight: 1.2 }}>
            {error ? 'Not Ready Yet' : (
              <>A Word for <span style={{ color: 'var(--gold)', fontStyle: 'italic' }}>{data?.submitterName}</span></>
            )}
          </h1>
        </motion.div>

        {error ? (
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}>
            <div className="card" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <p style={{ color: 'rgba(248,247,244,0.45)', lineHeight: 1.8, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                The Prophet is still reviewing your dream. Please check back within 48 hours.
              </p>
              <div style={{ borderTop: '1px solid rgba(200,169,107,0.1)', paddingTop: '1.25rem' }}>
                <p style={{ color: 'rgba(200,169,107,0.4)', fontSize: '0.85rem', fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif', lineHeight: 1.7 }}>
                  "Wait on the LORD; be of good courage..."
                </p>
                <p style={{ color: 'rgba(200,169,107,0.25)', fontSize: '0.7rem', marginTop: '0.3rem' }}>Psalm 27:14</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              {data?.interpretation?.type === 'text' && (
                <div>
                  <p style={{ color: 'rgba(200,169,107,0.5)', fontSize: '0.7rem', letterSpacing: '0.15em', marginBottom: '1.25rem' }}>
                    PROPHETIC INTERPRETATION
                  </p>
                  <p style={{ color: 'var(--cream)', lineHeight: 1.9, fontFamily: 'Cormorant Garamond, serif', fontSize: '1.15rem' }}>
                    {data.interpretation.textContent}
                  </p>
                </div>
              )}
              {data?.interpretation?.type === 'audio' && (
                <div>
                  <p style={{ color: 'rgba(200,169,107,0.5)', fontSize: '0.7rem', letterSpacing: '0.15em', marginBottom: '1.25rem' }}>
                    AUDIO INTERPRETATION
                  </p>
                  <audio controls src={data.interpretation.audioUrl} style={{ width: '100%', borderRadius: '0.75rem' }} />
                  <p style={{ color: 'rgba(248,247,244,0.25)', fontSize: '0.75rem', marginTop: '0.75rem', textAlign: 'center' }}>
                    Press play to hear the Prophet's interpretation
                  </p>
                </div>
              )}
              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(200,169,107,0.08)' }}>
                <p style={{ color: 'rgba(248,247,244,0.2)', fontSize: '0.7rem', textAlign: 'center' }}>
                  Interpreted on {new Date(data?.interpretation?.respondedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2}>
          <button className="btn-outline" onClick={() => navigate('/')}>
            Return Home
          </button>
        </motion.div>

      </div>
    </div>
  );
}