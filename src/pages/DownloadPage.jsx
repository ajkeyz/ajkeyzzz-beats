import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Icons from '../components/Icons';
import Footer from '../components/Footer';
import { useToast } from '../components/Toast';
import { fetchOrderByToken } from '../lib/data';
import { getSignedUrl } from '../lib/supabase';
import { formatDate, formatPrice } from '../lib/utils';

export default function DownloadPage() {
  const { token } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const { error: toastError } = useToast();

  useEffect(() => {
    if (!token) {
      setError('No download token provided.');
      setLoading(false);
      return;
    }

    fetchOrderByToken(token)
      .then((data) => {
        if (!data) {
          setError('Invalid or expired download link.');
        } else if (data.download_expires_at && new Date(data.download_expires_at) < new Date()) {
          setError('This download link has expired. Please contact support for a new link.');
        } else {
          setOrder(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Something went wrong. Please try again.');
        setLoading(false);
      });
  }, [token]);

  const handleDownload = async (fileType) => {
    if (!order) return;
    setDownloading(true);

    try {
      let bucket, path;

      if (fileType === 'stems' && order.beats?.stems_url) {
        bucket = 'stems';
        path = order.beats.stems_url;
      } else if (order.beats?.full_audio_url) {
        bucket = 'downloads';
        path = order.beats.full_audio_url;
      } else {
        throw new Error('File not available');
      }

      const url = await getSignedUrl(bucket, path, 600);
      if (!url) throw new Error('Could not generate download URL');

      // Trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = '';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      toastError('Download failed: ' + (err.message || 'Unknown error'));
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ paddingTop: 100, maxWidth: 600, margin: '0 auto', padding: '100px 24px 80px', textAlign: 'center' }}>
        <div className="skeleton" style={{ height: 40, width: '60%', margin: '0 auto 16px' }} />
        <div className="skeleton" style={{ height: 200, margin: '0 auto' }} />
      </div>
    );
  }

  if (error) {
    return (
      <>
        <Helmet><title>Download — AJKEYZZZ Beats</title></Helmet>
        <div style={{ paddingTop: 100, textAlign: 'center', padding: '200px 24px' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🔒</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Download Unavailable</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
            {error}
          </p>
          <Link to="/beats" style={{
            padding: '12px 28px', borderRadius: 50, background: 'var(--accent)',
            color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600,
          }}>
            Browse Beats
          </Link>
        </div>
      </>
    );
  }

  const beat = order.beats || {};
  const color = beat.cover_color || '#E84393';
  const tierLabels = { basic: 'Basic Lease', premium: 'Premium Lease', unlimited: 'Unlimited Lease', exclusive: 'Exclusive' };
  const tierLabel = tierLabels[order.license_tier] || order.license_tier;
  const hasStems = (order.license_tier === 'unlimited' || order.license_tier === 'exclusive') && beat.stems_url;
  const expiresAt = order.download_expires_at ? new Date(order.download_expires_at) : null;

  return (
    <>
      <Helmet>
        <title>Download {beat.title || 'Beat'} — AJKEYZZZ Beats</title>
      </Helmet>

      <div style={{ paddingTop: 80, maxWidth: 600, margin: '0 auto', padding: '80px 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>
            {beat.cover_emoji || '🎵'}
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Your Download</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Thank you for your purchase!
          </p>
        </div>

        {/* Order details */}
        <div style={{
          background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: 32,
          border: '1px solid var(--border)', marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 'var(--radius-sm)', flexShrink: 0,
              background: `linear-gradient(135deg, ${color}33, ${color}11)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
            }}>
              {beat.cover_emoji || '🎵'}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{beat.title || 'Beat'}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{tierLabel}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24, fontSize: 13 }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Order Date</span>
              <div style={{ fontWeight: 600 }}>{formatDate(order.created_at)}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>License</span>
              <div style={{ fontWeight: 600 }}>{tierLabel}</div>
            </div>
            {expiresAt && (
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ color: 'var(--text-muted)' }}>Link Expires</span>
                <div style={{ fontWeight: 600 }}>{formatDate(expiresAt.toISOString())}</div>
              </div>
            )}
          </div>

          {/* Download buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              onClick={() => handleDownload('full')}
              disabled={downloading}
              style={{
                padding: '14px 24px', borderRadius: 'var(--radius-sm)',
                background: color, border: 'none', color: '#fff',
                fontSize: 14, fontWeight: 600, cursor: downloading ? 'wait' : 'pointer',
                fontFamily: 'var(--font)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8, opacity: downloading ? 0.7 : 1,
              }}
            >
              <Icons.Download />
              {downloading ? 'Preparing...' : 'Download Full Quality'}
            </button>

            {hasStems && (
              <button
                onClick={() => handleDownload('stems')}
                disabled={downloading}
                style={{
                  padding: '14px 24px', borderRadius: 'var(--radius-sm)',
                  background: 'transparent', border: `1px solid ${color}44`,
                  color: color, fontSize: 14, fontWeight: 600,
                  cursor: downloading ? 'wait' : 'pointer', fontFamily: 'var(--font)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  opacity: downloading ? 0.7 : 1,
                }}
              >
                <Icons.Download />
                {downloading ? 'Preparing...' : 'Download Stems'}
              </button>
            )}
          </div>
        </div>

        {/* Receipt */}
        <div style={{
          background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: 32,
          border: '1px solid var(--border)', marginBottom: 24,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Receipt</h3>
            <button onClick={() => window.print()} style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12,
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font)',
            }}>
              Print Receipt
            </button>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--text-muted)' }}>Item</span>
              <span style={{ fontWeight: 600 }}>{beat.title} ({tierLabel})</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--text-muted)' }}>Amount</span>
              <span style={{ fontWeight: 600 }}>{formatPrice(order.amount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--text-muted)' }}>Date</span>
              <span>{formatDate(order.created_at)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Order ID</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{order.id?.slice(0, 8)}</span>
            </div>
          </div>
        </div>

        <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
          Download links expire 72 hours after purchase.
          If you have any issues, contact us at{' '}
          <Link to="/contact" style={{ color: 'var(--accent)', textDecoration: 'none' }}>our contact page</Link>.
        </p>

        <Footer />
      </div>
    </>
  );
}
