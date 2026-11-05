import React from 'react';
import { PortfolioContent } from '../types';
import DodgeField from './DodgeField';
import TextMorph from './TextMorph';

interface AboutSectionProps {
  content: PortfolioContent;
  accentColor: string;
  inlineEdit?: boolean;
  onTextChange?: (field: string, value: string) => void;
  onUpdateTypography?: (updates: Partial<PortfolioContent['typography']>) => void;
}

const MORPHING_WORDS = ["Creative Developer", "Visual Engineer", "Problem Solver"];

export const AboutSection = React.memo(function AboutSection({
  content,
  accentColor,
  inlineEdit = false,
  onTextChange,
  onUpdateTypography
}: AboutSectionProps) {
  const about = content.about || {
    heading: "Who am I?",
    quote: "I’ve always been curious about how things are made—and even more curious about how I can make them better.",
    p1: "I’m a Computer Science student who found a passion for both technology and creativity. Coding gives me a way to solve problems; design and visual work give me a way to express ideas.",
    p2: "I’m drawn to projects that don’t just work—they look, feel, and perform differently. Whether it’s an interactive website, a software project, or a cinematic visual, I enjoy taking a concept from “What if?” to “It actually exists.”",
    p3: "I’m still at the beginning of my journey, but I’m building every step of the way.",
    manifesto: "Code it. Create it. Make it unforgettable."
  };

  const fontSize = content.typography.aboutFontSize ?? 15;
  const hookFontSize = content.typography.aboutHookFontSize ?? 19;
  const manifestoFontSize = content.typography.aboutManifestoFontSize ?? 18;
  const morphingFontSize = content.typography.morphingFontSize ?? 22;
  const morphingAlignment = content.typography.morphingAlignment ?? 'center';
  const morphingXOffset = content.typography.morphingXOffset ?? 0;

  const [isMobile, setIsMobile] = React.useState(() => typeof window !== 'undefined' && window.innerWidth < 640);
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleBlur = (field: string, e: React.FocusEvent<HTMLElement>) => {
    if (onTextChange) {
      onTextChange(field, e.currentTarget.innerText.trim());
    }
  };

  return (
    <section
      id="about"
      className="relative z-10 py-6 sm:py-24 px-4 sm:px-12 lg:px-16 bg-transparent text-white"
    >
      {/* Outer container aligned with HeroSection, SelectedWorks, and Capabilities max-width */}
      <div className="max-w-[1600px] w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-14 items-center">
          
          {/* Left-Aligned Column matching HeroSection left column */}
          <div className="lg:col-span-7 flex flex-col space-y-3.5 sm:space-y-7 text-left">
          
          {/* Section Header */}
          <div className="w-full text-left flex flex-col items-start pb-2.5 sm:pb-5 border-b border-white/10 bg-transparent">
            <div className="inline-flex items-center gap-2 mb-1.5 sm:mb-2.5">
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: accentColor }}
              />
              <span
                className="font-mono text-[9px] sm:text-[11px] font-semibold tracking-[0.2em] uppercase"
                style={{ color: accentColor }}
              >
                // 01 · Identity & Background
              </span>
            </div>

            <h2
              className="font-heading text-2xl sm:text-5xl lg:text-6xl font-normal tracking-wide text-white uppercase text-left drop-shadow-sm"
              style={{ textShadow: '0 2px 6px rgba(0,0,0,0.4)' }}
              contentEditable={inlineEdit}
              data-ve-editable={inlineEdit ? "true" : undefined}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur('aboutHeading', e)}
            >
              {about.heading}
            </h2>
          </div>

          {/* Opening Hook Statement (No quotation marks, clean accent left border) */}
          <div 
            className="pl-3.5 sm:pl-5 py-0.5 bg-transparent"
            style={{
              borderLeft: `2.5px solid ${accentColor}`
            }}
          >
            <p
              className="font-nothing font-bold text-white leading-relaxed tracking-wide drop-shadow-sm text-left transition-all duration-150"
              style={{ fontSize: isMobile ? `clamp(13px, 3.8vw, ${hookFontSize}px)` : `${hookFontSize}px`, textShadow: '0 1px 4px rgba(0,0,0,0.35)' }}
              contentEditable={inlineEdit}
              data-ve-editable={inlineEdit ? "true" : undefined}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur('aboutQuote', e)}
            >
              {about.quote}
            </p>
          </div>

          {/* Narrative Body Paragraphs with Live Dynamic Font Size & Subtle Shadow */}
          <div 
            className="space-y-3 sm:space-y-4 pt-0.5 bg-transparent leading-relaxed text-left transition-all duration-150"
            style={{ fontSize: isMobile ? `clamp(12px, 3.2vw, ${fontSize}px)` : `${fontSize}px` }}
          >
            <p
              className="text-[#f0f0f5] font-source font-normal drop-shadow-sm tracking-normal"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
              contentEditable={inlineEdit}
              data-ve-editable={inlineEdit ? "true" : undefined}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur('aboutP1', e)}
            >
              {about.p1}
            </p>

            <p
              className="text-[#f0f0f5] font-source font-normal drop-shadow-sm tracking-normal"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
              contentEditable={inlineEdit}
              data-ve-editable={inlineEdit ? "true" : undefined}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur('aboutP2', e)}
            >
              {about.p2}
            </p>

            <p
              className="text-white font-source font-medium drop-shadow-sm tracking-normal"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
              contentEditable={inlineEdit}
              data-ve-editable={inlineEdit ? "true" : undefined}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur('aboutP3', e)}
            >
              {about.p3}
            </p>
          </div>

        </div>

        {/* Right Column: Interactive DodgeField Element */}
        <div className="lg:col-span-5 flex items-center justify-center w-full min-h-[90px] sm:min-h-[220px]">
          <DodgeField
            inkColor="#ffffff"
            contrastColor="#08080b"
            fieldHeight={typeof window !== 'undefined' && window.innerWidth < 640 ? 90 : 150}
            reach={typeof window !== 'undefined' && window.innerWidth < 640 ? 55 : 85}
            radius={typeof window !== 'undefined' && window.innerWidth < 640 ? 85 : 130}
            falloff={1.9}
            patience={5}
            taunts={['Catch me', 'Nope', 'Too slow', 'Almost', 'Okay, okay']}
            className="w-full"
          />
        </div>

      </div>

      {/* Mid-Screen Centered Block: Morphing Text Effect followed by Ending Momento */}
      <div className="w-full flex flex-col items-center justify-center text-center pt-4 sm:pt-12 mt-4 sm:mt-8 border-t border-white/10 space-y-3 sm:space-y-6">
        {/* Morphing Text Effect: Truly centered on all screen sizes */}
        <div 
          className="w-full flex items-center justify-center text-center font-semibold tracking-tight select-none transition-all duration-150"
          style={{ 
            fontSize: isMobile ? `clamp(13px, 3.8vw, ${morphingFontSize}px)` : `${morphingFontSize}px`,
            transform: typeof window !== 'undefined' && window.innerWidth < 640 ? undefined : (morphingXOffset ? `translateX(${morphingXOffset}px)` : undefined)
          }}
        >
          <div className="inline-flex items-center justify-center flex-nowrap text-center mx-auto">
            {/* Pure white static text with natural word spacing */}
            <span className="text-white font-normal drop-shadow-sm whitespace-nowrap mr-1.5 shrink-0">
              I am a
            </span>

            {/* Seamless centered morphing text slot */}
            <div className="relative inline-flex items-center justify-center text-center">
              <TextMorph
                words={MORPHING_WORDS}
                interval={2500}
                className="font-mono font-bold drop-shadow-sm"
                style={{ color: accentColor }}
              />
            </div>
          </div>
        </div>

        {/* Ending Momento Box */}
        <div 
          className="w-fit max-w-full px-4 sm:px-8 py-2 sm:py-4 rounded-xl bg-gradient-to-r from-black/80 to-black/50 backdrop-blur-md border border-white/12 shadow-xl mx-auto"
        >
          <div
            className="font-ga-maamli font-normal tracking-wide drop-shadow-sm text-center transition-all duration-150"
            style={{ color: accentColor, fontSize: isMobile ? `clamp(12px, 3.5vw, ${manifestoFontSize}px)` : `${manifestoFontSize}px`, textShadow: '0 1px 4px rgba(0,0,0,0.35)' }}
            contentEditable={inlineEdit}
            data-ve-editable={inlineEdit ? "true" : undefined}
            suppressContentEditableWarning
            onBlur={(e) => handleBlur('aboutManifesto', e)}
          >
            {about.manifesto}
          </div>
        </div>
      </div>
    </div>
  </section>
  );
});
