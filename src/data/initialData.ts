import { PortfolioContent, ProjectItem, CapabilityItem, ProcessItem } from '../types';

export const initialContent: PortfolioContent = {
  greeting: "Hello, I'm",
  name: "HRISHU SINHA",
  role: "CSE Student & Creative Developer",
  description: "I design and build stylish, interactive websites, software projects, and creative digital experiences with obsessive attention to craft.",
  availableStatus: "AVAILABLE WORLDWIDE",
  tagline: "When you see an IDEA,\nI see something to CREATE",
  watermark: "WELCOME",
  stats: [
    { number: "THINK", label: "" },
    { number: "OUT OF ", label: "" },
    { number: "THE BOX", label: "" }
  ],
  theme: {
    accentColor: "#ff7300",
    watermarkOpacity: 22,
    vignetteDarkness: 85,
    fadeDuration: 1.5,
    fadeEffect: "pixel",
    fadeBlur: false
  },
  typography: {
    fontCondensed: "'Anton', sans-serif",
    headlineScale: 110,
    roleFontSize: 1,
    nameAlignment: "diagonal",
    nameDiagonalSpread: 400,
    nameVerticalOffset: 0,
    nameHorizontalOffset: 0,
    nameRevealOffset: 75,
    nameLineHeight: 0.85,
    nameBeginningScale: 90,
    nameRevealXOffset: 0,
    nameBeginningDiagonalSpread: 762,
    aboutFontSize: 18,
    aboutHookFontSize: 23,
    aboutManifestoFontSize: 28,
    techStackTitleFontSize: 40,
    techStackDescFontSize: 18,
    techStackItemsFontSize: 20,
    techStackHeadingFontSize: 60,
    morphingXOffset: -6,
    morphingFontSize: 28,
    footerQuoteFontSize: 60,
    footerAuthorFontSize: 25,
    footerTopCtaFontSize: 35,
    footerHeadlineFontSize: 121,
    footerContactItemsFontSize: 18,
    footerBarFontSize: 12,
    processTitleFontSize: 50,
    processDescFontSize: 20,
    processIconSize: 26,
    processHeadingFontSize: 56,
    resumeButtonAlign: "center",
    resumeButtonTextAlign: "center",
    resumeButtonXOffset: -91,
    resumeButtonYOffset: 0,
    resumeButtonSize: 70
  },
  animation: {
    frameScrub: 0,
    scrollDistance: 5000,
    useImageSequence: true,
    folderPath: "/frames",
    frameCount: 144,
    parallaxStrength: 5,
    disableAtmosphere: true,
    sectionHaltDuration: 0,
    enableSectionHalts: false
  },
  about: {
    heading: "Who am I?",
    quote: "I’ve always been curious about how things are made—and even more curious about how I can make them better.",
    p1: "I’m a Computer Science student who found a passion for both technology and creativity. Coding gives me a way to solve problems; design and visual work give me a way to express ideas.",
    p2: "I’m drawn to projects that don’t just work—they look, feel, and perform differently. Whether it’s an interactive website, a software project, or a cinematic visual, I enjoy taking a concept from “What if?” to “It actually exists.”",
    p3: "I’m still at the beginning of my journey, but I’m building every step of the way.",
    manifesto: "Code it. Create it. Make it unforgettable."
  },
  contact: {
    quote: '"Design that speaks. Technology that delivers."',
    author: "Hrishu",
    topCta: "YOUR NEXT BIG IDEA\nSTARTS HERE",
    headline: "READY TO",
    headlineHighlight: "BUILD?",
    description: "I'm currently open for new projects and collaborations.\nLet's create something amazing that drives results.",
    email: "hrishusinha674@gmail.com",
    website: "",
    phone: "9394500884",
    location: "Assam, India",
    copyright: "© 2026 HRISHU SINHA · ALL RIGHTS RESERVED",
    footerRole: "WEB DESIGNER · DIGITAL CREATOR",
    resumeButtonLabel: "Pull to Download Resume"
  }
};

export const initialProjects: ProjectItem[] = [
  {
    id: "bgmi-edit",
    title: "BGMI Edit",
    year: "2026",
    layout: "large",
    tags: ["Adobe After Effects","Montage"],
    summary: "A gameplay montage of Battlegrounds Mobile India",
    image: "/images/short.JPG",
    videoUrl: "/videos/short.mp4"
  },
  {
    id: "insta",
    title: "Timelapse Edit",
    year: "2026",
    layout: "tall",
    tags: ["Instagram Reels","AMV Edit"],
    summary: "Flashy edits for reels on instagram",
    image: "/images/insta.JPG",
    videoUrl: "/videos/insta.mp4"
  },
  {
    id: "monatage",
    title: "Gameplay Edit",
    year: "2026",
    layout: "wide",
    tags: ["Youtube Edit","Video Game Highlights"],
    summary: "A calma and peaceful highlight edit of the gameplay for youtube",
    image: "/images/youtube.JPG",
    videoUrl: "/videos/youtube.mp4"
  },
  {
    id: "Agora",
    title: "Web Client",
    year: "2026",
    layout: "wide",
    tags: ["Website","HTML"],
    summary: "A website with complete UI/UX designing with multiple landaing pages for my client",
    image: "/images/agora.JPG",
    videoUrl: "/videos/agora.mp4"
  },
];

export const initialCapabilities: CapabilityItem[] = [
  {
    index: "01",
    title: "Programming & Web",
    description: "Core algorithms, object-oriented software engineering, script automation, and responsive web structure.",
    stack: ["C++", "Python", "Java", "HTML", "CSS"]
  },
  {
    index: "02",
    title: "Developer Tools",
    description: "Integrated development environments, debugging suites, and collaborative Git version control.",
    stack: ["VS Code", "Visual Studio", "Git"]
  },
  {
    index: "03",
    title: "Creative & Motion",
    description: "Cinematic timeline editing, dynamic motion graphics, visual effects, and post-production workflows.",
    stack: ["After Effects", "Premiere Pro"]
  }
];

export const initialProcess: ProcessItem[] = [
  {
    index: "01",
    glyph: "✦",
    name: "Discover",
    detail: "Deconstructing core business goals, target audience psychology, and establishing measurable product benchmarks."
  },
  {
    index: "02",
    glyph: "◈",
    name: "Architecture",
    detail: "Structuring intuitive information layouts, building component hierarchies, and locking typography and color tokens."
  },
  {
    index: "03",
    glyph: "❆",
    name: "Prototype",
    detail: "Breathing life into screens with tactile motion choreography, scroll-driven dynamics, and fluid physics."
  },
  {
    index: "04",
    glyph: "▲",
    name: "Deploy",
    detail: "Comprehensive cross-device stress testing, asset minification, Lighthouse auditing, and reliable production launch."
  }
];
