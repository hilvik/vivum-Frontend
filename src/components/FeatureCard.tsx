import React from 'react';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isDarkMode: boolean;
  delay: number;
}

export function FeatureCard({ icon, title, description, isDarkMode, delay }: FeatureCardProps) {
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