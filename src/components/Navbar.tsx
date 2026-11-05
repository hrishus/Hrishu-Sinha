import { useEffect, useState, useRef, memo } from 'react';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onResumeClick?: () => void;
  accentColor?: string;
}

export const Navbar = memo(function Navbar({ 
  activeSection, 
  onNavigate, 
  accentColor = '#ff7300' 
}: NavbarProps) {
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const threshold = 8;
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 70) {
        if (currentScrollY - lastScrollY.current > threshold) {
          // Scrolling down -> hide navbar
          setIsScrolledDown(true);
        } else if (lastScrollY.current - currentScrollY > threshold) {
          // Scrolling up -> unhide navbar
          setIsScrolledDown(false);
        }
      } else {
        // At the very top -> always visible
        setIsScrolledDown(false);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { label: 'HOME', id: 'heroSection' },
    { label: 'ABOUT', id: 'about' },
    { label: 'PROJECTS', id: 'selectedWorks' },
    { label: 'SKILLS', id: 'capabilities' },
    { label: 'WORKFLOW', id: 'process' },
    { label: 'CONTACT', id: 'contact' },
  ];

  // Hidden state is active when scrolled down and not hovered
  const isHidden = isScrolledDown && !isHovered;

  return (
    <header 
      className="hidden md:flex fixed top-0 left-0 right-0 z-40 justify-center pointer-events-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Invisible hover trigger zone at the top of the screen to reveal when hovering near hidden navbar */}
      <div 
        className="absolute top-0 left-0 right-0 h-14 pointer-events-auto cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        aria-hidden="true"
      />

      <div 
        className={`pointer-events-auto transition-transform duration-300 ease-out transform ${
          isHidden ? '-translate-y-[calc(100%-12px)]' : 'translate-y-4'
        }`}
        onMouseEnter={() => setIsHovered(true)}
      >
        {/* Pure CSS Frosted Glass Pill Container (No Refraction / No Distortion) */}
        <div 
          className="relative rounded-full bg-[#0a0a10]/75 backdrop-blur-xl border border-white/[0.12] shadow-2xl shadow-black/80 px-2 py-1 flex items-center gap-1 sm:gap-1.5 transition-all duration-200"
          style={{
            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
          }}
        >
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.label}
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(item.id);
                }}
                style={{
                  color: isActive ? accentColor : undefined,
                  textShadow: isActive ? `0 0 14px ${accentColor}90` : undefined,
                }}
                className={`px-3 sm:px-4 py-1.5 rounded-full font-mono text-[11px] uppercase tracking-[0.15em] transition-all duration-200 cursor-pointer select-none bg-transparent ${
                  isActive
                    ? 'font-bold'
                    : 'text-[#b4b4c8] hover:text-white font-medium hover:bg-white/[0.04]'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          {/* Small Peek Indicator Tab at the Bottom of Pill (visible when navbar is partially hidden) */}
          <div 
            className={`absolute left-1/2 -translate-x-1/2 bottom-0 w-8 h-[3px] rounded-full transition-opacity duration-300 pointer-events-none ${
              isHidden ? 'opacity-80' : 'opacity-0'
            }`}
            style={{ backgroundColor: accentColor }}
          />
        </div>
      </div>
    </header>
  );
});
