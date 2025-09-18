'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Github, ExternalLink, Star, GitFork, Award, Calendar, Users, Code2 } from 'lucide-react'
import InteractiveModelScene from '@/components/3d/InteractiveModelScene'

interface ProjectData {
  id: string
  title: string
  description: string
  longDescription: string
  technologies: string[]
  github?: string
  demo?: string
  image: string
  featured: boolean
  award?: string
  stars?: number
  forks?: number
  contributors?: number
  startDate?: string
  endDate?: string
  role?: string
  teamSize?: number
  challenges?: string[]
  solutions?: string[]
  impact?: string[]
  screenshots?: string[]
  modelPath?: string
}

const projectsData: ProjectData[] = [
  {
    id: 'ai-manual',
    title: 'AI Powered Product Manual',
    description: 'Award-winning AI system for Davis & Shirtliff that revolutionizes product documentation',
    longDescription: 'Developed an innovative AI-based customer support system with advanced analytics and performance monitoring. This solution transformed how Davis & Shirtliff handles product documentation, providing instant, intelligent responses to customer queries while tracking engagement metrics in real-time.',
    technologies: ['React', 'Node.js', 'OpenAI GPT-4', 'Python', 'FastAPI', 'MongoDB', 'D3.js', 'Docker'],
    github: 'https://github.com/kooya3/ai-product-manual',
    demo: 'https://ai-manual-demo.vercel.app',
    image: '/projects/ai-manual.jpg',
    featured: true,
    award: 'Davis & Shirtliff Hackathon Season 4 Winner',
    stars: 45,
    forks: 12,
    contributors: 5,
    startDate: 'Mar 2025',
    endDate: 'May 2025',
    role: 'Lead Developer',
    teamSize: 4,
    challenges: [
      'Processing large volumes of technical documentation',
      'Ensuring AI response accuracy for technical queries',
      'Real-time performance monitoring across distributed systems'
    ],
    solutions: [
      'Implemented vector embeddings for efficient document search',
      'Fine-tuned GPT-4 model with domain-specific training data',
      'Built custom analytics dashboard with D3.js for real-time metrics'
    ],
    impact: [
      '70% reduction in customer support response time',
      '95% accuracy in technical query responses',
      'Processed over 10,000 product manuals'
    ],
    modelPath: '/2.0/SciFiHelmet/glTF/SciFiHelmet.gltf'
  },
  {
    id: 'ecommerce-platform',
    title: 'State-of-the-art E-commerce Platform',
    description: 'Modern e-commerce solution with Microsoft Business Central integration',
    longDescription: 'Built a comprehensive e-commerce platform seamlessly integrated with Microsoft Business Central for real-time inventory management. The platform features secure payment processing, advanced search capabilities, and an intuitive admin interface designed for streamlined operations.',
    technologies: ['TypeScript', 'Next.js', 'Payload CMS', 'Microsoft Business Central', 'Stripe', 'Redis', 'PostgreSQL'],
    github: 'https://github.com/kooya3/ecommerce-platform',
    demo: 'https://ecommerce-demo.vercel.app',
    image: '/projects/ecommerce.jpg',
    featured: true,
    stars: 7,
    forks: 2,
    contributors: 3,
    startDate: 'Jun 2024',
    endDate: 'Sep 2024',
    role: 'Full-Stack Developer',
    teamSize: 3,
    challenges: [
      'Complex inventory synchronization with Business Central',
      'Handling high-traffic during sales events',
      'Multi-currency and multi-language support'
    ],
    solutions: [
      'Implemented webhook-based real-time sync',
      'Added Redis caching and CDN optimization',
      'Built modular internationalization system'
    ],
    impact: [
      'Handled 50,000+ concurrent users',
      '$2M+ in processed transactions',
      '40% improvement in conversion rate'
    ],
    modelPath: '/2.0/BoomBox/glTF-Binary/BoomBox.glb'
  },
  {
    id: 'real-estate',
    title: 'Real Estate Platform',
    description: 'Comprehensive property management system with virtual tours',
    longDescription: 'Created a full-featured real estate platform enabling property listings, agent profiles, and advanced search functionality. The platform includes virtual tour capabilities, real-time property updates, and a responsive design optimized for all devices.',
    technologies: ['JavaScript', 'React', 'Node.js', 'Express', 'PostgreSQL', 'Google Maps API', 'Three.js'],
    github: 'https://github.com/kooya3/real-estate-platform',
    demo: 'https://realestate-demo.vercel.app',
    image: '/projects/real-estate.jpg',
    featured: true,
    stars: 9,
    forks: 2,
    contributors: 2,
    startDate: 'Jan 2024',
    endDate: 'Apr 2024',
    role: 'Lead Frontend Developer',
    teamSize: 5,
    challenges: [
      'Implementing 3D virtual property tours',
      'Complex filtering with multiple criteria',
      'Real-time notifications for property updates'
    ],
    solutions: [
      'Integrated Three.js for immersive 3D experiences',
      'Built efficient PostgreSQL queries with indexing',
      'Implemented WebSocket-based notification system'
    ],
    impact: [
      '10,000+ property listings',
      '500+ registered agents',
      '30% faster property sales cycle'
    ],
    modelPath: '/2.0/Lantern/glTF-Binary/Lantern.glb'
  },
  {
    id: 'elyssa-gym',
    title: 'Elyssa Gym App',
    description: 'Comprehensive workout application for fitness enthusiasts',
    longDescription: 'Developed a feature-rich fitness tracking application with personalized workout plans, progress monitoring, and equipment-based exercise search. The app helps users achieve their fitness goals through structured training programs and detailed analytics.',
    technologies: ['JavaScript', 'React', 'CSS3', 'Firebase', 'Chart.js', 'PWA'],
    github: 'https://github.com/kooya3/elyssa-gym-app',
    demo: 'https://gym-app-demo.vercel.app',
    image: '/projects/gym-app.jpg',
    featured: false,
    stars: 17,
    forks: 4,
    contributors: 1,
    startDate: 'Oct 2023',
    endDate: 'Dec 2023',
    role: 'Solo Developer',
    teamSize: 1,
    challenges: [
      'Offline functionality for workout tracking',
      'Complex exercise categorization system',
      'Progress visualization across multiple metrics'
    ],
    solutions: [
      'Implemented PWA with service workers',
      'Created hierarchical tagging system',
      'Built custom Chart.js components for analytics'
    ],
    impact: [
      '5,000+ active users',
      '200+ exercise variations',
      '85% user retention rate'
    ],
    modelPath: '/2.0/Fox/glTF-Binary/Fox.glb'
  },
  {
    id: 'music-web-app',
    title: 'Modern Music Web Application',
    description: 'Spotify-like streaming platform with global charts',
    longDescription: 'Built a full-featured music streaming application with search capabilities, lyrics display, worldwide top charts, and location-based music discovery. The platform provides an intuitive interface for music exploration and playlist management.',
    technologies: ['JavaScript', 'React', 'Web Audio API', 'Node.js', 'MongoDB', 'Redis'],
    github: 'https://github.com/kooya3/music-web-app',
    demo: 'https://music-demo.vercel.app',
    image: '/projects/music-app.jpg',
    featured: false,
    stars: 6,
    forks: 3,
    contributors: 2,
    startDate: 'May 2023',
    endDate: 'Jul 2023',
    role: 'Full-Stack Developer',
    teamSize: 2,
    challenges: [
      'Audio streaming optimization',
      'Real-time lyrics synchronization',
      'Complex playlist management system'
    ],
    solutions: [
      'Implemented adaptive bitrate streaming',
      'Built custom lyrics sync algorithm',
      'Created efficient Redis-based caching'
    ],
    impact: [
      '1M+ songs streamed',
      '10,000+ playlists created',
      '99.9% uptime achieved'
    ],
    modelPath: '/2.0/Duck/glTF-Binary/Duck.glb'
  },
  {
    id: 'ai-article-summarizer',
    title: 'AI Article Summarizer',
    description: 'OpenAI-powered content summarization tool',
    longDescription: 'Developed a React application that leverages OpenAI GPT technology to process website URLs and generate concise article summaries. The tool helps users quickly understand content without reading entire articles.',
    technologies: ['React', 'OpenAI API', 'JavaScript', 'Tailwind CSS', 'Vercel'],
    github: 'https://github.com/kooya3/ai-article-summarizer',
    demo: 'https://summarizer-demo.vercel.app',
    image: '/projects/summarizer.jpg',
    featured: false,
    stars: 7,
    forks: 3,
    contributors: 1,
    startDate: 'Aug 2023',
    endDate: 'Sep 2023',
    role: 'Solo Developer',
    teamSize: 1,
    challenges: [
      'Handling various article formats',
      'Maintaining context in summaries',
      'API rate limiting and cost optimization'
    ],
    solutions: [
      'Built robust HTML parser',
      'Implemented smart chunking algorithm',
      'Added caching layer for repeated requests'
    ],
    impact: [
      '50,000+ articles summarized',
      '80% time saved in content consumption',
      '4.8/5 user satisfaction rating'
    ],
    modelPath: '/2.0/WaterBottle/glTF-Binary/WaterBottle.glb'
  }
]

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<ProjectData | null>(null)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'technical' | 'impact'>('overview')
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    const projectSlug = params.slug as string
    const foundProject = projectsData.find(p => p.id === projectSlug)
    
    if (foundProject) {
      setProject(foundProject)
    } else {
      router.push('/404')
    }
  }, [params.slug, router])

  if (!project) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white text-xl"
        >
          Loading project...
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section with 3D Model */}
      <section className="relative h-[60vh] overflow-hidden">
        <div className="absolute inset-0">
          <InteractiveModelScene modelName={project.modelPath ? project.modelPath.split('/').pop()?.replace('.glb', '').replace('.gltf', '') : 'BoomBox'} />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />
        
        {/* Back Button */}
        <Link href="/#projects">
          <motion.button
            className="absolute top-8 left-8 z-20 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={20} />
            <span>Back to Projects</span>
          </motion.button>
        </Link>

        {/* Project Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {project.award && (
              <div className="flex items-center gap-2 mb-4">
                <Award className="text-yellow-500" size={20} />
                <span className="text-yellow-500 font-semibold">{project.award}</span>
              </div>
            )}
            
            <h1 className="text-5xl font-bold mb-4">{project.title}</h1>
            <p className="text-xl text-gray-300 max-w-3xl">{project.description}</p>
            
            <div className="flex items-center gap-6 mt-6">
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all"
                >
                  <Github size={20} />
                  <span>View Code</span>
                </a>
              )}
              
              {project.demo && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full hover:opacity-90 transition-all"
                >
                  <ExternalLink size={20} />
                  <span>Live Demo</span>
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Project Stats */}
      <section className="py-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {project.stars && (
              <div className="flex items-center gap-2">
                <Star className="text-yellow-500" size={20} />
                <span className="text-gray-400">Stars:</span>
                <span className="font-semibold">{project.stars}</span>
              </div>
            )}
            
            {project.forks && (
              <div className="flex items-center gap-2">
                <GitFork className="text-blue-500" size={20} />
                <span className="text-gray-400">Forks:</span>
                <span className="font-semibold">{project.forks}</span>
              </div>
            )}
            
            {project.contributors && (
              <div className="flex items-center gap-2">
                <Users className="text-green-500" size={20} />
                <span className="text-gray-400">Contributors:</span>
                <span className="font-semibold">{project.contributors}</span>
              </div>
            )}
            
            {project.startDate && (
              <div className="flex items-center gap-2">
                <Calendar className="text-purple-500" size={20} />
                <span className="text-gray-400">Duration:</span>
                <span className="font-semibold">{project.startDate} - {project.endDate || 'Present'}</span>
              </div>
            )}
            
            {project.teamSize && (
              <div className="flex items-center gap-2">
                <Code2 className="text-cyan-500" size={20} />
                <span className="text-gray-400">Team Size:</span>
                <span className="font-semibold">{project.teamSize}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex gap-8 border-b border-white/10">
            {(['overview', 'technical', 'impact'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`pb-4 px-2 capitalize font-semibold transition-all ${
                  selectedTab === tab
                    ? 'text-white border-b-2 border-purple-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-8">
          <AnimatePresence mode="wait">
            {selectedTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-bold mb-4">Project Overview</h2>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {project.longDescription}
                  </p>
                </div>
                
                {project.role && (
                  <div>
                    <h3 className="text-2xl font-semibold mb-3">My Role</h3>
                    <p className="text-gray-300">{project.role}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-2xl font-semibold mb-4">Technologies Used</h3>
                  <div className="flex flex-wrap gap-3">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/30 rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            
            {selectedTab === 'technical' && (
              <motion.div
                key="technical"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {project.challenges && project.challenges.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">Technical Challenges</h3>
                    <ul className="space-y-3">
                      {project.challenges.map((challenge, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="text-red-500 mt-1">▸</span>
                          <span className="text-gray-300">{challenge}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {project.solutions && project.solutions.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">Solutions Implemented</h3>
                    <ul className="space-y-3">
                      {project.solutions.map((solution, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="text-green-500 mt-1">✓</span>
                          <span className="text-gray-300">{solution}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
            
            {selectedTab === 'impact' && (
              <motion.div
                key="impact"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {project.impact && project.impact.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">Project Impact</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      {project.impact.map((item, index) => (
                        <div
                          key={index}
                          className="p-6 bg-gradient-to-br from-purple-600/10 to-cyan-600/10 border border-purple-500/20 rounded-xl"
                        >
                          <p className="text-lg font-semibold text-white">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Navigation to Other Projects */}
      <section className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-8">
          <h3 className="text-2xl font-semibold mb-6">Other Projects</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {projectsData
              .filter(p => p.id !== project.id)
              .slice(0, 3)
              .map((otherProject) => (
                <Link key={otherProject.id} href={`/projects/${otherProject.id}`}>
                  <motion.div
                    className="p-6 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                  >
                    <h4 className="font-semibold mb-2">{otherProject.title}</h4>
                    <p className="text-gray-400 text-sm">{otherProject.description}</p>
                  </motion.div>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  )
}