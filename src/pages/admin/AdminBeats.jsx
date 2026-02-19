import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icons from '../../components/Icons';
import { fetchBeats, deleteBeat as deleteBeatApi, updateBeat } from '../../lib/data';

export default function AdminBeats() {
  const [beats, setBeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [dragIndex, setDragIndex] = useState(null);
  const navigate = useNavigate();

  const loadBeats = async () => {
    setLoading(true);
    const data = await fetchBeats({ published: false });
    setBeats(data);
    setLoading(false);
  };

  useEffect(() => { loadBeats(); }, []);

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteBeatApi(id);
      setBeats(beats.filter(b => b.id !== id));
      setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  // Bulk actions
  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === beats.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(beats.map(b => b.id)));
    }
  };

  const bulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} beat(s)? This cannot be undone.`)) return;
    const failed = [];
    for (const id of selectedIds) {
      try { await deleteBeatApi(id); } catch (_) { failed.push(id); }
    }
    const failedSet = new Set(failed);
    setBeats(prev => prev.filter(b => !selectedIds.has(b.id) || failedSet.has(b.id)));
    setSelectedIds(new Set());
    if (failed.length > 0) alert(`${failed.length} beat(s) failed to delete.`);
  };

  const bulkToggleFeatured = async () => {
    if (selectedIds.size === 0) return;
    const updated = [];
    for (const beat of beats) {
      if (selectedIds.has(beat.id)) {
        const toggled = !beat.featured;
        updated.push({ ...beat, featured: toggled });
        try { await updateBeat(beat.id, { featured: toggled }); } catch (_) {}
      }
    }
    setBeats(prev => prev.map(b => {
      const u = updated.find(x => x.id === b.id);
      return u || b;
    }));
    setSelectedIds(new Set());
  };

  // Inline editing
  const startEdit = (beat) => {
    setEditingId(beat.id);
    setEditValues({ title: beat.title, bpm: beat.bpm, genre: beat.genre });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const saveEdit = async (id) => {
    try {
      await updateBeat(id, editValues);
      setBeats(prev => prev.map(b => b.id === id ? { ...b, ...editValues } : b));
      setEditingId(null);
    } catch (err) {
      alert('Failed to save: ' + err.message);
    }
  };

  // Drag reorder
  const handleDragStart = (index) => setDragIndex(index);
  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const reordered = [...beats];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(index, 0, moved);
    setBeats(reordered);
    setDragIndex(index);
  };
  const handleDragEnd = () => setDragIndex(null);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700 }}>Manage Beats ({beats.length})</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {selectedIds.size > 0 && (
            <>
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={bulkToggleFeatured}
                style={{
                  padding: '8px 18px', borderRadius: 50, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'var(--font)',
                  background: 'var(--accent-purple)22', border: '1px solid var(--accent-purple)44',
                  color: 'var(--accent-purple)',
                }}
              >
                Toggle Featured ({selectedIds.size})
              </motion.button>
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={bulkDelete}
                style={{
                  padding: '8px 18px', borderRadius: 50, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'var(--font)',
                  background: '#D6303122', border: '1px solid #D6303144', color: '#D63031',
                }}
              >
                Delete ({selectedIds.size})
              </motion.button>
            </>
          )}
          <Link
            to="/admin/beats/new"
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px',
              borderRadius: 50, background: 'var(--accent)', border: 'none',
              color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font)',
              textDecoration: 'none',
            }}
          >
            <Icons.Upload /> Add Beat
          </Link>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 72, borderRadius: 'var(--radius-sm)' }} />
          ))}
        </div>
      ) : beats.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: 64,
          border: '1px solid var(--border)', textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎵</div>
          <div style={{ fontSize: 18, marginBottom: 8 }}>No beats yet</div>
          <div style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Add your first beat to get started</div>
          <Link to="/admin/beats/new" style={{
            padding: '12px 28px', borderRadius: 50, background: 'var(--accent)',
            color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600,
          }}>
            Add Beat
          </Link>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          {/* Select all */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '10px 20px',
            borderBottom: '1px solid var(--border)', background: 'var(--bg-tertiary)',
          }}>
            <input
              type="checkbox"
              checked={selectedIds.size === beats.length && beats.length > 0}
              onChange={selectAll}
              style={{ accentColor: 'var(--accent)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
              {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
            </span>
          </div>

          {beats.map((beat, i) => {
            const isEditing = editingId === beat.id;
            return (
              <div
                key={beat.id}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => handleDragOver(e, i)}
                onDragEnd={handleDragEnd}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
                  borderBottom: i < beats.length - 1 ? '1px solid var(--border)' : 'none',
                  background: dragIndex === i ? 'var(--bg-tertiary)' : selectedIds.has(beat.id) ? 'var(--accent)08' : 'transparent',
                  transition: 'background 0.15s',
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(beat.id)}
                  onChange={() => toggleSelect(beat.id)}
                  style={{ accentColor: 'var(--accent)', cursor: 'pointer', flexShrink: 0 }}
                />
                <div style={{ cursor: 'grab', color: 'var(--text-muted)', display: 'flex', flexShrink: 0 }}>
                  <Icons.DragHandle />
                </div>
                <div style={{
                  width: 44, height: 44, borderRadius: 8, flexShrink: 0,
                  background: beat.cover_art_url
                    ? `url(${beat.cover_art_url}) center/cover`
                    : `linear-gradient(135deg, ${beat.cover_color || '#FFD800'}33, ${beat.cover_color || '#FFD800'}11)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                }}>
                  {!beat.cover_art_url && (beat.cover_emoji || '🎵')}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        value={editValues.title || ''}
                        onChange={(e) => setEditValues(prev => ({ ...prev, title: e.target.value }))}
                        style={{
                          background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                          borderRadius: 6, padding: '4px 10px', fontSize: 13, fontWeight: 600,
                          color: 'var(--text-primary)', fontFamily: 'var(--font)', outline: 'none', width: 150,
                        }}
                      />
                      <input
                        value={editValues.bpm || ''}
                        onChange={(e) => setEditValues(prev => ({ ...prev, bpm: parseInt(e.target.value) || 0 }))}
                        style={{
                          background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                          borderRadius: 6, padding: '4px 10px', fontSize: 12,
                          color: 'var(--text-primary)', fontFamily: 'var(--mono)', outline: 'none', width: 60,
                        }}
                        placeholder="BPM"
                      />
                      <button onClick={() => saveEdit(beat.id)} style={{
                        background: 'var(--accent)', border: 'none', borderRadius: 6,
                        padding: '4px 12px', fontSize: 11, fontWeight: 600, color: '#fff',
                        cursor: 'pointer', fontFamily: 'var(--font)',
                      }}>Save</button>
                      <button onClick={cancelEdit} style={{
                        background: 'none', border: '1px solid var(--border)', borderRadius: 6,
                        padding: '4px 12px', fontSize: 11, color: 'var(--text-muted)',
                        cursor: 'pointer', fontFamily: 'var(--font)',
                      }}>Cancel</button>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span onDoubleClick={() => startEdit(beat)} style={{ cursor: 'default' }} title="Double-click to edit">
                          {beat.title}
                        </span>
                        {beat.featured && (
                          <span style={{ fontSize: 10, background: 'var(--accent)22', color: 'var(--accent)', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>Featured</span>
                        )}
                        {beat.published === false && (
                          <span style={{ fontSize: 10, background: 'var(--text-muted)22', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>Draft</span>
                        )}
                        {beat.preview_url && (
                          <span style={{ fontSize: 10, background: 'var(--accent-green)22', color: 'var(--accent-green)', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>Audio ✓</span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {beat.genre} · {beat.bpm} BPM · {beat.typebeat || '—'}
                      </div>
                    </>
                  )}
                </div>

                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: 8, fontFamily: 'var(--mono)', flexShrink: 0 }}>
                  &#9654; {(beat.plays || 0).toLocaleString()}
                </div>
                <button
                  onClick={() => navigate(`/admin/beats/${beat.id}/edit`)}
                  style={{
                    background: 'none', border: '1px solid var(--border)', borderRadius: 8,
                    padding: 8, cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', flexShrink: 0,
                  }}
                  aria-label="Edit"
                >
                  <Icons.Edit />
                </button>
                <button
                  onClick={() => handleDelete(beat.id, beat.title)}
                  style={{
                    background: 'none', border: '1px solid #D6303133', borderRadius: 8,
                    padding: 8, cursor: 'pointer', color: '#D63031', display: 'flex', flexShrink: 0,
                  }}
                  aria-label="Delete"
                >
                  <Icons.Trash />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
