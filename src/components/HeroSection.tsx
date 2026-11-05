import { useEffect, useRef, useState, memo } from 'react';
import { ChevronDown, FileText } from 'lucide-react';
import { PortfolioContent } from '../types';
import { TechText } from './TechText';
import { SpecularButton } from './SpecularButton';

interface HeroSectionProps {
  content: PortfolioContent;
  inlineEdit?: boolean;
  onTextChange?: (field: string, value: string, statIndex?: number) => void;
  revealProgress?: number;
  onExpandClick?: () => void;
  onResumeClick?: () => void;
}

export const HeroSection = memo(function HeroSection({
  content,
  inlineEdit = false,
  onTextChange = () => {},
  revealProgress = 1,
  onExpandClick,
  onResumeClick
}: HeroSectionProps) {
  const { theme, typography } = content;
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const h1Ref = useRef<HTMLHeadingElement | null>(null);
  const [centerOffset, setCenterOffset] = useState({ x: 0, y: 0 });

  const p = revealProgress;

  const alignment = typography.nameAlignment || 'diagonal';
  const finalSpread = typography.nameDiagonalSpread ?? 420;
  const beginningSpread = typography.nameBeginningDiagonalSpread ?? finalSpread;
  
  const isMobileWidth = typeof window !== 'undefined' && window.innerWidth < 768;
  const isTabletWidth = typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth <= 1024;
  const tabletSquareSpread = typeof window !== 'undefined' 
    ? Math.round(Math.min(window.innerWidth * 0.62, window.innerHeight * 0.55, 460)) 
    : 420;

  const effectiveBeginningSpread = isMobileWidth 
    ? Math.min(window.innerWidth - 64, 250) 
    : isTabletWidth
    ? Math.min(tabletSquareSpread - 56, 360)
    : beginningSpread;
  const effectiveFinalSpread = isMobileWidth 
    ? Math.min(window.innerWidth - 48, 290) 
    : isTabletWidth
    ? Math.max(finalSpread, Math.min(typeof window !== 'undefined' ? window.innerWidth * 0.55 : 460, 520))
    : finalSpread;
  const currentSpread = (1 - p) * effectiveBeginningSpread + p * effectiveFinalSpread;

  const heroYOffset = typography.nameVerticalOffset ?? 0;
  const heroXOffset = typography.nameHorizontalOffset ?? 0;
  const revealYShift = typography.nameRevealOffset ?? 100;
  const revealXShift = typography.nameRevealXOffset ?? 0;
  const nameLineHeight = typography.nameLineHeight ?? 0.85;

  // Beginning scale at p = 0 vs Final hero scale at p = 1
  const beginningScale = typography.nameBeginningScale ?? typography.headlineScale;
  const beginningRatio = beginningScale / (typography.headlineScale || 100);
  const currentScale = (1 - p) * beginningRatio + p * 1.0;

  let firstAlignClass = 'text-left self-start';
  let lastAlignClass = 'text-right self-end';
  let isDiagonal = true;

  if (alignment === 'left') {
    firstAlignClass = 'text-left self-start';
    lastAlignClass = 'text-left self-start';
    isDiagonal = false;
  } else if (alignment === 'center') {
    firstAlignClass = 'text-center self-center';
    lastAlignClass = 'text-center self-center';
    isDiagonal = false;
  } else if (alignment === 'right') {
    firstAlignClass = 'text-right self-end';
    lastAlignClass = 'text-right self-end';
    isDiagonal = false;
  } else if (alignment === 'diagonal-reverse') {
    firstAlignClass = 'text-right self-end';
    lastAlignClass = 'text-left self-start';
    isDiagonal = true;
  } else if (alignment === 'custom') {
    const fAlign = typography.nameFirstWordAlign || 'left';
    const sAlign = typography.nameSecondWordAlign || 'right';
    firstAlignClass = fAlign === 'center' ? 'text-center self-center' : fAlign === 'right' ? 'text-right self-end' : 'text-left self-start';
    lastAlignClass = sAlign === 'center' ? 'text-center self-center' : sAlign === 'left' ? 'text-left self-start' : 'text-right self-end';
    isDiagonal = true;
  }

  // Calculate distance between H1's natural resting place and the viewport position
  useEffect(() => {
    const calculateOffset = () => {
      if (!anchorRef.current || !h1Ref.current) return;
      const anchorRect = anchorRef.current.getBoundingClientRect();
      const textWidth = h1Ref.current.offsetWidth || h1Ref.current.getBoundingClientRect().width;

      // Natural resting position when p = 1 (accounting for hero position offsets)
      const naturalLeft = anchorRect.left + heroXOffset;
      const naturalTop = anchorRect.top + heroYOffset;

      const isMobile = window.innerWidth < 768;
      const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1024;
      const tabletSquare = Math.round(Math.min(window.innerWidth * 0.62, window.innerHeight * 0.55, 460));

      const initH = isMobile
        ? Math.min(window.innerHeight * 0.42, 310)
        : isTablet
        ? tabletSquare
        : Math.min(window.innerHeight * 0.58, 600);

      const boxTop = (window.innerHeight - initH) / 2;

      // Scaled width in beginning state:
      const begWidth = isMobile
        ? Math.min(window.innerWidth - 64, 250) * beginningRatio
        : isTablet
        ? (isDiagonal ? Math.min(tabletSquare - 56, 360) : textWidth) * beginningRatio
        : Math.min(window.innerWidth, (isDiagonal ? beginningSpread : textWidth) * beginningRatio);

      // Target position when p = 0:
      // Perfectly centered horizontally over card:
      const targetLeft = (window.innerWidth - begWidth) / 2 + (isMobile || isTablet ? 0 : revealXShift);

      // Measured or estimated height of H1 text:
      const measuredH = h1Ref.current ? h1Ref.current.offsetHeight : 0;
      const textH = (measuredH || (isMobile ? 56 : isTablet ? 130 : 180)) * beginningRatio;

      // Perfectly centered vertically in the card:
      const targetTop = isTablet
        ? boxTop + (initH - textH) / 2
        : isMobile
        ? boxTop + (initH - 56) / 2
        : boxTop + (initH - 56) / 2 + revealYShift;

      setCenterOffset({
        x: targetLeft - naturalLeft,
        y: targetTop - naturalTop
      });
    };

    calculateOffset();
    window.addEventListener('resize', calculateOffset);
    const t1 = setTimeout(calculateOffset, 80);
    const t2 = setTimeout(calculateOffset, 300);

    return () => {
      window.removeEventListener('resize', calculateOffset);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [
    content.name,
    typography.headlineScale,
    typography.nameBeginningScale,
    typography.nameAlignment,
    typography.nameFirstWordAlign,
    typography.nameSecondWordAlign,
    typography.nameFirstWordOffset,
    typography.nameSecondWordOffset,
    typography.nameBeginningDiagonalSpread,
    typography.nameDiagonalSpread,
    typography.nameVerticalOffset,
    typography.nameHorizontalOffset,
    typography.nameRevealOffset,
    typography.nameRevealXOffset,
    typography.nameLineHeight,
    heroXOffset,
    heroYOffset,
    revealYShift,
    revealXShift,
    beginningRatio,
    beginningSpread,
    finalSpread,
    isDiagonal
  ]);

  const watermarkStrokeStyle = {
    WebkitTextStroke: `1.2px rgba(${
      theme.accentColor.startsWith('#')
        ? parseInt(theme.accentColor.slice(1, 3), 16) + ',' +
          parseInt(theme.accentColor.slice(3, 5), 16) + ',' +
          parseInt(theme.accentColor.slice(5, 7), 16)
        : '247, 103, 7'
    }, ${theme.watermarkOpacity / 100})`,
    fontFamily: typography.fontCondensed
  };

  const nameScale = typography.headlineScale / 100;
  const nameStyle = {
    fontFamily: typography.fontCondensed,
    fontSize: isMobileWidth
      ? `clamp(${2.0 * nameScale}rem, ${8.2 * nameScale}vw, ${3.2 * nameScale}rem)`
      : `clamp(${2.5 * nameScale}rem, ${8 * nameScale}vw, ${9 * nameScale}rem)`
  };

  const roleStyle = {
    fontSize: `${typography.roleFontSize}rem`,
    color: theme.accentColor
  };

  // Interpolated translation for the floating "HRISHU SINHA" (constant 1:1 hero size throughout)
  const translateX = (1 - p) * centerOffset.x;
  const translateY = (1 - p) * centerOffset.y;

  // Extract first and last name for stacked two-line typography
  const nameParts = (content.name || 'HRISHU SINHA').trim().toUpperCase().split(/\s+/);
  const firstName = (nameParts[0] || 'HRISHU').toUpperCase();
  const lastName = (nameParts.slice(1).join(' ') || 'SINHA').toUpperCase();

  return (
    <header 
      className="hero-section relative min-h-[70vh] sm:min-h-screen flex flex-col justify-between overflow-hidden pt-8 sm:pt-28 pb-6 sm:pb-12 px-4 sm:px-12 lg:px-16" 
      id="heroSection"
      onClick={p < 0.5 ? onExpandClick : undefined}
    >
      {/* Giant Outlined Watermark (Fades in with expansion) */}
      <div 
        className="hero-watermark pointer-events-none select-none transition-opacity duration-700"
        aria-hidden="true"
        style={{
          ...watermarkStrokeStyle,
          opacity: p >= 0.25 ? Math.min(1, (p - 0.25) / 0.6) : 0
        }}
      >
        {content.watermark}
      </div>

      {/* Main Two-Column Hero Row */}
      <div className="hero-content relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end flex-1 gap-5 sm:gap-12 max-w-[1600px] w-full mx-auto">
        
        {/* Left Column: Greeting, Name, Role, Bio, Availability */}
        <div className="hero-left max-w-2xl w-full">
          <span 
            className="hero-greeting font-hand text-xl sm:text-3xl text-[#d4d4e2] block mb-1.5 sm:mb-2 drop-shadow-md transition-opacity duration-700"
            style={{ opacity: Math.max(0, (p - 0.2) / 0.8) }}
            contentEditable={inlineEdit}
            data-ve-editable={inlineEdit ? "true" : undefined}
            suppressContentEditableWarning
            onBlur={(e) => onTextChange('greeting', e.currentTarget.innerText)}
          >
            {content.greeting}
          </span>

          {/* Static Anchor for Natural Left-Aligned Position */}
          <div 
            ref={anchorRef} 
            className="relative w-fit"
            style={{
              transform: `translate3d(${heroXOffset}px, ${heroYOffset}px, 0)`
            }}
          >
            {/* Floating Text with user-controlled beginning & hero scale, plus unlimited position coordinates */}
            <div
              style={{
                transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${currentScale})`,
                willChange: 'transform',
                transformOrigin: alignment === 'center' ? 'top center' : alignment === 'right' ? 'top right' : 'top left'
              }}
              className="w-fit"
            >
              <h1 
                ref={h1Ref}
                className="hero-name font-condensed font-normal uppercase tracking-[0.02em] text-white mb-4 drop-shadow-md select-text flex flex-col"
                style={{
                  ...nameStyle,
                  lineHeight: nameLineHeight,
                  maxWidth: isDiagonal ? `min(calc(100vw - 3rem), ${currentSpread}px)` : (alignment === 'center' || alignment === 'right') ? '520px' : undefined,
                  width: (isDiagonal || alignment === 'center' || alignment === 'right') ? `min(calc(100vw - 3rem), ${currentSpread}px)` : 'fit-content',
                  textShadow: '0 4px 16px rgba(0,0,0,0.45)'
                }}
                contentEditable={inlineEdit}
                data-ve-editable={inlineEdit ? "true" : undefined}
                suppressContentEditableWarning
                onBlur={(e) => onTextChange('name', e.currentTarget.innerText.replace(/\n+/g, ' ').toUpperCase())}
              >
                <span 
                  className={`block ${firstAlignClass} relative`} 
                  style={{ 
                    lineHeight: nameLineHeight,
                    height: '1.08em',
                    width: '100%',
                    transform: !isMobileWidth && typography.nameFirstWordOffset ? `translate3d(${typography.nameFirstWordOffset}px, 0, 0)` : undefined
                  }}
                >
                  {inlineEdit ? (
                    firstName
                  ) : (
                    <TechText
                      text={firstName}
                      fontFamily={typography.fontCondensed || "'Anton', sans-serif"}
                      fontWeight={typography.fontCondensed?.includes('Anton') || typography.fontCondensed?.includes('Bebas') ? 400 : 700}
                      fontSize={160}
                      letterSpacing={0}
                      color="#ffffff"
                      accentColor={theme.accentColor || '#ff7300'}
                      reach={220}
                      softness={0.7}
                      dashLength={4}
                      dashGap={2}
                      strokeWidth={1.5}
                      lineStyle="dashed"
                      reveal="letter"
                      specks={15}
                      selection={true}
                      labels={true}
                      draggable={true}
                      sweep={false}
                      speed={1}
                      align={firstAlignClass.includes('text-right') ? 'right' : firstAlignClass.includes('text-center') ? 'center' : 'left'}
                      style={{ width: '100%', height: '100%' }}
                    />
                  )}
                </span>
                <span 
                  className={`block ${lastAlignClass} relative`} 
                  style={{ 
                    lineHeight: nameLineHeight,
                    height: '1.08em',
                    width: '100%',
                    transform: !isMobileWidth && typography.nameSecondWordOffset ? `translate3d(${typography.nameSecondWordOffset}px, 0, 0)` : undefined
                  }}
                >
                  {inlineEdit ? (
                    lastName
                  ) : (
                    <TechText
                      text={lastName}
                      fontFamily={typography.fontCondensed || "'Anton', sans-serif"}
                      fontWeight={typography.fontCondensed?.includes('Anton') || typography.fontCondensed?.includes('Bebas') ? 400 : 700}
                      fontSize={160}
                      letterSpacing={0}
                      color="#ffffff"
                      accentColor={theme.accentColor || '#ff7300'}
                      reach={220}
                      softness={0.7}
                      dashLength={4}
                      dashGap={2}
                      strokeWidth={1.5}
                      lineStyle="dashed"
                      reveal="letter"
                      specks={15}
                      selection={true}
                      labels={true}
                      draggable={true}
                      sweep={false}
                      speed={1}
                      align={lastAlignClass.includes('text-left') ? 'left' : lastAlignClass.includes('text-center') ? 'center' : 'right'}
                      style={{ width: '100%', height: '100%' }}
                    />
                  )}
                </span>
              </h1>
            </div>
          </div>

          <p 
            className="hero-role font-mono font-bold tracking-[0.1em] sm:tracking-[0.14em] uppercase mb-1.5 sm:mb-3.5 text-xs sm:text-sm drop-shadow-sm transition-all duration-700"
            style={{
              ...roleStyle,
              opacity: Math.max(0, (p - 0.2) / 0.8)
            }}
            contentEditable={inlineEdit}
            data-ve-editable={inlineEdit ? "true" : undefined}
            suppressContentEditableWarning
            onBlur={(e) => onTextChange('role', e.currentTarget.innerText)}
          >
            {content.role}
          </p>

          <p 
            className="hero-desc text-xs sm:text-[15px] text-[#b4b4c8] leading-relaxed max-w-xs sm:max-w-sm mb-3 sm:mb-7 drop-shadow-sm transition-opacity duration-700"
            style={{ opacity: Math.max(0, (p - 0.2) / 0.8) }}
            contentEditable={inlineEdit}
            data-ve-editable={inlineEdit ? "true" : undefined}
            suppressContentEditableWarning
            onBlur={(e) => onTextChange('description', e.currentTarget.innerText)}
          >
            {content.description}
          </p>

          {/* Specular Light-Rim Resume Button */}
          <div 
            className="hero-resume transition-opacity duration-700 pt-0.5 sm:pt-1"
            style={{ opacity: Math.max(0, (p - 0.2) / 0.8) }}
          >
            <SpecularButton
              onClick={onResumeClick}
              size="sm"
              radius={9999}
              tint={theme.accentColor || '#ff7300'}
              lineColor={theme.accentColor || '#ff7300'}
              baseColor="#262630"
              intensity={1.25}
              idleIntensity={0.45}
              glow={1.2}
              className="font-mono text-[9px] sm:text-[11px] font-semibold tracking-[0.1em] sm:tracking-[0.16em] uppercase px-3 sm:px-5 py-1.5 sm:py-2.5 text-white shadow-xl hover:scale-105 active:scale-95 transition-transform"
            >
              <FileText className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-white/90" />
              <span>VIEW RESUME</span>
            </SpecularButton>
          </div>
        </div>

        {/* Right Column: Tagline Quote & Stats Counter */}
        <div 
          className="hero-right flex flex-col items-start lg:items-end text-left lg:text-right max-w-sm gap-4 sm:gap-5 lg:gap-10 transition-opacity duration-700"
          style={{ opacity: Math.max(0, (p - 0.25) / 0.75) }}
        >
          <div className="hero-tagline flex flex-col items-start lg:items-end">
            <span 
              className="tagline-quote text-xl sm:text-3xl font-serif leading-none mb-0.5 sm:mb-1 select-none"
              style={{ color: theme.accentColor }}
            >
              “
            </span>
            <p 
              className="text-xs sm:text-[15px] text-[#c0c0d2] leading-snug drop-shadow-md whitespace-pre-line"
              contentEditable={inlineEdit}
              data-ve-editable={inlineEdit ? "true" : undefined}
              suppressContentEditableWarning
              onBlur={(e) => onTextChange('tagline', e.currentTarget.innerText)}
            >
              {content.tagline}
            </p>
          </div>

          <div className="hero-stats flex flex-row lg:flex-col gap-4 sm:gap-7 items-start lg:items-end flex-wrap">
            {content.stats.map((stat, idx) => (
              <div key={idx} className="stat-item flex flex-col items-start lg:items-end">
                <span 
                  className="stat-number font-condensed text-2xl sm:text-5xl font-normal leading-[0.95] mb-0.5 sm:mb-1 drop-shadow-lg transition-colors duration-200"
                  style={{ color: theme.accentColor }}
                  contentEditable={inlineEdit}
                  data-ve-editable={inlineEdit ? "true" : undefined}
                  suppressContentEditableWarning
                  onBlur={(e) => onTextChange('statNumber', e.currentTarget.innerText, idx)}
                >
                  {stat.number}
                </span>
                <span 
                  className="stat-label font-mono text-[9px] sm:text-[10px] font-medium tracking-[0.1em] sm:tracking-[0.12em] uppercase text-[#88889c]"
                  contentEditable={inlineEdit}
                  data-ve-editable={inlineEdit ? "true" : undefined}
                  suppressContentEditableWarning
                  onBlur={(e) => onTextChange('statLabel', e.currentTarget.innerText, idx)}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Floating Expand Prompt - Clean text & arrow in professional sans font */}
      {p < 0.65 && (
        <button
          onClick={onExpandClick}
          className="fixed z-20 left-1/2 -translate-x-1/2 bottom-3 sm:bottom-8 flex flex-col items-center gap-1 cursor-pointer hover:opacity-100 transition-all select-none group text-white/70 hover:text-white"
          style={{ opacity: Math.max(0, 1 - p * 2.2) }}
          aria-label="Swipe or click to expand"
        >
          <span className="font-sans text-[10px] sm:text-xs font-semibold tracking-[0.26em] uppercase text-white/80 group-hover:text-white transition-colors drop-shadow-md">
            SWIPE OR CLICK TO EXPAND
          </span>
          <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/60 group-hover:text-white animate-bounce transition-colors drop-shadow-md" />
        </button>
      )}
    </header>
  );
});
