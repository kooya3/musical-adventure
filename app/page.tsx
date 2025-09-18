"use client"

import React, { useState, useEffect, useRef } from "react"
import InteractiveModelScene from "@/components/3d/InteractiveModelScene"
import ProjectsScene from "@/components/3d/ProjectsScene"
import ExperienceScene from "@/components/3d/ExperienceScene"
import SkillsScene from "@/components/3d/SkillsScene"
import NavigationOrb from "@/components/3d/NavigationOrb"
import ProjectPortal from "@/components/ProjectPortal"
import { projectsData } from "@/data/projects"
import LoadingScreen from "@/components/ui/LoadingScreen"
import { GlowingStarsBackground } from "@/components/ui/glowing-stars"
import { Meteors } from "@/components/magicui/meteors"
import { AuroraText } from "@/components/magicui/aurora-text"
import { Globe } from "@/components/magicui/globe"
import { ShimmerButton } from "@/components/magicui/shimmer-button"
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card"
import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
} from "@/components/magicui/terminal"
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from "framer-motion"
import { gsap } from "gsap"

// Model selection (excluding Duck as requested)
const HERO_MODELS = ['BoomBox', 'FlightHelmet', 'DamagedHelmet', 'Avocado', 'BarramundiFish', 'Lantern', 'WaterBottle']

export default function Home() {
  const [selectedModel, setSelectedModel] = useState('BoomBox')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [cursorVariant, setCursorVariant] = useState('default')
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [activeProject, setActiveProject] = useState(0)
  const [activeExperience, setActiveExperience] = useState(0)
  const [activeSkill, setActiveSkill] = useState('')
  const [selectedProject, setSelectedProject] = useState<typeof projectsData[0] | null>(null)
  const [isPortalOpen, setIsPortalOpen] = useState(false)
  const [currentSection, setCurrentSection] = useState('hero')
  const heroRef = useRef<HTMLDivElement>(null)
  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)
  const springConfig = { damping: 15, stiffness: 300 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)
  const { scrollYProgress } = useScroll()
  
  // Parallax transforms
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9])

  useEffect(() => {
    // Page loading animation
    setTimeout(() => {
      setIsPageLoading(false)
    }, 2000)
    
    // Section detection
    const handleScroll = () => {
      const sections = ['hero', 'experience', 'skills', 'projects', 'contact']
      const scrollPosition = window.scrollY + window.innerHeight / 2
      
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId === 'hero' ? 'hero-section' : sectionId)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setCurrentSection(sectionId)
            break
          }
        }
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial check
    
    // Enhanced cursor movement with trail effect
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 20)
      cursorY.set(e.clientY - 20)
    }
    window.addEventListener('mousemove', moveCursor)
    
    // Animated text on load
    gsap.fromTo('.hero-title span', 
      { 
        y: 100,
        opacity: 0,
        rotateX: -90
      },
      {
        y: 0,
        opacity: 1,
        rotateX: 0,
        duration: 1,
        stagger: 0.02,
        ease: "power4.out",
        delay: 0.5
      }
    )

    // Card animations
    gsap.fromTo('.project-card', 
      { 
        y: 100,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: '.project-card',
          start: 'top 80%',
        }
      }
    )
    
    return () => {
      window.removeEventListener('mousemove', moveCursor)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const menuItems = ['Projects', 'Experience', 'Skills', 'Contact']

  const experiences = [
    {
      title: "Software Developer",
      company: "Datacurve (YC W24)",
      period: "Jul - Sep 2024",
      description: "Developed scalable solutions for Y Combinator-backed AI startup"
    },
    {
      title: "Frontend Engineer",
      company: "JamiiYaJadeite Foundation",
      period: "Dec 2023 - Apr 2024",
      description: "Led website redesign resulting in 40% network growth"
    },
    {
      title: "AI Product Manual Winner",
      company: "Davis & Shirtliff Hackathon",
      period: "Mar - May 2025",
      description: "Developed award-winning AI-based customer support system"
    }
  ]

  const handleProjectClick = (project: typeof projectsData[0]) => {
    // Map project IDs to the new routing structure
    const projectRouteMap: Record<string, string> = {
      'hackathon-ai-winner': 'ai-manual',
      'yc-saas-platform': 'ecommerce-platform',
      'ecommerce-nextjs': 'ecommerce-platform',
      'real-estate-platform': 'real-estate',
      'fitness-tracker': 'elyssa-gym',
      'music-streaming': 'music-web-app'
    }
    
    const routeId = projectRouteMap[project.id] || project.id
    window.location.href = `/projects/${routeId}`
  }

  const closePortal = () => {
    setIsPortalOpen(false)
    setTimeout(() => setSelectedProject(null), 500)
  }

  return (
    <>
      <LoadingScreen isLoading={isPageLoading} />
      
      <motion.div 
        className="relative min-h-screen bg-black overflow-x-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: isPageLoading ? 0 : 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Combined Background Effects - Glowing Stars and Meteors */}
        <GlowingStarsBackground className="opacity-50" />
        <div className="fixed inset-0 z-0 pointer-events-none">
          <Meteors number={20} />
        </div>
      
        {/* Enhanced Custom Cursor */}
        <motion.div
          className="fixed w-10 h-10 pointer-events-none z-[100] mix-blend-difference"
          style={{
            x: cursorXSpring,
            y: cursorYSpring,
          }}
        >
          <motion.div
            className="relative w-full h-full"
            animate={{
              scale: cursorVariant === 'hover' ? 2 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 bg-white rounded-full opacity-20" />
            <motion.div
              className="absolute inset-2 rounded-full"
              animate={{
                backgroundColor: cursorVariant === 'hover' ? '#8b5cf6' : '#ffffff',
              }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        </motion.div>

        {/* Navigation */}
        <motion.nav 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="fixed top-0 left-0 right-0 z-50 px-8 py-6 backdrop-blur-md bg-black/50"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <motion.div 
              className="text-2xl font-bold"
              whileHover={{ scale: 1.05 }}
              onMouseEnter={() => setCursorVariant('hover')}
              onMouseLeave={() => setCursorVariant('default')}
            >
              <AuroraText className="text-2xl">ET</AuroraText>
            </motion.div>

            <div className="hidden md:flex items-center space-x-8">
              {menuItems.map((item, index) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-white/70 hover:text-white transition-colors relative group"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                  onMouseEnter={() => setCursorVariant('hover')}
                  onMouseLeave={() => setCursorVariant('default')}
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-cyan-400 group-hover:w-full transition-all duration-300" />
                </motion.a>
              ))}
              <ShimmerButton
                className="shadow-2xl"
                shimmerColor="#ffffff"
                shimmerSize="0.1em"
                background="linear-gradient(110deg,#8b5cf6,#06b6d4)"
                onMouseEnter={() => setCursorVariant('hover')}
                onMouseLeave={() => setCursorVariant('default')}
              >
                <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white">
                  Let's Connect
                </span>
              </ShimmerButton>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white"
            >
              <div className="space-y-1.5">
                <motion.span 
                  animate={{ rotateZ: isMenuOpen ? 45 : 0, y: isMenuOpen ? 6 : 0 }}
                  className="block w-6 h-0.5 bg-white"
                />
                <motion.span 
                  animate={{ opacity: isMenuOpen ? 0 : 1 }}
                  className="block w-6 h-0.5 bg-white"
                />
                <motion.span 
                  animate={{ rotateZ: isMenuOpen ? -45 : 0, y: isMenuOpen ? -6 : 0 }}
                  className="block w-6 h-0.5 bg-white"
                />
              </div>
            </button>
          </div>
        </motion.nav>

        {/* Navigation Orb - Fixed Position */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.5, duration: 0.5 }}
          className="fixed bottom-8 right-8 z-40"
        >
          <NavigationOrb currentSection={currentSection} />
        </motion.div>

        {/* Hero Section */}
        <section id="hero-section" ref={heroRef} className="relative min-h-screen flex items-center justify-center">
          <motion.div 
            style={{ y, opacity, scale }}
            className="absolute inset-0 z-0"
          >
            <InteractiveModelScene 
              modelName={selectedModel}
              className="w-full h-full"
            />
          </motion.div>

          {/* Hero Content */}
          <div className="relative z-10 text-center px-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <span className="inline-block px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-medium">
                Frontend Engineer • Full-Stack Developer • 4+ Years Experience
              </span>
            </motion.div>

            <h1 className="hero-title text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
              {'Elyees Waweru'.split('').map((char, i) => (
                <span key={i} className="inline-block" style={{ display: char === ' ' ? 'inline' : 'inline-block' }}>
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
              <br />
              <span className="text-3xl md:text-5xl lg:text-6xl">
                <AuroraText>Tatua</AuroraText>
              </span>
            </h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="text-xl text-white/60 mb-12 max-w-3xl mx-auto"
            >
              Specializing in React, Next.js, and AI-powered solutions. 
              Proven track record with Y Combinator startups and award-winning hackathon projects.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <motion.a
                href="#projects"
                onMouseEnter={() => setCursorVariant('hover')}
                onMouseLeave={() => setCursorVariant('default')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-4 bg-white text-black font-semibold rounded-full overflow-hidden"
              >
                <span className="relative z-10">View Projects</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  View Projects
                </span>
              </motion.a>

              <motion.a
                href="/Elyees_Tatua_CV_2025.pdf"
                download="Elyees_Tatua_CV_2025.pdf"
                onMouseEnter={() => setCursorVariant('hover')}
                onMouseLeave={() => setCursorVariant('default')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border border-white/20 text-white font-semibold rounded-full hover:bg-white/5 transition-all"
              >
                Download CV
              </motion.a>
            </motion.div>

            {/* Model Selector */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-16 flex items-center justify-center gap-2"
            >
              <span className="text-white/40 text-sm mr-4">Switch Model:</span>
              {HERO_MODELS.map((model) => (
                <motion.button
                  key={model}
                  onMouseEnter={() => setCursorVariant('hover')}
                  onMouseLeave={() => setCursorVariant('default')}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedModel(model)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    selectedModel === model 
                      ? 'bg-gradient-to-r from-purple-400 to-cyan-400 w-8' 
                      : 'bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <div className="flex flex-col items-center text-white/40">
              <span className="text-xs mb-2">Scroll to explore</span>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center"
              >
                <div className="w-1 h-3 bg-white/60 rounded-full mt-2" />
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Experience Section */}
        <section id="experience" className="relative py-20 overflow-hidden">
          {/* 3D Background Scene */}
          <div className="absolute inset-0 z-0">
            <ExperienceScene 
              activeExperience={activeExperience}
              className="w-full h-full opacity-30"
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl font-bold mb-4">
                <AuroraText>Professional Experience</AuroraText>
              </h2>
              <p className="text-xl text-white/60">
                Building innovative solutions at leading companies
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                {experiences.map((exp, index) => (
                  <motion.div
                    key={exp.title}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    onMouseEnter={() => {
                      setCursorVariant('hover')
                      setActiveExperience(index)
                    }}
                    onMouseLeave={() => {
                      setCursorVariant('default')
                    }}
                    whileHover={{ x: 10 }}
                    className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-purple-500/30 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-white">{exp.title}</h3>
                      <span className="text-sm text-purple-400">{exp.period}</span>
                    </div>
                    <p className="text-purple-300 mb-2">{exp.company}</p>
                    <p className="text-white/60">{exp.description}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Globe for location */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative h-[500px] flex items-center justify-center"
              >
                <Globe className="w-full h-full" />
                <div className="absolute bottom-0 left-0 right-0 text-center">
                  <p className="text-purple-400 font-medium">🌍 Global Reach</p>
                  <p className="text-white/60 text-sm">Available for remote opportunities worldwide</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Skills Section with Terminal */}
        <section id="skills" className="relative py-20 overflow-hidden">
          {/* 3D Background Scene */}
          <div className="absolute inset-0 z-0">
            <SkillsScene 
              activeSkill={activeSkill}
              className="w-full h-full opacity-40"
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl font-bold mb-4">
                <AuroraText>Technical Skills</AuroraText>
              </h2>
              <p className="text-xl text-white/60">
                Modern tech stack for cutting-edge development
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Terminal>
                  <TypingAnimation className="text-green-400">
                    $ npm list --depth=0
                  </TypingAnimation>
                  
                  <AnimatedSpan className="text-purple-400">
                    ├── react@18.2.0
                  </AnimatedSpan>
                  <AnimatedSpan className="text-purple-400">
                    ├── next@15.5.0
                  </AnimatedSpan>
                  <AnimatedSpan className="text-purple-400">
                    ├── typescript@5.0.0
                  </AnimatedSpan>
                  <AnimatedSpan className="text-purple-400">
                    ├── three@0.169.0
                  </AnimatedSpan>
                  <AnimatedSpan className="text-purple-400">
                    ├── tailwindcss@3.4.0
                  </AnimatedSpan>
                  
                  <TypingAnimation className="text-green-400">
                    $ git status
                  </TypingAnimation>
                  
                  <AnimatedSpan className="text-cyan-400">
                    On branch: main
                  </AnimatedSpan>
                  <AnimatedSpan className="text-cyan-400">
                    Projects completed: 50+
                  </AnimatedSpan>
                  <AnimatedSpan className="text-cyan-400">
                    Clients served: 20+
                  </AnimatedSpan>
                  
                  <TypingAnimation className="text-yellow-400">
                    ✨ Skills loaded successfully!
                  </TypingAnimation>
                </Terminal>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                {[
                  { category: 'Frontend', skills: 'React, Next.js, TypeScript, Vue.js, Three.js', mainSkill: 'React' },
                  { category: 'Backend', skills: 'Node.js, Python, Express, Django, RESTful APIs', mainSkill: 'Node.js' },
                  { category: 'Database', skills: 'MongoDB, MySQL, PostgreSQL', mainSkill: 'MongoDB' },
                  { category: 'CMS', skills: 'Sanity, WordPress, Payload CMS', mainSkill: 'Sanity' },
                  { category: 'Tools', skills: 'Git, Docker, Linux, CI/CD, Agile', mainSkill: 'Docker' },
                ].map((item, index) => (
                  <motion.div
                    key={item.category}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    onMouseEnter={() => {
                      setCursorVariant('hover')
                      setActiveSkill(item.mainSkill)
                    }}
                    onMouseLeave={() => {
                      setCursorVariant('default')
                      setActiveSkill('')
                    }}
                    className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg hover:border-purple-500/30 transition-all"
                  >
                    <h3 className="text-purple-400 font-semibold mb-2">{item.category}</h3>
                    <p className="text-white/80">{item.skills}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="relative py-20 overflow-hidden">
          {/* 3D Background Scene */}
          <div className="absolute inset-0 z-0">
            <ProjectsScene activeProject={activeProject} className="w-full h-full opacity-30" />
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl font-bold mb-4">
                <AuroraText>Featured Projects</AuroraText>
              </h2>
              <p className="text-xl text-white/60">
                Award-winning solutions and innovative applications
              </p>
            </motion.div>

            {/* Project Grid with 3D Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
              {projectsData.slice(0, 6).map((project, index) => (
                <div
                  key={project.id}
                  onMouseEnter={() => setActiveProject(index)}
                  onClick={() => handleProjectClick(project)}
                  className="cursor-pointer"
                >
                  <CardContainer className="inter-var">
                    <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-purple-500/[0.1] dark:bg-black/80 backdrop-blur-sm dark:border-white/[0.2] border-black/[0.1] w-auto h-auto rounded-xl p-6 border">
                    <CardItem
                      translateZ="50"
                      className="text-xl font-bold text-neutral-600 dark:text-white"
                    >
                      {project.title}
                    </CardItem>
                    <CardItem
                      as="p"
                      translateZ="60"
                      className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                    >
                      {project.description}
                    </CardItem>
                    <CardItem translateZ="100" className="w-full mt-4">
                      <div 
                        className="h-40 w-full rounded-xl relative overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${project.color.primary}, ${project.color.secondary})`
                        }}
                      >
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="w-20 h-20 border-4 border-white/20 border-t-white/60 rounded-full"
                          />
                        </div>
                      </div>
                    </CardItem>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {project.tags.slice(0, 4).map((tag) => (
                        <CardItem
                          key={tag}
                          translateZ="30"
                          className="px-3 py-1 bg-white/10 text-white/70 text-xs rounded-full"
                        >
                          {tag}
                        </CardItem>
                      ))}
                    </div>
                    <div className="flex justify-between items-center mt-6">
                      {project.liveUrl && (
                        <CardItem
                          translateZ={20}
                          as="a"
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                          className="px-4 py-2 rounded-xl text-xs font-normal dark:text-white hover:text-purple-400 transition-colors"
                        >
                          Live Demo →
                        </CardItem>
                      )}
                      <CardItem
                        translateZ={20}
                        as="button"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation()
                          handleProjectClick(project)
                        }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-xs font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                      >
                        View Details
                      </CardItem>
                    </div>
                    </CardBody>
                  </CardContainer>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="relative py-20">
          <div className="max-w-4xl mx-auto px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl font-bold mb-8">
                <AuroraText>Let's Build Together</AuroraText>
              </h2>
              <p className="text-xl text-white/60 mb-12">
                Ready to create something amazing? Let's connect and discuss your next project.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <motion.a
                  href="mailto:elyees.dev@gmail.com?subject=Hello%20from%20your%20Portfolio!&body=Hi%20Elyees,%0D%0A%0D%0AI%20found%20your%20portfolio%20and%20would%20love%20to%20connect!"
                  onMouseEnter={() => setCursorVariant('hover')}
                  onMouseLeave={() => setCursorVariant('default')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                >
                  Get In Touch
                </motion.a>
                <motion.a
                  href="https://linkedin.com/in/elyees-tatua"
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => setCursorVariant('hover')}
                  onMouseLeave={() => setCursorVariant('default')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 border border-white/20 text-white font-semibold rounded-full hover:bg-white/5 transition-all"
                >
                  LinkedIn
                </motion.a>
                <motion.a
                  href="https://github.com/kooya3"
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => setCursorVariant('hover')}
                  onMouseLeave={() => setCursorVariant('default')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 border border-white/20 text-white font-semibold rounded-full hover:bg-white/5 transition-all"
                >
                  GitHub
                </motion.a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              className="fixed inset-0 z-40 bg-black/95 backdrop-blur-md md:hidden"
            >
              <div className="flex flex-col items-center justify-center h-full space-y-8">
                {menuItems.map((item) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-3xl font-bold text-white hover:text-purple-400 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Project Portal */}
        <ProjectPortal 
          project={selectedProject}
          isOpen={isPortalOpen}
          onClose={closePortal}
        />
      </motion.div>
    </>
  )
}