import { memo } from 'react';
import { ChromaGrid, ChromaItem, DEFAULT_ITEMS } from './ChromaGrid';
import { ProjectItem } from '../types';

interface SelectedWorksProps {
  projects?: ProjectItem[];
  accentColor: string;
  onSelectProject?: (project: ProjectItem) => void;
  customImages?: string[];
  customTitles?: string[];
}

export const SelectedWorks = memo(function SelectedWorks({
  projects = [],
  accentColor,
  onSelectProject,
  customImages,
  customTitles
}: SelectedWorksProps) {
  const accents = [
    accentColor,
    '#ff8a4c',
    '#ff5a36',
    '#a98bff',
    '#7cc4ff',
    '#ff7eb6'
  ];

  const items: ChromaItem[] = projects.length > 0
    ? projects.map((p, idx) => ({
        image: customImages?.[idx] || p.image,
        title: customTitles?.[idx] || p.title,
        subtitle: p.tags?.slice(0, 2).join(' · ') || p.summary || p.year,
        accent: accents[idx % accents.length] || accentColor,
        onClick: () => onSelectProject?.(p)
      }))
    : DEFAULT_ITEMS;

  return (
    <section 
      className="relative z-10 min-h-0 sm:min-h-screen flex flex-col justify-center py-6 sm:py-16 px-4 sm:px-12 lg:px-16 bg-transparent text-white" 
      id="selectedWorks"
    >
      <div className="max-w-[1600px] w-full mx-auto flex flex-col">
        {/* Section Header - Perfectly realigned to match About section heading */}
        <div className="w-full text-left flex flex-col items-start pb-2.5 sm:pb-4 mb-3 sm:mb-6 border-b border-white/10 bg-transparent">
          <div className="inline-flex items-center gap-2 mb-1.5 sm:mb-2.5">
            <span 
              className="w-1.5 h-1.5 rounded-full animate-pulse" 
              style={{ backgroundColor: accentColor }} 
            />
            <span 
              className="font-mono text-[9px] sm:text-[11px] font-semibold tracking-[0.2em] uppercase" 
              style={{ color: accentColor }}
            >
              // 02 · Projects & Archive
            </span>
          </div>
          <h2 className="font-heading text-2xl sm:text-5xl lg:text-6xl font-normal tracking-wide text-white uppercase text-left drop-shadow-md">
            PROJECTS & GALLERY
          </h2>
        </div>

        {/* ChromaGrid Animated Showcase - Centered with increased aesthetic breadth */}
        <div className="w-full max-w-[1240px] mx-auto">
          <ChromaGrid 
            items={items}
            columns={3}
            gap={16}
            radius={260}
            cardRadius={18}
            aspectRatio="16 / 9"
            theme="dark"
            glow={0.7}
            borderGlow={1}
            reveal="spotlight"
          />
        </div>
      </div>
    </section>
  );
});

export default SelectedWorks;
