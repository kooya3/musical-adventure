"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SITE_CONFIG, ANIMATIONS } from "@/lib/constants"
import { useLenis } from "@/components/layout/SmoothScroll"
import { useResponsive } from "@/hooks/useResponsive"

const navigation = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Contact", href: "#contact" },
]

export default function NavigationMenu() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { scrollTo } = useLenis()
  const { isMobile } = useResponsive()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false)
    scrollTo(href, { duration: 1.5, easing: (t: number) => 1 - Math.pow(1 - t, 3) })
  }

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled || isMobileMenuOpen
            ? "bg-slate-900/95 backdrop-blur-md border-b border-white/10"
            : "bg-transparent"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{
          duration: ANIMATIONS.duration.medium,
          ease: ANIMATIONS.ease.smooth,
        }}
      >
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <motion.div
              className="flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                onClick={() => handleNavClick("#home")}
                className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
              >
                ET
              </button>
            </motion.div>

            {/* Desktop Navigation */}
            {!isMobile && (
              <div className="hidden lg:flex lg:items-center lg:space-x-8">
                {navigation.map((item, index) => (
                  <motion.button
                    key={item.name}
                    onClick={() => handleNavClick(item.href)}
                    className="text-white/80 hover:text-white font-medium transition-colors duration-200 relative group"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: index * 0.1,
                      duration: ANIMATIONS.duration.medium,
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 group-hover:w-full" />
                  </motion.button>
                ))}
              </div>
            )}

            {/* CTA Button (Desktop) */}
            {!isMobile && (
              <motion.button
                onClick={() => handleNavClick("#contact")}
                className="hidden lg:inline-flex px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.5,
                  duration: ANIMATIONS.duration.medium,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Let's Talk
              </motion.button>
            )}

            {/* Mobile menu button */}
            {isMobile && (
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-white/80 hover:text-white transition-colors duration-200"
                whileTap={{ scale: 0.95 }}
                aria-label="Toggle mobile menu"
              >
                <motion.div
                  className="w-6 h-6 flex flex-col justify-center items-center"
                  animate={isMobileMenuOpen ? "open" : "closed"}
                >
                  <motion.span
                    className="w-6 h-0.5 bg-current block transition-all duration-300"
                    variants={{
                      closed: { rotate: 0, y: 0 },
                      open: { rotate: 45, y: 6 },
                    }}
                  />
                  <motion.span
                    className="w-6 h-0.5 bg-current block mt-1.5 transition-all duration-300"
                    variants={{
                      closed: { opacity: 1 },
                      open: { opacity: 0 },
                    }}
                  />
                  <motion.span
                    className="w-6 h-0.5 bg-current block mt-1.5 transition-all duration-300"
                    variants={{
                      closed: { rotate: 0, y: 0 },
                      open: { rotate: -45, y: -6 },
                    }}
                  />
                </motion.div>
              </motion.button>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobile && isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu */}
            <motion.div
              className="fixed top-16 left-0 right-0 z-35 bg-slate-900/95 backdrop-blur-md border-b border-white/10 lg:hidden"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: ANIMATIONS.duration.fast,
                ease: ANIMATIONS.ease.smooth,
              }}
            >
              <div className="container mx-auto px-6 py-6">
                <div className="space-y-4">
                  {navigation.map((item, index) => (
                    <motion.button
                      key={item.name}
                      onClick={() => handleNavClick(item.href)}
                      className="block w-full text-left text-white/80 hover:text-white text-lg font-medium py-3 transition-colors duration-200"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: index * 0.1,
                        duration: ANIMATIONS.duration.fast,
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {item.name}
                    </motion.button>
                  ))}

                  {/* Mobile CTA */}
                  <motion.button
                    onClick={() => handleNavClick("#contact")}
                    className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: navigation.length * 0.1,
                      duration: ANIMATIONS.duration.fast,
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Let's Talk
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}