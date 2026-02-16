import { useState } from 'react';
import Icons from './Icons';
import { useToast } from './Toast';
import { LICENSE_TIERS, DISCOUNT_CODES } from '../lib/seeds';
import { formatPrice } from '../lib/utils';
import { isStripeConfigured } from '../lib/env';
import env from '../lib/env';
import { supabase } from '../lib/supabase';
import { createOrder, sendNotification, updateBeat } from '../lib/data';
import { trackLicenseClick, trackCheckoutStart } from '../lib/analytics';
import useFocusTrap from '../hooks/useFocusTrap';
import { cart } from '../lib/cart';

export default function LicensingModal({ beat, onClose }) {
  const trapRef = useFocusTrap(true);
  const [selectedTier, setSelectedTier] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [showTerms, setShowTerms] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const { success: toastSuccess, error: toastError } = useToast();

  if (!beat) return null;

  const getPrice = (tier) => {
    const key = tier.priceKey;
    return beat[key] || tier.defaultPrice;
  };

  const getFinalPrice = () => {
    const base = getPrice(selectedTier);
    if (!appliedDiscount) return base;
    if (appliedDiscount.type === 'percent') return base * (1 - appliedDiscount.value / 100);
    if (appliedDiscount.type === 'fixed') return Math.max(0, base - appliedDiscount.value);
    return base;
  };

  const handleSelect = (tier) => {
    setSelectedTier(tier);
    setShowEmailInput(true);
    trackLicenseClick(beat.id, beat.title);
  };

  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleCheckout = async () => {
    if (!email || !isValidEmail(email) || !agreedToTerms) return;
    setCheckoutLoading(true);
    setCheckoutError('');
    const price = getFinalPrice();
    trackCheckoutStart(beat.id, selectedTier.id, price);

    try {
      if (selectedTier.free) {
        const order = await createOrder({
          beat_id: beat.id,
          customer_email: email,
          customer_name: '',
          license_tier: 'free',
          amount: 0,
          currency: 'usd',
        });
        toastSuccess('Check your download!');
        window.location.href = `/download/${order.download_token}`;
        return;
      }

      if (isStripeConfigured) {
        // Call Supabase edge function to create a Stripe Checkout session
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: {
            beat_id: beat.id,
            beat_title: beat.title,
            license_tier: selectedTier.id,
            amount: price,
            customer_email: email,
            success_url: `${env.SITE_URL}/download/{CHECKOUT_TOKEN}`,
            cancel_url: `${env.SITE_URL}/beats/${beat.slug}`,
          },
        });
        if (error) throw new Error(error.message || 'Checkout failed');
        if (data?.url) {
          window.location.href = data.url;
          return;
        }
        throw new Error('No checkout URL returned');
      } else {
        // Demo mode — create a real order with download token
        const order = await createOrder({
          beat_id: beat.id,
          customer_email: email,
          customer_name: '',
          license_tier: selectedTier.id,
          amount: price,
          currency: 'usd',
        });
        sendNotification({
          type: 'order_notification',
          customer_email: email,
          beat_title: beat.title,
          license_tier: selectedTier.id,
          amount: price,
        });
        if (selectedTier.id === 'exclusive') {
          updateBeat(beat.id, { published: false });
        }
        // Navigate to download page
        window.location.href = `/download/${order.download_token}`;
        return;
      }
    } catch (err) {
      setCheckoutError(err.message || 'Checkout failed. Please try again.');
      setCheckoutLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, animation: 'fadeIn 0.3s ease-out',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`License ${beat.title}`}
    >
      <div
        ref={trapRef}
        style={{
          background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', padding: 40,
          maxWidth: 900, width: '100%', maxHeight: '90vh', overflow: 'auto',
          border: '1px solid var(--border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700 }}>License &ldquo;{beat.title}&rdquo;</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
              Choose a license that fits your project
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            aria-label="Close"
          >
            <Icons.Close />
          </button>
        </div>

        {!showEmailInput ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16 }}>
            {LICENSE_TIERS.map((tier) => (
              <div key={tier.id} style={{
                background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', padding: 24,
                border: tier.popular ? `1px solid ${tier.accent}55` : '1px solid var(--border)',
                position: 'relative', transition: 'transform 0.2s, border-color 0.2s',
              }}>
                {tier.popular && (
                  <div style={{
                    position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                    background: tier.accent, padding: '3px 14px', borderRadius: 20,
                    fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                  }}>
                    Popular
                  </div>
                )}
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: tier.accent }}>{tier.name}</div>
                <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>{formatPrice(getPrice(tier))}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  {tier.features.map((f, i) => (
                    <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{ color: tier.accent, fontWeight: 700 }}>✓</span> {f}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleSelect(tier)}
                  style={{
                    width: '100%', padding: '10px 0', borderRadius: 50,
                    background: tier.popular ? tier.accent : 'transparent',
                    border: tier.popular ? 'none' : `1px solid ${tier.accent}44`,
                    color: tier.popular ? '#fff' : tier.accent,
                    fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)',
                    transition: 'all 0.2s',
                  }}
                >
                  Select
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ maxWidth: 440, margin: '0 auto', textAlign: 'center' }}>
            <div style={{
              background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)',
              padding: 24, marginBottom: 24, border: `1px solid ${selectedTier.accent}33`,
            }}>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>{selectedTier.name}</div>
              <div style={{ fontSize: 32, fontWeight: 800 }}>
                {appliedDiscount ? (
                  <>
                    <span style={{ textDecoration: 'line-through', opacity: 0.4, fontSize: 22 }}>{formatPrice(getPrice(selectedTier))}</span>{' '}
                    {formatPrice(getFinalPrice())}
                  </>
                ) : formatPrice(getPrice(selectedTier))}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>for &ldquo;{beat.title}&rdquo;</div>
            </div>

            <div style={{ textAlign: 'left', marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Your email (for download link)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: '100%', padding: '14px 18px', background: 'var(--bg-primary)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)', fontSize: 14, fontFamily: 'var(--font)', outline: 'none',
                }}
              />
            </div>

            <div style={{ textAlign: 'left', marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Discount Code (optional)
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  style={{
                    flex: 1, padding: '10px 14px', background: 'var(--bg-primary)',
                    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font)', outline: 'none',
                  }}
                />
                <button
                  onClick={() => {
                    const code = DISCOUNT_CODES[discountCode];
                    if (code) { setAppliedDiscount(code); toastSuccess(`Applied: ${code.description}`); }
                    else { setAppliedDiscount(null); toastError('Invalid code'); }
                  }}
                  style={{
                    padding: '10px 16px', borderRadius: 'var(--radius-sm)', fontSize: 12,
                    background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                    color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font)',
                  }}
                >
                  Apply
                </button>
              </div>
              {appliedDiscount && (
                <div style={{ fontSize: 12, color: 'var(--accent-green)', marginTop: 6 }}>
                  {appliedDiscount.description} applied!
                </div>
              )}
            </div>

            <div style={{ textAlign: 'left', marginBottom: 16 }}>
              <button
                onClick={() => setShowTerms(!showTerms)}
                style={{
                  background: 'none', border: 'none', color: 'var(--accent)',
                  fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)',
                  padding: 0, textDecoration: 'underline',
                }}
              >
                {showTerms ? 'Hide License Terms' : 'View License Terms'}
              </button>
              {showTerms && (
                <div style={{
                  marginTop: 12, padding: 16, background: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                  fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7, textAlign: 'left',
                }}>
                  <strong>Basic Lease:</strong> Non-exclusive license. MP3 file only. For hobby/streaming use (e.g. SoundCloud, Spotify, YouTube).<br /><br />
                  <strong>Premium Lease:</strong> Non-exclusive license. MP3 + WAV files. Suitable for DSP distribution, radio play, and music videos.<br /><br />
                  <strong>Unlimited Lease:</strong> Non-exclusive license. MP3 + WAV + Stems. Unlimited distribution across all platforms.<br /><br />
                  <strong>Exclusive License:</strong> Full ownership transfer. The beat is permanently removed from the store after purchase.
                </div>
              )}
            </div>

            <div style={{ textAlign: 'left', marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  style={{ accentColor: selectedTier.accent, width: 16, height: 16, cursor: 'pointer' }}
                />
                I agree to the license terms
              </label>
            </div>

            {checkoutError && (
              <div style={{ background: '#D6303118', border: '1px solid #D63031', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#D63031', textAlign: 'left' }}>
                {checkoutError}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => { setShowEmailInput(false); setCheckoutError(''); }}
                style={{
                  flex: 1, padding: '14px 0', borderRadius: 50, background: 'transparent',
                  border: '1px solid var(--border)', color: 'var(--text-secondary)',
                  fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font)',
                }}
              >
                Back
              </button>
              <button
                onClick={() => {
                  cart.addItem({
                    beatId: beat.id,
                    beatTitle: beat.title,
                    beatSlug: beat.slug,
                    tier: selectedTier.id,
                    tierName: selectedTier.name,
                    price: getFinalPrice(),
                    coverEmoji: beat.cover_emoji,
                    coverColor: beat.cover_color,
                  });
                  toastSuccess(`Added "${beat.title}" to cart`);
                  onClose();
                }}
                style={{
                  flex: 1, padding: '14px 0', borderRadius: 50, background: 'transparent',
                  border: '1px solid var(--accent)44', color: 'var(--accent)',
                  fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font)',
                }}
              >
                Add to Cart
              </button>
              <button
                onClick={handleCheckout}
                disabled={!email || !isValidEmail(email) || !agreedToTerms || checkoutLoading}
                style={{
                  flex: 2, padding: '14px 0', borderRadius: 50,
                  background: email && isValidEmail(email) && agreedToTerms ? selectedTier.accent : 'var(--bg-tertiary)',
                  border: 'none',
                  color: email && isValidEmail(email) && agreedToTerms ? '#fff' : 'var(--text-muted)',
                  fontSize: 14, fontWeight: 600,
                  cursor: email && isValidEmail(email) && agreedToTerms ? 'pointer' : 'not-allowed',
                  fontFamily: 'var(--font)',
                }}
              >
                {checkoutLoading ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
