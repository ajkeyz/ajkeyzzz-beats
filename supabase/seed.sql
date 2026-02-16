-- AJKEYZZZ Beats Platform — Seed Data
-- Run this after schema.sql to populate initial beats

insert into beats (id, title, slug, genre, bpm, musical_key, typebeat, tags, description, cover_color, cover_emoji, duration, featured, published, plays, playlist, created_at)
values
  (gen_random_uuid(), 'hearts', 'hearts', 'Alté', 140, 'Cm', 'amaarae type beat',
   ARRAY['alte', 'amaarae'], 'A dreamy Alté beat with lush pads and gentle percussion. Perfect for smooth vocals and introspective lyrics.',
   '#E84393', '💗', 198, true, true, 342, 'alte', '2025-01-15T00:00:00Z'),
  (gen_random_uuid(), 'balance', 'balance', 'Alté', 96, 'Am', 'amaarae type beat',
   ARRAY['alte', 'amaarae'], 'Smooth and balanced Alté vibes with warm bass and crisp hi-hats.',
   '#2D3436', '⚖️', 174, true, true, 218, 'alte', '2025-01-10T00:00:00Z'),
  (gen_random_uuid(), 'palmwine', 'palmwine', 'Alté', 90, 'Gm', 'boj type beat',
   ARRAY['alte', 'boj'], 'Tropical Alté beat with guitar loops and relaxed groove.',
   '#00B894', '🌴', 210, true, true, 189, 'alte', '2025-01-08T00:00:00Z'),
  (gen_random_uuid(), 'away', 'away', 'Alté', 99, 'Dm', 'odumodu type beat',
   ARRAY['alte', 'odumodu'], 'Ethereal Alté beat with spacious synths and bouncy drums.',
   '#636E72', '🌊', 186, true, true, 156, 'alte', '2025-01-05T00:00:00Z'),
  (gen_random_uuid(), 'midnight cruise', 'midnight-cruise', 'Afro Swing', 108, 'Fm', 'burna boy type beat',
   ARRAY['afroswing', 'burna'], 'Late night Afro Swing vibes with rolling basslines and atmospheric pads.',
   '#0984E3', '🌙', 204, false, true, 421, 'afro-swing', '2025-02-01T00:00:00Z'),
  (gen_random_uuid(), 'jollof', 'jollof', 'Afro Swing', 115, 'Bbm', 'rema type beat',
   ARRAY['afroswing', 'rema'], 'High-energy Afro Swing with percussive grooves and catchy melodies.',
   '#D63031', '🍛', 192, false, true, 305, 'afro-swing', '2025-02-05T00:00:00Z'),
  (gen_random_uuid(), 'golden hour', 'golden-hour', 'Alté', 85, 'Em', 'tems type beat',
   ARRAY['alte', 'tems'], 'Warm, sun-soaked Alté beat with soulful chords and gentle drums.',
   '#FDCB6E', '☀️', 216, false, true, 267, 'alte', '2025-02-10T00:00:00Z'),
  (gen_random_uuid(), 'lagos nights', 'lagos-nights', 'Afro Swing', 120, 'Abm', 'wizkid type beat',
   ARRAY['afroswing', 'wizkid'], 'Vibrant Afro Swing anthem with driving rhythms and hypnotic melodies.',
   '#6C5CE7', '🌃', 180, false, true, 534, 'afro-swing', '2025-02-12T00:00:00Z');
