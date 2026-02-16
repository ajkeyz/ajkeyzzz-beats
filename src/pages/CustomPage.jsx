import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Footer from '../components/Footer';
import Icons from '../components/Icons';
import { createInquiry } from '../lib/data';
import { inquirySchema } from '../lib/schema';
import { trackInquirySubmit } from '../lib/analytics';
import { canSubmit } from '../lib/utils';

export default function CustomPage() {
  const [form, setForm] = useState({
    name: '', email: '', inquiry_type: 'custom_beat',
    budget: '', timeline: '', reference_links: '',
    vocals_needed: false, platform: '', message: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    const result = inquirySchema.safeParse(form);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach(i => { fieldErrors[i.path[0]] = i.message; });
      setErrors(fieldErrors);
      return;
    }
    if (!canSubmit('inquiry', 15_000)) {
      setErrors({ _form: 'Please wait a moment before submitting again.' });
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await createInquiry(result.data);
      trackInquirySubmit(result.data.inquiry_type);
      setSubmitted(true);
      setForm({ name: '', email: '', inquiry_type: 'custom_beat', budget: '', timeline: '', reference_links: '', vocals_needed: false, platform: '', message: '' });
    } catch (err) {
      setErrors({ _form: 'Failed to submit. Please try again.' });
    }
    setSubmitting(false);
  };

  const inputStyle = {
    width: '100%', padding: '14px 18px', background: 'var(--bg-tertiary)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)', fontSize: 14, fontFamily: 'var(--font)', outline: 'none',
  };

  const labelStyle = { fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 500 };

  const services = [
    { emoji: '🎵', title: 'Custom Beats', desc: 'Made-to-order production matching your style and references' },
    { emoji: '🎬', title: 'Film & Media', desc: 'Scoring for films, commercials, and video content' },
    { emoji: '🎤', title: 'Artist Development', desc: 'Ongoing production partnerships for projects and albums' },
    { emoji: '🎛️', title: 'Sound Design', desc: 'Unique textures, sound kits, and sonic landscapes' },
  ];

  return (
    <>
      <Helmet>
        <title>Custom Production — AJKEYZZZ</title>
        <meta name="description" content="Need a custom beat? Submit your project details for a tailored production quote from AJKEYZZZ." />
      </Helmet>

      <div style={{ paddingTop: 100, maxWidth: 800, margin: '0 auto', padding: '100px 24px 80px' }}>
        <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 8 }}>Custom / Exclusive Production</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 48, lineHeight: 1.7 }}>
          Need something made from scratch? I create custom beats tailored to your vision, sound, and project requirements.
        </p>

        {/* Services */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 48 }}>
          {services.map((item) => (
            <div key={item.title} style={{
              background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: 28,
              border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>{item.emoji}</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{item.title}</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>

        {/* Inquiry form */}
        <div style={{
          background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: 40,
          border: '1px solid var(--border)',
        }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Submit Your Project</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>
            Fill in the details below and I&apos;ll get back to you within 24-48 hours.
          </p>

          {submitted && (
            <div style={{
              background: 'var(--accent-green)22', border: '1px solid var(--accent-green)',
              borderRadius: 'var(--radius-sm)', padding: '14px 20px', marginBottom: 24,
              color: 'var(--accent-green)', fontSize: 14, fontWeight: 500,
            }}>
              ✓ Inquiry submitted! I&apos;ll be in touch soon.
            </div>
          )}

          {errors._form && (
            <div style={{
              background: '#D6303122', border: '1px solid #D63031',
              borderRadius: 'var(--radius-sm)', padding: '14px 20px', marginBottom: 24,
              color: '#D63031', fontSize: 14,
            }}>
              {errors._form}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              <div>
                <label style={labelStyle}>Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ ...inputStyle, borderColor: errors.name ? '#D63031' : 'var(--border)' }}
                  placeholder="Your name"
                />
                {errors.name && <span style={{ fontSize: 11, color: '#D63031' }}>{errors.name}</span>}
              </div>
              <div>
                <label style={labelStyle}>Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={{ ...inputStyle, borderColor: errors.email ? '#D63031' : 'var(--border)' }}
                  placeholder="you@example.com"
                />
                {errors.email && <span style={{ fontSize: 11, color: '#D63031' }}>{errors.email}</span>}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Type of Project</label>
              <select
                value={form.inquiry_type}
                onChange={(e) => setForm({ ...form, inquiry_type: e.target.value })}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="custom_beat">Custom Beat</option>
                <option value="film_media">Film & Media Scoring</option>
                <option value="artist_development">Artist Development</option>
                <option value="sound_design">Sound Design</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              <div>
                <label style={labelStyle}>Budget Range</label>
                <select
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="">Select budget range</option>
                  <option value="under-500">Under $500</option>
                  <option value="500-1000">$500 – $1,000</option>
                  <option value="1000-2500">$1,000 – $2,500</option>
                  <option value="2500-5000">$2,500 – $5,000</option>
                  <option value="5000+">$5,000+</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Timeline</label>
                <select
                  value={form.timeline}
                  onChange={(e) => setForm({ ...form, timeline: e.target.value })}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="">Select timeline</option>
                  <option value="asap">ASAP (1-3 days)</option>
                  <option value="1-week">Within 1 week</option>
                  <option value="2-weeks">Within 2 weeks</option>
                  <option value="1-month">Within 1 month</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Reference Links (songs, beats, artists)</label>
              <input
                value={form.reference_links}
                onChange={(e) => setForm({ ...form, reference_links: e.target.value })}
                style={inputStyle}
                placeholder="Paste YouTube, Spotify, or SoundCloud links"
              />
            </div>

            <div>
              <label style={labelStyle}>Platform / Intended Use</label>
              <input
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
                style={inputStyle}
                placeholder="e.g., Spotify release, YouTube video, film project"
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={form.vocals_needed}
                onChange={(e) => setForm({ ...form, vocals_needed: e.target.checked })}
              />
              I need vocal production / toplining
            </label>

            <div>
              <label style={labelStyle}>Project Details *</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={5}
                style={{ ...inputStyle, resize: 'vertical', borderColor: errors.message ? '#D63031' : 'var(--border)' }}
                placeholder="Describe your vision, vibe, mood, and any specific requirements..."
              />
              {errors.message && <span style={{ fontSize: 11, color: '#D63031' }}>{errors.message}</span>}
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                padding: '16px 40px', borderRadius: 50,
                background: 'var(--accent)', border: 'none', color: '#fff',
                fontSize: 15, fontWeight: 600, cursor: submitting ? 'wait' : 'pointer',
                fontFamily: 'var(--font)', transition: 'all 0.2s', alignSelf: 'flex-start',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Inquiry'}
            </button>
          </div>
        </div>

        {/* Direct contact */}
        <div style={{
          marginTop: 40, textAlign: 'center', padding: 32,
          background: 'linear-gradient(135deg, rgba(232,67,147,0.08), rgba(108,92,231,0.08))',
          borderRadius: 'var(--radius)', border: '1px solid var(--border)',
        }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: 15 }}>
            Prefer to reach out directly?
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://www.instagram.com/ajkeyzzz" target="_blank" rel="noopener noreferrer" style={{
              padding: '12px 28px', borderRadius: 50, background: 'var(--accent)', border: 'none',
              color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Icons.Instagram /> Instagram
            </a>
            <a href="mailto:ajkeyzzz@gmail.com" style={{
              padding: '12px 28px', borderRadius: 50, background: 'transparent',
              border: '1px solid var(--border-hover)', color: 'var(--text-primary)',
              fontSize: 14, fontWeight: 600, textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Icons.Mail /> Email
            </a>
          </div>
        </div>

        <div style={{ height: 60 }} />
        <Footer />
      </div>
    </>
  );
}
