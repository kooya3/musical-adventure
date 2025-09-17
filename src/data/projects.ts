import { ProjectData } from '@/components/ProjectPortal'

export const projectsData: ProjectData[] = [
  {
    id: 'hackathon-ai-winner',
    title: 'Davis & Shirtliff AI Hackathon Winner',
    description: 'AI-powered water management system that won first place',
    longDescription: 'Led a team to victory in the 2025 Davis & Shirtliff AI Hackathon by developing an innovative AI-powered water management system. The solution leverages machine learning to optimize water distribution, predict maintenance needs, and reduce waste in industrial water systems.',
    image: '/projects/hackathon.jpg',
    tags: ['AI/ML', 'Python', 'TensorFlow', 'IoT', 'Winner'],
    liveUrl: 'https://hackathon-demo.vercel.app',
    githubUrl: 'https://github.com/kooya3/water-ai',
    features: [
      'Real-time water consumption monitoring and analytics',
      'Predictive maintenance using machine learning algorithms',
      'Automated leak detection with 95% accuracy',
      'Mobile app for remote system management',
      'Integration with IoT sensors and industrial systems'
    ],
    techStack: ['Python', 'TensorFlow', 'React Native', 'Node.js', 'MongoDB', 'AWS IoT', 'Docker'],
    role: 'Team Lead & AI Engineer',
    team: '4 developers',
    duration: '48 hours',
    challenges: [
      'Processing real-time sensor data at scale',
      'Building accurate ML models with limited training data',
      'Creating intuitive UI for non-technical users'
    ],
    solutions: [
      'Implemented stream processing with Apache Kafka',
      'Used transfer learning and data augmentation',
      'Conducted user testing and iterative design'
    ],
    metrics: [
      { label: 'Water Saved', value: '30%' },
      { label: 'Prize Won', value: '$10,000' },
      { label: 'Accuracy', value: '95%' }
    ],
    color: {
      primary: '#06b6d4',
      secondary: '#8b5cf6'
    }
  },
  {
    id: 'yc-saas-platform',
    title: 'YC Startup SaaS Platform',
    description: 'Full-stack platform for YC S23 startup serving 1000+ users',
    longDescription: 'Developed a comprehensive SaaS platform for a Y Combinator-backed startup, handling everything from architecture design to deployment. The platform now serves over 1000 active users with 99.9% uptime.',
    image: '/projects/saas.jpg',
    tags: ['Next.js', 'TypeScript', 'PostgreSQL', 'AWS', 'Enterprise'],
    liveUrl: 'https://platform-demo.vercel.app',
    features: [
      'Multi-tenant architecture with role-based access control',
      'Real-time collaboration features using WebSockets',
      'Automated billing and subscription management',
      'Advanced analytics dashboard with data visualization',
      'API integration with 20+ third-party services'
    ],
    techStack: ['Next.js 14', 'TypeScript', 'PostgreSQL', 'Prisma', 'Redis', 'AWS', 'Stripe', 'WebSockets'],
    role: 'Full-Stack Lead Developer',
    team: 'Remote team of 6',
    duration: '6 months',
    challenges: [
      'Scaling to handle 10x user growth',
      'Implementing complex permission systems',
      'Ensuring data security and GDPR compliance'
    ],
    solutions: [
      'Implemented horizontal scaling with load balancing',
      'Built flexible RBAC system with granular permissions',
      'Added encryption, audit logs, and compliance features'
    ],
    metrics: [
      { label: 'Active Users', value: '1000+' },
      { label: 'Uptime', value: '99.9%' },
      { label: 'Response Time', value: '<200ms' }
    ],
    color: {
      primary: '#f97316',
      secondary: '#06b6d4'
    }
  },
  {
    id: 'ai-portfolio',
    title: '3D Interactive Portfolio',
    description: 'Award-winning portfolio with Three.js and custom shaders',
    longDescription: 'This cutting-edge portfolio showcases advanced 3D graphics and interactive experiences using Three.js, custom GLSL shaders, and modern web technologies. Features immersive animations and unique user interactions.',
    image: '/projects/portfolio.jpg',
    tags: ['Three.js', 'GLSL', 'React', 'WebGL', 'Creative'],
    liveUrl: 'https://elyees.dev',
    githubUrl: 'https://github.com/kooya3/portfolio',
    features: [
      'Custom GLSL shaders for holographic effects',
      'Interactive 3D model viewer with smooth transitions',
      'Post-processing effects including bloom and DOF',
      'Responsive design with mobile optimization',
      'SEO optimized with structured data'
    ],
    techStack: ['Next.js 15', 'Three.js', 'GLSL', 'TypeScript', 'Framer Motion', 'GSAP', 'Tailwind CSS'],
    role: 'Creator & Developer',
    team: 'Solo project',
    duration: '2 weeks',
    challenges: [
      'Optimizing 3D performance on mobile devices',
      'Creating smooth transitions between scenes',
      'Balancing visual effects with performance'
    ],
    solutions: [
      'Implemented LOD and frustum culling',
      'Used GSAP for optimized animations',
      'Added dynamic quality settings based on device'
    ],
    metrics: [
      { label: 'Lighthouse Score', value: '95+' },
      { label: 'Load Time', value: '<2s' },
      { label: 'FPS', value: '60' }
    ],
    color: {
      primary: '#8b5cf6',
      secondary: '#ec4899'
    }
  },
  {
    id: 'spacetime-visualization',
    title: 'Spacetime Visualization',
    description: 'Interactive 3D visualization of spacetime concepts',
    longDescription: 'An educational platform that brings complex physics concepts to life through interactive 3D visualizations. Built for fun to explore the intersection of physics, mathematics, and creative coding.',
    image: '/projects/spacetime.jpg',
    tags: ['Three.js', 'Physics', 'Education', 'WebGL', 'Creative'],
    liveUrl: 'https://spacetime-chi.vercel.app/',
    githubUrl: 'https://github.com/kooya3/spacetime',
    features: [
      'Interactive spacetime fabric simulation',
      'Real-time gravity well visualizations',
      'Time dilation demonstrations',
      'Particle system simulations',
      'Educational tooltips and explanations'
    ],
    techStack: ['React', 'Three.js', 'React Three Fiber', 'GLSL', 'Vercel'],
    role: 'Creator & Developer',
    team: 'Solo project',
    duration: '1 week',
    challenges: [
      'Accurately representing complex physics concepts',
      'Making abstract concepts visually intuitive',
      'Optimizing particle simulations'
    ],
    solutions: [
      'Collaborated with physics educators for accuracy',
      'Used color gradients and animations for clarity',
      'Implemented GPU-based particle calculations'
    ],
    metrics: [
      { label: 'Unique Visitors', value: '5000+' },
      { label: 'Avg. Session', value: '8 min' },
      { label: 'Stars', value: '120+' }
    ],
    color: {
      primary: '#3b82f6',
      secondary: '#8b5cf6'
    }
  },
  {
    id: 'ai-challenge-dashboard',
    title: 'AI Challenge Platform',
    description: 'Competitive AI challenge platform with real-time leaderboards',
    longDescription: 'A comprehensive platform for hosting AI challenges and competitions. Features real-time leaderboards, automated evaluation systems, and interactive dashboards for participants and organizers.',
    image: '/projects/ai-challenge.jpg',
    tags: ['AI/ML', 'Dashboard', 'Real-time', 'Competition', 'Analytics'],
    liveUrl: 'https://ai-challenge-sigma.vercel.app/dashboard',
    githubUrl: 'https://github.com/kooya3/ai-challenge',
    features: [
      'Real-time leaderboard with live updates',
      'Automated code evaluation and scoring',
      'Interactive data visualization dashboards',
      'Team collaboration features',
      'Resource monitoring and usage analytics'
    ],
    techStack: ['Next.js', 'Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes'],
    role: 'Full-Stack Developer',
    team: 'Team of 3',
    duration: '2 months',
    challenges: [
      'Handling concurrent code submissions',
      'Preventing cheating and ensuring fair play',
      'Scaling evaluation infrastructure'
    ],
    solutions: [
      'Implemented queue-based processing with Redis',
      'Added plagiarism detection and sandboxing',
      'Used Kubernetes for auto-scaling'
    ],
    metrics: [
      { label: 'Participants', value: '500+' },
      { label: 'Submissions', value: '10k+' },
      { label: 'Uptime', value: '99.9%' }
    ],
    color: {
      primary: '#10b981',
      secondary: '#06b6d4'
    }
  },
  {
    id: 'e-commerce-redesign',
    title: 'E-Commerce Platform Redesign',
    description: 'Complete redesign increasing conversion by 40%',
    longDescription: 'Led the complete redesign and optimization of a major e-commerce platform, focusing on user experience, performance, and conversion rate optimization. The redesign resulted in significant improvements across all key metrics.',
    image: '/projects/ecommerce.jpg',
    tags: ['UX/UI', 'React', 'Performance', 'A/B Testing', 'Analytics'],
    liveUrl: 'https://shop-demo.vercel.app',
    features: [
      'Modern, responsive design system',
      'Optimized checkout flow reducing cart abandonment',
      'Personalized product recommendations using ML',
      'Advanced search with filters and sorting',
      'Progressive Web App capabilities'
    ],
    techStack: ['React', 'Next.js', 'Tailwind CSS', 'Stripe', 'Algolia', 'Sanity CMS'],
    role: 'Lead Frontend Developer',
    team: 'Cross-functional team of 8',
    duration: '4 months',
    challenges: [
      'Migrating without downtime',
      'Maintaining SEO rankings during redesign',
      'Improving performance with large catalog'
    ],
    solutions: [
      'Implemented phased rollout strategy',
      'Preserved URL structure and added redirects',
      'Added lazy loading and virtualization'
    ],
    metrics: [
      { label: 'Conversion Rate', value: '+40%' },
      { label: 'Page Speed', value: '+60%' },
      { label: 'Revenue', value: '+25%' }
    ],
    color: {
      primary: '#ec4899',
      secondary: '#f97316'
    }
  }
]