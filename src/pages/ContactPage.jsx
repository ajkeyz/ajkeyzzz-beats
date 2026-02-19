import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Footer from '../components/Footer';
import Icons from '../components/Icons';
import { createMessage } from '../lib/data';
import { contactSchema } from '../lib/schema';
import { trackContactSubmit } from '../lib/analytics';
import { canSubmit } from '../lib/utils';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach(i => { fieldErrors[i.path[0]] = i.message; });
      setErrors(fieldErrors);
      return;
    }
    if (!canSubmit('contact', 15_000)) {
      setErrors({ _form: 'Please wait a moment before sending another message.' });
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await createMessage(result.data);
      trackContactSubmit();
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSent(false), 5000);
    } catch {
      setErrors({ _form: 'Failed to send. Please try again.' });
    }
    setSubmitting(false);
  };

  const inputStyle = {
    width: '100%', padding: '14px 18px', background: 'var(--bg-tertiary)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)', fontSize: 14, fontFamily: 'var(--font)',
    outline: 'none', transition: 'border-color 0.2s',
  };

  const labelStyle = { fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 500 };

  return (
    <>
      <Helmet>
        <title>Contact — AJKEYZZZ</title>
        <meta name="description" content="Get in touch with AJKEYZZZ for beat licensing, custom production, or collaborations." />
      </Helmet>

      <div style={{ paddingTop: 100, maxWidth: 700, margin: '0 auto', padding: '100px 24px 80px' }}>
        <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 8 }}>Get In Touch</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 48, lineHeight: 1.7 }}>
          Have a question, want to collaborate, or need a custom beat? Drop a message.
        </p>

        {sent && (
          <div style={{
            background: 'var(--accent-green)22', border: '1px solid var(--accent-green)',
            borderRadius: 'var(--radius-sm)', padding: '14px 20px', marginBottom: 24,
            color: 'var(--accent-green)', fontSize: 14, fontWeight: 500,
          }}>
            ✓ Message sent! I&apos;ll get back to you soon.
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
                placeholder="Your name *"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                style={{ ...inputStyle, borderColor: errors.name ? '#D63031' : 'var(--border)' }}
              />
              {errors.name && <span style={{ fontSize: 11, color: '#D63031' }}>{errors.name}</span>}
            </div>
            <div>
              <label style={labelStyle}>Email *</label>
              <input
                placeholder="Your email *"
                type="email"
                value={form.email}
                onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                style={{ ...inputStyle, borderColor: errors.email ? '#D63031' : 'var(--border)' }}
              />
              {errors.email && <span style={{ fontSize: 11, color: '#D63031' }}>{errors.email}</span>}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Subject</label>
            <input
              placeholder="Subject (optional)"
              value={form.subject}
              onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Message *</label>
            <textarea
              placeholder="Your message... *"
              value={form.message}
              onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
              rows={6}
              style={{ ...inputStyle, resize: 'vertical', borderColor: errors.message ? '#D63031' : 'var(--border)' }}
            />
            {errors.message && <span style={{ fontSize: 11, color: '#D63031' }}>{errors.message}</span>}
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: '16px 40px', borderRadius: 50,
              background: 'var(--accent)', border: 'none', color: '#fff',
              fontSize: 15, fontWeight: 600,
              cursor: submitting ? 'wait' : 'pointer',
              fontFamily: 'var(--font)', transition: 'all 0.2s', alignSelf: 'flex-start',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'Sending...' : 'Send Message'}
          </button>
        </div>

        <div style={{ marginTop: 60, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {[
            { icon: <Icons.Instagram />, label: '@ajkeyzzz', href: 'https://www.instagram.com/ajkeyzzz' },
            { icon: <Icons.YouTube />, label: 'YouTube', href: 'https://youtube.com/@ajkeyzzz1927' },
            { icon: <Icons.Twitter />, label: '@ajkeyzzz', href: 'https://x.com/ajkeyzzz' },
          ].map((s) => (
            <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px',
              background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14, transition: 'all 0.2s',
            }}>
              {s.icon} {s.label}
            </a>
          ))}
        </div>

        <div style={{ height: 60 }} />
        <Footer />
      </div>
    </>
  );
}
