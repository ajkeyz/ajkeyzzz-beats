import { useEffect, useState, useRef } from 'react';
import Icons from '../../components/Icons';
import { fetchCollections, createCollection, updateCollection, deleteCollection, fetchBeats } from '../../lib/data';
import { EMOJI_OPTIONS } from '../../lib/seeds';

const COLOR_PRESETS = ['#FFD800', '#0984E3', '#6C5CE7', '#00B894', '#FDCB6E', '#D63031', '#636E72', '#E17055', '#00CEC9', '#A29BFE'];

const inputStyle = {
  width: '100%', padding: '10px 14px', background: 'var(--bg-tertiary)',
  border: '1px solid var(--border)', borderRadius: 'var(--radius-xs)',
  color: 'var(--text-primary)', fontSize: 14, fontFamily: 'var(--font)', outline: 'none',
};

function CollectionForm({ initial = {}, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    cover_color: initial.cover_color || '#FFD800',
    cover_emoji: initial.cover_emoji || '🎵',
    cover_image_url: initial.cover_image_url || '',
  });
  const [imgInput, setImgInput] = useState('');
  const imgFileRef = useRef(null);

  const handleImgFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm({ ...form, cover_image_url: ev.target.result });
      setImgInput('');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{
      background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: 24,
      border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <div>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 1 }}>
          Name
        </label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={inputStyle}
          placeholder="e.g. Afrobeats"
          autoFocus
        />
      </div>

      {/* Cover Image */}
      <div>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 1 }}>
          Cover Image
        </label>
        {form.cover_image_url && (
          <div style={{ position: 'relative', marginBottom: 10, display: 'inline-block' }}>
            <img
              src={form.cover_image_url}
              alt="Cover"
              style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 'var(--radius-sm)', display: 'block' }}
            />
            <button
              onClick={() => setForm({ ...form, cover_image_url: '' })}
              style={{
                position: 'absolute', top: -6, right: -6,
                background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none',
                borderRadius: '50%', width: 22, height: 22, fontSize: 11,
                fontWeight: 700, cursor: 'pointer', lineHeight: '22px', textAlign: 'center',
              }}
            >
              ✕
            </button>
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Paste image URL..."
            value={imgInput}
            onChange={(e) => setImgInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && imgInput.trim()) {
                setForm({ ...form, cover_image_url: imgInput.trim() });
                setImgInput('');
              }
            }}
            style={{ ...inputStyle, flex: 1, minWidth: 160, width: 'auto' }}
          />
          <button
            onClick={() => {
              if (imgInput.trim()) {
                setForm({ ...form, cover_image_url: imgInput.trim() });
                setImgInput('');
              }
            }}
            style={{
              padding: '10px 16px', borderRadius: 'var(--radius-xs)', background: 'var(--accent)',
              border: 'none', color: '#000', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font)',
            }}
          >
            Set
          </button>
          <button
            onClick={() => imgFileRef.current?.click()}
            style={{
              padding: '10px 16px', borderRadius: 'var(--radius-xs)',
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500, cursor: 'pointer',
              fontFamily: 'var(--font)',
            }}
          >
            Upload
          </button>
          <input ref={imgFileRef} type="file" accept="image/*" onChange={handleImgFile} style={{ display: 'none' }} />
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          Optional. Falls back to cover art of beats in this collection.
        </p>
      </div>

      <div>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 1 }}>
          Color
        </label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {COLOR_PRESETS.map((c) => (
            <button
              key={c}
              onClick={() => setForm({ ...form, cover_color: c })}
              style={{
                width: 28, height: 28, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer',
                outline: form.cover_color === c ? `2px solid ${c}` : 'none',
                outlineOffset: 2,
              }}
              aria-label={c}
            />
          ))}
          <input
            type="color"
            value={form.cover_color}
            onChange={(e) => setForm({ ...form, cover_color: e.target.value })}
            style={{ width: 28, height: 28, border: 'none', padding: 0, cursor: 'pointer', borderRadius: 4 }}
          />
        </div>
      </div>

      <div>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 1 }}>
          Emoji
        </label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EMOJI_OPTIONS.map((e) => (
            <button
              key={e}
              onClick={() => setForm({ ...form, cover_emoji: e })}
              style={{
                width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 18,
                background: form.cover_emoji === e ? 'var(--accent)22' : 'var(--bg-tertiary)',
                outline: form.cover_emoji === e ? '2px solid var(--accent)' : 'none',
              }}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button
          onClick={() => { if (form.name.trim()) onSave(form); }}
          disabled={!form.name.trim() || saving}
          style={{
            padding: '10px 24px', borderRadius: 50, background: 'var(--accent)',
            border: 'none', color: '#fff', fontSize: 13, fontWeight: 600,
            cursor: form.name.trim() && !saving ? 'pointer' : 'not-allowed',
            fontFamily: 'var(--font)', opacity: !form.name.trim() || saving ? 0.5 : 1,
          }}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: '10px 24px', borderRadius: 50, background: 'none',
            border: '1px solid var(--border)', color: 'var(--text-secondary)',
            fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function AdminCollections() {
  const [collections, setCollections] = useState([]);
  const [beats, setBeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [cols, allBeats] = await Promise.all([
      fetchCollections(),
      fetchBeats({ published: false }),
    ]);
    setCollections(cols);
    setBeats(allBeats);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const beatCountFor = (col) =>
    beats.filter(b => b.playlist === col.id || b.genre === col.name).length;

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      const created = await createCollection({
        name: form.name.trim(),
        cover_color: form.cover_color,
        cover_emoji: form.cover_emoji,
        cover_image_url: form.cover_image_url || '',
      });
      setCollections(prev => [...prev, created]);
      setShowAddForm(false);
    } catch (err) {
      alert('Failed to create: ' + err.message);
    }
    setSaving(false);
  };

  const handleUpdate = async (id, form) => {
    setSaving(true);
    try {
      const updated = await updateCollection(id, {
        name: form.name.trim(),
        cover_color: form.cover_color,
        cover_emoji: form.cover_emoji,
        cover_image_url: form.cover_image_url || '',
      });
      setCollections(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
      setEditingId(null);
    } catch (err) {
      alert('Failed to update: ' + err.message);
    }
    setSaving(false);
  };

  const handleDelete = async (col) => {
    const count = beatCountFor(col);
    const msg = count > 0
      ? `Delete "${col.name}"? ${count} beat(s) are assigned to this collection. They will be unlinked.`
      : `Delete "${col.name}"? This cannot be undone.`;
    if (!confirm(msg)) return;
    try {
      await deleteCollection(col.id);
      setCollections(prev => prev.filter(c => c.id !== col.id));
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700 }}>Manage Collections ({collections.length})</h3>
        {!showAddForm && (
          <button
            onClick={() => { setShowAddForm(true); setEditingId(null); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px',
              borderRadius: 50, background: 'var(--accent)', border: 'none',
              color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font)',
              cursor: 'pointer',
            }}
          >
            + Add Collection
          </button>
        )}
      </div>

      {showAddForm && (
        <div style={{ marginBottom: 20 }}>
          <CollectionForm
            onSave={handleCreate}
            onCancel={() => setShowAddForm(false)}
            saving={saving}
          />
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--radius-sm)' }} />
          ))}
        </div>
      ) : collections.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: 64,
          border: '1px solid var(--border)', textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📁</div>
          <div style={{ fontSize: 18, marginBottom: 8 }}>No collections yet</div>
          <div style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Add your first collection to organize beats</div>
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              padding: '12px 28px', borderRadius: 50, background: 'var(--accent)',
              color: '#fff', border: 'none', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--font)',
            }}
          >
            Add Collection
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {collections.map((col) => (
            <div key={col.id}>
              {editingId === col.id ? (
                <CollectionForm
                  initial={col}
                  onSave={(form) => handleUpdate(col.id, form)}
                  onCancel={() => setEditingId(null)}
                  saving={saving}
                />
              ) : (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
                  background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                }}>
                  {/* Cover preview */}
                  {col.cover_image_url ? (
                    <img
                      src={col.cover_image_url}
                      alt=""
                      style={{
                        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <div style={{
                      width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                      background: `linear-gradient(135deg, ${col.cover_color}33, ${col.cover_color}11)`,
                      border: `1px solid ${col.cover_color}33`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                    }}>
                      {col.cover_emoji || '🎵'}
                    </div>
                  )}

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{col.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {beatCountFor(col)} beat{beatCountFor(col) !== 1 ? 's' : ''} · {col.cover_color}
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => { setEditingId(col.id); setShowAddForm(false); }}
                    style={{
                      background: 'none', border: '1px solid var(--border)', borderRadius: 8,
                      padding: 8, cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', flexShrink: 0,
                    }}
                    aria-label="Edit"
                  >
                    <Icons.Edit />
                  </button>
                  <button
                    onClick={() => handleDelete(col)}
                    style={{
                      background: 'none', border: '1px solid #D6303133', borderRadius: 8,
                      padding: 8, cursor: 'pointer', color: '#D63031', display: 'flex', flexShrink: 0,
                    }}
                    aria-label="Delete"
                  >
                    <Icons.Trash />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
