import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Copy, Check, ArrowUpRight, MessageSquare, Download } from 'lucide-react';
import SlingButton from './SlingButton';
import { downloadResumePdf } from '../utils/resumeGenerator';
import { PortfolioContent } from '../types';

interface ContactSectionProps {
  content: PortfolioContent;
  inlineEdit?: boolean;
  onTextChange?: (field: string, value: string) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const ContactSection = React.memo(function ContactSection({
  content,
  inlineEdit = false,
  onTextChange = () => {},
  onShowToast
}: ContactSectionProps) {
  const { contact, theme, typography } = content;
  const accentColor = theme?.accentColor || '#ff6600';
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  // Footer font sizes from typography adjustors
  const quoteFontSize = typography?.footerQuoteFontSize ?? 38;
  const authorFontSize = typography?.footerAuthorFontSize ?? 18;
  const topCtaFontSize = typography?.footerTopCtaFontSize ?? 16;
  const headlineFontSize = typography?.footerHeadlineFontSize ?? 72;
  const contactItemsFontSize = typography?.footerContactItemsFontSize ?? 14;
  const footerBarFontSize = typography?.footerBarFontSize ?? 11;

  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sling Button & Resume label alignment & layout
  const resumeButtonAlign = typography?.resumeButtonAlign || 'left';
  const resumeButtonTextAlign = typography?.resumeButtonTextAlign || resumeButtonAlign;
  const resumeButtonXOffset = typography?.resumeButtonXOffset ?? 0;
  const resumeButtonYOffset = typography?.resumeButtonYOffset ?? 32;
  const resumeButtonSize = typography?.resumeButtonSize ?? 56;

  const alignContainerClass =
    isMobile
      ? 'items-start text-left'
      : resumeButtonAlign === 'center'
      ? 'items-center text-center self-center'
      : resumeButtonAlign === 'right'
      ? 'items-end text-right self-end'
      : 'items-start text-left';

  const textAlignClass =
    isMobile
      ? 'text-left'
      : resumeButtonTextAlign === 'center'
      ? 'text-center'
      : resumeButtonTextAlign === 'right'
      ? 'text-right'
      : 'text-left';

  // Fallback defaults with user's real details
  const quoteText = contact.quote || '"Design that speaks. Technology that delivers."';
  const authorText = contact.author || 'Hrishu';
  const topCtaText = contact.topCta || "YOUR NEXT BIG IDEA\nSTARTS HERE";
  const headlineText = contact.headline || "READY TO";
  const highlightText = contact.headlineHighlight !== undefined ? contact.headlineHighlight : "BUILD?";
  const descText = contact.description || "Currently accepting selected commissions and high-impact digital engineering contracts. Let's build something unforgettable.";
  const emailVal = contact.email || 'hrishusinha674@gmail.com';
  const phoneVal = contact.phone || '9394500884';
  const locVal = contact.location || 'Assam, India';
  const resumeLabel = contact.resumeButtonLabel || 'Pull to Download Resume';

  const handleDownloadResume = async () => {
    await downloadResumePdf(content);
    onShowToast('Resume downloaded: Hrishu_Sinha_Resume.pdf', '📄');
  };

  const handleCopy = (e: React.MouseEvent, text: string, label: string) => {
    e.preventDefault();
    navigator.clipboard.writeText(text).then(() => {
      setCopiedItem(label);
      onShowToast(`Copied ${label}: ${text}`, '✓');
      setTimeout(() => setCopiedItem(null), 2000);
    }).catch(() => {
      // ignore
    });
  };

  const effectiveButtonSize = isMobile ? 38 : resumeButtonSize;

  return (
    <section
      className="relative z-10 w-full max-w-full min-h-0 sm:min-h-screen bg-transparent text-white flex flex-col justify-between py-5 sm:py-16 px-3 sm:px-12 lg:px-16 overflow-hidden"
      id="contact"
    >
      <div className="w-full max-w-[1600px] mx-auto flex-1 flex flex-col justify-between min-w-0">
        
        {/* ── TOP SECTION: QUOTE & CONDENSED CALLOUT (DESKTOP PARITY: SIDE-BY-SIDE ON ALL SCREENS) ── */}
        <div className="flex flex-row justify-between items-start gap-2.5 sm:gap-12 pb-2.5 sm:pb-6 border-b border-white/[0.08] w-full min-w-0">
          
          {/* Quote & Author - Left Aligned */}
          <div className="max-w-2xl text-left flex-1 min-w-0 pr-2">
            <h1
              className="text-white text-left select-text drop-shadow-sm font-normal tracking-wide transition-all duration-150"
              style={{
                fontFamily: "'Ms Madi', cursive",
                fontSize: isMobile ? `clamp(14px, 3.6vw, ${quoteFontSize}px)` : `${quoteFontSize}px`,
                lineHeight: 1.25,
                textShadow: '0 2px 8px rgba(0,0,0,0.45)',
              }}
              contentEditable={inlineEdit}
              data-ve-editable={inlineEdit ? "true" : undefined}
              suppressContentEditableWarning
              onBlur={(e) => onTextChange('contactQuote', e.currentTarget.innerText)}
            >
              {quoteText}
            </h1>

            <p
              className="mt-0.5 sm:mt-3 font-sans font-semibold flex items-center gap-1.5 sm:gap-2 drop-shadow-sm transition-all duration-150"
              style={{ 
                color: accentColor,
                fontSize: isMobile ? `clamp(9px, 2.2vw, ${authorFontSize}px)` : `${authorFontSize}px`,
              }}
              contentEditable={inlineEdit}
              data-ve-editable={inlineEdit ? "true" : undefined}
              suppressContentEditableWarning
              onBlur={(e) => onTextChange('contactAuthor', e.currentTarget.innerText)}
            >
              <span>—</span> {authorText}
            </p>
          </div>

          {/* Top-Right Condensed Callout - Left-aligned text within badge */}
          <div
            className="text-left font-sans tracking-tight text-white font-bold leading-tight sm:leading-snug uppercase select-text whitespace-pre-line shrink-0 px-2 sm:px-4 py-1 sm:py-3 rounded-lg sm:rounded-xl bg-black/25 backdrop-blur-md border border-white/[0.08] drop-shadow-sm transition-all duration-150"
            style={{ fontSize: isMobile ? `clamp(8px, 2.0vw, ${topCtaFontSize}px)` : `${topCtaFontSize}px` }}
            contentEditable={inlineEdit}
            data-ve-editable={inlineEdit ? "true" : undefined}
            suppressContentEditableWarning
            onBlur={(e) => onTextChange('contactTopCta', e.currentTarget.innerText)}
          >
            {topCtaText}
          </div>
        </div>

        {/* ── MIDDLE ROW: GIANT CALL TO ACTION & DIRECT CONTACT LIST (EXACT DESKTOP SIDE-BY-SIDE ON ALL SCREENS) ── */}
        <div className="grid grid-cols-12 gap-2 sm:gap-12 items-center py-3 sm:py-8 w-full max-w-full overflow-hidden">
          
          {/* Left Block: Bold Scaled Headline + Action Trigger - Left Aligned */}
          <div className="col-span-5 sm:col-span-6 w-full min-w-0 flex flex-col items-start text-left justify-center pr-1 sm:pr-0 overflow-hidden">
            <h2 
              className="font-heading font-bold uppercase tracking-tight text-left drop-shadow-md leading-[0.9] transition-all duration-150"
              style={{ fontSize: isMobile ? `clamp(18px, 4.5vw, ${headlineFontSize}px)` : `${headlineFontSize}px` }}
            >
              <div
                className="text-white text-left font-bold"
                contentEditable={inlineEdit}
                data-ve-editable={inlineEdit ? "true" : undefined}
                suppressContentEditableWarning
                onBlur={(e) => onTextChange('contactHeadline', e.currentTarget.innerText)}
              >
                {headlineText}
              </div>
              <div
                className="text-left mt-0.5 sm:mt-1.5 font-bold"
                style={{ color: accentColor }}
                contentEditable={inlineEdit}
                data-ve-editable={inlineEdit ? "true" : undefined}
                suppressContentEditableWarning
                onBlur={(e) => onTextChange('contactHeadlineHighlight', e.currentTarget.innerText)}
              >
                {highlightText}
              </div>
            </h2>

            {/* Sling Button: Pull to Download Resume */}
            <div
              className={`flex flex-col gap-1 sm:gap-2.5 select-none transition-all duration-150 ${alignContainerClass}`}
              style={{
                marginTop: isMobile ? '8px' : `${resumeButtonYOffset}px`,
                transform: !isMobile && resumeButtonXOffset ? `translateX(${resumeButtonXOffset}px)` : undefined,
              }}
            >
              <div className="cursor-target rounded-full inline-block" data-cursor-label="PULL">
                <SlingButton
                  onSend={handleDownloadResume}
                  size={effectiveButtonSize}
                  maxPull={isMobile ? 65 : 160}
                  armAt={isMobile ? 30 : 48}
                  padColor="#ffffff"
                  iconColor="#121218"
                  accentColor="#ffffff"
                  wellColor="#1e1e28"
                  bandColor="#444456"
                  strokeWidth={isMobile ? 2.5 : 3}
                  tapSends={false}
                  ariaLabel={resumeLabel}
                >
                  <Download className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#121218]" />
                </SlingButton>
              </div>

              {/* Plain non-clickable text label (not a button, no onClick download trigger) */}
              <span
                className={`font-sans text-[8px] sm:text-[13px] font-normal text-[#c4c4d4] select-text cursor-default max-w-[120px] sm:max-w-none leading-tight ${textAlignClass}`}
                contentEditable={inlineEdit}
                data-ve-editable={inlineEdit ? "true" : undefined}
                suppressContentEditableWarning
                onBlur={(e) => onTextChange('contactResumeButtonLabel', e.currentTarget.innerText)}
              >
                {resumeLabel}
              </span>
            </div>
          </div>

          {/* Right Block: Minimalist Interactive Directory - Transparent with Horizontal Fading Lines */}
          <div className="col-span-7 sm:col-span-6 w-full min-w-0 flex flex-col justify-center overflow-hidden">
            <div className="w-full flex flex-col bg-transparent">
              
              {/* Top Fading Line matching Tech Stack style */}
              <div
                className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none"
                aria-hidden="true"
              />

              {/* Email Row */}
              <div className="py-1.5 sm:py-5 flex items-center justify-between group gap-1.5 sm:gap-2">
                <div className="flex items-center gap-1.5 sm:gap-4 min-w-0 flex-1">
                  <div 
                    className="w-6 h-6 sm:w-9 sm:h-9 rounded-md sm:rounded-lg border border-white/10 bg-white/[0.03] flex items-center justify-center transition-colors shrink-0"
                    style={{ color: accentColor }}
                  >
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-mono text-[7px] sm:text-[10px] text-white/40 block uppercase tracking-wider">Direct Email</span>
                    <a
                      href={`mailto:${emailVal}`}
                      className="font-mono text-white/90 group-hover:text-white tracking-wide transition-all duration-150 block truncate text-[9px] sm:text-sm"
                      style={{ fontSize: isMobile ? undefined : `${contactItemsFontSize}px` }}
                      title={emailVal}
                    >
                      {emailVal}
                    </a>
                  </div>
                </div>
                <button
                  onClick={(e) => handleCopy(e, emailVal, 'Email')}
                  className="p-1 sm:p-2 rounded-md sm:rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-white/60 hover:text-white transition-colors border border-white/[0.06] shrink-0"
                  title="Copy email address"
                >
                  {copiedItem === 'Email' ? <Check className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />}
                </button>
              </div>

              {/* Horizontal Divider 1 */}
              <div
                className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none"
                aria-hidden="true"
              />

              {/* Phone / WhatsApp Row */}
              <div className="py-1.5 sm:py-5 flex items-center justify-between group gap-1.5 sm:gap-2">
                <div className="flex items-center gap-1.5 sm:gap-4 min-w-0 flex-1">
                  <div 
                    className="w-6 h-6 sm:w-9 sm:h-9 rounded-md sm:rounded-lg border border-white/10 bg-white/[0.03] flex items-center justify-center transition-colors shrink-0"
                    style={{ color: accentColor }}
                  >
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-mono text-[7px] sm:text-[10px] text-white/40 block uppercase tracking-wider">Phone / WhatsApp</span>
                    <a
                      href={`tel:${phoneVal.replace(/\s+/g, '')}`}
                      className="font-mono text-white/90 group-hover:text-white tracking-wide transition-all duration-150 block truncate text-[9px] sm:text-sm"
                      style={{ fontSize: isMobile ? undefined : `${contactItemsFontSize}px` }}
                    >
                      {phoneVal.startsWith('+') ? phoneVal : `+91 ${phoneVal}`}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <a
                    href={`https://wa.me/91${phoneVal.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 sm:p-2 rounded-md sm:rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-white/60 hover:text-emerald-400 transition-colors border border-white/[0.06] flex items-center gap-1 font-mono text-[8px] sm:text-[11px]"
                    title="Chat on WhatsApp"
                  >
                    <MessageSquare className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </a>
                  <button
                    onClick={(e) => handleCopy(e, phoneVal, 'Phone')}
                    className="p-1 sm:p-2 rounded-md sm:rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-white/60 hover:text-white transition-colors border border-white/[0.06]"
                    title="Copy phone number"
                  >
                    {copiedItem === 'Phone' ? <Check className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Horizontal Divider 2 */}
              <div
                className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none"
                aria-hidden="true"
              />

              {/* Location Row */}
              <div className="py-1.5 sm:py-5 flex items-center justify-between gap-1.5 sm:gap-2">
                <div className="flex items-center gap-1.5 sm:gap-4 min-w-0 flex-1">
                  <div 
                    className="w-6 h-6 sm:w-9 sm:h-9 rounded-md sm:rounded-lg border border-white/10 bg-white/[0.03] flex items-center justify-center transition-colors shrink-0"
                    style={{ color: accentColor }}
                  >
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-mono text-[7px] sm:text-[10px] text-white/40 block uppercase tracking-wider">Location / Studio</span>
                    <span 
                      className="font-mono text-white/90 tracking-wide transition-all duration-150 block truncate text-[9px] sm:text-sm"
                      style={{ fontSize: isMobile ? undefined : `${contactItemsFontSize}px` }}
                    >
                      {locVal}
                    </span>
                  </div>
                </div>
                <span className="font-mono text-[7px] sm:text-[10px] px-1 sm:px-2.5 py-0.5 sm:py-1 rounded bg-white/[0.04] border border-white/10 text-white/60 tracking-wider shrink-0">
                  IST · UTC+5:30
                </span>
              </div>

              {/* Bottom Fading Line */}
              <div
                className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none"
                aria-hidden="true"
              />

            </div>
          </div>

        </div>

      </div>

      {/* ── PRISTINE FOOTER BAR (DESKTOP PARITY: HORIZONTAL SIDE-BY-SIDE ON ALL SCREENS) ── */}
      <footer 
        className="w-full max-w-[1600px] mx-auto border-t border-white/[0.08] pt-2.5 sm:pt-6 flex flex-row items-center justify-between gap-1.5 sm:gap-2 text-[#88889a] font-mono tracking-[0.06em] sm:tracking-[0.16em] uppercase transition-all duration-150 text-[7px] sm:text-[11px] overflow-hidden"
        style={{ fontSize: isMobile ? undefined : `${footerBarFontSize}px` }}
      >
        <div
          className="truncate"
          contentEditable={inlineEdit}
          data-ve-editable={inlineEdit ? "true" : undefined}
          suppressContentEditableWarning
          onBlur={(e) => onTextChange('contactCopyright', e.currentTarget.innerText)}
        >
          {contact.copyright || '© 2026 HRISHU SINHA · ALL RIGHTS RESERVED'}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 max-w-[50%] justify-end">
          <div
            className="truncate text-right"
            contentEditable={inlineEdit}
            data-ve-editable={inlineEdit ? "true" : undefined}
            suppressContentEditableWarning
            onBlur={(e) => onTextChange('contactFooterRole', e.currentTarget.innerText)}
          >
            {contact.footerRole || 'DIGITAL PRODUCT DESIGNER · CREATIVE TECHNOLOGIST'}
          </div>
        </div>
      </footer>
    </section>
  );
});
