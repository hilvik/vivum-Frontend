import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

interface ThemeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

export function ThemeToggle({ isDarkMode, onToggle }: ThemeToggleProps) {
  return (
    <motion.button
      onClick={onToggle}
      className={`p-2.5 rounded-lg transition-all duration-300 ${
        isDarkMode 
          ? 'bg-slate-800 hover:bg-slate-700 text-sky-300' 
          : 'bg-slate-100 hover:bg-slate-200 text-sky-600'
      } hover:shadow-lg hover:shadow-sky-500/10`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </motion.button>
  );
}