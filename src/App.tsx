import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HomePage } from './pages/HomePage';
import { ActivationPage } from './pages/ActivationPage';
import { WaitlistPage } from './pages/WaitlistPage';
import { ChatInterface } from './pages/ChatInterface';
import { ResetPassword } from './pages/ResetPassword';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  return (
    <Router>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<HomePage isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />} />
        <Route path="/activate" element={<ActivationPage isDarkMode={isDarkMode} />} />
        <Route path="/waitlist" element={<WaitlistPage isDarkMode={isDarkMode} />} />
        <Route path="/dashboard" element={<ChatInterface isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />} />
        <Route path="/reset-password" element={<ResetPassword isDarkMode={isDarkMode} />} />
      </Routes>
    </Router>
  );
}

export default App;