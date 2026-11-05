'use client';

import React, { useEffect, useRef } from 'react';
import './TechText.css';

const LABEL_FONT = '10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const FALLOFF_STEPS = 8;
const SPRING = 320;
const DAMPING = 22;

const approach = (current: number, target: number, dt: number, seconds: number) =>
  current + (target - current) * (1 - Math.exp(-dt / seconds));

const hexToRgb = (hex: string): [number, number, number] => {
  let h = String(hex || '').replace('#', '');
  if (h.length === 3) h = h.replace(/./g, c => c + c);
  const n = parseInt(h.slice(0, 6), 16);
  return Number.isNaN(n) ? [255, 255, 255] : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const rgba = (hex: string, alpha: number) => {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const noise = (...values: number[]) => {
  let h = 2166136261;
  for (const value of values) {
    h = Math.imul(h ^ (value | 0), 16777619);
    h ^= h >>> 13;
    h = Math.imul(h, 0x5bd1e995);
    h ^= h >>> 15;
  }
  return (h >>> 0) / 4294967296;
};

const signed = (value: number) => (value > 0 ? `+${value}` : value < 0 ? `−${-value}` : '0');

export interface TechTextProps {
  text?: string;
  fontFamily?: string;
  fontWeight?: string | number;
  fontSize?: number;
  letterSpacing?: number;
  color?: string;
  accentColor?: string;
  reach?: number;
  softness?: number;
  dashLength?: number;
  dashGap?: number;
  strokeWidth?: number;
  lineStyle?: 'dashed' | 'solid';
  reveal?: 'letter' | 'area';
  specks?: number;
  selection?: boolean;
  labels?: boolean;
  draggable?: boolean;
  sweep?: boolean;
  speed?: number;
  align?: 'left' | 'center' | 'right';
  className?: string;
  style?: React.CSSProperties;
}

interface GlyphBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface GlyphSprite {
  image: HTMLCanvasElement;
  left: number;
  top: number;
}

interface Glyph {
  char: string;
  x: number;
  box: GlyphBox;
  offset: { x: number; y: number };
  velocity: { x: number; y: number };
  outline: number;
  index: number;
  fill: GlyphSprite;
  dashes: GlyphSprite;
}

interface WordLayout {
  size: number;
  baseline: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface Settings {
  text: string;
  fontFamily: string;
  fontWeight: string | number;
  fontSize: number;
  letterSpacing: number;
  color: string;
  accentColor: string;
  reach: number;
  softness: number;
  dashLength: number;
  dashGap: number;
  strokeWidth: number;
  lineStyle: 'dashed' | 'solid';
  reveal: 'letter' | 'area';
  specks: number;
  selection: boolean;
  labels: boolean;
  draggable: boolean;
  sweep: boolean;
  speed: number;
  align: 'left' | 'center' | 'right';
}

export const TechText: React.FC<TechTextProps> = ({
  text = 'React Bits',
  fontFamily = '',
  fontWeight = 600,
  fontSize = 150,
  letterSpacing = -0.05,
  color = '#ffffff',
  accentColor = '#ffffff',
  reach = 200,
  softness = 0.7,
  dashLength = 4,
  dashGap = 2,
  strokeWidth = 1.5,
  lineStyle = 'dashed',
  reveal = 'letter',
  specks = 15,
  selection = true,
  labels = true,
  draggable = true,
  sweep = false,
  speed = 1,
  align = 'center',
  className = '',
  style
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const settingsRef = useRef<Settings | null>(null);
  const wakeRef = useRef<() => void>(() => {});

  useEffect(() => {
    settingsRef.current = {
      text,
      fontFamily,
      fontWeight,
      fontSize,
      letterSpacing,
      color,
      accentColor,
      reach,
      softness,
      dashLength,
      dashGap,
      strokeWidth,
      lineStyle,
      reveal,
      specks,
      selection,
      labels,
      draggable,
      sweep,
      speed,
      align
    };
    wakeRef.current();
  });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const scratch = document.createElement('canvas');
    const scratchCtx = scratch.getContext('2d');
    if (!container || !canvas || !ctx || !scratchCtx) return undefined;

    const dragCanvas = document.createElement('canvas');
    dragCanvas.className = 'tech-text-drag-overlay';
    dragCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:99999;display:none;';
    document.body.appendChild(dragCanvas);
    const dragCtx = dragCanvas.getContext('2d');

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let width = 1;
    let height = 1;
    let dpr = 1;
    let raf = 0;
    let last = performance.now();
    let visible = true;
    let alive = true;
    let layoutKey = '';
    let requestedFont = '';
    let word: WordLayout | null = null;
    let glyphs: Glyph[] = [];
    let previousSize = 0;
    let presence = 0;
    let clock = 0;
    let pulse = 0;
    let placed = false;
    let dragging = -1;
    const pointer = { x: 0, y: 0, inside: false };
    const grab = { x: 0, y: 0 };
    const lens = { x: 0, y: 0 };
    const frame = { x1: 0, y1: 0, x2: 0, y2: 0, alpha: 0, index: -1 };

    const refreshFonts = () => {
      layoutKey = '';
      wakeRef.current();
    };

    const family = (s: Settings) => s.fontFamily || getComputedStyle(container).fontFamily || 'sans-serif';
    const fontFor = (s: Settings, size: number) => `${s.fontWeight} ${size}px ${family(s)}`;

    const setFont = (target: CanvasRenderingContext2D, s: Settings, size: number) => {
      target.font = fontFor(s, size);
      if ('letterSpacing' in target) {
        (target as any).letterSpacing = `${s.letterSpacing * size}px`;
      }
      target.textAlign = 'left';
      target.textBaseline = 'alphabetic';
    };

    const sprite = (s: Settings, view: WordLayout, glyph: { char: string; box: GlyphBox; x: number }, stroke: boolean): GlyphSprite => {
      const pad = Math.ceil(s.strokeWidth * 2 + 4);
      const left = glyph.box.x1 - pad;
      const top = glyph.box.y1 - pad;
      const w = glyph.box.x2 - glyph.box.x1 + pad * 2;
      const h = glyph.box.y2 - glyph.box.y1 + pad * 2;
      const image = document.createElement('canvas');
      image.width = Math.max(1, Math.ceil(w * dpr));
      image.height = Math.max(1, Math.ceil(h * dpr));
      const c = image.getContext('2d');
      if (!c) return { image, left, top };
      c.setTransform(dpr, 0, 0, dpr, -left * dpr, -top * dpr);
      setFont(c, s, view.size);
      if (stroke) {
        c.lineJoin = 'round';
        c.lineWidth = s.strokeWidth * 2;
        c.lineCap = 'butt';
        c.strokeStyle = s.color;
        if (s.lineStyle !== 'solid') c.setLineDash([Math.max(1, s.dashLength), Math.max(1, s.dashGap)]);
        c.strokeText(glyph.char, glyph.x, view.baseline);
        c.setLineDash([]);
        c.globalCompositeOperation = 'destination-out';
        c.fillStyle = '#000000';
        c.fillText(glyph.char, glyph.x, view.baseline);
        c.globalCompositeOperation = 'source-over';
      } else {
        c.fillStyle = s.color;
        c.fillText(glyph.char, glyph.x, view.baseline);
      }
      return { image, left, top };
    };

    const ensureLayout = (s: Settings) => {
      const probe = scratchCtx;
      setFont(probe, s, s.fontSize);
      let m = probe.measureText(s.text);
      const fit = Math.min(
        1,
        (width * 0.96) / Math.max(m.actualBoundingBoxLeft + m.actualBoundingBoxRight, 1),
        (height * 0.85) / Math.max(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent, 1)
      );
      const size = s.fontSize * fit;
      const key = [
        s.text,
        family(s),
        s.fontWeight,
        Math.round(size),
        s.letterSpacing,
        s.color,
        s.dashLength,
        s.dashGap,
        s.strokeWidth,
        s.lineStyle,
        s.align,
        Math.round(width),
        Math.round(height),
        dpr
      ].join('|');
      if (key === layoutKey && word) return word;
      layoutKey = key;
      const wanted = fontFor(s, 64);
      if (document.fonts && wanted !== requestedFont) {
        requestedFont = wanted;
        document.fonts.load(wanted, s.text).then(refreshFonts, refreshFonts);
      }

      setFont(probe, s, size);
      m = probe.measureText(s.text);
      const inkWidth = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
      const inkHeight = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
      const x = s.align === 'left'
        ? m.actualBoundingBoxLeft + 4
        : s.align === 'right'
        ? width - m.actualBoundingBoxRight - 4
        : (width - inkWidth) / 2 + m.actualBoundingBoxLeft;
      const baseline = (height - inkHeight) / 2 + m.actualBoundingBoxAscent;
      const next: WordLayout = {
        size,
        baseline,
        left: x - m.actualBoundingBoxLeft,
        right: x + m.actualBoundingBoxRight,
        top: baseline - m.actualBoundingBoxAscent,
        bottom: baseline + m.actualBoundingBoxDescent
      };
      word = next;

      const chars = Array.from(s.text);
      const previous = glyphs;
      glyphs = [];
      let prefix = '';
      chars.forEach((char, i) => {
        prefix += char;
        const own = probe.measureText(char);
        const gx = x + probe.measureText(prefix).width - own.width;
        if (!char.trim()) return;
        const base = {
          char,
          x: gx,
          box: {
            x1: gx - own.actualBoundingBoxLeft,
            y1: baseline - own.actualBoundingBoxAscent,
            x2: gx + own.actualBoundingBoxRight,
            y2: baseline + own.actualBoundingBoxDescent
          }
        };
        const kept = previous[glyphs.length];
        const canReuse = kept?.char === char && previousSize === size;
        const fill = canReuse && kept?.fill ? kept.fill : sprite(s, next, base, false);
        const dashes = canReuse && kept?.dashes ? kept.dashes : sprite(s, next, base, true);
        const pad = Math.ceil(s.strokeWidth * 2 + 4);
        fill.left = base.box.x1 - pad;
        fill.top = base.box.y1 - pad;
        dashes.left = base.box.x1 - pad;
        dashes.top = base.box.y1 - pad;
        glyphs.push({
          ...base,
          offset: kept?.char === char ? kept.offset : { x: 0, y: 0 },
          velocity: kept?.char === char ? kept.velocity : { x: 0, y: 0 },
          outline: kept?.char === char ? kept.outline : 0,
          index: i,
          fill,
          dashes
        });
      });
      previousSize = size;
      if (dragging >= glyphs.length) dragging = -1;
      if (frame.index >= glyphs.length) frame.index = -1;
      return next;
    };

    const glyphAt = (x: number, y: number) => {
      if (!word || y < word.top - 24 || y > word.bottom + 24) return -1;
      let best = -1;
      let bestDistance = Infinity;
      glyphs.forEach((glyph, i) => {
        const x1 = glyph.box.x1 + glyph.offset.x;
        const x2 = glyph.box.x2 + glyph.offset.x;
        const d = x < x1 ? x1 - x : x > x2 ? x - x2 : 0;
        if (d < bestDistance) {
          bestDistance = d;
          best = i;
        }
      });
      return bestDistance < 28 ? best : -1;
    };

    const falloff = (target: CanvasRenderingContext2D, cx: number, cy: number, radius: number, strength: number, softnessValue: number) => {
      const inner = Math.min(1, Math.max(0, 1 - softnessValue));
      const gradient = target.createRadialGradient(cx, cy, 0, cx, cy, radius);
      gradient.addColorStop(0, `rgba(0, 0, 0, ${strength})`);
      if (inner > 0.995) {
        gradient.addColorStop(0.995, `rgba(0, 0, 0, ${strength})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        return gradient;
      }
      for (let i = 0; i <= FALLOFF_STEPS; i++) {
        const t = i / FALLOFF_STEPS;
        const eased = t * t * (3 - 2 * t);
        gradient.addColorStop(inner + (1 - inner) * t, `rgba(0, 0, 0, ${strength * (1 - eased)})`);
      }
      return gradient;
    };

    const blit = (target: CanvasRenderingContext2D, art: GlyphSprite, dx: number, dy: number, originX: number, originY: number) => {
      target.drawImage(
        art.image,
        Math.round((art.left + dx) * dpr - originX),
        Math.round((art.top + dy) * dpr - originY)
      );
    };

    const drawReveal = (s: Settings) => {
      const radius = s.reach * dpr;
      const cx = lens.x * dpr;
      const cy = lens.y * dpr;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = falloff(ctx, cx, cy, radius, presence, s.softness);
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
      ctx.globalCompositeOperation = 'source-over';

      const x0 = Math.max(0, Math.floor(cx - radius));
      const y0 = Math.max(0, Math.floor(cy - radius));
      const x1 = Math.min(canvas.width, Math.ceil(cx + radius));
      const y1 = Math.min(canvas.height, Math.ceil(cy + radius));
      if (x1 <= x0 || y1 <= y0) return;
      const w = x1 - x0;
      const h = y1 - y0;
      if (scratch.width < w || scratch.height < h) {
        scratch.width = Math.max(scratch.width, w);
        scratch.height = Math.max(scratch.height, h);
      }
      scratchCtx.setTransform(1, 0, 0, 1, 0, 0);
      scratchCtx.globalCompositeOperation = 'source-over';
      scratchCtx.clearRect(0, 0, w, h);
      for (const glyph of glyphs) blit(scratchCtx, glyph.dashes, glyph.offset.x, glyph.offset.y, x0, y0);
      scratchCtx.globalCompositeOperation = 'destination-in';
      scratchCtx.fillStyle = falloff(scratchCtx, cx - x0, cy - y0, radius, 1, s.softness);
      scratchCtx.fillRect(0, 0, w, h);
      scratchCtx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = presence;
      ctx.drawImage(scratch, 0, 0, w, h, x0, y0, w, h);
      ctx.globalAlpha = 1;
    };

    const crisp = (value: number) => (Math.round(value * dpr) + 0.5) / dpr;

    const perimeterPoint = (distance: number, w: number, h: number): [number, number, number, number] => {
      let d = ((distance % (2 * (w + h))) + 2 * (w + h)) % (2 * (w + h));
      if (d < w) return [frame.x1 + d, frame.y1, 0, -1];
      d -= w;
      if (d < h) return [frame.x2, frame.y1 + d, 1, 0];
      d -= h;
      if (d < w) return [frame.x2 - d, frame.y2, 0, 1];
      d -= w;
      return [frame.x1, frame.y2 - d, -1, 0];
    };

    const drawSpecks = (s: Settings, a: number) => {
      const w = frame.x2 - frame.x1;
      const h = frame.y2 - frame.y1;
      if (w < 2 || h < 2) return;
      const perimeter = 2 * (w + h);
      const seed = frame.index + 1;
      const grid = 3;

      for (let k = 0; k < s.specks; k++) {
        const period = 0.5 + noise(seed, k, 11) * 1.2;
        const t = pulse / period + noise(seed, k, 17);
        const cycle = Math.floor(t);
        const life = t - cycle;
        if (life > 0.7) continue;
        const [px, py, nx, ny] = perimeterPoint(noise(seed, k, cycle) * perimeter, w, h);
        const pick = noise(seed, k, cycle, 2);
        const size = pick < 0.46 ? 2 : pick < 0.7 ? 3 : pick < 0.84 ? 5 : pick < 0.94 ? 8 : 11;
        const large = size >= 8;
        const out = (large ? 9 : 4) + Math.floor(noise(seed, k, cycle, 1) * 5) * grid;
        const x = frame.x1 + Math.round((px + nx * out - frame.x1) / grid) * grid;
        const y = frame.y1 + Math.round((py + ny * out - frame.y1) / grid) * grid;
        const tone = noise(seed, k, cycle, 3);
        const blink = life < 0.06 || (life > 0.32 && life < 0.36) ? 0.35 : 1;
        const alpha = a * (large ? 0.3 + 0.4 * tone : 0.3 + 0.6 * tone) * blink;
        const left = Math.round(x - size / 2);
        const top = Math.round(y - size / 2);
        if (tone < 0.26 || (large && tone < 0.78)) {
          ctx.strokeStyle = rgba(s.accentColor, alpha);
          ctx.strokeRect(left + 0.5, top + 0.5, size, size);
          if (large && tone > 0.5) {
            ctx.fillStyle = rgba(s.accentColor, alpha);
            ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 2, 2);
          }
        } else {
          ctx.fillStyle = rgba(s.accentColor, alpha);
          ctx.fillRect(left, top, size, size);
        }
      }

      for (let j = 0; j < 2; j++) {
        const head = (pulse * 0.42 * s.speed + j * 0.5) * perimeter;
        for (let i = 0; i < 4; i++) {
          const [x, y] = perimeterPoint(head - i * 6, w, h);
          const size = i === 0 ? 3 : 2;
          ctx.fillStyle = rgba(s.accentColor, a * [0.95, 0.55, 0.32, 0.16][i]);
          ctx.fillRect(Math.round(x - size / 2), Math.round(y - size / 2), size, size);
        }
      }
    };

    const drawFrame = (s: Settings) => {
      const glyph = glyphs[frame.index];
      if (!glyph || frame.alpha < 0.01) return;
      const a = frame.alpha;
      const x1 = crisp(frame.x1);
      const y1 = crisp(frame.y1);
      const x2 = crisp(frame.x2);
      const y2 = crisp(frame.y2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const moved = Math.hypot(glyph.offset.x, glyph.offset.y);
      if (moved > 1) {
        const hx = (glyph.box.x1 + glyph.box.x2) / 2;
        const hy = (glyph.box.y1 + glyph.box.y2) / 2;
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(hx + glyph.offset.x, hy + glyph.offset.y);
        ctx.setLineDash([3, 4]);
        ctx.lineWidth = 1;
        ctx.strokeStyle = rgba(s.accentColor, 0.45 * a);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.rect(Math.round(hx) - 2, Math.round(hy) - 2, 4, 4);
        ctx.fillStyle = rgba(s.accentColor, 0.7 * a);
        ctx.fill();
      }

      ctx.beginPath();
      ctx.rect(x1, y1, x2 - x1, y2 - y1);
      ctx.lineWidth = 1;
      ctx.strokeStyle = rgba(s.accentColor, 0.5 * a);
      ctx.stroke();

      ctx.beginPath();
      for (const [cx, cy] of [
        [x1, y1],
        [x2, y1],
        [x2, y2],
        [x1, y2]
      ]) {
        ctx.rect(Math.round(cx) - 2, Math.round(cy) - 2, 5, 5);
      }
      ctx.fillStyle = rgba(s.accentColor, 0.95 * a);
      ctx.fill();

      if (s.specks > 0) {
        ctx.lineWidth = 1;
        drawSpecks(s, a);
      }

      if (!s.labels) return;
      ctx.font = LABEL_FONT;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = rgba(s.accentColor, 0.62 * a);
      const label =
        moved > 1
          ? `${signed(Math.round(glyph.offset.x))}, ${signed(Math.round(-glyph.offset.y))}`
          : `${glyph.char}  ${Math.round(glyph.box.x2 - glyph.box.x1)} × ${Math.round(glyph.box.y2 - glyph.box.y1)}`;
      ctx.fillText(label, Math.round(frame.x1), Math.round(frame.y1) - 7);
    };

    const tick = (now: number) => {
      raf = 0;
      const s = settingsRef.current;
      if (!s) return;
      const curW = Math.max(1, container.clientWidth);
      const curH = Math.max(1, container.clientHeight);
      if (curW !== width || curH !== height) {
        width = curW;
        height = curH;
        layoutKey = '';
      }
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      const view = ensureLayout(s);

      const sweeping = s.sweep && !reducedMotion && !pointer.inside && dragging < 0;
      if (sweeping) clock += dt * s.speed;
      pulse += dt;
      let targetX = pointer.x;
      let targetY = pointer.y;
      if (sweeping) {
        targetX = view.left + (view.right - view.left) * (0.5 - 0.5 * Math.cos(clock * 0.45));
        targetY = view.top + (view.bottom - view.top) * (0.45 + 0.1 * Math.sin(clock * 0.8));
      }
      const active = pointer.inside || sweeping || dragging >= 0;
      if (active && !placed) {
        lens.x = targetX;
        lens.y = targetY;
      }
      if (active) {
        const lag = pointer.inside ? 0.05 : 0.22;
        lens.x = approach(lens.x, targetX, dt, lag);
        lens.y = approach(lens.y, targetY, dt, lag);
      }
      placed = active;
      presence = approach(presence, s.reveal === 'area' && active && dragging < 0 ? 1 : 0, dt, 0.16);

      let moving = false;
      glyphs.forEach((glyph, i) => {
        if (i === dragging) {
          glyph.offset.x = approach(glyph.offset.x, pointer.x - grab.x, dt, 0.03);
          glyph.offset.y = approach(glyph.offset.y, pointer.y - grab.y, dt, 0.03);
          glyph.velocity.x = 0;
          glyph.velocity.y = 0;
          moving = true;
          return;
        }
        const { offset, velocity } = glyph;
        if (Math.abs(offset.x) < 0.05 && Math.abs(offset.y) < 0.05 && Math.hypot(velocity.x, velocity.y) < 0.5) {
          offset.x = 0;
          offset.y = 0;
          velocity.x = 0;
          velocity.y = 0;
          return;
        }
        velocity.x += (-SPRING * offset.x - DAMPING * velocity.x) * dt;
        velocity.y += (-SPRING * offset.y - DAMPING * velocity.y) * dt;
        offset.x += velocity.x * dt;
        offset.y += velocity.y * dt;
        moving = true;
      });

      const focus = dragging >= 0 ? dragging : active ? glyphAt(lens.x, lens.y) : -1;
      if (focus >= 0 && s.selection) {
        const glyph = glyphs[focus];
        const bx1 = glyph.box.x1 + glyph.offset.x - 6;
        const by1 = glyph.box.y1 + glyph.offset.y - 6;
        const bx2 = glyph.box.x2 + glyph.offset.x + 6;
        const by2 = glyph.box.y2 + glyph.offset.y + 6;
        if (frame.index < 0 || frame.alpha < 0.02) {
          frame.x1 = bx1;
          frame.y1 = by1;
          frame.x2 = bx2;
          frame.y2 = by2;
        }
        const glide = focus === dragging ? 0.02 : 0.08;
        frame.x1 = approach(frame.x1, bx1, dt, glide);
        frame.y1 = approach(frame.y1, by1, dt, glide);
        frame.x2 = approach(frame.x2, bx2, dt, glide);
        frame.y2 = approach(frame.y2, by2, dt, glide);
        frame.index = focus;
      }
      frame.alpha = approach(frame.alpha, focus >= 0 && s.selection ? 1 : 0, dt, 0.1);

      glyphs.forEach((glyph, i) => {
        const target = s.reveal === 'letter' && i === focus && i !== dragging ? 1 : 0;
        glyph.outline = approach(glyph.outline, target, dt, 0.09);
        if (Math.abs(glyph.outline - target) > 0.002) moving = true;
        else glyph.outline = target;
      });

      if (s.draggable) container.style.cursor = dragging >= 0 ? 'grabbing' : focus >= 0 && pointer.inside ? 'grab' : '';

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const draggedIndex = dragging >= 0 ? dragging : glyphs.findIndex(g => Math.hypot(g.offset.x, g.offset.y) > 0.5);

      for (let i = 0; i < glyphs.length; i++) {
        const glyph = glyphs[i];
        if (i === draggedIndex) {
          ctx.globalAlpha = 0.5;
          blit(ctx, glyph.dashes, 0, 0, 0, 0);
          ctx.globalAlpha = 1;
        } else {
          if (glyph.outline < 0.999) {
            ctx.globalAlpha = 1 - glyph.outline;
            blit(ctx, glyph.fill, glyph.offset.x, glyph.offset.y, 0, 0);
          }
          if (glyph.outline > 0.001) {
            ctx.globalAlpha = glyph.outline;
            blit(ctx, glyph.dashes, glyph.offset.x, glyph.offset.y, 0, 0);
          }
          ctx.globalAlpha = 1;
        }
      }

      if (presence > 0.001) drawReveal(s);
      if (draggedIndex < 0) {
        drawFrame(s);
      }

      if (draggedIndex >= 0 && dragCtx) {
        if (dragCanvas.style.display !== 'block') {
          dragCanvas.style.display = 'block';
        }
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        const targetDW = Math.round(winW * dpr);
        const targetDH = Math.round(winH * dpr);
        if (dragCanvas.width !== targetDW || dragCanvas.height !== targetDH) {
          dragCanvas.width = targetDW;
          dragCanvas.height = targetDH;
        }

        dragCtx.setTransform(1, 0, 0, 1, 0, 0);
        dragCtx.clearRect(0, 0, dragCanvas.width, dragCanvas.height);
        dragCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const rect = container.getBoundingClientRect();
        const curW = container.clientWidth || width;
        const curH = container.clientHeight || height;
        const zoomX = rect.width > 0 ? rect.width / curW : 1;
        const zoomY = rect.height > 0 ? rect.height / curH : 1;

        const dg = glyphs[draggedIndex];
        const pad = Math.ceil(s.strokeWidth * 2 + 4);

        const hx = (dg.box.x1 + dg.box.x2) / 2;
        const hy = (dg.box.y1 + dg.box.y2) / 2;
        const originScreenX = rect.left + hx * zoomX;
        const originScreenY = rect.top + hy * zoomY;

        const dragScreenX = rect.left + (hx + dg.offset.x) * zoomX;
        const dragScreenY = rect.top + (hy + dg.offset.y) * zoomY;

        const spriteScreenLeft = rect.left + (dg.box.x1 - pad + dg.offset.x) * zoomX;
        const spriteScreenTop = rect.top + (dg.box.y1 - pad + dg.offset.y) * zoomY;
        const spriteW = (dg.box.x2 - dg.box.x1 + pad * 2) * zoomX;
        const spriteH = (dg.box.y2 - dg.box.y1 + pad * 2) * zoomY;

        const moved = Math.hypot(dg.offset.x, dg.offset.y);

        if (moved > 1) {
          dragCtx.beginPath();
          dragCtx.moveTo(originScreenX, originScreenY);
          dragCtx.lineTo(dragScreenX, dragScreenY);
          dragCtx.setLineDash([3, 4]);
          dragCtx.lineWidth = 1.5;
          dragCtx.strokeStyle = rgba(s.accentColor, 0.45);
          dragCtx.stroke();
          dragCtx.setLineDash([]);

          dragCtx.beginPath();
          dragCtx.rect(Math.round(originScreenX) - 2, Math.round(originScreenY) - 2, 4, 4);
          dragCtx.fillStyle = rgba(s.accentColor, 0.7);
          dragCtx.fill();
        }

        dragCtx.drawImage(
          dg.fill.image,
          spriteScreenLeft,
          spriteScreenTop,
          spriteW,
          spriteH
        );

        const fx1 = rect.left + (dg.box.x1 + dg.offset.x - 6) * zoomX;
        const fy1 = rect.top + (dg.box.y1 + dg.offset.y - 6) * zoomY;
        const fx2 = rect.left + (dg.box.x2 + dg.offset.x + 6) * zoomX;
        const fy2 = rect.top + (dg.box.y2 + dg.offset.y + 6) * zoomY;

        dragCtx.beginPath();
        dragCtx.rect(fx1, fy1, fx2 - fx1, fy2 - fy1);
        dragCtx.lineWidth = 1;
        dragCtx.strokeStyle = rgba(s.accentColor, 0.5);
        dragCtx.stroke();

        for (const [cx, cy] of [
          [fx1, fy1],
          [fx2, fy1],
          [fx2, fy2],
          [fx1, fy2]
        ]) {
          dragCtx.beginPath();
          dragCtx.rect(Math.round(cx) - 2, Math.round(cy) - 2, 5, 5);
          dragCtx.fillStyle = rgba(s.accentColor, 0.95);
          dragCtx.fill();
        }

        if (s.labels) {
          dragCtx.font = LABEL_FONT;
          dragCtx.textAlign = 'left';
          dragCtx.textBaseline = 'bottom';
          dragCtx.fillStyle = rgba(s.accentColor, 0.75);
          const label = `${signed(Math.round(dg.offset.x))}, ${signed(Math.round(-dg.offset.y))}`;
          dragCtx.fillText(label, Math.round(fx1), Math.round(fy1) - 7);
        }
      } else if (dragCanvas.style.display !== 'none') {
        dragCanvas.style.display = 'none';
      }

      const settling =
        moving ||
        (draggedIndex >= 0) ||
        Math.abs(presence - (s.reveal === 'area' && active && dragging < 0 ? 1 : 0)) > 0.002 ||
        (frame.alpha > 0.01 && frame.alpha < 0.99);
      if ((active || settling) && visible && alive) raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (raf || !visible || !alive) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    wakeRef.current = wake;

    const resize = () => {
      width = Math.max(1, container.clientWidth);
      height = Math.max(1, container.clientHeight);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetCanvasW = Math.round(width * dpr);
      const targetCanvasH = Math.round(height * dpr);
      if (canvas.width !== targetCanvasW || canvas.height !== targetCanvasH) {
        canvas.width = targetCanvasW;
        canvas.height = targetCanvasH;
      }
      layoutKey = '';
      tick(performance.now());
    };

    const locate = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const curWidth = container.clientWidth || width;
      const curHeight = container.clientHeight || height;
      const scaleX = rect.width > 0 ? curWidth / rect.width : 1;
      const scaleY = rect.height > 0 ? curHeight / rect.height : 1;
      pointer.x = (e.clientX - rect.left) * scaleX;
      pointer.y = (e.clientY - rect.top) * scaleY;
    };
    const onMove = (e: PointerEvent) => {
      locate(e);
      pointer.inside = true;
      wake();
    };
    const onLeave = () => {
      if (dragging >= 0) return;
      pointer.inside = false;
      wake();
    };
    const onDown = (e: PointerEvent) => {
      locate(e);
      pointer.inside = true;
      const s = settingsRef.current;
      if (s?.draggable && (e.pointerType !== 'mouse' || e.button === 0)) {
        const index = glyphAt(pointer.x, pointer.y);
        if (index >= 0) {
          dragging = index;
          grab.x = pointer.x - glyphs[index].offset.x;
          grab.y = pointer.y - glyphs[index].offset.y;
          container.setPointerCapture?.(e.pointerId);
        }
      }
      wake();
    };
    const onUp = (e: PointerEvent) => {
      if (dragging >= 0) {
        dragging = -1;
        container.releasePointerCapture?.(e.pointerId);
        const rect = container.getBoundingClientRect();
        pointer.inside =
          e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      }
      wake();
    };

    container.addEventListener('pointermove', onMove, { passive: true });
    container.addEventListener('pointerenter', onMove, { passive: true });
    container.addEventListener('pointerdown', onDown, { passive: true });
    container.addEventListener('pointerup', onUp, { passive: true });
    container.addEventListener('pointercancel', onUp, { passive: true });
    container.addEventListener('pointerleave', onLeave, { passive: true });

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      wake();
    });
    intersectionObserver.observe(container);
    if (document.fonts) document.fonts.ready.then(refreshFonts, refreshFonts);

    resize();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      wakeRef.current = () => {};
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      if (dragCanvas.parentNode) {
        dragCanvas.parentNode.removeChild(dragCanvas);
      }
      container.removeEventListener('pointermove', onMove);
      container.removeEventListener('pointerenter', onMove);
      container.removeEventListener('pointerdown', onDown);
      container.removeEventListener('pointerup', onUp);
      container.removeEventListener('pointercancel', onUp);
      container.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div ref={containerRef} className={`tech-text ${className}`.trim()} style={style} role="img" aria-label={text}>
      <canvas ref={canvasRef} className="tech-text-canvas" />
    </div>
  );
};

export default TechText;
