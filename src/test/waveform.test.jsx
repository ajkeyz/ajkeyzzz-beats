import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { Component } from 'react';
import Waveform from '../components/Waveform';

// Probe boundary: records whether a render/effect error reached a boundary
class Probe extends Component {
  state = { crashed: false };
  static getDerivedStateFromError() { return { crashed: true }; }
  componentDidCatch() {}
  render() {
    return this.state.crashed ? <div data-testid="crashed" /> : this.props.children;
  }
}

// Spec-faithful roundRect: the canvas spec throws RangeError on negative radii,
// which is exactly what real browsers do (unlike a vi.fn() no-op mock).
function specRoundRect() {
  return vi.fn((x, y, w, h, r) => {
    const radii = Array.isArray(r) ? r : [r];
    if (radii.some((v) => v < 0 || !Number.isFinite(v))) {
      throw new RangeError("Failed to execute 'roundRect': radius is negative");
    }
  });
}

const origGetContext = window.HTMLCanvasElement.prototype.getContext;
const origGetRect = window.HTMLCanvasElement.prototype.getBoundingClientRect;

function mockCanvas({ width, height, roundRectImpl }) {
  const ctx = {
    scale: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    fill: vi.fn(),
    rect: vi.fn(),
  };
  if (roundRectImpl !== undefined) ctx.roundRect = roundRectImpl;
  window.HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(ctx);
  window.HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
    width, height, x: 0, y: 0, top: 0, left: 0, right: width, bottom: height,
  });
  window.ResizeObserver = class {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  return ctx;
}

describe('Waveform crash regression (preview playback crash, 2026-10-14)', () => {
  beforeEach(() => { vi.stubGlobal('devicePixelRatio', 2); });
  afterEach(() => {
    window.HTMLCanvasElement.prototype.getContext = origGetContext;
    window.HTMLCanvasElement.prototype.getBoundingClientRect = origGetRect;
    vi.unstubAllGlobals();
  });

  it('does not crash when mounted in a zero-size (display:none) container', async () => {
    // Reproduces the mobile crash: the desktop mini-player waveform stays mounted
    // but is display:none under 768px, so its rect is 0x0 and barWidth/radius go negative.
    const roundRect = specRoundRect();
    mockCanvas({ width: 0, height: 0, roundRectImpl: roundRect });

    const { queryByTestId } = render(
      <Probe><Waveform audioUrl={null} progress={10} color="#FFD800" height={28} mini /></Probe>
    );

    await waitFor(() => expect(queryByTestId('crashed')).toBeNull());
    // Drawing must be skipped entirely while hidden — never hand a negative radius to roundRect
    expect(roundRect).not.toHaveBeenCalled();
  });

  it('falls back to rect() when roundRect is unavailable (Safari < 16)', async () => {
    const ctx = mockCanvas({ width: 300, height: 48, roundRectImpl: undefined });

    const { queryByTestId } = render(
      <Probe><Waveform audioUrl={null} progress={10} color="#FFD800" height={48} /></Probe>
    );

    await waitFor(() => expect(ctx.rect).toHaveBeenCalled());
    expect(queryByTestId('crashed')).toBeNull();
  });

  it('draws rounded bars with non-negative radii when visible on a modern browser', async () => {
    const roundRect = specRoundRect();
    mockCanvas({ width: 300, height: 48, roundRectImpl: roundRect });

    const { queryByTestId } = render(
      <Probe><Waveform audioUrl={null} progress={10} color="#FFD800" height={48} /></Probe>
    );

    await waitFor(() => expect(roundRect).toHaveBeenCalled());
    expect(queryByTestId('crashed')).toBeNull();
  });
});
