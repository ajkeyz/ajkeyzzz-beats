import { useEffect, useRef, useState, useCallback } from 'react';

const BAR_COUNT = 64;
const BAR_GAP = 2;

// Generate fake waveform data for demo mode / beats without audio
function generateFakeWaveform(count) {
  const bars = [];
  for (let i = 0; i < count; i++) {
    // Create a natural-looking waveform shape
    const pos = i / count;
    const base = 0.3 + 0.4 * Math.sin(pos * Math.PI);
    const noise = 0.15 * Math.sin(pos * 17.3) + 0.1 * Math.cos(pos * 31.7);
    bars.push(Math.max(0.08, Math.min(1, base + noise)));
  }
  return bars;
}

// Extract waveform data from audio using Web Audio API
async function extractWaveform(audioUrl, barCount) {
  try {
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const channelData = audioBuffer.getChannelData(0);

    const samplesPerBar = Math.floor(channelData.length / barCount);
    const bars = [];

    for (let i = 0; i < barCount; i++) {
      let sum = 0;
      const start = i * samplesPerBar;
      for (let j = start; j < start + samplesPerBar && j < channelData.length; j++) {
        sum += Math.abs(channelData[j]);
      }
      bars.push(sum / samplesPerBar);
    }

    // Normalize to 0-1
    const max = Math.max(...bars);
    if (max > 0) {
      for (let i = 0; i < bars.length; i++) {
        bars[i] = Math.max(0.08, bars[i] / max);
      }
    }

    audioContext.close();
    return bars;
  } catch {
    return generateFakeWaveform(barCount);
  }
}

// Cache waveform data by URL to avoid re-decoding
const waveformCache = new Map();

export default function Waveform({
  audioUrl,
  progress = 0,
  color = '#E84393',
  height = 48,
  onSeek,
  isPlaying = false,
  mini = false,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [bars, setBars] = useState(null);
  const [hoverX, setHoverX] = useState(null);
  const barsCount = mini ? 32 : BAR_COUNT;

  // Load or generate waveform data
  useEffect(() => {
    if (audioUrl && waveformCache.has(audioUrl)) {
      setBars(waveformCache.get(audioUrl));
      return;
    }

    if (audioUrl) {
      extractWaveform(audioUrl, barsCount).then((data) => {
        waveformCache.set(audioUrl, data);
        setBars(data);
      });
    } else {
      setBars(generateFakeWaveform(barsCount));
    }
  }, [audioUrl, barsCount]);

  // Draw waveform on canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !bars) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const barWidth = (rect.width - (bars.length - 1) * BAR_GAP) / bars.length;
    const progressX = (progress / 100) * rect.width;
    const hoverProgress = hoverX !== null ? (hoverX / rect.width) * 100 : null;

    bars.forEach((amp, i) => {
      const x = i * (barWidth + BAR_GAP);
      const barHeight = amp * rect.height * 0.9;
      const y = (rect.height - barHeight) / 2;

      if (x + barWidth <= progressX) {
        // Played portion
        ctx.fillStyle = color;
      } else if (hoverX !== null && x + barWidth <= hoverX) {
        // Hover portion
        ctx.fillStyle = color + '66';
      } else {
        // Unplayed portion
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
      }

      const radius = Math.min(barWidth / 2, 2);
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, radius);
      ctx.fill();
    });
  }, [bars, progress, color, hoverX]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Redraw on resize
  useEffect(() => {
    const observer = new ResizeObserver(() => draw());
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [draw]);

  const handleClick = (e) => {
    if (!onSeek) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    onSeek(Math.max(0, Math.min(100, pct)));
  };

  const handleMouseMove = (e) => {
    if (!onSeek) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverX(e.clientX - rect.left);
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height,
        cursor: onSeek ? 'pointer' : 'default',
        position: 'relative',
      }}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverX(null)}
      role={onSeek ? 'slider' : undefined}
      aria-label={onSeek ? 'Seek' : 'Waveform'}
      aria-valuemin={onSeek ? 0 : undefined}
      aria-valuemax={onSeek ? 100 : undefined}
      aria-valuenow={onSeek ? Math.round(progress) : undefined}
      tabIndex={onSeek ? 0 : undefined}
      onKeyDown={onSeek ? (e) => {
        if (e.key === 'ArrowRight') onSeek(Math.min(100, progress + 2));
        if (e.key === 'ArrowLeft') onSeek(Math.max(0, progress - 2));
      } : undefined}
    >
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
