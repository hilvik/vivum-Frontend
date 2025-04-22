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
    
    // Split content into paragraphs
    const paragraphs = content.split('\n').filter(Boolean);
    let currentIndex = 0;
    
    const typeNextParagraph = () => {
      if (currentIndex < paragraphs.length) {
        setDisplayedContent(prev => {
          const newContent = prev + (prev ? '\n' : '') + paragraphs[currentIndex];
          return newContent;
        });
        currentIndex++;
        timeoutRef.current = setTimeout(typeNextParagraph, 100);
      } else {
        setIsTyping(false);
        onComplete?.();
      }
    };

    timeoutRef.current = setTimeout(typeNextParagraph, 100);

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
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={`${isDarkMode ? 'text-purple-300' : 'text-purple-600'} bg-opacity-10 rounded px-1`} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {displayedContent}
        </ReactMarkdown>
      </div>
    </div>
  );
}