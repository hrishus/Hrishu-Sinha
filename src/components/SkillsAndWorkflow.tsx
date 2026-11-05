import { useState, useEffect, memo } from 'react';
import { CapabilityItem, ProcessItem, PortfolioContent } from '../types';
import { Terminal, Code2, Video, CheckCircle2, Compass, Palette, Rocket, ArrowRight } from 'lucide-react';

interface CapabilitiesSectionProps {
  capabilities: CapabilityItem[];
  accentColor: string;
  typography?: PortfolioContent['typography'];
}

export const CapabilitiesSection = memo(function CapabilitiesSection({ capabilities, accentColor, typography }: CapabilitiesSectionProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const headingSize = typography?.techStackHeadingFontSize ?? 56;
  const titleSize = typography?.techStackTitleFontSize ?? 28;
  const descSize = typography?.techStackDescFontSize ?? 16;
  const itemsSize = typography?.techStackItemsFontSize ?? 15;

  const getDisciplineIcon = (index: string) => {
    switch (index) {
      case '01': return <Terminal className="w-6 h-6" />;
      case '02': return <Code2 className="w-6 h-6" />;
      case '03': return <Video className="w-6 h-6" />;
      default: return <CheckCircle2 className="w-6 h-6" />;
    }
  };

  return (
    <section 
      className="relative z-10 py-6 sm:py-28 px-4 sm:px-12 lg:px-16 bg-transparent" 
      id="capabilities"
    >
      <div className="max-w-[1600px] w-full mx-auto">
        <div className="max-w-2xl text-left flex flex-col items-start mb-4 sm:mb-14 pb-2.5 sm:pb-6 border-b border-white/10">
          <div className="inline-flex items-center gap-2 mb-1.5 sm:mb-2.5">
            <span 
              className="w-1.5 h-1.5 rounded-full animate-pulse" 
              style={{ backgroundColor: accentColor }} 
            />
            <span 
              className="font-mono text-[9px] sm:text-[11px] font-semibold tracking-[0.2em] uppercase" 
              style={{ color: accentColor }}
            >
              // 03 · Tooling & Technologies
            </span>
          </div>

          <h2 
            className="font-heading font-normal tracking-wide text-white uppercase text-left drop-shadow-sm transition-all duration-150"
            style={{ fontSize: isMobile ? `clamp(22px, 4.5vw, ${headingSize}px)` : `${headingSize}px`, textShadow: '0 2px 6px rgba(0,0,0,0.4)' }}
          >
            TECH STACK
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 relative max-w-6xl w-full mx-auto">
          {capabilities.map((cap, i) => {
            const isHovered = hoveredIdx === i;

            return (
              <div
                key={cap.index}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="relative group bg-transparent flex flex-col items-center text-center justify-between py-3.5 md:py-6 px-3 sm:px-8 lg:px-10 transition-all duration-300"
              >
                {i > 0 && (
                  <div
                    className="hidden md:block absolute left-0 top-3 bottom-3 w-[1px] bg-gradient-to-b from-transparent via-white/30 to-transparent pointer-events-none"
                    aria-hidden="true"
                  />
                )}

                {i > 0 && (
                  <div
                    className="md:hidden absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none"
                    aria-hidden="true"
                  />
                )}

                <div className="w-full flex flex-col items-center text-center">
                  <div 
                    className="mb-2 sm:mb-5 transition-all duration-300 transform group-hover:scale-110 flex items-center justify-center drop-shadow-sm"
                    style={{ color: isHovered ? accentColor : 'rgba(255, 255, 255, 0.6)' }}
                  >
                    {getDisciplineIcon(cap.index)}
                  </div>

                  <h3 
                    className="font-heading font-normal text-white mb-1.5 sm:mb-3.5 tracking-wide uppercase text-center drop-shadow-sm transition-all duration-150"
                    style={{ fontSize: isMobile ? `clamp(18px, 4.5vw, ${titleSize}px)` : `${titleSize}px`, textShadow: '0 1px 4px rgba(0,0,0,0.35)' }}
                  >
                    {cap.title}
                  </h3>

                  <p 
                    className="text-[#b4b4cc] leading-relaxed mb-2.5 sm:mb-8 max-w-md mx-auto text-center font-normal drop-shadow-sm transition-all duration-150 text-xs sm:text-base"
                    style={{ fontSize: isMobile ? `clamp(11px, 2.8vw, ${descSize}px)` : `${descSize}px`, textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
                  >
                    {cap.description}
                  </p>
                </div>

                <div className="w-full pt-2.5 sm:pt-6 border-t border-white/[0.08] flex items-center justify-center">
                  <div 
                    className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 font-mono text-center drop-shadow-sm transition-all duration-150"
                    style={{ fontSize: isMobile ? `clamp(11px, 2.6vw, ${itemsSize}px)` : `${itemsSize}px`, textShadow: '0 1px 2px rgba(0,0,0,0.25)' }}
                  >
                    {cap.stack.map((tech, idx) => (
                      <span key={tech} className="inline-flex items-center gap-2 sm:gap-3">
                        <span className="text-white/90 hover:text-white transition-colors font-medium">
                          {tech}
                        </span>
                        {idx < cap.stack.length - 1 && (
                          <span className="text-white/25 select-none font-light">|</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
});

interface ProcessSectionProps {
  processList: ProcessItem[];
  accentColor: string;
  typography?: PortfolioContent['typography'];
}

export const ProcessSection = memo(function ProcessSection({ processList, accentColor, typography }: ProcessSectionProps) {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const headingSize = typography?.processHeadingFontSize ?? 56;
  const titleSize = typography?.processTitleFontSize ?? 32;
  const descSize = typography?.processDescFontSize ?? 16;
  const iconSize = typography?.processIconSize ?? 28;

  const getStepIcon = (index: string) => {
    const style = { width: `${iconSize}px`, height: `${iconSize}px` };
    switch (index) {
      case '01': return <Compass style={style} />;
      case '02': return <Palette style={style} />;
      case '03': return <Code2 style={style} />;
      case '04': return <Rocket style={style} />;
      default: return <ArrowRight style={style} />;
    }
  };

  return (
    <section 
      className="relative z-10 py-6 sm:py-28 px-4 sm:px-12 lg:px-16 bg-transparent" 
      id="process"
    >
      <div className="max-w-[1600px] w-full mx-auto">
        <div className="max-w-2xl text-left flex flex-col items-start mb-4 sm:mb-14 pb-2.5 sm:pb-6 border-b border-white/8">
          <div className="inline-flex items-center gap-2 mb-1.5 sm:mb-2.5">
            <span 
              className="w-1.5 h-1.5 rounded-full animate-pulse" 
              style={{ backgroundColor: accentColor }} 
            />
            <span 
              className="font-mono text-[9px] sm:text-[11px] font-semibold tracking-[0.2em] uppercase" 
              style={{ color: accentColor }}
            >
              // 04 · Engineering Workflow
            </span>
          </div>

          <h2 
            className="font-heading font-normal tracking-wide text-white uppercase text-left drop-shadow-sm transition-all duration-150"
            style={{ fontSize: isMobile ? `clamp(22px, 4.5vw, ${headingSize}px)` : `${headingSize}px`, textShadow: '0 2px 6px rgba(0,0,0,0.4)' }}
          >
            THE METHODOLOGY
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6 relative max-w-7xl w-full mx-auto">
          {processList.map((item, i) => {
            const isHovered = activeStep === i;

            return (
              <div
                key={item.index}
                onMouseEnter={() => setActiveStep(i)}
                onMouseLeave={() => setActiveStep(null)}
                className="relative group bg-transparent flex flex-col items-center text-center justify-start py-3.5 md:py-8 px-2 sm:px-8 transition-all duration-300"
              >
                {i > 0 && (
                  <div
                    className="hidden lg:block absolute left-0 top-3 bottom-3 w-[1px] bg-gradient-to-b from-transparent via-white/30 to-transparent pointer-events-none"
                    aria-hidden="true"
                  />
                )}

                <div className="w-full flex flex-col items-center text-center">
                  <div className="inline-flex items-center gap-1 mb-1.5 sm:mb-3.5">
                    <span 
                      className="font-mono text-[10px] sm:text-xs font-bold tracking-wider" 
                      style={{ color: accentColor }}
                    >
                      {item.index}
                    </span>
                    <span className="font-mono text-[8px] sm:text-[9px] text-white/40 tracking-wider uppercase">
                      / Phase
                    </span>
                  </div>

                  <div 
                    className="mb-2 sm:mb-6 transition-all duration-300 transform group-hover:scale-110 flex items-center justify-center drop-shadow-sm scale-90 sm:scale-100"
                    style={{ color: isHovered ? accentColor : 'rgba(255, 255, 255, 0.7)' }}
                  >
                    {getStepIcon(item.index)}
                  </div>

                  <h3 
                    className="font-heading font-normal text-white mb-1 sm:mb-4 tracking-wide uppercase text-center drop-shadow-sm transition-all duration-150"
                    style={{ fontSize: isMobile ? `clamp(16px, 4vw, ${titleSize}px)` : `${titleSize}px`, textShadow: '0 1px 4px rgba(0,0,0,0.35)' }}
                  >
                    {item.name}
                  </h3>

                  <p 
                    className="text-[#b4b4cc] leading-relaxed max-w-sm mx-auto text-center font-normal drop-shadow-sm transition-all duration-150 text-[10px] sm:text-base"
                    style={{ fontSize: isMobile ? `clamp(10px, 2.6vw, ${descSize}px)` : `${descSize}px`, textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
                  >
                    {item.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
});
