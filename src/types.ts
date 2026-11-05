export interface StatItem {
  number: string;
  label: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  year?: string;
  tags?: string[];
  summary: string;
  image: string;
  videoUrl?: string;
  layout?: 'large' | 'tall' | 'wide';
}

export interface CapabilityItem {
  index: string;
  title: string;
  description: string;
  stack: string[];
}

export interface ProcessItem {
  index: string;
  glyph: string;
  name: string;
  detail: string;
}

export interface PortfolioContent {
  greeting: string;
  name: string;
  role: string;
  description: string;
  availableStatus: string;
  tagline: string;
  watermark: string;
  stats: StatItem[];
  theme: {
    accentColor: string;
    watermarkOpacity: number;
    vignetteDarkness: number;
    fadeEffect?: 'fade' | 'focus' | 'develop' | 'dissolve' | 'mist' | 'pixel';
    fadeBlur?: boolean;
    fadeDuration?: number;
  };
  typography: {
    fontCondensed: string;
    headlineScale: number;
    nameBeginningScale?: number;
    roleFontSize: number;
    nameAlignment?: 'diagonal' | 'left' | 'center' | 'right' | 'diagonal-reverse' | 'custom';
    nameFirstWordAlign?: 'left' | 'center' | 'right';
    nameSecondWordAlign?: 'left' | 'center' | 'right';
    nameFirstWordOffset?: number;
    nameSecondWordOffset?: number;
    nameBeginningDiagonalSpread?: number;
    nameDiagonalSpread?: number;
    nameVerticalOffset?: number;
    nameHorizontalOffset?: number;
    nameRevealOffset?: number;
    nameRevealXOffset?: number;
    nameLineHeight?: number;
    aboutFontSize?: number;
    aboutHookFontSize?: number;
    aboutHeadingFontSize?: number;
    aboutManifestoFontSize?: number;
    contentBodyFontSize?: number;
    morphingFontSize?: number;
    morphingAlignment?: 'left' | 'center' | 'right';
    morphingXOffset?: number;
    techStackHeadingFontSize?: number;
    techStackTitleFontSize?: number;
    techStackDescFontSize?: number;
    techStackItemsFontSize?: number;
    processHeadingFontSize?: number;
    processTitleFontSize?: number;
    processDescFontSize?: number;
    processIconSize?: number;
    footerQuoteFontSize?: number;
    footerAuthorFontSize?: number;
    footerTopCtaFontSize?: number;
    footerHeadlineFontSize?: number;
    footerDescFontSize?: number;
    footerContactItemsFontSize?: number;
    footerBarFontSize?: number;
    resumeButtonAlign?: 'left' | 'center' | 'right';
    resumeButtonTextAlign?: 'left' | 'center' | 'right';
    resumeButtonXOffset?: number;
    resumeButtonYOffset?: number;
    resumeButtonSize?: number;
  };
  animation: {
    frameScrub: number;
    scrollDistance: number;
    useImageSequence?: boolean;
    folderPath?: string;
    frameCount?: number;
    parallaxStrength?: number;
    disableAtmosphere?: boolean;
    sectionHaltDuration?: number;
    enableSectionHalts?: boolean;
  };
  about?: {
    heading: string;
    quote: string;
    p1: string;
    p2: string;
    p3: string;
    manifesto: string;
  };
  contact: {
    quote: string;
    author: string;
    topCta: string;
    headline: string;
    headlineHighlight: string;
    description: string;
    email: string;
    website: string;
    phone: string;
    location: string;
    copyright: string;
    footerRole: string;
    resumeButtonLabel?: string;
  };
}
