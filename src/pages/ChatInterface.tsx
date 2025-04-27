import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ChevronDown, Globe, Settings, LogOut, MessageSquare, ChevronLeft, Search, Clock, Trash2, Menu, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import { TypewriterMessage } from '../components/TypewriterMessage';
import { checkApiHealth } from '../lib/api';
import toast from 'react-hot-toast';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

export function ChatInterface({ isDarkMode, setIsDarkMode }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isApiHealthy, setIsApiHealthy] = useState(false);
  const [isCheckingHealth, setIsCheckingHealth] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const sources = [
    { value: 'all', label: 'All Sources', icon: Globe },
    { value: 'pubmed', label: 'PubMed' },
    { value: 'scopus', label: 'Scopus' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const checkHealth = async () => {
      setIsCheckingHealth(true);
      try {
        const isHealthy = await checkApiHealth();
        setIsApiHealthy(isHealthy);
        
        if (isHealthy) {
          toast.success('Connected to AI service', {
            duration: 3000,
            icon: '🟢',
          });
        } else {
          toast.error('Unable to connect to AI service', {
            duration: 5000,
            icon: '🔴',
          });
        }
      } catch (error) {
        console.error('Health check error:', error);
        setIsApiHealthy(false);
      } finally {
        setIsCheckingHealth(false);
      }
    };

    // Initial health check
    checkHealth();

    // Set up periodic health checks every 30 seconds
    const healthCheckInterval = setInterval(checkHealth, 30000);

    // Show welcome message
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        role: 'assistant',
        content: `# Hello, Welcome to Vivum AI 👋

I'm your research assistant, ready to help you explore and analyze scientific literature. You can ask me about:

- **Research Papers**: Find and analyze papers from PubMed, Scopus, and other databases
- **Literature Reviews**: Get comprehensive overviews of specific topics
- **Clinical Trials**: Stay updated on the latest medical research
- **Data Analysis**: Extract insights from research findings

What would you like to explore today?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }

    return () => clearInterval(healthCheckInterval);
  }, [messages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (!isApiHealthy) {
      toast.error('AI service is currently unavailable', {
        duration: 5000,
        icon: '🔌',
      });
      return;
    }

    toast.error('The query feature is currently under maintenance. Please try again later.', {
      duration: 5000,
      icon: '🔧',
    });
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-[#1f1f1f] text-white' : 'bg-white text-gray-900'}`}>
      {/* Sidebar */}
      <motion.div
        initial={{ width: isSidebarOpen ? 320 : 0 }}
        animate={{ width: isSidebarOpen ? 320 : 0 }}
        transition={{ duration: 0.3 }}
        className={`h-screen flex-shrink-0 overflow-hidden ${
          isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-100'
        }`}
      >
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Chat History</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className={`p-1 rounded-lg ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {/* Chat history items */}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className={`flex items-center justify-between px-4 md:px-6 py-4 ${
          isDarkMode ? 'bg-[#1f1f1f]' : 'bg-white'
        } border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-lg ${
                isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              <Menu className="w-5 h-5" />
            </button>
            <motion.img 
              src="/vivum-logo.png" 
              alt="Vivum Logo" 
              className="w-8 h-8"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.8 }}
            />
            <motion.h1 
              className="text-xl font-bold font-display bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text"
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
              Vivum AI
            </motion.h1>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            {!isCheckingHealth && isApiHealthy && (
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                isDarkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-50 text-green-600'
              }`}>
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm">AI Connected</span>
              </div>
            )}
            {setIsDarkMode && (
              <ThemeToggle isDarkMode={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} />
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className={`p-2 rounded-lg ${
                isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className={`flex-1 overflow-y-auto p-4 md:p-6 space-y-6 ${
          isDarkMode ? 'bg-[#1f1f1f]' : 'bg-gray-50'
        }`}>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center max-w-4xl mx-auto"
            >
              <div className={`w-full rounded-xl p-6 ${
                message.role === 'user'
                  ? isDarkMode 
                    ? 'bg-gray-800 text-white' 
                    : 'bg-gray-100 text-gray-900'
                  : isDarkMode
                    ? 'bg-[#2a2a2a] text-white'
                    : 'bg-white text-gray-900'
              }`}>
                {message.role === 'assistant' ? (
                  <TypewriterMessage 
                    content={message.content} 
                    isDarkMode={isDarkMode}
                  />
                ) : (
                  <div className="prose prose-sm sm:prose-base max-w-none">
                    <p>{message.content}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {isSearching && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center max-w-4xl mx-auto"
            >
              <div className={`w-full rounded-xl p-4 ${
                isDarkMode
                  ? 'bg-[#2a2a2a] text-white'
                  : 'bg-white text-gray-900'
              }`}>
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full"
                  />
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                    Analyzing research papers...
                  </span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className={`p-4 ${isDarkMode ? 'bg-[#1f1f1f]' : 'bg-white'}`}>
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className={`flex items-center space-x-2 p-2 rounded-2xl ${
              isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-100'
            }`}>
              <div className="relative flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                    isDarkMode 
                      ? 'hover:bg-gray-700 text-gray-300' 
                      : 'hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <span>{sources.find(s => s.value === selectedSource)?.label || 'All Sources'}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`absolute bottom-full mb-2 w-48 rounded-lg shadow-lg ${
                        isDarkMode ? 'bg-gray-800' : 'bg-white'
                      } border ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}
                    >
                      {sources.map((source) => (
                        <button
                          key={source.value}
                          type="button"
                          onClick={() => {
                            setSelectedSource(source.value);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 first:rounded-t-lg last:rounded-b-lg ${
                            isDarkMode 
                              ? 'hover:bg-gray-700' 
                              : 'hover:bg-gray-100'
                          } ${
                            selectedSource === source.value
                              ? isDarkMode 
                                ? 'bg-gray-700' 
                                : 'bg-gray-100'
                              : ''
                          }`}
                        >
                          {source.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  className={`w-full px-4 py-3 rounded-xl ${
                    isDarkMode 
                      ? 'bg-transparent text-white placeholder-gray-400' 
                      : 'bg-transparent text-gray-900 placeholder-gray-500'
                  } focus:outline-none`}
                />
              </div>

              <motion.button
                type="submit"
                disabled={isSearching || !isApiHealthy}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2.5 rounded-lg ${
                  !isApiHealthy || isSearching
                    ? 'bg-gray-700 cursor-not-allowed'
                    : isDarkMode
                      ? 'bg-purple-500 hover:bg-purple-600'
                      : 'bg-purple-500 hover:bg-purple-600'
                } text-white`}
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}