import { useState, useEffect, useCallback, useRef } from 'react';
import { HeroCanvas } from './components/HeroCanvas';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { SelectedWorks } from './components/SelectedWorks';
import { CapabilitiesSection, ProcessSection } from './components/SkillsAndWorkflow';
import { ContactSection } from './components/ContactSection';
import { ProjectModal, ResumeModal, ToastNotice } from './components/Modals';
import FadeContent from './components/FadeContent';
import TargetCursor from './components/TargetCursor';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initialContent, initialProjects, initialCapabilities, initialProcess } from './data/initialData';
import { PortfolioContent, ProjectItem } from './types';

// Fixed Anchor Offsets specified by user
// Desktop: About: 900px, Projects: 1750px, Skills: 2600px, Workflow: 3500px, Contact: 4411px
const DESKTOP_ANCHOR_POSITIONS: Record<string, number> = {
  heroSection: 0,
  about: 900,
  selectedWorks: 1750,
  capabilities: 2600,
  process: 3500,
  contact: 4411
};

// Tablet: About: 1000px, Projects: 2350px, Skills: 3300px, Workflow: 4400px, Contact: 5588px
const TABLET_ANCHOR_POSITIONS: Record<string, number> = {
  heroSection: 0,
  about: 1000,
  selectedWorks: 2350,
  capabilities: 3300,
  process: 4400,
  contact: 5588
};

export default function App() {
  const [content] = useState<PortfolioContent>(() => {
    try {
      const saved = localStorage.getItem('portfolio_visual_editor_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.typography && (!parsed.typography.fontCondensed || parsed.typography.fontCondensed.includes('Bebas'))) {
          parsed.typography.fontCondensed = "'Anton', sans-serif";
        }
        if (parsed?.contact) {
          if (!parsed.contact.author || parsed.contact.author === 'Rayhan' || parsed.contact.author === 'Hrishu Sinha') {
            parsed.contact.author = 'Hrishu';
          }
          if (!parsed.contact.quote || parsed.contact.quote.includes('Good design')) {
            parsed.contact.quote = '"Design that speaks. Technology that delivers."';
          }
          if (!parsed.contact.topCta || parsed.contact.topCta.includes('SOMETHING GREAT') || parsed.contact.topCta.includes("LET'S CREATE")) {
            parsed.contact.topCta = 'YOUR NEXT BIG IDEA\nSTARTS HERE';
          }
          if (!parsed.contact.headline || parsed.contact.headline.includes("LET'S WORK") || parsed.contact.headlineHighlight === 'TOGETHER') {
            parsed.contact.headline = 'READY TO';
            parsed.contact.headlineHighlight = 'BUILD?';
          }
          if (parsed.contact.email?.includes('rayhan') || parsed.contact.email === 'hello@hrishusinha.com') {
            parsed.contact.email = 'hrishusinha674@gmail.com';
          }
          if (parsed.contact.phone === '+62 812 3456 7890' || !parsed.contact.phone) {
            parsed.contact.phone = '9394500884';
          }
          if (parsed.contact.location === 'Jakarta, Indonesia' || !parsed.contact.location) {
            parsed.contact.location = 'Assam, India';
          }
          if (parsed.contact.website?.includes('rayhan') || parsed.contact.website === 'www.hrishusinha.com') {
            parsed.contact.website = '';
          }
          if (parsed.contact.copyright?.includes('RAYHAN')) {
            parsed.contact.copyright = '© 2026 HRISHU SINHA · ALL RIGHTS RESERVED';
          }
        }
        if (parsed?.stats?.[0]?.number === '3+') {
          parsed.stats[0].number = '1+';
          parsed.stats[0].label = 'YEARS INTENSIVE';
        }
        if (parsed?.theme) {
          parsed.theme.fadeDuration = 1.5;
        }
        return parsed;
      }
    } catch {
      // ignore
    }
    return initialContent;
  });

  const [projects] = useState<ProjectItem[]>(initialProjects);
  const [capabilities] = useState(initialCapabilities);
  const [processList] = useState(initialProcess);

  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('heroSection');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [revealProgress, setRevealProgress] = useState(0);
  const [isHeroRevealed, setIsHeroRevealed] = useState(false);

  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const targetScrollProgressRef = useRef(0);
  const currentScrollProgressRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  const [toast, setToast] = useState<{ message: string | null; icon?: string }>({ message: null });

  const showToast = useCallback((message: string, icon = '✓') => {
    setToast({ message, icon });
    setTimeout(() => {
      setToast({ message: null });
    }, 3200);
  }, []);

  // Sync CSS variables to document root for theme styling
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent', content.theme.accentColor);
    root.style.setProperty('--accent-orange', content.theme.accentColor);
    root.style.setProperty('--font-condensed', content.typography.fontCondensed);
    root.style.setProperty('--font-heading', "'Bebas Neue', sans-serif");
    root.style.setProperty('--font-display', "'Bebas Neue', sans-serif");
  }, [content.theme.accentColor, content.typography.fontCondensed]);

  // Continuous silky-smooth damped LERP loop for reveal expansion
  useEffect(() => {
    let active = true;

    const tick = () => {
      if (!active) return;

      const target = targetProgressRef.current;
      const current = currentProgressRef.current;
      const diff = target - current;

      if (Math.abs(diff) > 0.0004) {
        const next = current + diff * 0.085;
        currentProgressRef.current = next;
        setRevealProgress(next);

        if (next >= 0.995 && target >= 1) {
          currentProgressRef.current = 1;
          setRevealProgress(1);
          setIsHeroRevealed(true);
        }
      } else if (current !== target) {
        currentProgressRef.current = target;
        setRevealProgress(target);
        if (target >= 1) {
          setIsHeroRevealed(true);
        }
      }

      // Smooth scroll animation progress (in lockstep with scrollY)
      const targetScroll = targetScrollProgressRef.current;
      const currentScroll = currentScrollProgressRef.current;
      const scrollDiff = targetScroll - currentScroll;

      if (Math.abs(scrollDiff) > 0.0001) {
        const nextScroll = currentScroll + scrollDiff * 0.22;
        currentScrollProgressRef.current = nextScroll;
        setScrollProgress(nextScroll);
      } else if (currentScroll !== targetScroll) {
        currentScrollProgressRef.current = targetScroll;
        setScrollProgress(targetScroll);
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Reveal phase gesture tracking (wheel and touch)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isResumeOpen || selectedProject) {
        const target = e.target as HTMLElement | null;
        if (target && target.closest('.resume-scroll-container, .project-modal-container')) {
          return;
        }
        e.preventDefault();
        return;
      }

      const scrollY = window.scrollY || window.pageYOffset || 0;

      // 1. Contract back into reveal card smoothly when at top
      if (isHeroRevealed && e.deltaY < -8 && scrollY <= 5) {
        e.preventDefault();
        setIsHeroRevealed(false);
        targetProgressRef.current = 0.90;
        return;
      }

      // 2. Intercept wheel to expand during initial reveal card phase
      if (!isHeroRevealed) {
        e.preventDefault();
        window.scrollTo(0, 0);

        const delta = e.deltaY * 0.0007;
        targetProgressRef.current = Math.min(1, Math.max(0, targetProgressRef.current + delta));
        return;
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isResumeOpen || selectedProject) {
        const target = e.target as HTMLElement | null;
        if (target && target.closest('.resume-scroll-container, .project-modal-container')) {
          return;
        }
        e.preventDefault();
        return;
      }
      if (!touchStartY) return;
      const currentY = e.touches[0].clientY;
      const deltaY = touchStartY - currentY;
      const scrollY = window.scrollY || window.pageYOffset || 0;

      if (isHeroRevealed && deltaY < -20 && scrollY <= 5) {
        e.preventDefault();
        setIsHeroRevealed(false);
        targetProgressRef.current = 0.90;
        touchStartY = currentY;
        return;
      }

      if (!isHeroRevealed) {
        e.preventDefault();
        window.scrollTo(0, 0);

        const factor = deltaY > 0 ? 0.0022 : 0.0032;
        targetProgressRef.current = Math.min(1, Math.max(0, targetProgressRef.current + deltaY * factor));
        touchStartY = currentY;
        return;
      }
    };

    const handleTouchEnd = () => {
      if (!isHeroRevealed && targetProgressRef.current > 0.22) {
        targetProgressRef.current = 1;
      }
      touchStartY = 0;
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isHeroRevealed, isResumeOpen, selectedProject]);

  const handleAutoExpand = useCallback(() => {
    if (isHeroRevealed) return;
    targetProgressRef.current = 1;
  }, [isHeroRevealed]);

  // Scroll listener for progress & active section tracking
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY || window.pageYOffset || 0;
          const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
          const progress = Math.min(1, Math.max(0, scrollY / maxScroll));
          targetScrollProgressRef.current = progress;

          const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1024;
          let matched = 'heroSection';

          if (isTablet) {
            // Tablet: About: 1000, Projects: 2350, Skills: 3300, Workflow: 4400, Contact: 5588
            if (scrollY >= 4994) {
              matched = 'contact';
            } else if (scrollY >= 3850) {
              matched = 'process';
            } else if (scrollY >= 2825) {
              matched = 'capabilities';
            } else if (scrollY >= 1675) {
              matched = 'selectedWorks';
            } else if (scrollY >= 500) {
              matched = 'about';
            } else {
              matched = 'heroSection';
            }
          } else {
            // Desktop (0, 900, 1750, 2600, 3500, 4411) / Mobile default
            if (scrollY >= 3950) {
              matched = 'contact';
            } else if (scrollY >= 3050) {
              matched = 'process';
            } else if (scrollY >= 2175) {
              matched = 'capabilities';
            } else if (scrollY >= 1325) {
              matched = 'selectedWorks';
            } else if (scrollY >= 450) {
              matched = 'about';
            } else {
              matched = 'heroSection';
            }
          }
          setActiveSection((prev) => (prev !== matched ? matched : prev));

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle section navigation using pixel offsets
  const handleNavigate = useCallback((sectionId: string) => {
    if (!isHeroRevealed) {
      targetProgressRef.current = 1;
      setIsHeroRevealed(true);
    }

    const isTablet = typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth <= 1024;
    const isDesktop = typeof window !== 'undefined' && window.innerWidth > 1024;

    if (isTablet && TABLET_ANCHOR_POSITIONS[sectionId] !== undefined) {
      window.scrollTo({
        top: TABLET_ANCHOR_POSITIONS[sectionId],
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
      return;
    }

    if (isDesktop && DESKTOP_ANCHOR_POSITIONS[sectionId] !== undefined) {
      window.scrollTo({
        top: DESKTOP_ANCHOR_POSITIONS[sectionId],
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
      return;
    }

    const target = document.getElementById(sectionId);
    if (target) {
      const top = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({
        top: Math.max(0, top),
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
    }
  }, [isHeroRevealed]);

  const handleOpenResume = useCallback(() => setIsResumeOpen(true), []);
  const handleCloseResume = useCallback(() => setIsResumeOpen(false), []);
  const handleSelectProject = useCallback((p: ProjectItem) => setSelectedProject(p), []);
  const handleCloseProject = useCallback(() => setSelectedProject(null), []);

  useEffect(() => {
    if (isHeroRevealed) {
      const timer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isHeroRevealed]);

  return (
    <div className="relative min-h-screen bg-transparent text-[#f4f4f6] selection:bg-[#ff7300]/30 selection:text-white">
      {/* Fixed Kinetic 3D Canvas Background with Reveal Animation on Same Canvas Layer */}
      <HeroCanvas
        accentColor={content.theme.accentColor}
        vignetteDarkness={content.theme.vignetteDarkness}
        frameIndex={content.animation.frameScrub}
        scrollProgress={scrollProgress}
        revealProgress={revealProgress}
        parallaxStrength={content.animation.parallaxStrength ?? 0}
        disableAtmosphere={content.animation.disableAtmosphere ?? true}
      />

      {/* Centered Pill Navigation Bar - Hidden on mobile devices, visible on tablets (md:) and desktop */}
      <div className={`hidden md:block transition-opacity duration-1000 ${revealProgress >= 0.75 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <Navbar
          activeSection={activeSection}
          onNavigate={handleNavigate}
          onResumeClick={handleOpenResume}
          accentColor={content.theme.accentColor}
        />
      </div>

      {/* Main Page Flow (Scrolls over Fixed Canvas) */}
      <main className="relative z-10 w-full" id="pageContent">
        <HeroSection
          content={content}
          revealProgress={revealProgress}
          onExpandClick={handleAutoExpand}
          onResumeClick={handleOpenResume}
        />

        <div className={`transition-opacity duration-700 ${isHeroRevealed ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <FadeContent
            effect={content.theme.fadeEffect || 'mist'}
            blur={content.theme.fadeBlur ?? true}
            duration={content.theme.fadeDuration ?? 1.5}
            threshold={0.08}
            className="w-full"
          >
            <AboutSection
              content={content}
              accentColor={content.theme.accentColor}
            />
          </FadeContent>

          <FadeContent
            effect={content.theme.fadeEffect || 'mist'}
            blur={content.theme.fadeBlur ?? true}
            duration={content.theme.fadeDuration ?? 1.5}
            threshold={0.08}
            className="w-full"
          >
            <SelectedWorks
              projects={projects}
              onSelectProject={handleSelectProject}
              accentColor={content.theme.accentColor}
            />
          </FadeContent>

          <FadeContent
            effect={content.theme.fadeEffect || 'mist'}
            blur={content.theme.fadeBlur ?? true}
            duration={content.theme.fadeDuration ?? 1.5}
            threshold={0.08}
            className="w-full"
          >
            <CapabilitiesSection
              capabilities={capabilities}
              accentColor={content.theme.accentColor}
              typography={content.typography}
            />
          </FadeContent>

          <FadeContent
            effect={content.theme.fadeEffect || 'mist'}
            blur={content.theme.fadeBlur ?? true}
            duration={content.theme.fadeDuration ?? 1.5}
            threshold={0.08}
            className="w-full"
          >
            <ProcessSection
              processList={processList}
              accentColor={content.theme.accentColor}
              typography={content.typography}
            />
          </FadeContent>

          <FadeContent
            effect={content.theme.fadeEffect || 'mist'}
            blur={content.theme.fadeBlur ?? true}
            duration={content.theme.fadeDuration ?? 1.5}
            threshold={0.08}
            className="w-full"
          >
            <ContactSection
              content={content}
              onShowToast={showToast}
            />
          </FadeContent>
        </div>
      </main>

      {/* Project Case Study Modal */}
      <ProjectModal
        project={selectedProject}
        accentColor={content.theme.accentColor}
        onClose={handleCloseProject}
      />

      {/* Resume Modal */}
      <ResumeModal
        content={content}
        isOpen={isResumeOpen}
        onClose={handleCloseResume}
      />

      {/* Toast Notification */}
      <ToastNotice
        message={toast.message}
        icon={toast.icon}
        accentColor={content.theme.accentColor}
      />

      {/* Kinetic Mechanical Target Cursor */}
      <TargetCursor
        targetSelector="button, a, [role='button'], input, textarea, .cursor-target"
        cursorColor="#ffffff"
        cursorColorOnTarget={content.theme.accentColor}
        blendMode="difference"
        hoverDuration={0.2}
        spinDuration={2}
        size={36}
        cornerSize={12}
        thickness={2.5}
        padding={6}
        matchRadius={true}
        dotSize={4}
        showLabel={true}
        clickEffect={true}
      />
    </div>
  );
}
