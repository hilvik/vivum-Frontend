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
      className={`p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border ${
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
        className="mb-4 inline-block p-2 sm:p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10"
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        {icon}
      </motion.div>
      <h3 className={`text-lg sm:text-xl font-semibold mb-3 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>{title}</h3>
      <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
    </motion.div>
  );
}

export function HomePage({ isDarkMode, setIsDarkMode }: HomePageProps) {
  const [mainSearchQuery, setMainSearchQuery] = useState('');
  const [keywordSearchQuery, setKeywordSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  const sources = [
    { value: 'all', label: 'All Sources', icon: Database },
    { value: 'pubmed', label: 'PubMed', icon: Flask },
    { value: 'scopus', label: 'Scopus', icon: Newspaper },
  ];

  const selectedSourceData = sources.find(source => source.value === selectedSource);
  const SelectedIcon = selectedSourceData?.icon || Database;

  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/activate');
  };

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
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-pink-600 transform origin-left z-50"
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
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 max-w-[1400px] flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-2 sm:space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <motion.img 
              src="/vivum-logo.png" 
              alt="Vivum Logo" 
              className="w-8 h-8 sm:w-10 sm:h-10"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.8 }}
            />
            <motion.span 
              className="text-xl sm:text-2xl font-bold font-display bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text"
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
          
          <div className="flex items-center space-x-2 sm:space-x-5">
            <motion.button
              onClick={() => navigate('/activate')}
              className="px-3 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg sm:rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-200 text-sm sm:text-base"
              whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(147, 51, 234, 0.3)" }}
              whileTap={{ scale: 0.98 }}
            >
              Get Started
            </motion.button>
            <ThemeToggle isDarkMode={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} />
          </div>
        </nav>
      </motion.header>

      <main className="pt-16 sm:pt-20 lg:pt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 max-w-[1400px]">
          <motion.div 
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 sm:mb-8 bg-gradient-to-r ${
                isDarkMode 
                  ? 'from-purple-400 via-pink-400 to-purple-400' 
                  : 'from-purple-600 via-pink-600 to-purple-600'
              } text-transparent bg-clip-text leading-tight max-w-4xl mx-auto px-4`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              Take a Leap to Discover.
              <br className="hidden sm:block" />
              Analyze. Synthesize.
            </motion.h1>
            
            <motion.div
              className={`max-w-3xl mx-auto mb-8 sm:mb-12 px-4 py-6 rounded-2xl ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-purple-900/30' 
                  : 'bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.p 
                className={`text-xl sm:text-2xl lg:text-3xl font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                } leading-relaxed`}
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{ 
                  backgroundImage: `linear-gradient(45deg, ${isDarkMode ? '#a855f7, #ec4899' : '#9333ea, #db2777'})`,
                  backgroundSize: "200% 200%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Six hours of research, solved in six minutes
                <br className="hidden sm:block" />
                with real-time, citation-anchored AI
              </motion.p>
            </motion.div>

            <motion.p 
              className={`text-base sm:text-lg lg:text-xl ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              } mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4`}
            >
              No more manual and time-consuming literature searches and time wasting—Vivum brings it quickly at your fingertips. Get instant access to real-time data from PubMed, Scopus, and beyond, making literature reviews and evidence synthesis effortless.
            </motion.p>
          </motion.div>

          <motion.div 
            className={`max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl lg:rounded-3xl ${
              isDarkMode 
                ? 'bg-gradient-to-r from-purple-900/30 via-gray-900/50 to-pink-900/30 border-gray-800' 
                : 'bg-gradient-to-r from-purple-50 via-white to-pink-50 border-gray-200'
            } shadow-2xl border backdrop-blur-xl mb-12 sm:mb-16 lg:mb-24`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <form onSubmit={handleSearch} className="space-y-4 sm:space-y-6">
              <div className="relative group">
                <Search className={`absolute left-3 sm:left-4 top-3 sm:top-4 w-5 sm:w-6 h-5 sm:h-6 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                } group-hover:text-purple-400 transition-colors`} />
                <input
                  type="text"
                  placeholder="What research topic are you exploring?"
                  value={mainSearchQuery}
                  onChange={(e) => setMainSearchQuery(e.target.value)}
                  className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 rounded-lg sm:rounded-xl text-base sm:text-lg ${
                    isDarkMode 
                      ? 'bg-gray-800/50 text-gray-100 placeholder-gray-500 border-gray-700' 
                      : 'bg-white/50 text-gray-900 placeholder-gray-400 border-gray-200'
                  } border focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all`}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative group">
                  <Tag className={`absolute left-3 sm:left-4 top-3 sm:top-4 w-5 h-5 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  } group-hover:text-purple-400 transition-colors`} />
                  <input
                    type="text"
                    placeholder="Filter by keywords..."
                    value={keywordSearchQuery}
                    onChange={(e) => setKeywordSearchQuery(e.target.value)}
                    className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 rounded-lg sm:rounded-xl text-base sm:text-lg ${
                      isDarkMode 
                        ? 'bg-gray-800/50 text-gray-100 placeholder-gray-500 border-gray-700' 
                        : 'bg-white/50 text-gray-900 placeholder-gray-400 border-gray-200'
                    } border focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all`}
                  />
                </div>

                <div className="sm:w-48">
                  <motion.button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`w-full flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 rounded-lg sm:rounded-xl ${
                      isDarkMode 
                        ? 'bg-gray-800/50 border-gray-700' 
                        : 'bg-white/50 border-gray-200'
                    } border hover:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-400/20 transition-all text-base sm:text-lg`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3">
                      <SelectedIcon className="w-5 h-5 text-purple-400" />
                      <span>{selectedSourceData?.label}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </motion.button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`absolute mt-2 w-full sm:w-48 rounded-lg sm:rounded-xl shadow-lg ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-700' 
                            : 'bg-white border-gray-200'
                        } border overflow-hidden z-50`}
                      >
                        {sources.map((source) => {
                          const Icon = source.icon;
                          return (
                            <motion.button
                              type="button"
                              key={source.value}
                              onClick={() => {
                                setSelectedSource(source.value);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full flex items-center space-x-3 px-4 sm:px-5 py-3 ${
                                isDarkMode 
                                  ? 'hover:bg-purple-500/10' 
                                  : 'hover:bg-purple-50'
                              } transition-colors ${
                                selectedSource === source.value 
                                  ? isDarkMode
                                    ? 'bg-purple-500/20 text-purple-400'
                                    : 'bg-purple-50 text-purple-600'
                                  : ''
                              } text-base`}
                              whileHover={{ x: 5 }}
                            >
                              <Icon className="w-5 h-5" />
                              <span>{source.label}</span>
                            </motion.button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <motion.button 
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl text-base sm:text-lg flex items-center justify-center space-x-3 shadow-lg text-white font-medium"
                whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(147, 51, 234, 0.3)" }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Search Literature</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </form>
          </motion.div>

          <motion.div
            className={`max-w-6xl mx-auto rounded-2xl sm:rounded-3xl overflow-hidden ${
              isDarkMode 
                ? 'bg-gradient-to-r from-purple-900/30 via-gray-900 to-pink-900/30' 
                : 'bg-gradient-to-r from-purple-50 via-white to-pink-50'
            } mb-16 sm:mb-24`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="grid md:grid-cols-2 gap-8 p-4 sm:p-8 lg:p-12">
              <div className="space-y-8">
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
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                    <Bot className={`w-16 h-16 ${
                      isDarkMode ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                  </div>
                </motion.div>
                
                <div>
                  <h2 className={`text-3xl sm:text-4xl font-bold mb-6 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Meet Your AI Agent
                  </h2>
                  <p className={`text-lg mb-8 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Experience the future of research with an AI agent that understands context, analyzes patterns, and delivers meaningful insights tailored to your needs.
                  </p>
                  <motion.button
                    onClick={handleTryAIAgent}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
                  >
                    <span>Try the AI Agent</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              <div className="relative">
                <motion.div
                  className={`p-6 rounded-2xl ${
                    isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'
                  } backdrop-blur-sm shadow-xl`}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-4">
                    <div className={`p-4 rounded-xl ${
                      isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                    }`}>
                      <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                        "Analyze recent clinical trials on immunotherapy..."
                      </p>
                    </div>
                    <div className={`p-4 rounded-xl ${
                      isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'
                    }`}>
                      <p className={isDarkMode ? 'text-purple-300' : 'text-purple-600'}>
                        "I found 127 relevant papers. Here's a comprehensive analysis..."
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className={`absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 p-4 rounded-xl ${
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
                  <Sparkles className={`w-8 h-8 ${
                    isDarkMode ? 'text-pink-400' : 'text-pink-500'
                  }`} />
                </motion.div>
              </div>
            </div>
          </motion.div>

          <motion.section 
            className="max-w-7xl mx-auto py-12 sm:py-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 
              className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-12 sm:mb-20 bg-gradient-to-r ${
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 px-4">
              <FeatureCard
                icon={<Brain className="w-8 h-8 text-purple-400" />}
                title="Your Personal Research Assistant"
                description="Vivum does more than search—it analyzes, critiques, and organizes your research."
                isDarkMode={isDarkMode}
                delay={0}
              />
              <FeatureCard
                icon={<Database className="w-8 h-8 text-pink-400" />}
                title="Automated Literature Reviews & Systematic Analysis"
                description="Vivum takes the complexity out of evidence synthesis from AI-augmented systematic reviews to AI meta-analyses."
                isDarkMode={isDarkMode}
                delay={0.1}
              />
              <FeatureCard
                icon={<Search className="w-8 h-8 text-purple-400" />}
                title="Smarter Searches, Faster Insights"
                description="Instantly access PubMed, Scopus, and global databases with AI-enhanced precision. Filter by keywords, MeSH terms, and Boolean logic to find exactly what you need."
                isDarkMode={isDarkMode}
                delay={0.2}
              />
              <FeatureCard
                icon={<MessageCircle className="w-8 h-8 text-pink-400" />}
                title="Source Citations"
                description="Every insight comes with real-time citations and links to original sources."
                isDarkMode={isDarkMode}
                delay={0.3}
              />
              <FeatureCard
                icon={<Lightbulb className="w-8 h-8 text-purple-400" />}
                title="Stay Ahead with AI-Augmented Future"
                description="Whether you're a clinician, academic, or industry researcher, Vivum empowers you with the latest breakthroughs and personalized alerts."
                isDarkMode={isDarkMode}
                delay={0.4}
              />
            </div>
          </motion.section>

          <motion.div
            className={`max-w-4xl mx-auto text-center p-6 sm:p-10 lg:p-12 rounded-2xl sm:rounded-3xl ${
              isDarkMode ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30' : 'bg-gradient-to-r from-purple-50 to-pink-50'
            } backdrop-blur-sm mb-16 sm:mb-24 border ${isDarkMode ? 'border-purple-800/30' : 'border-purple-100'}`}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            whileHover={{ scale: 1.02 }}
          >
            <motion.div 
              className="flex items-center justify-center space-x-4 mb-6"
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
                <Rocket className={`w-8 h-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} />
              </motion.div>
              <span className={`text-3xl font-display font-bold ${
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
                <Sparkles className={`w-8 h-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} />
              </motion.div>
            </motion.div>
            <motion.p 
              className={`text-xl ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              } leading-relaxed`}
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
              className="mt-8 inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium text-lg shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
            >
              Join the Waitlist
              <ArrowRight className="ml-2 w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </main>

      <footer className={`py-6 sm:py-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              © 2025 Vivum.app - A Venture by AD Vivum
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}