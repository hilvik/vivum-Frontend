import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface TypewriterMessageProps {
  content: string;
  isDarkMode: boolean;
  onComplete?: () => void;
}

export function TypewriterMessage({ content, isDarkMode, onComplete }: TypewriterMessageProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!content) return;
    
    setIsTyping(true);
    setDisplayedContent('');
    
    // Split content into sentences
    const sentences = content.match(/[^.!?]+[.!?]+|\s*\n\s*|\s*```[\s\S]*?```\s*|\s*`[^`]*`\s*/g) || [];
    let currentIndex = 0;
    
    const typeNextSentence = () => {
      if (currentIndex < sentences.length) {
        setDisplayedContent(prev => prev + sentences[currentIndex]);
        currentIndex++;
        // Adjust timing based on sentence length and type
        const delay = sentences[currentIndex - 1].includes('```') ? 100 : 50;
        timeoutRef.current = setTimeout(typeNextSentence, delay);
      } else {
        setIsTyping(false);
        onComplete?.();
      }
    };

    timeoutRef.current = setTimeout(typeNextSentence, 50);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, onComplete]);

  return (
    <div className="relative">
      {isTyping && (
        <div className="absolute -top-2 right-0">
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse delay-150" />
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse delay-300" />
          </div>
        </div>
      )}
      <div className={`prose prose-lg max-w-none ${isDarkMode ? 'prose-invert' : ''}`}>
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className={`mb-4 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {children}
              </p>
            ),
            strong: ({ children }) => (
              <strong className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {children}
              </strong>
            ),
            em: ({ children }) => (
              <em className={`italic ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {children}
              </em>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`font-medium underline decoration-2 underline-offset-2 ${
                  isDarkMode 
                    ? 'text-blue-400 hover:text-blue-300' 
                    : 'text-blue-600 hover:text-blue-500'
                } transition-colors duration-200`}
              >
                {children}
              </a>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside mb-4 space-y-2">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside mb-4 space-y-2">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} ml-4`}>
                {children}
              </li>
            ),
            code: ({ node, inline, className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  style={atomDark}
                  language={match[1]}
                  PreTag="div"
                  className="rounded-lg my-4"
                  customStyle={{
                    margin: '1rem 0',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                  }}
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={`${
                  isDarkMode 
                    ? 'text-purple-300 bg-gray-800' 
                    : 'text-purple-600 bg-gray-100'
                } px-1.5 py-0.5 rounded font-mono text-sm`} {...props}>
                  {children}
                </code>
              );
            },
            blockquote: ({ children }) => (
              <blockquote className={`border-l-4 ${
                isDarkMode 
                  ? 'border-gray-700 bg-gray-800/50' 
                  : 'border-gray-200 bg-gray-50'
              } pl-4 py-2 mb-4 rounded italic`}>
                {children}
              </blockquote>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto mb-4">
                <table className={`min-w-full border ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className={`px-4 py-2 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-gray-100 border-gray-200'
              } border font-semibold text-left`}>
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className={`px-4 py-2 ${
                isDarkMode 
                  ? 'border-gray-700' 
                  : 'border-gray-200'
              } border`}>
                {children}
              </td>
            ),
          }}
        >
          {displayedContent}
        </ReactMarkdown>
      </div>
    </div>
  );
}