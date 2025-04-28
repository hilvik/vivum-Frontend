import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {  ChevronDown, Globe, Settings, LogOut, MessageSquare, ChevronLeft, Search, Clock, Trash2, Menu, CheckCircle2, User, Building2, MapPin, Pencil, X, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import { TypewriterMessage } from '../components/TypewriterMessage';
import { checkApiHealth ,getarticles,gettopicid} from '../lib/api';
import { supabase } from '../lib/supabase';
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

interface UserProfile {
  full_name: string;
  email: string;
  institute: string;
  country: string;
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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [articledata , setArticleData] = useState([])
  const[articles , setArticles] = useState(false)
  const [fetchText , setFetchText] = useState("Fetch Response")
  const [editedProfile, setEditedProfile] = useState({
    institute: '',
    country: ''
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
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
    console.log("hello")
    const checkHealth = async () => {
      try {
        const isHealthy = await checkApiHealth();   
        
        if (isHealthy) {
          setIsApiHealthy(true)
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
        setIsCheckingHealth(false)
      } catch (error) {
        console.error('Health check error:', error);
        setIsApiHealthy(false);
      }
    };

    // Initial health check
    checkHealth();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/');
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('full_name, email, institute, country')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setUserProfile(profile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Failed to load user profile');
      }
    };

    fetchUserProfile();
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
   

    // Set up periodic health checks every 30 seconds
    // const healthCheckInterval = setInterval(checkHealth, 30000);

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
      // setMessages([welcomeMessage]);
    }

    
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

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleEditClick = () => {
    setEditedProfile({
      institute: userProfile?.institute || '',
      country: userProfile?.country || ''
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedProfile({
      institute: userProfile?.institute || '',
      country: userProfile?.country || ''
    });
  };

 
  const handleFetchArticles = async() => {
    const response = await gettopicid(input)
    console.log(response)
    console.log("in getart")
    const topicId = response.topic_id;
    console.log(topicId)
    const timer = setTimeout(async() => {
      const art = await getarticles(topicId)
      console.log(art)
     setFetchText("Generate")
     setArticleData(art.articles)
     setArticles(true)
    }, 5000);

    // const {topic_id} = response
    
  };
  

  const handleSaveProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('User not authenticated');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          institute: editedProfile.institute,
          country: editedProfile.country,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setUserProfile(prev => ({
        ...prev!,
        institute: editedProfile.institute,
        country: editedProfile.country
      }));

      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
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
            
            {/* Profile Section */}
            <div className="relative" ref={profileRef}>
              <motion.button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-lg ${
                  isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
              >
                <User className="w-5 h-5" />
              </motion.button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`absolute right-0 mt-2 w-72 rounded-xl shadow-lg ${
                      isDarkMode ? 'bg-gray-800' : 'bg-white'
                    } border ${
                      isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    } overflow-hidden z-50`}
                  >
                    <div className="p-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={`p-2 rounded-lg ${
                          isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          <User className={`w-6 h-6 ${
                            isDarkMode ? 'text-purple-400' : 'text-purple-600'
                          }`} />
                        </div>
                        <div>
                          <h3 className={`font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {userProfile?.full_name || 'Loading...'}
                          </h3>
                          <p className={`text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {userProfile?.email || 'Loading...'}
                          </p>
                        </div>
                      </div>

                      <div className={`space-y-3 mb-4 p-3 rounded-lg ${
                        isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                      }`}>
                        {isEditing ? (
                          <div className="space-y-3">
                            <div>
                              <label className={`block text-sm font-medium mb-1 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                Institute
                              </label>
                              <input
                                type="text"
                                value={editedProfile.institute}
                                onChange={(e) => setEditedProfile(prev => ({
                                  ...prev,
                                  institute: e.target.value
                                }))}
                                className={`w-full px-3 py-1.5 rounded-lg text-sm ${
                                  isDarkMode 
                                    ? 'bg-gray-800 text-white border-gray-600' 
                                    : 'bg-white text-gray-900 border-gray-300'
                                } border focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                                placeholder="Enter your institute"
                              />
                            </div>
                            <div>
                              <label className={`block text-sm font-medium mb-1 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                Country
                              </label>
                              <input
                                type="text"
                                value={editedProfile.country}
                                onChange={(e) => setEditedProfile(prev => ({
                                  ...prev,
                                  country: e.target.value
                                }))}
                                className={`w-full px-3 py-1.5 rounded-lg text-sm ${
                                  isDarkMode 
                                    ? 'bg-gray-800 text-white border-gray-600' 
                                    : 'bg-white text-gray-900 border-gray-300'
                                } border focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                                placeholder="Enter your country"
                              />
                            </div>
                            <div className="flex space-x-2 pt-2">
                              <button
                                onClick={handleSaveProfile}
                                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-1.5 rounded-lg text-sm ${
                                  isDarkMode 
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                                }`}
                              >
                                <Save className="w-4 h-4" />
                                <span>Save</span>
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-1.5 rounded-lg text-sm ${
                                  isDarkMode 
                                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                }`}
                              >
                                <X className="w-4 h-4" />
                                <span>Cancel</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Building2 className={`w-4 h-4 ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`} />
                                <span className={`text-sm ${
                                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                }`}>
                                  {userProfile?.institute || 'No institute set'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <MapPin className={`w-4 h-4 ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`} />
                                <span className={`text-sm ${
                                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                }`}>
                                  {userProfile?.country || 'No country set'}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={handleEditClick}
                              className={`w-full flex items-center justify-center space-x-2 p-1.5 rounded-lg text-sm ${
                                isDarkMode 
                                  ? 'bg-gray-600/50 hover:bg-gray-600 text-gray-300' 
                                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                              }`}
                            >
                              <Pencil className="w-4 h-4" />
                              <span>Edit Profile</span>
                            </button>
                          </>
                        )}
                      </div>

                      <button
                        onClick={handleLogout}
                        className={`w-full flex items-center justify-center space-x-2 p-2 rounded-lg ${
                          isDarkMode 
                            ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30' 
                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                        } transition-colors`}
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div>
          {articledata?.map((article, index) => ( 
//           <div className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
    
//         <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Noteworthy technology acquisitions 2021</h5>
   
//     <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.</p>
//     <button  className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" />
//         Read more
//         <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
//             <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
//         </svg>
   
// </div>
<div>
hello
</div>
          ))}

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
                onClick={handleFetchArticles}
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
                {fetchText}
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}