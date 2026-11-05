import { useEffect } from 'react';
import { X, ExternalLink, Download, GraduationCap, Code, Award, Briefcase } from 'lucide-react';
import { ProjectItem, PortfolioContent } from '../types';
import { downloadResumePdf } from '../utils/resumeGenerator';

interface ProjectModalProps {
  project: ProjectItem | null;
  accentColor: string;
  onClose: () => void;
}

function getYouTubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match
    ? `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0&playsinline=1&mute=1&loop=1&playlist=${match[1]}`
    : null;
}

function getInstagramEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/instagram\.com\/(?:reel|p)\/([a-zA-Z0-9_-]+)/);
  return match ? `https://www.instagram.com/p/${match[1]}/embed/` : null;
}

function isDirectVideo(url?: string): boolean {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url) || url.startsWith('blob:') || url.startsWith('data:video');
}

export function ProjectModal({ project, accentColor, onClose }: ProjectModalProps) {
  if (!project) return null;

  const youtubeUrl = getYouTubeEmbedUrl(project.videoUrl);
  const instagramUrl = getInstagramEmbedUrl(project.videoUrl);
  const isVideoFile = isDirectVideo(project.videoUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-[#0e0e14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10 my-auto">
        {/* Header Media: Shielded pure video without platform overlays or click-throughs */}
        <div className="relative aspect-[16/9] w-full bg-[#08080b] shrink-0 overflow-hidden select-none">
          {youtubeUrl ? (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <iframe
                src={youtubeUrl}
                title={project.title}
                className="w-[136%] h-[136%] -ml-[18%] -mt-[18%] border-0 pointer-events-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          ) : instagramUrl ? (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <iframe
                src={instagramUrl}
                title={project.title}
                className="w-[124%] h-[124%] -ml-[12%] -mt-[12%] border-0 bg-black pointer-events-none"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
              />
            </div>
          ) : isVideoFile || (project.videoUrl && !project.videoUrl.includes('://')) ? (
            <video
              src={project.videoUrl}
              poster={project.image}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover bg-black pointer-events-none"
            />
          ) : (
            <>
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e14] via-transparent to-transparent pointer-events-none" />
            </>
          )}

          {/* Absolute click shield: intercepts all clicks so user cannot click through to YouTube/Instagram */}
          <div 
            className="absolute inset-0 z-10 cursor-default" 
            onClick={(e) => { e.stopPropagation(); }}
            onContextMenu={(e) => e.preventDefault()}
          />
          
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer shadow-lg backdrop-blur-sm"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Minimal Project Info: Title and Summary Only (no internal scroll) */}
        <div className="p-6 sm:p-7 space-y-3">
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#a0a0b4]"
                >
                  {tag}
                </span>
              ))}
              {project.year && (
                <span className="font-mono text-xs font-semibold px-2.5 py-0.5" style={{ color: accentColor }}>
                  {project.year}
                </span>
              )}
            </div>
          )}
          <h2 className="font-heading text-2xl sm:text-4xl font-normal text-white tracking-wide uppercase leading-tight">
            {project.title}
          </h2>
          <p className="text-sm sm:text-base text-[#a4a4b8] leading-relaxed">
            {project.summary}
          </p>
        </div>

        <div className="px-6 py-4 bg-[#08080b] border-t border-white/8 flex items-center justify-end">
          <a
            href="#contact"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-br from-[#e8590c] to-[#f76707] text-white font-mono text-xs font-semibold tracking-wider uppercase hover:brightness-110 shadow-lg shadow-[#f76707]/30 transition-all cursor-pointer"
          >
            <span>Inquire About Project</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

interface ResumeModalProps {
  content: PortfolioContent;
  isOpen: boolean;
  onClose: () => void;
}

export function ResumeModal({ content, isOpen, onClose }: ResumeModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const blockBackgroundScroll = (e: WheelEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('.resume-scroll-container')) return;
      e.preventDefault();
    };

    window.addEventListener('wheel', blockBackgroundScroll, { passive: false });
    window.addEventListener('touchmove', blockBackgroundScroll, { passive: false });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      window.removeEventListener('wheel', blockBackgroundScroll);
      window.removeEventListener('touchmove', blockBackgroundScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const accent = content.theme.accentColor || '#ff7300';

  const handleDownload = () => {
    downloadResumePdf(content);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Résumé Modal"
      onWheel={(e) => {
        const target = e.target as HTMLElement | null;
        if (!target?.closest('.resume-scroll-container')) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        onWheel={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onTouchMove={(e) => { e.preventDefault(); e.stopPropagation(); }}
      />

      <div 
        className="relative w-full max-w-2xl bg-[#0c0c10] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-10 my-auto flex flex-col h-[88vh] sm:h-[82vh] max-h-[820px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 sm:px-6 py-3.5 sm:py-5 bg-[#101016] border-b border-white/8 flex items-center justify-between gap-2 sm:gap-4 shrink-0">
          <div className="min-w-0 pr-2">
            <h2 className="font-heading text-xl sm:text-3xl font-normal text-white tracking-wide uppercase truncate">
              {content.name}
            </h2>
            <p className="font-mono text-[11px] sm:text-xs text-white/80 mt-0.5 truncate">
              B.Tech CSE (AI & ML) · <span style={{ color: accent }}>2024 — 2028</span>
            </p>
            <p className="text-[10px] sm:text-[11px] text-white/50 mt-0.5 font-mono truncate">
              {content.contact.location} · {content.contact.email} · {content.contact.phone}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownload}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white font-mono text-[11px] sm:text-xs flex items-center gap-1.5 border border-white/15 transition-colors cursor-pointer"
              title="Download PDF résumé"
            >
              <Download className="w-3.5 h-3.5" style={{ color: accent }} />
              <span className="hidden sm:inline">Download PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>

            <button
              onClick={onClose}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center border border-white/10 transition-colors cursor-pointer"
              aria-label="Close résumé"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div 
          className="resume-scroll-container flex-1 min-h-0 p-4 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto overscroll-contain text-xs text-white/75"
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="space-y-1.5">
            <h3 
              className="font-mono text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5"
              style={{ color: accent }}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Profile</span>
            </h3>
            <p className="text-xs leading-relaxed text-white/80">
              B.Tech Computer Science undergraduate (2024–2028) specializing in Artificial Intelligence & Machine Learning. Focused on high-performance software engineering, modern web architectures, and cinematic visual systems.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/6">
            <h3 
              className="font-mono text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5"
              style={{ color: accent }}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Education</span>
            </h3>
            
            <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-white text-xs">Bachelor of Technology (B.Tech) - Computer Science & Engineering</div>
                  <div className="text-[11px] text-white/70 mt-0.5">Specialization in Artificial Intelligence & Machine Learning (AI & ML)</div>
                  <div className="text-[10px] text-white/45 mt-1 font-mono">Core: Neural Networks, Machine Learning, Data Structures & Algorithms, Object-Oriented Software</div>
                </div>
                <span 
                  className="font-mono text-[11px] font-bold whitespace-nowrap pl-3"
                  style={{ color: accent }}
                >
                  2024 — 2028
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/6">
            <h3 
              className="font-mono text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5"
              style={{ color: accent }}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Technical Competencies</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/6 space-y-1">
                <span className="font-mono text-[10px] uppercase font-semibold text-white/50 block">Core CS & AI/ML</span>
                <span className="font-mono text-[11px] text-white block">Python, C++, Java, Machine Learning, DSA</span>
              </div>

              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/6 space-y-1">
                <span className="font-mono text-[10px] uppercase font-semibold text-white/50 block">Web Development</span>
                <span className="font-mono text-[11px] text-white block">TypeScript, React, HTML5, CSS3, Tailwind CSS</span>
              </div>

              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/6 space-y-1">
                <span className="font-mono text-[10px] uppercase font-semibold text-white/50 block">Motion & Media</span>
                <span className="font-mono text-[11px] text-white block">Adobe Premiere Pro, After Effects, Motion Graphics</span>
              </div>

              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/6 space-y-1">
                <span className="font-mono text-[10px] uppercase font-semibold text-white/50 block">Tooling & Workflow</span>
                <span className="font-mono text-[11px] text-white block">Git, GitHub, VS Code, Visual Studio, Vite</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/6">
            <h3 
              className="font-mono text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5"
              style={{ color: accent }}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Engineering & Creative Experience</span>
            </h3>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/6 space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-white text-xs">Software & Frontend Engineering</span>
                  <span 
                    className="font-mono text-[10px] font-bold"
                    style={{ color: accent }}
                  >
                    2024 — Present
                  </span>
                </div>
                <ul className="space-y-1 text-white/70 text-[11px]">
                  <li className="flex items-start gap-1.5">
                    <span style={{ color: accent }}>•</span>
                    <span>Engineered responsive web applications prioritizing spatial math, performance, and modern component systems.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span style={{ color: accent }}>•</span>
                    <span>Built software prototypes combining machine learning concepts with interactive user interfaces.</span>
                  </li>
                </ul>
              </div>

              <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/6 space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-white text-xs">Cinematic Video & Motion Design</span>
                  <span 
                    className="font-mono text-[10px] font-bold"
                    style={{ color: accent }}
                  >
                    2024 — Present
                  </span>
                </div>
                <ul className="space-y-1 text-white/70 text-[11px]">
                  <li className="flex items-start gap-1.5">
                    <span style={{ color: accent }}>•</span>
                    <span>Produced high-fidelity timeline video edits and kinetic visual effects using Premiere Pro and After Effects.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span style={{ color: accent }}>•</span>
                    <span>Composed visual pacing, color grading, and motion graphics for digital presentations.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ToastNoticeProps {
  message: string | null;
  icon?: string;
  accentColor: string;
}

export function ToastNotice({ message, icon = '✓', accentColor }: ToastNoticeProps) {
  if (!message) return null;

  return (
    <div
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[100001] flex items-center gap-2.5 px-6 py-3 rounded-full border text-xs font-semibold text-white shadow-2xl backdrop-blur-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-4"
      style={{
        backgroundColor: 'rgba(20, 18, 22, 0.95)',
        borderColor: accentColor,
        boxShadow: `0 10px 30px rgba(0,0,0,0.8), 0 0 20px ${accentColor}40`
      }}
    >
      <span className="text-sm font-bold" style={{ color: accentColor }}>
        {icon}
      </span>
      <span>{message}</span>
    </div>
  );
}
