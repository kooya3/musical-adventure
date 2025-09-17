export const SITE_CONFIG = {
  name: "Elyees Waweru Tatua",
  title: "Frontend Software Engineer | Full-Stack Developer",
  description: "Innovative fullstack developer with 4+ years of experience crafting exceptional web experiences. Specializing in React, Next.js, and cutting-edge 3D web technologies.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://elyees-portfolio.vercel.app",
  ogImage: "/og-image.jpg",
  links: {
    github: "https://github.com/kooya3",
    linkedin: "https://linkedin.com/in/elyees-tatua",
    email: "elyees.dev@gmail.com"
  }
} as const

export const CAREER_TIMELINE = [
  {
    year: "2025",
    title: "AI Hackathon Winner",
    company: "Davis & Shirtliff",
    description: "Built an AI-powered product manual system that won first place",
    type: "achievement" as const,
    icon: "🏆"
  },
  {
    year: "2024",
    title: "YC Startup Experience",
    company: "Various Startups",
    description: "Contributed to Y Combinator backed startups, building scalable web solutions",
    type: "role" as const,
    icon: "🚀"
  },
  {
    year: "2024",
    title: "Technical Consultant",
    company: "JamiiYaJadeite Foundation",
    description: "Led digital transformation initiatives for non-profit organization",
    type: "role" as const,
    icon: "💼"
  },
  {
    year: "2023",
    title: "Frontend Developer",
    company: "Vop, Am Pm",
    description: "Built responsive web applications with React and modern frontend technologies",
    type: "role" as const,
    icon: "💻"
  },
  {
    year: "2022-2023",
    title: "Dean's List",
    company: "University",
    description: "Maintained academic excellence while building practical development skills",
    type: "achievement" as const,
    icon: "🎓"
  },
  {
    year: "2022",
    title: "Software Developer",
    company: "Kievy Investments",
    description: "Started professional development journey, building financial software solutions",
    type: "role" as const,
    icon: "🏢"
  }
] as const

export const SKILLS = {
  frontend: [
    { name: "React", level: 95, color: "#61DAFB" },
    { name: "Next.js", level: 90, color: "#000000" },
    { name: "TypeScript", level: 85, color: "#3178C6" },
    { name: "Three.js", level: 80, color: "#049EF4" },
    { name: "Tailwind CSS", level: 90, color: "#06B6D4" }
  ],
  backend: [
    { name: "Node.js", level: 85, color: "#339933" },
    { name: "Python", level: 80, color: "#3776AB" },
    { name: "MongoDB", level: 75, color: "#47A248" },
    { name: "PostgreSQL", level: 70, color: "#336791" }
  ],
  tools: [
    { name: "Docker", level: 75, color: "#2496ED" },
    { name: "AWS", level: 70, color: "#FF9900" },
    { name: "Git", level: 90, color: "#F05032" },
    { name: "Vercel", level: 85, color: "#000000" }
  ]
} as const

export const PROJECTS = [
  {
    id: "ai-manual",
    title: "AI Powered Product Manual",
    description: "Award-winning AI system for Davis & Shirtliff that revolutionizes product documentation",
    tech: ["React", "Python", "OpenAI", "FastAPI"],
    github: "https://github.com/kooya3/ai-product-manual",
    demo: "https://ai-manual-demo.vercel.app",
    image: "/projects/ai-manual.jpg",
    featured: true,
    award: "🏆 Davis & Shirtliff Hackathon Winner"
  },
  {
    id: "ecommerce-platform",
    title: "State-of-the-art E-commerce Platform",
    description: "Modern e-commerce solution with advanced search, payments, and analytics",
    tech: ["Next.js", "Node.js", "MongoDB", "Stripe"],
    github: "https://github.com/kooya3/ecommerce-platform",
    demo: "https://ecommerce-demo.vercel.app",
    image: "/projects/ecommerce.jpg",
    featured: true
  },
  {
    id: "real-estate",
    title: "Real Estate Platform",
    description: "Comprehensive real estate platform with virtual tours and property management",
    tech: ["React", "Express", "PostgreSQL", "Maps API"],
    github: "https://github.com/kooya3/real-estate-platform",
    demo: "https://realestate-demo.vercel.app",
    image: "/projects/real-estate.jpg",
    featured: true
  },
  {
    id: "elyssa-gym",
    title: "Elyssa Gym App",
    description: "Fitness tracking application with workout plans and progress monitoring",
    tech: ["React Native", "Firebase", "Node.js"],
    github: "https://github.com/kooya3/elyssa-gym-app",
    demo: "https://gym-app-demo.vercel.app",
    image: "/projects/gym-app.jpg",
    featured: false
  },
  {
    id: "music-web-app",
    title: "Music Web Application",
    description: "Spotify-like music streaming platform with playlist management",
    tech: ["Vue.js", "Express", "MongoDB", "Web Audio API"],
    github: "https://github.com/kooya3/music-web-app",
    demo: "https://music-demo.vercel.app",
    image: "/projects/music-app.jpg",
    featured: false
  }
] as const

export const PERFORMANCE_TARGETS = {
  loading: {
    firstMeaningfulPaint: 1500, // ms
    threeInteractive: 3000, // ms
    totalAssetBudget: 5 * 1024 * 1024, // 5MB
  },
  runtime: {
    desktopFps: 60,
    mobileFps: 30,
    maxDrawCalls: 100,
    memoryLimit: 500 * 1024 * 1024, // 500MB
  }
} as const

export const ANIMATIONS = {
  ease: {
    default: [0.6, 0.01, -0.05, 0.95],
    smooth: [0.25, 0.46, 0.45, 0.94],
    bounce: [0.68, -0.55, 0.265, 1.55],
  },
  duration: {
    fast: 0.3,
    medium: 0.6,
    slow: 1.2,
  }
} as const