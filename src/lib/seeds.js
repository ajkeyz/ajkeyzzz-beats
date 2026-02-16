// Seed data for local/demo mode
export const SEED_BEATS = [
  {
    id: '1', title: 'hearts', slug: 'hearts', genre: 'Alté', bpm: 140,
    musical_key: 'Cm', typebeat: 'amaarae type beat', tags: ['alte', 'amaarae'], moods: ['dreamy', 'chill'],
    description: 'A dreamy Alté beat with lush pads and gentle percussion. Perfect for smooth vocals and introspective lyrics.',
    cover_color: '#E84393', cover_emoji: '💗', cover_art_url: '',
    preview_url: '', full_audio_url: '', stems_url: '',
    duration: 198, price_basic: 29.99, price_premium: 99.99,
    price_unlimited: 149.99, price_exclusive: 299.99,
    featured: true, published: true, plays: 342,
    created_at: '2025-01-15T00:00:00Z', playlist: 'alte',
  },
  {
    id: '2', title: 'balance', slug: 'balance', genre: 'Alté', bpm: 96,
    musical_key: 'Am', typebeat: 'amaarae type beat', tags: ['alte', 'amaarae'], moods: ['smooth', 'chill'],
    description: 'Smooth and balanced Alté vibes with warm bass and crisp hi-hats.',
    cover_color: '#2D3436', cover_emoji: '⚖️', cover_art_url: '',
    preview_url: '', full_audio_url: '', stems_url: '',
    duration: 174, price_basic: 29.99, price_premium: 99.99,
    price_unlimited: 149.99, price_exclusive: 299.99,
    featured: true, published: true, plays: 218,
    created_at: '2025-01-10T00:00:00Z', playlist: 'alte',
  },
  {
    id: '3', title: 'palmwine', slug: 'palmwine', genre: 'Alté', bpm: 90,
    musical_key: 'Gm', typebeat: 'boj type beat', tags: ['alte', 'boj'], moods: ['tropical', 'vibey'],
    description: 'Tropical Alté beat with guitar loops and relaxed groove.',
    cover_color: '#00B894', cover_emoji: '🌴', cover_art_url: '',
    preview_url: '', full_audio_url: '', stems_url: '',
    duration: 210, price_basic: 29.99, price_premium: 99.99,
    price_unlimited: 149.99, price_exclusive: 299.99,
    featured: true, published: true, plays: 189,
    created_at: '2025-01-08T00:00:00Z', playlist: 'alte',
  },
  {
    id: '4', title: 'away', slug: 'away', genre: 'Alté', bpm: 99,
    musical_key: 'Dm', typebeat: 'odumodu type beat', tags: ['alte', 'odumodu'], moods: ['dreamy', 'ethereal'],
    description: 'Ethereal Alté beat with spacious synths and bouncy drums.',
    cover_color: '#636E72', cover_emoji: '🌊', cover_art_url: '',
    preview_url: '', full_audio_url: '', stems_url: '',
    duration: 186, price_basic: 29.99, price_premium: 99.99,
    price_unlimited: 149.99, price_exclusive: 299.99,
    featured: true, published: true, plays: 156,
    created_at: '2025-01-05T00:00:00Z', playlist: 'alte',
  },
  {
    id: '5', title: 'midnight cruise', slug: 'midnight-cruise', genre: 'Afro Swing', bpm: 108,
    musical_key: 'Fm', typebeat: 'burna boy type beat', tags: ['afroswing', 'burna'], moods: ['dark', 'vibey'],
    description: 'Late night Afro Swing vibes with rolling basslines and atmospheric pads.',
    cover_color: '#0984E3', cover_emoji: '🌙', cover_art_url: '',
    preview_url: '', full_audio_url: '', stems_url: '',
    duration: 204, price_basic: 29.99, price_premium: 99.99,
    price_unlimited: 149.99, price_exclusive: 299.99,
    featured: false, published: true, plays: 421,
    created_at: '2025-02-01T00:00:00Z', playlist: 'afro-swing',
  },
  {
    id: '6', title: 'jollof', slug: 'jollof', genre: 'Afro Swing', bpm: 115,
    musical_key: 'Bbm', typebeat: 'rema type beat', tags: ['afroswing', 'rema'], moods: ['energetic', 'hype'],
    description: 'High-energy Afro Swing with percussive grooves and catchy melodies.',
    cover_color: '#D63031', cover_emoji: '🍛', cover_art_url: '',
    preview_url: '', full_audio_url: '', stems_url: '',
    duration: 192, price_basic: 29.99, price_premium: 99.99,
    price_unlimited: 149.99, price_exclusive: 299.99,
    featured: false, published: true, plays: 305,
    created_at: '2025-02-05T00:00:00Z', playlist: 'afro-swing',
  },
  {
    id: '7', title: 'golden hour', slug: 'golden-hour', genre: 'Alté', bpm: 85,
    musical_key: 'Em', typebeat: 'tems type beat', tags: ['alte', 'tems'], moods: ['smooth', 'warm'],
    description: 'Warm, sun-soaked Alté beat with soulful chords and gentle drums.',
    cover_color: '#FDCB6E', cover_emoji: '☀️', cover_art_url: '',
    preview_url: '', full_audio_url: '', stems_url: '',
    duration: 216, price_basic: 29.99, price_premium: 99.99,
    price_unlimited: 149.99, price_exclusive: 299.99,
    featured: false, published: true, plays: 267,
    created_at: '2025-02-10T00:00:00Z', playlist: 'alte',
  },
  {
    id: '8', title: 'lagos nights', slug: 'lagos-nights', genre: 'Afro Swing', bpm: 120,
    musical_key: 'Abm', typebeat: 'wizkid type beat', tags: ['afroswing', 'wizkid'], moods: ['hype', 'vibey'],
    description: 'Vibrant Afro Swing anthem with driving rhythms and hypnotic melodies.',
    cover_color: '#6C5CE7', cover_emoji: '🌃', cover_art_url: '',
    preview_url: '', full_audio_url: '', stems_url: '',
    duration: 180, price_basic: 29.99, price_premium: 99.99,
    price_unlimited: 149.99, price_exclusive: 299.99,
    featured: false, published: true, plays: 534,
    created_at: '2025-02-12T00:00:00Z', playlist: 'afro-swing',
  },
];

export const SEED_PLAYLISTS = [
  { id: 'alte', name: 'Alté', cover_color: '#E84393', cover_emoji: '💗' },
  { id: 'afro-swing', name: 'Afro Swing', cover_color: '#0984E3', cover_emoji: '🎶' },
];

export const LICENSE_TIERS = [
  {
    id: 'free',
    name: 'Free Download',
    priceKey: null,
    defaultPrice: 0,
    features: ['Tagged MP3 (with producer tag)', 'Non-commercial use only', 'Must credit AJKEYZZZ'],
    accent: '#636E72',
    free: true,
  },
  {
    id: 'basic',
    name: 'Basic Lease',
    priceKey: 'price_basic',
    defaultPrice: 29.99,
    features: ['High Quality MP3', 'For Hobby Musicians, YouTubers & Podcasters', 'YouTube, SoundCloud, Audiomack'],
    accent: '#636E72',
  },
  {
    id: 'premium',
    name: 'Premium Lease',
    priceKey: 'price_premium',
    defaultPrice: 99.99,
    features: ['MP3 & WAV', 'DSP Distribution', 'Radio Broadcasting Rights', 'Monetize YouTube Videos', 'Spotify, iTunes & more'],
    accent: '#0984E3',
    popular: true,
  },
  {
    id: 'unlimited',
    name: 'Unlimited Lease',
    priceKey: 'price_unlimited',
    defaultPrice: 149.99,
    features: ['MP3, WAV & Stems', 'Unlimited Distribution', 'Radio Broadcasting', 'Paid Performances', 'All Platforms'],
    accent: '#6C5CE7',
  },
  {
    id: 'exclusive',
    name: 'Exclusive',
    priceKey: 'price_exclusive',
    defaultPrice: 299.99,
    features: ['MP3, WAV & Stems', 'Full Ownership & Control', 'Beat Removed From Store', 'All Premium Features', 'Film, TV, Netflix & More'],
    accent: '#E84393',
  },
];

export const DISCOUNT_CODES = {
  'LAUNCH20': { type: 'percent', value: 20, description: '20% off', minAmount: 0 },
  'FIRST10': { type: 'percent', value: 10, description: '10% off first purchase', minAmount: 0 },
  'BEATS50': { type: 'fixed', value: 50, description: '$50 off', minAmount: 100 },
};

export const GENRE_OPTIONS = ['Alté', 'Afro Swing', 'Afrobeats', 'Amapiano', 'R&B', 'Hip Hop'];

export const MOOD_OPTIONS = [
  { name: 'chill', color: '#0984E3' },
  { name: 'dreamy', color: '#A29BFE' },
  { name: 'vibey', color: '#E84393' },
  { name: 'energetic', color: '#FDCB6E' },
  { name: 'dark', color: '#636E72' },
  { name: 'hype', color: '#D63031' },
  { name: 'smooth', color: '#00B894' },
  { name: 'tropical', color: '#00CEC9' },
  { name: 'ethereal', color: '#6C5CE7' },
  { name: 'warm', color: '#E17055' },
];

export const MUSICAL_KEYS = [
  'C', 'Cm', 'C#', 'C#m', 'D', 'Dm', 'D#', 'D#m',
  'E', 'Em', 'F', 'Fm', 'F#', 'F#m', 'G', 'Gm',
  'G#', 'G#m', 'A', 'Am', 'A#', 'A#m', 'B', 'Bm',
  'Ab', 'Abm', 'Bb', 'Bbm', 'Db', 'Dbm', 'Eb', 'Ebm', 'Gb', 'Gbm',
];

export const EMOJI_OPTIONS = [
  '🎵', '💗', '⚖️', '🌴', '🌊', '🌙', '🍛', '☀️', '🌃',
  '🔥', '💎', '🎤', '🎧', '🌺', '⚡', '🎭', '🌈', '🦋',
];
