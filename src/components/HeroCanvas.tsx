import { useEffect, useRef, useState, memo } from 'react';

interface HeroCanvasProps {
  accentColor: string;
  vignetteDarkness: number;
  frameIndex: number;
  scrollProgress: number;
  revealProgress?: number;
  customLoadedFrames?: HTMLImageElement[];
  parallaxStrength?: number;
  disableAtmosphere?: boolean;
}

export const HeroCanvas = memo(function HeroCanvas({
  accentColor,
  vignetteDarkness,
  frameIndex,
  scrollProgress,
  revealProgress = 1,
  customLoadedFrames = [],
  parallaxStrength = 0,
  disableAtmosphere = true
}: HeroCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });
  const animFrameIdRef = useRef<number | null>(null);

  // Auto-loaded preloaded images from /frames/ or /Video 2 PNG/ if available
  const [folderFrames, setFolderFrames] = useState<HTMLImageElement[]>([]);
  const lastValidImgRef = useRef<HTMLImageElement | null>(null);
  const ambientBgImgRef = useRef<HTMLImageElement | null>(null);

  // Store live props in a ref so the canvas render loop runs continuously without tearing down on each frame
  const propsRef = useRef({
    accentColor,
    vignetteDarkness,
    frameIndex,
    scrollProgress,
    revealProgress,
    customLoadedFrames,
    folderFrames,
    parallaxStrength,
    disableAtmosphere
  });
  propsRef.current = {
    accentColor,
    vignetteDarkness,
    frameIndex,
    scrollProgress,
    revealProgress,
    customLoadedFrames,
    folderFrames,
    parallaxStrength,
    disableAtmosphere
  };

  // Helper to convert hex to rgba
  const hexToRgb = (hex: string) => {
    const clean = hex.replace('#', '');
    const bigint = parseInt(clean, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r: isNaN(r) ? 255 : r, g: isNaN(g) ? 115 : g, b: isNaN(b) ? 0 : b };
  };

  // Cache parsed RGB to avoid string parsing on every 60fps frame
  const lastHexRef = useRef('');
  const rgbRef = useRef({ r: 255, g: 115, b: 0 });
  if (lastHexRef.current !== accentColor) {
    lastHexRef.current = accentColor;
    rgbRef.current = hexToRgb(accentColor);
  }

  // Preload uploaded background ambient image
  useEffect(() => {
    const img = new Image();
    img.decoding = 'async';
    img.src = '/ambient_bg.jpg';
    img.onload = () => {
      ambientBgImgRef.current = img;
    };
  }, []);

  // Attempt to detect and preload any frames placed in standard locations
  useEffect(() => {
    let isMounted = true;

    // Test for common frame formats (frame_0001.jpg, ezgif-frame-001.jpg, 1.jpg, etc.)
    const checkAndPreloadFrames = async () => {
      const tryFormats = [
        (i: number) => `/frames/frame_${String(i).padStart(4, '0')}.jpg`,
        (i: number) => `/frames/frame_${String(i).padStart(3, '0')}.jpg`,
        (i: number) => `/frames/frame_${String(i).padStart(4, '0')}.png`,
        (i: number) => `/frames/frame_${String(i).padStart(3, '0')}.png`,
        (i: number) => `/frames/${i}.jpg`,
        (i: number) => `/frames/${i}.png`,
        (i: number) => `/Video 2 PNG/frame_${String(i).padStart(4, '0')}.png`,
        (i: number) => `/Video 2 PNG/frame_${String(i).padStart(3, '0')}.jpg`,
        (i: number) => `/Video 2 PNG/${i}.jpg`,
        (i: number) => `/Video 2 PNG/${i}.png`,
      ];

      for (const formatFn of tryFormats) {
        const testUrl = formatFn(1);
        try {
          const res = await fetch(testUrl, { method: 'HEAD' });
          const contentType = res.headers.get('content-type') || '';
          // Ensure it's an actual image, not an index.html SPA fallback
          if (res.ok && (contentType.includes('image') || testUrl.endsWith('.jpg') || testUrl.endsWith('.png'))) {
            // Exactly 144 frames exist in /frames/ (frame_0001.jpg through frame_0144.jpg)
            const maxCount = 144;
            const loadedList: HTMLImageElement[] = [];

            for (let i = 1; i <= maxCount; i++) {
              const url = formatFn(i);
              const img = new Image();
              img.decoding = 'async';
              img.src = url;
              loadedList.push(img);
            }

            if (isMounted && loadedList.length > 0) {
              setFolderFrames(loadedList);
            }
            break;
          }
        } catch {
          // Continue trying next pattern
        }
      }
    };

    checkAndPreloadFrames();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = (canvas.width = window.innerWidth * dpr);
    let height = (canvas.height = window.innerHeight * dpr);

    const handleResize = () => {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.width = window.innerWidth * dpr;
      height = canvas.height = window.innerHeight * dpr;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX / window.innerWidth;
      mouseRef.current.targetY = e.clientY / window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    handleResize();

    // 3D Particle nodes for dynamic depth
    const particleCount = 130;
    const particles: Array<{
      x: number;
      y: number;
      z: number;
      baseX: number;
      baseY: number;
      baseZ: number;
      size: number;
      speed: number;
      orbitRadius: number;
      orbitAngle: number;
      phase: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 240 + Math.random() * 320;
      particles.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
        baseX: r * Math.sin(phi) * Math.cos(theta),
        baseY: r * Math.sin(phi) * Math.sin(theta),
        baseZ: r * Math.cos(phi),
        size: Math.random() * 1.8 + 0.6,
        speed: (Math.random() * 0.002 + 0.001) * (Math.random() > 0.5 ? 1 : -1),
        orbitRadius: 180 + Math.random() * 380,
        orbitAngle: Math.random() * Math.PI * 2,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.012;

      // Smooth mouse follow (only relevant if parallax is active)
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const {
        frameIndex: curFrameIndex,
        scrollProgress: curScrollProgress,
        revealProgress: curRevealProgress = 1,
        customLoadedFrames: curCustomFrames,
        folderFrames: curFolderFrames,
        parallaxStrength: curParallax = 0,
        disableAtmosphere: curDisableAtmo = true
      } = propsRef.current;
      const rgb = rgbRef.current;

      // Priority 1: Check if user provided custom loaded image frames or preloaded folder frames
      const activeFramePool = curCustomFrames.length > 0 ? curCustomFrames : curFolderFrames;
      const hasActiveFrames = activeFramePool.length > 0;

      if (hasActiveFrames) {
        // Continuous, seamless 1:1 scroll progress mapping (zero halts, zero dead zones, zero jitter)
        const total = activeFramePool.length;
        const clampedProgress = Math.min(1, Math.max(0, curScrollProgress));

        const normalizedIndex = curFrameIndex > 0 
          ? Math.min(Math.floor((curFrameIndex / 143) * (total - 1)), total - 1)
          : Math.min(Math.floor(clampedProgress * (total - 1)), total - 1);
        
        const clampedIndex = Math.max(0, Math.min(normalizedIndex, total - 1));
        let targetImg: HTMLImageElement | null = activeFramePool[clampedIndex] || null;

        if (!targetImg || !targetImg.complete || targetImg.naturalWidth === 0) {
          targetImg = lastValidImgRef.current || activeFramePool.find(img => img.complete && img.naturalWidth > 0) || null;
        }

        if (targetImg && targetImg.complete && targetImg.naturalWidth > 0) {
          lastValidImgRef.current = targetImg;

          const p = curRevealProgress ?? 1;

          if (p < 0.999) {
            // Initial reveal card dimensions in CSS pixels, scaled by current DPR
            const cssW = width / dpr;
            const cssH = height / dpr;
            const isMobile = cssW < 768;
            const isTablet = cssW >= 768 && cssW <= 1024;

            let initW: number;
            let initH: number;

            if (isMobile) {
              initW = Math.min(cssW * 0.68, 250) * dpr;
              initH = Math.min(cssH * 0.42, 310) * dpr;
            } else if (isTablet) {
              const tabletSquare = Math.round(Math.min(cssW * 0.62, cssH * 0.55, 460));
              initW = tabletSquare * dpr;
              initH = tabletSquare * dpr;
            } else {
              initW = Math.min(cssW * 0.32, 460) * dpr;
              initH = Math.min(cssH * 0.58, 600) * dpr;
            }

            const boxW = initW + p * (width - initW);
            const boxH = initH + p * (height - initH);
            const boxX = (width - boxW) / 2;
            const boxY = (height - boxH) / 2;
            const radius = Math.max(0, (1 - p) * 16 * dpr);

            // 1. Draw ambient background image outside/behind the reveal card
            const bgImg = ambientBgImgRef.current;
            if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
              const bgImgRatio = bgImg.naturalWidth / bgImg.naturalHeight;
              const screenRatio = width / height;
              let bgW = width;
              let bgH = height;
              let bgOffX = 0;
              let bgOffY = 0;

              if (screenRatio > bgImgRatio) {
                bgW = width;
                bgH = width / bgImgRatio;
                bgOffY = (height - bgH) / 2;
              } else {
                bgH = height;
                bgW = height * bgImgRatio;
                bgOffX = (width - bgW) / 2;
              }

              ctx.save();
              ctx.globalAlpha = Math.max(0, 1 - p * 0.95);
              ctx.drawImage(bgImg, bgOffX, bgOffY, bgW, bgH);
              ctx.restore();
            } else {
              // Fallback smooth ambient gradient while image finishes loading
              const bgGrad = ctx.createRadialGradient(
                width * 0.42, height * 0.45, 50,
                width * 0.5, height * 0.5, Math.max(width, height) * 0.75
              );
              bgGrad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.38 * (1 - p)})`);
              bgGrad.addColorStop(0.35, `rgba(${Math.floor(rgb.r * 0.6)}, ${Math.floor(rgb.g * 0.3)}, 0, ${0.22 * (1 - p)})`);
              bgGrad.addColorStop(0.75, '#0a0604');
              bgGrad.addColorStop(1, '#050302');
              ctx.fillStyle = bgGrad;
              ctx.fillRect(0, 0, width, height);
            }

            // 2. Card warm glow & drop shadow
            ctx.save();
            ctx.shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.45 * (1 - p)})`;
            ctx.shadowBlur = 80 * (1 - p);
            ctx.shadowOffsetY = 15 * (1 - p);
            ctx.fillStyle = '#0e0a07';
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(boxX, boxY, boxW, boxH, radius);
            } else {
              ctx.rect(boxX, boxY, boxW, boxH);
            }
            ctx.fill();
            ctx.restore();

            // 3. Clip to rounded rectangle and draw image covering the box
            ctx.save();
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(boxX, boxY, boxW, boxH, radius);
            } else {
              ctx.rect(boxX, boxY, boxW, boxH);
            }
            ctx.clip();

            const imgRatio = targetImg.naturalWidth / targetImg.naturalHeight;
            const boxRatio = boxW / boxH;
            let renderW = boxW;
            let renderH = boxH;
            let offsetX = boxX;
            let offsetY = boxY;

            if (boxRatio > imgRatio) {
              renderW = boxW;
              renderH = boxW / imgRatio;
              offsetY = boxY + (boxH - renderH) / 2;
            } else {
              renderH = boxH;
              renderW = boxH * imgRatio;
              offsetX = boxX + (boxW - renderW) / 2;
            }

            ctx.drawImage(targetImg, offsetX, offsetY, renderW, renderH);

            // Soft bottom vignette on image so the face in the upper-center stays fully clear and bright
            if (p < 0.92) {
              const bottomVignette = ctx.createLinearGradient(boxX, boxY + boxH * 0.45, boxX, boxY + boxH);
              bottomVignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
              bottomVignette.addColorStop(1, `rgba(0, 0, 0, ${0.55 * (1 - p)})`);
              ctx.fillStyle = bottomVignette;
              ctx.fillRect(boxX, boxY + boxH * 0.45, boxW, boxH * 0.55);
            }

            // Hairline border with accent color
            if (p < 0.98) {
              ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.42 * (1 - p)})`;
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              if (ctx.roundRect) {
                ctx.roundRect(boxX, boxY, boxW, boxH, radius);
              } else {
                ctx.rect(boxX, boxY, boxW, boxH);
              }
              ctx.stroke();
            }

            ctx.restore();
          } else {
            // Fully expanded: normal full-bleed draw
            const imgRatio = targetImg.naturalWidth / targetImg.naturalHeight;
            const canvasRatio = width / height;

            let renderW = width;
            let renderH = height;
            let offsetX = 0;
            let offsetY = 0;

            if (canvasRatio > imgRatio) {
              // Screen is wider than image
              renderW = width;
              renderH = width / imgRatio;
              offsetY = (height - renderH) / 2;
            } else {
              // Screen is taller than image
              renderH = height;
              renderW = height * imgRatio;
              offsetX = (width - renderW) / 2;
            }

            // Parallax offset: uses parallaxStrength prop (default 0 = completely static, no unwanted displacement)
            const parallaxX = (mouseRef.current.x - 0.5) * curParallax;
            const parallaxY = (mouseRef.current.y - 0.5) * curParallax;

            ctx.save();
            ctx.drawImage(targetImg, offsetX + parallaxX, offsetY + parallaxY, renderW, renderH);
            ctx.restore();
          }
        }
      }

      // If frames are used and disableAtmosphere is true (default), DO NOT render any lighting, glow, rings, or sparks over the frames
      const shouldRenderAtmosphere = !hasActiveFrames || !curDisableAtmo;

      if (shouldRenderAtmosphere) {
        const activeFactor = curFrameIndex > 0 ? curFrameIndex / 144 : curScrollProgress;
        const cx = width * 0.5;
        const cy = height * 0.48;

        ctx.save();
        ctx.translate(cx, cy);

        // Procedural 3D Atmosphere overlay / fallback when NO image frames are loaded
        if (!hasActiveFrames) {
          // Ambient Radial Core Glow
          const gradient = ctx.createRadialGradient(0, 0, 10, 0, 0, 360);
          gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.22)`);
          gradient.addColorStop(0.4, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`);
          gradient.addColorStop(0.8, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.02)`);
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(0, 0, 360, 0, Math.PI * 2);
          ctx.fill();

          // Kinetic Concentric Geometry
          const ringCount = 5;
          const baseRadius = 80;

          for (let r = 0; r < ringCount; r++) {
            const currentRadius = baseRadius + r * 54;
            const angleOffset = (time * (0.18 + r * 0.04) + activeFactor * Math.PI * 2) * (r % 2 === 0 ? 1 : -1);
            const segments = 6 + r * 2;

            ctx.beginPath();
            for (let s = 0; s <= segments; s++) {
              const rad = (s / segments) * Math.PI * 2 + angleOffset;
              const px = Math.cos(rad) * currentRadius;
              const py = Math.sin(rad) * currentRadius * 0.72;

              const tiltY = py * Math.cos(0.55) - (mouseRef.current.y - 0.5) * 30;
              const finalX = px + (mouseRef.current.x - 0.5) * 40;
              const finalY = tiltY;

              if (s === 0) ctx.moveTo(finalX, finalY);
              else ctx.lineTo(finalX, finalY);
            }

            const alpha = Math.max(0.08, 0.35 - r * 0.06);
            ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
            ctx.lineWidth = r === 0 ? 1.8 : 1.0;
            ctx.stroke();
          }

          // Central Wireframe Octahedron/Gem Core
          const coreSize = 90 * (1 + Math.sin(time * 2) * 0.05);
          const vertices: [number, number, number][] = [
            [0, -coreSize, 0],
            [coreSize, 0, 0],
            [0, 0, coreSize],
            [-coreSize, 0, 0],
            [0, 0, -coreSize],
            [0, coreSize, 0],
          ];

          const rotCoreX = time * 0.7 + activeFactor * Math.PI * 3;
          const rotCoreY = time * 0.9 + activeFactor * Math.PI * 2;

          const projected = vertices.map(([vx, vy, vz]) => {
            const y1 = vy * Math.cos(rotCoreX) - vz * Math.sin(rotCoreX);
            const z1 = vy * Math.sin(rotCoreX) + vz * Math.cos(rotCoreX);
            const x2 = vx * Math.cos(rotCoreY) + z1 * Math.sin(rotCoreY);
            const z2 = -vx * Math.sin(rotCoreY) + z1 * Math.cos(rotCoreY);

            const fov = 400;
            const scale = fov / (fov + z2 + 100);
            return { x: x2 * scale, y: y1 * scale, z: z2 };
          });

          const edges = [
            [0, 1], [0, 2], [0, 3], [0, 4],
            [5, 1], [5, 2], [5, 3], [5, 4],
            [1, 2], [2, 3], [3, 4], [4, 1]
          ];

          ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.55)`;
          ctx.lineWidth = 1.4;
          edges.forEach(([i1, i2]) => {
            ctx.beginPath();
            ctx.moveTo(projected[i1].x, projected[i1].y);
            ctx.lineTo(projected[i2].x, projected[i2].y);
            ctx.stroke();
          });

          // Core vertex lights
          projected.forEach(p => {
            ctx.fillStyle = `rgba(255, 255, 255, 0.8)`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
            ctx.fill();
          });
        }

        ctx.restore();

        // Sparks overlay only if no frames are present
        if (!hasActiveFrames) {
          particles.forEach((p) => {
            p.orbitAngle += p.speed;
            const ox = cx + Math.cos(p.orbitAngle + activeFactor * 2) * p.orbitRadius;
            const oy = cy + Math.sin(p.orbitAngle * 1.5) * (p.orbitRadius * 0.45);

            const twinkle = Math.sin(time * 3 + p.phase) * 0.4 + 0.6;
            const alpha = Math.min(0.8, Math.max(0.08, twinkle * 0.7));

            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
            ctx.beginPath();
            ctx.arc(ox, oy, p.size, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, []);

  // When frames are loaded, keep the canvas pure without any heavy artificial dark overlays
  const hasFrames = customLoadedFrames.length > 0 || folderFrames.length > 0;
  const v = vignetteDarkness / 100;
  const vignetteStyle = hasFrames
    ? { display: 'none' } // Completely removes any atmospheric darkness/tint/vignette over user frames
    : {
        background: `
          radial-gradient(ellipse 75% 70% at 50% 48%, transparent 0%, rgba(8,8,11,${v * 0.25}) 52%, rgba(8,8,11,${v}) 100%),
          linear-gradient(to right, rgba(8,8,11,${v * 0.65}) 0%, transparent 28%, transparent 72%, rgba(8,8,11,${v * 0.65}) 100%),
          linear-gradient(to bottom, rgba(8,8,11,${v * 0.55}) 0%, transparent 18%, transparent 80%, rgba(8,8,11,${v * 0.85}) 100%)
        `
      };

  return (
    <div className="fixed-canvas-bg" id="fixedCanvasBg" aria-hidden="true">
      <canvas id="heroCanvas" ref={canvasRef} />
      <div className="canvas-vignette" style={vignetteStyle} />
    </div>
  );
});
