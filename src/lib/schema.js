import { z } from 'zod';

export const beatSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  slug: z.string().min(1).max(120).optional(),
  genre: z.string().min(1, 'Genre is required'),
  bpm: z.number().int().min(40).max(300),
  musical_key: z.string().max(10).optional().default(''),
  typebeat: z.string().max(100).optional().default(''),
  tags: z.array(z.string()).optional().default([]),
  description: z.string().max(2000).optional().default(''),
  cover_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#FFD800'),
  cover_emoji: z.string().max(4).default('🎵'),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
});

export const inquirySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Valid email required'),
  inquiry_type: z.enum(['custom_beat', 'film_media', 'artist_development', 'sound_design', 'other']).default('custom_beat'),
  budget: z.string().max(50).optional().default(''),
  timeline: z.string().max(100).optional().default(''),
  reference_links: z.string().max(1000).optional().default(''),
  vocals_needed: z.boolean().optional().default(false),
  platform: z.string().max(200).optional().default(''),
  message: z.string().min(1, 'Message is required').max(5000),
});

export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Valid email required'),
  subject: z.string().max(200).optional().default(''),
  message: z.string().min(1, 'Message is required').max(5000),
});
