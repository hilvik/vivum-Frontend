import React, { useState } from 'react';
import { motion, AnimatePresence, useScroll, useSpring, useMotionValueEvent } from 'framer-motion';
import { Search, ArrowRight, Database, Brain, ChevronDown, Newspaper, FlaskRound as Flask, Tag, MessageCircle, X, Sparkles, Lightbulb, Bot, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';

interface HomePageProps {
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

function FeatureCard({ icon, title, description, isDarkMode, delay }) {
  return (
    <motion.div
      className={`p-4 sm:p-5 lg:p-6 rounded-xl border ${
        isDarkMode 
          ? 'border-gray-800 bg-gray-900/50' 
          : 'border-gray-200 bg-white/50'
      } backdrop-blur-sm hover:border-purple-500/50 h-full`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ 
        y: -5, 
        boxShadow: "0 10px 30px rgba(147, 51, 234, 0.2)",
        transition: { duration: 0.2 }
      }}
    >
      <motion.div 
        className="mb-3  inline-block p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10"
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        {icon}
      </motion.div>
      <h3 className={`text-base sm:text-lg font-semibold mb-2 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>{title}</h3>
      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
    </motion.div>
  );
}

export function HomePage({ isDarkMode, setIsDarkMode }: HomePageProps) {
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const navigate = useNavigate();

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const currentScroll = latest;
    setIsNavVisible(currentScroll < lastScrollY || currentScroll < 100);
    setLastScrollY(currentScroll);
  });

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const handleTryAIAgent = () => {
    navigate('/activate');
  };

  const handleJoinWaitlist = () => {
    navigate('/waitlist');
  };

  return (
    <div className={`min-h-screen theme-transition ${
      isDarkMode ? 'theme-dark bg-black' : 'theme-light bg-white'
    }`}>
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 transform origin-left z-50"
        style={{ scaleX }}
      />

      <motion.header 
        initial={{ opacity: 1, y: 0 }}
        animate={{ 
          opacity: isNavVisible ? 1 : 0,
          y: isNavVisible ? 0 : -100,
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut"
        }}
        className={`fixed w-full top-0 z-40 backdrop-blur-xl bg-opacity-80 transition-all duration-300 ${
          isDarkMode ? 'bg-black/80' : 'bg-white/80'
        }`}
      >
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 max-w-[1400px] flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <motion.img 
              src="/vivum-logo.png" 
              alt="Vivum Logo" 
              className="w-7 h-7"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.8 }}
            />
            <motion.span 
              className="text-lg font-bold font-display bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text"
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{ backgroundSize: "200% 200%" }}
            >
              Vivum
            </motion.span>
          </motion.div>
          
          <div className="flex items-center space-x-3">
            <motion.button
              onClick={() => navigate('/activate')}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-serif rounded-lg shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
              whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(147, 51, 234, 0.3)" }}
              whileTap={{ scale: 0.98 }}
            >
              Get Started
            </motion.button>
            <ThemeToggle isDarkMode={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} />
          </div>
        </nav>
      </motion.header>

      <main className="pt-16 sm:pt-24">
        <div className="container mx-auto px-4 sm:px-8 lg:px-12 py-12 sm:py-16 max-w-[1600px]">
          <motion.div 
            className="text-center mb-16 sm:mb-24 relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <motion.div
              className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 blur-3xl"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{ backgroundSize: "200% 200%" }}
            />

            <motion.div 
              className={`absolute top-20 left-10 w-20 h-20 rounded-full ${
                isDarkMode ? 'bg-purple-600/20' : 'bg-purple-200/50'
              } blur-xl`}
              animate={{ 
                y: [-20, 20, -20],
                rotate: [0, 180, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            />
            <motion.div 
              className={`absolute  bottom-0 right-20 w-32 h-36 rounded-full ${
                isDarkMode ? 'bg-pink-600/20' : 'bg-pink-200/50'
              } blur-xl`}
              animate={{ 
                y: [20, -20, 20],
                rotate: [360, 180, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 10, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            />

            <motion.h1 
              className="text-5xl sm:text-5xl md:text-6xl lg:text-6xl font-serif  leading-[1.1] max-w-6xl mx-auto px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.span
                className={isDarkMode?`inline-block bg-white text-transparent bg-clip-text`:'bg-black inline-block text-transparent bg-clip-text'}
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{ backgroundSize: "200% 200%" }}
              >
                Take a Leap to Discover.
              </motion.span>
              <br className="hidden sm:block" />
              <motion.span
                className={`inline-block ${isDarkMode?'bg-white':'bg-black'} font-serif mb-8 text-transparent bg-clip-text`}
                animate={{
                  backgroundPosition: ["100% 50%", "0% 50%", "100% 50%"],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{ backgroundSize: "200% 200%" }}
              >
                Analyze. Synthesize.
              </motion.span>
            </motion.h1>
            
            <motion.div
              className={`relative max-w-5xl mx-auto mb-10 sm:mb-12 px-8 py-10 rounded-3xl overflow-hidden ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-purple-900/30' 
                  : 'bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50'
              } backdrop-blur-xl`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{ backgroundSize: "200% 200%" }}
              />

              <motion.p 
                className={`relative text-2xl sm:text-3xl lg:text-3xl  leading-relaxed ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <motion.span
                  className="inline-block"
                  animate={{
                    color: isDarkMode 
                      ? ['#a855f7', '#ec4899', '#a855f7']
                      : ['#9333ea', '#db2777', '#9333ea']
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  Six hours of research, solved in six minutes
                </motion.span>
                <br className="hidden sm:block" />
                <motion.span
                  className="inline-block"
                  animate={{
                    color: isDarkMode 
                      ? ['#ec4899', '#a855f7', '#ec4899']
                      : ['#db2777', '#9333ea', '#db2777']
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  with the first real-time, citation-anchored AI agent
                </motion.span>
              </motion.p>
            </motion.div>

            <motion.p 
              className={`text-lg sm:text-xl ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              } mb-12 max-w-4xl mx-auto leading-relaxed px-4`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              No more manual and time-consuming literature searches—Vivum brings it quickly at your fingertips. 
              Get instant access to real-time data from PubMed, Scopus, and beyond.
            </motion.p>
          </motion.div>

          <motion.div
            className={`max-w-6xl h-72 mx-auto text-center p-8 sm:p-10 rounded-2xl ${
              isDarkMode ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30' : 'bg-gradient-to-r from-purple-50 to-pink-50'
            } backdrop-blur-sm mb-16 border ${isDarkMode ? 'border-purple-800/30' : 'border-purple-100'}`}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            whileHover={{ scale: 1.02 }}
          >
            <motion.div 
              className="flex items-center justify-center space-x-3 mb-4"
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <Rocket className={`w-10 h-10 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} />
              </motion.div>
              <span className={`text-3xl font-display font-bold ${
                isDarkMode ? 'text-purple-400' : 'text-purple-600'
              }`}>
                Coming Soon
              </span>
              <motion.div
                animate={{ 
                  rotate: [0, -360],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <Sparkles className={`w-10 h-10 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} />
              </motion.div>
            </motion.div>
            <motion.p 
              className={` text-xl ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              } leading-relaxed mb-5`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Join our waitlist to be among the first to experience
              <br className="hidden sm:block" />
              the future of research and discovery
            </motion.p>
            <motion.button
              onClick={handleJoinWaitlist}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-12 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl rounded-lg font-medium shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
            >
              Join the Waitlist
              <ArrowRight className="ml-2 w-4 h-4" />
            </motion.button>
          </motion.div>

          <motion.div
            className={`max-w-6xl mx-auto rounded-2xl overflow-hidden ${
              isDarkMode 
                ? 'bg-gradient-to-r from-purple-900/30 via-gray-900 to-pink-900/30' 
                : 'bg-gradient-to-r from-purple-50 via-white to-pink-50'
            } mb-16 sm:mb-24`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="grid md:grid-cols-2 gap-8 p-8 sm:p-10">
              <div className="space-y-6">
                <motion.div
                  className="inline-block"
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                    <Bot className={`w-12 h-12 ${
                      isDarkMode ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                  </div>
                </motion.div>
                
                <div>
                  <h2 className={`text-2xl sm:text-3xl font-bold mb-4 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Meet Your AI Agent
                  </h2>
                  <p className={`text-base mb-6 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Experience the future of research with an AI agent that understands context, analyzes patterns, and delivers meaningful insights.
                  </p>
                  <motion.button
                    onClick={handleTryAIAgent}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
                  >
                    <span>Try the AI Agent</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              <div className="relative">
                <motion.div
                  className={`p-5 rounded-xl ${
                    isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'
                  } backdrop-blur-sm shadow-xl`}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-3">
                    <div className={`p-3 rounded-lg ${
                      isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                    }`}>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        "Analyze recent clinical trials on immunotherapy..."
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${
                      isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'
                    }`}>
                      <p className={`text-sm ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                        "I found 127 relevant papers. Here's a comprehensive analysis..."
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className={`absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 p-3 rounded-lg ${
                    isDarkMode ? 'bg-pink-900/30' : 'bg-pink-50'
                  }`}
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Sparkles className={`w-6 h-6 ${
                    isDarkMode ? 'text-pink-400' : 'text-pink-500'
                  }`} />
                </motion.div>
              </div>
            </div>
          </motion.div>

          <motion.section 
            className="max-w-7xl mx-auto py-12 sm:py-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 
              className={`text-2xl sm:text-3xl font-bold text-center mb-12 sm:mb-16 bg-gradient-to-r ${
                isDarkMode 
                  ? 'from-purple-400 to-pink-400' 
                  : 'from-purple-600 to-pink-600'
              } text-transparent bg-clip-text`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              How Vivum Empowers You
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 sm:gap-8 px-4">
              <FeatureCard
                icon={<Brain className="w-6 h-6 text-purple-400" />}
                title="Your Personal Research Assistant"
                description="Vivum does more than search—it analyzes, critiques, and organizes your research."
                isDarkMode={isDarkMode}
                delay={0}
              />
              <FeatureCard
                icon={<Database className="w-6 h-6 text-pink-400" />}
                title="Automated Literature Reviews"
                description="Vivum takes the complexity out of evidence synthesis with AI-augmented systematic reviews."
                isDarkMode={isDarkMode}
                delay={0.1}
              />
              <FeatureCard
                icon={<Search className="w-6 h-6 text-purple-400" />}
                title="Smarter Searches"
                description="Instantly access PubMed, Scopus, and global databases with AI-enhanced precision."
                isDarkMode={isDarkMode}
                delay={0.2}
              />
              <FeatureCard
                icon={<MessageCircle className="w-6 h-6 text-pink-400" />}
                title="Source Citations"
                description="Every insight comes with real-time citations and links to original sources."
                isDarkMode={isDarkMode}
                delay={0.3}
              />
              <FeatureCard
                icon={<Lightbulb className="w-6 h-6 text-purple-400" />}
                title="Stay Ahead"
                description="Get the latest breakthroughs and personalized alerts for your research interests."
                isDarkMode={isDarkMode}
                delay={0.4}
              />
            </div>
          </motion.section>

          {/* <motion.div
            className={`max-w-4xl mx-auto text-center p-8 sm:p-10 rounded-2xl ${
              isDarkMode ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30' : 'bg-gradient-to-r from-purple-50 to-pink-50'
            } backdrop-blur-sm mb-16 border ${isDarkMode ? 'border-purple-800/30' : 'border-purple-100'}`}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            whileHover={{ scale: 1.02 }}
          >
            <motion.div 
              className="flex items-center justify-center space-x-3 mb-4"
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <Rocket className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} />
              </motion.div>
              <span className={`text-xl font-display font-bold ${
                isDarkMode ? 'text-purple-400' : 'text-purple-600'
              }`}>
                Launching Soon
              </span>
              <motion.div
                animate={{ 
                  rotate: [0, -360],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <Sparkles className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} />
              </motion.div>
            </motion.div>
            <motion.p 
              className={`text-base ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              } leading-relaxed mb-5`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Join our waitlist to be among the first to experience
              <br className="hidden sm:block" />
              the future of research and discovery
            </motion.p>
            <motion.button
              onClick={handleJoinWaitlist}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
            >
              Join the Waitlist
              <ArrowRight className="ml-2 w-4 h-4" />
            </motion.button>
          </motion.div> */}
        </div>
      </main>

      <footer className={`py-6 sm:py-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center">
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              © 2025 Vivum.app - A Venture by AD Vivum
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
