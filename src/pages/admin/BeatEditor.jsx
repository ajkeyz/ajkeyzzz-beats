import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Icons from '../../components/Icons';
import { useToast } from '../../components/Toast';
import { fetchBeats, createBeat, updateBeat, fetchCollections } from '../../lib/data';
import { uploadFile, getPublicUrl } from '../../lib/supabase';
import { isSupabaseConfigured } from '../../lib/env';
import { beatSchema } from '../../lib/schema';
import { slugify, sanitizeFilename, getAudioDuration } from '../../lib/utils';
import { GENRE_OPTIONS, MUSICAL_KEYS, EMOJI_OPTIONS, MOOD_OPTIONS } from '../../lib/seeds';

export default function BeatEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { error: toastError, warning: toastWarning } = useToast();
  const isNew = !id;

  const [form, setForm] = useState({
    title: '', genre: 'Alté', bpm: 120, musical_key: '', typebeat: '',
    tags: '', moods: [], description: '', cover_color: '#FFD800', cover_emoji: '🎵',
    price_basic: 29.99, price_premium: 99.99, price_unlimited: 149.99, price_exclusive: 299.99,
    featured: false, published: true, playlist: 'alte',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  // File states
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [previewFile, setPreviewFile] = useState(null);
  const [previewFileName, setPreviewFileName] = useState('');
  const [fullFile, setFullFile] = useState(null);
  const [fullFileName, setFullFileName] = useState('');
  const [stemsFile, setStemsFile] = useState(null);
  const [stemsFileName, setStemsFileName] = useState('');
  const [audioDuration, setAudioDuration] = useState(0);

  // Existing URLs (for edit mode)
  const [existingCover, setExistingCover] = useState('');
  const [existingPreview, setExistingPreview] = useState('');
  const [existingFull, setExistingFull] = useState('');
  const [existingStems, setExistingStems] = useState('');

  const coverInputRef = useRef();
  const previewInputRef = useRef();
  const fullInputRef = useRef();
  const stemsInputRef = useRef();
  const typebeatRef = useRef(null);
  const previewPlayerRef = useRef(null);
  const [previewPlaying, setPreviewPlaying] = useState(false);

  const togglePreviewPlayback = useCallback(() => {
    const src = previewFile ? URL.createObjectURL(previewFile) : existingPreview;
    if (!src) return;
    if (previewPlaying && previewPlayerRef.current) {
      previewPlayerRef.current.pause();
      setPreviewPlaying(false);
      return;
    }
    if (!previewPlayerRef.current || previewPlayerRef.current.src !== src) {
      previewPlayerRef.current = new Audio(src);
      previewPlayerRef.current.onended = () => setPreviewPlaying(false);
    }
    previewPlayerRef.current.play().catch(() => {});
    setPreviewPlaying(true);
  }, [previewFile, existingPreview, previewPlaying]);

  // Dynamic collections + typebeat suggestions
  const [collections, setCollections] = useState([]);
  const [typebeatSuggestions, setTypebeatSuggestions] = useState([]);
  const [showTypebeatDropdown, setShowTypebeatDropdown] = useState(false);

  useEffect(() => {
    fetchCollections().then(setCollections);
    fetchBeats({ published: false }).then(beats => {
      const values = beats.map(b => (b.typebeat || '').trim()).filter(Boolean);
      setTypebeatSuggestions([...new Set(values)].sort());
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (typebeatRef.current && !typebeatRef.current.contains(e.target)) setShowTypebeatDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isNew) {
      fetchBeats({ published: false }).then(beats => {
        const beat = beats.find(b => b.id === id);
        if (!beat) { navigate('/admin/beats'); return; }
        setForm({
          title: beat.title || '',
          genre: beat.genre || 'Alté',
          bpm: beat.bpm || 120,
          musical_key: beat.musical_key || '',
          typebeat: beat.typebeat || '',
          tags: (beat.tags || []).join(', '),
          moods: beat.moods || [],
          description: beat.description || '',
          cover_color: beat.cover_color || '#FFD800',
          cover_emoji: beat.cover_emoji || '🎵',
          price_basic: beat.price_basic ?? 29.99,
          price_premium: beat.price_premium ?? 99.99,
          price_unlimited: beat.price_unlimited ?? 149.99,
          price_exclusive: beat.price_exclusive ?? 299.99,
          featured: beat.featured || false,
          published: beat.published !== false,
          playlist: beat.playlist || '',
        });
        setExistingCover(beat.cover_art_url || '');
        setExistingPreview(beat.preview_url || '');
        setExistingFull(beat.full_audio_url || '');
        setExistingStems(beat.stems_url || '');
        setAudioDuration(beat.duration || 0);
        setLoading(false);
      });
    }
  }, [id, isNew, navigate]);

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toastWarning('Please select an image file (JPG, PNG, WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toastWarning('Cover image must be under 5MB');
      return;
    }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleAudioChange = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav', 'audio/wave'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav)$/i)) {
      toastWarning('Please select an MP3 or WAV file');
      return;
    }
    const maxSize = type === 'preview' ? 20 : 100; // MB
    if (file.size > maxSize * 1024 * 1024) {
      toastWarning(`File must be under ${maxSize}MB`);
      return;
    }

    if (type === 'preview') {
      setPreviewFile(file);
      setPreviewFileName(file.name);
      // Auto-extract duration
      const dur = await getAudioDuration(file);
      if (dur) setAudioDuration(dur);
    } else if (type === 'full') {
      setFullFile(file);
      setFullFileName(file.name);
      // If no preview yet, use full file duration
      if (!audioDuration) {
        const dur = await getAudioDuration(file);
        if (dur) setAudioDuration(dur);
      }
    }
  };

  const handleStemsChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024 * 1024) {
      toastWarning('Stems file must be under 500MB');
      return;
    }
    setStemsFile(file);
    setStemsFileName(file.name);
  };

  const handleSave = async () => {
    // Validate
    const parsed = beatSchema.safeParse({
      ...form,
      bpm: Number(form.bpm),
      price_basic: Number(form.price_basic),
      price_premium: Number(form.price_premium),
      price_unlimited: Number(form.price_unlimited),
      price_exclusive: Number(form.price_exclusive),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    });

    if (!parsed.success) {
      const fieldErrors = {};
      parsed.error.issues.forEach(i => { fieldErrors[i.path[0]] = i.message; });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSaving(true);

    try {
      const slug = slugify(form.title);
      let cover_art_url = existingCover;
      let preview_url = existingPreview;
      let full_audio_url = existingFull;
      let stems_url = existingStems;

      // Helper: read a file as a data URL (fallback when Supabase storage is unavailable)
      const toDataUrl = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Upload files to Supabase Storage, falling back to data URLs if RLS blocks the upload
      if (isSupabaseConfigured) {
        if (coverFile) {
          const path = `covers/${slug}-${Date.now()}.${coverFile.name.split('.').pop()}`;
          const { error } = await uploadFile('covers', path, coverFile);
          if (error) {
            cover_art_url = await toDataUrl(coverFile);
          } else {
            cover_art_url = getPublicUrl('covers', path);
          }
        }
        if (previewFile) {
          const path = `previews/${slug}-${Date.now()}.${previewFile.name.split('.').pop()}`;
          const { error } = await uploadFile('previews', path, previewFile);
          if (error) {
            preview_url = URL.createObjectURL(previewFile);
          } else {
            preview_url = getPublicUrl('previews', path);
          }
        }
        if (fullFile) {
          const path = `downloads/${slug}-full-${Date.now()}.${fullFile.name.split('.').pop()}`;
          const { error } = await uploadFile('downloads', path, fullFile);
          if (error) {
            full_audio_url = URL.createObjectURL(fullFile);
          } else {
            full_audio_url = path;
          }
        }
        if (stemsFile) {
          const path = `stems/${slug}-stems-${Date.now()}.${stemsFile.name.split('.').pop()}`;
          const { error } = await uploadFile('stems', path, stemsFile);
          if (error) {
            stems_url = URL.createObjectURL(stemsFile);
          } else {
            stems_url = path;
          }
        }
      } else {
        // Demo mode — create local URLs for preview playback
        if (coverFile) {
          cover_art_url = await toDataUrl(coverFile);
        }
        if (previewFile) {
          preview_url = URL.createObjectURL(previewFile);
        }
      }

      const beatData = {
        title: form.title,
        slug,
        genre: form.genre,
        bpm: Number(form.bpm),
        musical_key: form.musical_key,
        typebeat: form.typebeat,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        moods: form.moods,
        description: form.description,
        cover_color: form.cover_color,
        cover_emoji: form.cover_emoji,
        cover_art_url,
        preview_url,
        full_audio_url,
        stems_url,
        duration: audioDuration || 180,
        price_basic: Number(form.price_basic),
        price_premium: Number(form.price_premium),
        price_unlimited: Number(form.price_unlimited),
        price_exclusive: Number(form.price_exclusive),
        featured: form.featured,
        published: form.published,
        playlist: form.playlist,
      };

      if (isNew) {
        await createBeat(beatData);
      } else {
        await updateBeat(id, beatData);
      }

      navigate('/admin/beats');
    } catch (err) {
      setErrors({ _form: err.message || 'Failed to save beat' });
    }
    setSaving(false);
  };

  if (loading) {
    return <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px', background: 'var(--bg-primary)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius-xs)',
    color: 'var(--text-primary)', fontSize: 14, fontFamily: 'var(--font)', outline: 'none',
  };
  const labelStyle = { fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 500 };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <button
          onClick={() => navigate('/admin/beats')}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 24 }}
        >
          ←
        </button>
        <h3 style={{ fontSize: 22, fontWeight: 700 }}>
          {isNew ? 'Add New Beat' : `Edit: ${form.title}`}
        </h3>
      </div>

      {errors._form && (
        <div style={{
          background: '#D6303122', border: '1px solid #D63031',
          borderRadius: 'var(--radius-sm)', padding: '14px 20px', marginBottom: 24,
          color: '#D63031', fontSize: 14,
        }}>
          {errors._form}
        </div>
      )}

      <div style={{
        background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: 32,
        border: '1px solid var(--border)',
      }}>
        {/* Basic info */}
        <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1 }}>
          Basic Info
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={{ ...inputStyle, borderColor: errors.title ? '#D63031' : 'var(--border)' }}
              placeholder="Beat title"
            />
            {errors.title && <span style={{ fontSize: 11, color: '#D63031' }}>{errors.title}</span>}
          </div>
          <div style={{ position: 'relative' }} ref={typebeatRef}>
            <label style={labelStyle}>Type Beat</label>
            <input
              value={form.typebeat}
              onChange={(e) => { setForm({ ...form, typebeat: e.target.value }); setShowTypebeatDropdown(true); }}
              onFocus={() => setShowTypebeatDropdown(true)}
              style={inputStyle}
              placeholder="e.g. wizkid type beat"
              autoComplete="off"
            />
            {showTypebeatDropdown && form.typebeat && (() => {
              const filtered = typebeatSuggestions.filter(s =>
                s.toLowerCase().includes(form.typebeat.toLowerCase()) && s.toLowerCase() !== form.typebeat.toLowerCase()
              );
              if (filtered.length === 0) return null;
              return (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xs)', marginTop: 4,
                  maxHeight: 180, overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}>
                  {filtered.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => { setForm({ ...form, typebeat: s }); setShowTypebeatDropdown(false); }}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '10px 16px', border: 'none', background: 'transparent',
                        color: 'var(--text-primary)', fontSize: 14, cursor: 'pointer',
                        fontFamily: 'var(--font)', borderBottom: '1px solid var(--border)',
                      }}
                      onMouseEnter={(e) => { e.target.style.background = 'var(--bg-tertiary)'; }}
                      onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Genre *</label>
            <select value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
              {GENRE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>BPM *</label>
            <input type="number" value={form.bpm} onChange={(e) => setForm({ ...form, bpm: e.target.value })} style={inputStyle} min="40" max="300" />
          </div>
          <div>
            <label style={labelStyle}>Key</label>
            <select value={form.musical_key} onChange={(e) => setForm({ ...form, musical_key: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">—</option>
              {MUSICAL_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Collection</label>
            <select value={form.playlist} onChange={(e) => setForm({ ...form, playlist: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">None</option>
              {collections.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Tags (comma separated)</label>
          <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} style={inputStyle} placeholder="alte, amaarae, vibes" />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Moods</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {MOOD_OPTIONS.map((m) => {
              const active = form.moods.includes(m.name);
              return (
                <button
                  key={m.name}
                  type="button"
                  onClick={() => {
                    setForm(prev => ({
                      ...prev,
                      moods: active
                        ? prev.moods.filter(x => x !== m.name)
                        : [...prev.moods, m.name],
                    }));
                  }}
                  style={{
                    padding: '6px 16px', borderRadius: 'var(--radius-pill)',
                    fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    fontFamily: 'var(--font)',
                    border: active ? `1px solid ${m.color}` : '1px solid var(--border)',
                    background: active ? `${m.color}18` : 'transparent',
                    color: active ? m.color : 'var(--text-muted)',
                    transition: 'all 0.2s',
                  }}
                >
                  {m.name}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
            placeholder="Describe the vibe, sound, and ideal use..."
          />
        </div>

        {/* Cover */}
        <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 20, marginTop: 32, textTransform: 'uppercase', letterSpacing: 1 }}>
          Cover Art
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 2fr', gap: 14, marginBottom: 14, alignItems: 'start' }}>
          <div>
            <div
              style={{
                width: 120, height: 120, borderRadius: 'var(--radius-sm)', overflow: 'hidden',
                background: coverPreview || existingCover
                  ? `url(${coverPreview || existingCover}) center/cover`
                  : `linear-gradient(135deg, ${form.cover_color}33, ${form.cover_color}11)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid var(--border)', cursor: 'pointer',
              }}
              onClick={() => coverInputRef.current?.click()}
            >
              {!coverPreview && !existingCover && (
                <span style={{ fontSize: 48 }}>{form.cover_emoji}</span>
              )}
            </div>
            <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverChange} style={{ display: 'none' }} />
            <button
              onClick={() => coverInputRef.current?.click()}
              style={{
                marginTop: 8, fontSize: 11, color: 'var(--accent)', background: 'none',
                border: 'none', cursor: 'pointer', fontFamily: 'var(--font)',
              }}
            >
              Upload image
            </button>
          </div>
          <div>
            <label style={labelStyle}>Color</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="color" value={form.cover_color} onChange={(e) => setForm({ ...form, cover_color: e.target.value })} style={{ width: 40, height: 40, border: 'none', cursor: 'pointer', borderRadius: 8 }} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>{form.cover_color}</span>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Emoji</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => setForm({ ...form, cover_emoji: e })}
                  style={{
                    width: 36, height: 36, borderRadius: 8, fontSize: 18, border: 'none',
                    background: form.cover_emoji === e ? 'var(--accent)33' : 'var(--bg-tertiary)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    outline: form.cover_emoji === e ? '2px solid var(--accent)' : 'none',
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Audio files */}
        <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 20, marginTop: 32, textTransform: 'uppercase', letterSpacing: 1 }}>
          Audio Files
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 14 }}>
          {/* Preview audio */}
          <div style={{
            background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', padding: 20,
            border: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Preview Audio (public)</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  MP3 file for streaming. {existingPreview ? '✓ Current file uploaded' : 'No file uploaded'}
                </div>
                {previewFileName && <div style={{ fontSize: 12, color: 'var(--accent-green)', marginTop: 4 }}>New: {previewFileName}</div>}
                {audioDuration > 0 && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Duration: {Math.floor(audioDuration / 60)}:{String(Math.floor(audioDuration % 60)).padStart(2, '0')}</div>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {(previewFile || existingPreview) && (
                  <button
                    onClick={togglePreviewPlayback}
                    type="button"
                    style={{
                      padding: '8px 16px', borderRadius: 50, background: previewPlaying ? 'var(--accent)15' : 'var(--bg-tertiary)',
                      border: previewPlaying ? '1px solid var(--accent)44' : '1px solid var(--border)',
                      color: previewPlaying ? 'var(--accent)' : 'var(--text-secondary)',
                      fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    {previewPlaying ? <Icons.Pause /> : <Icons.Play />}
                    {previewPlaying ? 'Stop' : 'Preview'}
                  </button>
                )}
                <button
                  onClick={() => previewInputRef.current?.click()}
                  style={{
                    padding: '8px 20px', borderRadius: 50, background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)', color: 'var(--text-secondary)',
                    fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <Icons.Upload /> Choose MP3
                </button>
              </div>
            </div>
            <input ref={previewInputRef} type="file" accept=".mp3,.wav,audio/mpeg,audio/wav" onChange={(e) => handleAudioChange(e, 'preview')} style={{ display: 'none' }} />
          </div>

          {/* Full audio */}
          <div style={{
            background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', padding: 20,
            border: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Full Quality File (private)</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  WAV/MP3 delivered after purchase. {existingFull ? '✓ File uploaded' : 'No file uploaded'}
                </div>
                {fullFileName && <div style={{ fontSize: 12, color: 'var(--accent-green)', marginTop: 4 }}>New: {fullFileName}</div>}
              </div>
              <button
                onClick={() => fullInputRef.current?.click()}
                style={{
                  padding: '8px 20px', borderRadius: 50, background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)', color: 'var(--text-secondary)',
                  fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <Icons.Upload /> Choose File
              </button>
            </div>
            <input ref={fullInputRef} type="file" accept=".mp3,.wav,audio/mpeg,audio/wav" onChange={(e) => handleAudioChange(e, 'full')} style={{ display: 'none' }} />
          </div>

          {/* Stems */}
          <div style={{
            background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', padding: 20,
            border: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Stems (optional, private)</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  ZIP of individual stems. {existingStems ? '✓ File uploaded' : 'No file uploaded'}
                </div>
                {stemsFileName && <div style={{ fontSize: 12, color: 'var(--accent-green)', marginTop: 4 }}>New: {stemsFileName}</div>}
              </div>
              <button
                onClick={() => stemsInputRef.current?.click()}
                style={{
                  padding: '8px 20px', borderRadius: 50, background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)', color: 'var(--text-secondary)',
                  fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <Icons.Upload /> Choose ZIP
              </button>
            </div>
            <input ref={stemsInputRef} type="file" accept=".zip,.rar" onChange={handleStemsChange} style={{ display: 'none' }} />
          </div>
        </div>

        {/* Pricing */}
        <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 20, marginTop: 32, textTransform: 'uppercase', letterSpacing: 1 }}>
          Pricing
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 14 }}>
          {[
            { key: 'price_basic', label: 'Basic Lease' },
            { key: 'price_premium', label: 'Premium Lease' },
            { key: 'price_unlimited', label: 'Unlimited' },
            { key: 'price_exclusive', label: 'Exclusive' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label style={labelStyle}>{label} ($)</label>
              <input
                type="number"
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                style={inputStyle}
                min="0"
                step="0.01"
              />
            </div>
          ))}
        </div>

        {/* Options */}
        <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 20, marginTop: 32, textTransform: 'uppercase', letterSpacing: 1 }}>
          Options
        </h4>
        <div style={{ display: 'flex', gap: 24, marginBottom: 28 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            Featured (shown on homepage)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
            Published (visible in catalog)
          </label>
        </div>

        {/* Save buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleSave}
            disabled={saving || !form.title}
            style={{
              padding: '12px 32px', borderRadius: 50,
              background: form.title && !saving ? 'var(--accent)' : 'var(--bg-tertiary)',
              border: 'none',
              color: form.title && !saving ? '#fff' : 'var(--text-muted)',
              fontSize: 14, fontWeight: 600,
              cursor: form.title && !saving ? 'pointer' : 'not-allowed',
              fontFamily: 'var(--font)',
            }}
          >
            {saving ? 'Saving...' : isNew ? 'Create Beat' : 'Save Changes'}
          </button>
          <button
            onClick={() => navigate('/admin/beats')}
            style={{
              padding: '12px 32px', borderRadius: 50, background: 'transparent',
              border: '1px solid var(--border)', color: 'var(--text-secondary)',
              fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font)',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
