import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Globe, Settings, LogOut, MessageSquare, ChevronLeft, Search, Clock, Trash2, Menu, CheckCircle2, User, Building2, MapPin, Pencil, X, Save, Send, BookOpen, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import { TypewriterMessage } from '../components/TypewriterMessage';
import { checkApiHealth, getarticles, gettopicid, checkTopicStatus, generateResponse } from '../lib/api';
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
  const [articleData, setArticleData] = useState([]);
  const [fetchText, setFetchText] = useState("Fetch Articles");
  const [currentTopicId, setCurrentTopicId] = useState<string | null>(null);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [showSourcesPopup, setShowSourcesPopup] = useState(false);
  const [hasAskedFirstQuery, setHasAskedFirstQuery] = useState(false);
  const [conversationid, setConversationId] = useState("null");
  const [visibleArticles, setVisibleArticles] = useState(0);
  const [showArticleFilter, setShowArticleFilter] = useState(false);
  const [articleCount, setArticleCount] = useState(5);
  const [showFilterTooltip, setShowFilterTooltip] = useState(true);
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

  useEffect(() => {
    const tooltipTimer = setTimeout(() => {
      setShowFilterTooltip(false);
    }, 5000);

    return () => clearTimeout(tooltipTimer);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const isHealthy = await checkApiHealth();   
        
        if (isHealthy) {
          setIsApiHealthy(true);
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
        setIsCheckingHealth(false);
      } catch (error) {
        console.error('Health check error:', error);
        setIsApiHealthy(false);
      }
    };

    checkHealth();
  }, []);

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
    if (articleData.length > 0 && visibleArticles < articleData.length) {
      const timer = setTimeout(() => {
        setVisibleArticles(prev => prev + 1);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [articleData, visibleArticles]);

  useEffect(() => {
    setVisibleArticles(0);
    if (articleData.length > 0) {
      setVisibleArticles(1);
    }
  }, [articleData]);

  const pollTopicStatus = async (topicId: string) => {
    let attempts = 0;
    const maxAttempts = 10;
    const pollInterval = 5000;

    while (attempts < maxAttempts) {
      const { status, error } = await checkTopicStatus(topicId);
      
      if (error) {
        toast.error(error);
        return false;
      }

      if (status === 'completed') {
        return true;
      }

      if (status === 'error') {
        toast.error('Error processing topic');
        return false;
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
      attempts++;
    }

    toast.error('Topic processing timed out');
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (!isApiHealthy) {
      toast.error('AI service is currently unavailable');
      return;
    }

    if (!currentTopicId) {
      toast.error('Please fetch articles first');
      return;
    }

    if (!hasAskedFirstQuery) {
      setHasAskedFirstQuery(true);
    }

    setMessages(prev => [...prev, { 
      role: 'user', 
      content: input, 
      timestamp: new Date() 
    }]);

    setIsGeneratingResponse(true);

    try {
      setInput("");
      const { response, conversation_id } = await generateResponse(currentTopicId, input, conversationid);

      if (response) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response,
          timestamp: new Date()
        }]);
        setConversationId(conversation_id);
        setIsGeneratingResponse(false);
      }
    } catch (error) {
      toast.error('Failed to generate response');
      console.error('Error generating response:', error);
    }
  };

  const handleFetchArticles = async () => {
    if (!input.trim()) {
      toast.error('Please enter a topic to search for');
      return;
    }

    setIsSearching(true);
    setFetchText("Fetching...");

    try {
      const { topic_id, error: topicError } = await gettopicid(input, articleCount);
      
      if (topicError) {
        toast.error(topicError);
        return;
      }

      if (!topic_id) {
        toast.error('No topic ID returned from server');
        return;
      }

      setCurrentTopicId(topic_id);

      await new Promise(resolve => setTimeout(resolve, 5000));

      const isCompleted = await pollTopicStatus(topic_id);
      
      if (!isCompleted) {
        return;
      }

      const { articles, error: articlesError } = await getarticles(topic_id);
      
      if (articlesError) {
        toast.error(articlesError);
        return;
      }

      if (articles && articles.length > 0) {
        setArticleData(articles);
        setMessages(prev => [...prev, {
          role: 'user',
          content: `Search for articles about: ${input}`,
          timestamp: new Date()
        }]);
        toast.success(`Found ${articles.length} articles. Ask me anything about them!`);
      } else {
        toast.error('No articles found for this topic');
      }
    } catch (error) {
      toast.error('Failed to fetch articles');
      console.error('Error fetching articles:', error);
    } finally {
      setIsSearching(false);
      setFetchText("Fetch Articles");
      setInput('');
    }
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
          </div>
        </div>
      </motion.div>

      <div className="flex-1 flex flex-col min-w-0">
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

          {!hasAskedFirstQuery && articleData.slice(0, visibleArticles).map((article: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className={`p-6 rounded-xl ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-lg max-w-4xl mx-auto`}
            >
              <h3 className={`text-xl font-semibold mb-3 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {article.title}
              </h3>
              {article.authors && (
                <p className={`text-sm mb-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Authors: {article.authors}
                </p>
              )}
              {article.abstract && (
                <p className={`text-sm mb-4 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {article.abstract}
                </p>
              )}
              <div className="flex items-center space-x-4">
                {article.pubmed_id && (
                  <a
                    href={`https://pubmed.ncbi.nlm.nih.gov/${article.pubmed_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-sm font-medium ${
                      isDarkMode 
                        ? 'text-purple-400 hover:text-purple-300' 
                        : 'text-purple-600 hover:text-purple-500'
                    }`}
                  >
                    View on PubMed
                  </a>
                )}
                {article.url && (
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-sm font-medium ${
                      isDarkMode 
                        ? 'text-purple-400 hover:text-purple-300' 
                        : 'text-purple-600 hover:text-purple-500'
                    }`}
                  >
                    View Article
                  </a>
                )}
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className={`p-4 ${isDarkMode ? 'bg-[#1f1f1f]' : 'bg-white'}`}>
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className={`flex items-center space-x-2 p-2 rounded-2xl ${
              isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-100'
            }`}>
              {hasAskedFirstQuery && articleData.length > 0 && (
                <motion.button
                  type="button"
                  onClick={() => setShowSourcesPopup(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm">Sources</span>
                </motion.button>
              )}

              <div className="relative flex-1">
                {articleData.length === 0 && (
                  <div className="relative">
                    <motion.button
                      type="button"
                      onClick={() => setShowArticleFilter(true)}
                      className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-lg ${
                        isDarkMode 
                          ? 'hover:bg-gray-700 text-gray-400' 
                          : 'hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                    </motion.button>
                    
                    {showFilterTooltip && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`absolute left-0 bottom-full mb-2 px-3 py-2 rounded-lg text-sm ${
                          isDarkMode 
                            ? 'bg-gray-800 text-gray-200' 
                            : 'bg-white text-gray-700'
                        } shadow-lg border ${
                          isDarkMode ? 'border-gray-700' : 'border-gray-200'
                        } whitespace-nowrap`}
                      >
                        Select number of articles
                        <div className={`absolute bottom-0 left-4 transform translate-y-1/2 rotate-45 w-2 h-2 ${
                          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        } border-r border-b`}></div>
                      </motion.div>
                    )}
                  </div>
                )}
                
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={articleData.length > 0 ? "Ask me anything about these articles..." : "Enter a research topic..."}
                  className={`w-full ${articleData.length === 0 ? 'pl-12' : 'pl-4'} pr-4 py-3 rounded-xl ${
                    isDarkMode 
                      ? 'bg-transparent text-white placeholder-gray-400' 
                      : 'bg-transparent text-gray-900 placeholder-gray-500'
                  } focus:outline-none`}
                />
              </div>

              {articleData.length === 0 ? (
                <motion.button
                  type="button"
                  onClick={handleFetchArticles}
                  disabled={isSearching || !isApiHealthy}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2.5 rounded-lg ${
                    !isApiHealthy || isSearching
                      ? 'bg-gray-700 cursor-not-allowed'
                      : isDarkMode
                        ? 'bg-purple-500 hover:bg-purple-600'
                        : 'bg-purple-500 hover:bg-purple-600'
                  } text-white font-medium`}
                >
                  {fetchText}
                </motion.button>
              ) : (
                <motion.button
                  type="submit"
                  disabled={!input.trim() || isGeneratingResponse || !isApiHealthy}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-3 rounded-lg ${
                    !input.trim() || !isApiHealthy || isGeneratingResponse
                      ? 'bg-gray-700 cursor-not-allowed'
                      : isDarkMode
                        ? 'bg-purple-500 hover:bg-purple-600'
                        : 'bg-purple-500 hover:bg-purple-600'
                  } text-white`}
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              )}
            </div>
          </form>
        </div>

        <AnimatePresence>
          {showArticleFilter && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowArticleFilter(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className={`w-full max-w-md rounded-xl shadow-xl ${
                  isDarkMode ? 'bg-gray-900' : 'bg-white'
                } p-6`}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-xl font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Number of Articles
                  </h3>
                  <button
                    onClick={() => setShowArticleFilter(false)}
                    className={`p-2 rounded-lg ${
                      isDarkMode 
                        ? 'hover:bg-gray-800 text-gray-400' 
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className={`text-center text-3xl font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {articleCount}
                  </div>

                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={() => setArticleCount(prev => Math.max(5, prev - 1))}
                      className={`p-2 rounded-lg ${
                        isDarkMode 
                          ? 'hover:bg-gray-800 text-gray-400' 
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      -
                    </button>
                    
                    <input
                      type="range"
                      min="5"
                      max="25"
                      value={articleCount}
                      onChange={(e) => setArticleCount(parseInt(e.target.value))}
                      className="w-48 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    
                    <button
                      onClick={() => setArticleCount(prev => Math.min(25, prev + 1))}
                      className={`p-2 rounded-lg ${
                        isDarkMode 
                          ? 'hover:bg-gray-800 text-gray-400' 
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      +
                    </button>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      Min: 5
                    </span>
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      Max: 25
                    </span>
                  </div>

                  <motion.button
                    onClick={() => setShowArticleFilter(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-medium"
                  >
                    Confirm
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {showSourcesPopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowSourcesPopup(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className={`w-full max-w-3xl max-h-[80vh] overflow-y-auto rounded-xl shadow-xl ${
                  isDarkMode ? 'bg-gray-900' : 'bg-white'
                } p-6`}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-xl font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Source Articles
                  </h3>
                  <button
                    onClick={() => setShowSourcesPopup(false)}
                    className={`p-2 rounded-lg ${
                      isDarkMode 
                        ? 'hover:bg-gray-800 text-gray-400' 
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {articleData.map((article: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-700' 
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <h4 className={`text-lg font-medium mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {article.title}
                      </h4>
                      {article.authors && (
                        <p className={`text-sm mb-2 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Authors: {article.authors}
                        </p>
                      )}
                      {article.abstract && (
                        <p className={`text-sm mb-4 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {article.abstract}
                        </p>
                      )}
                      <div className="flex items-center space-x-4">
                        {article.pubmed_id && (
                          <a
                            href={`https://pubmed.ncbi.nlm.nih.gov/${article.pubmed_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-sm font-medium ${
                              isDarkMode 
                                ? 'text-purple-400 hover:text-purple-300' 
                                : 'text-purple-600 hover:text-purple-500'
                            }`}
                          >
                            View on PubMed
                          </a>
                        )}
                        {article.url && (
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-sm font-medium ${
                              isDarkMode 
                                ? 'text-purple-400 hover:text-purple-300' 
                                : 'text-purple-600 hover:text-purple-500'
                            }`}
                          >
                            View Article
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}