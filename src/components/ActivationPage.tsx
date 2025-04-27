import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Fingerprint, X, Mail, Lock, Building2, Globe2, User, AlertCircle, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Dialog, Combobox } from '@headlessui/react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface ActivationPageProps {
  isDarkMode: boolean;
}

// Password validation criteria
const PASSWORD_CRITERIA = {
  minLength: 8,
  hasUpperCase: /[A-Z]/,
  hasLowerCase: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/,
};

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde",
  "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros",
  "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica",
  "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini",
  "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada",
  "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia",
  "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati",
  "Korea, North", "Korea, South", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia",
  "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta",
  "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro",
  "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger",
  "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea",
  "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis",
  "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia",
  "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia",
  "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan",
  "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey",
  "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay",
  "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

export function ActivationPage({ isDarkMode }: ActivationPageProps) {
  const [invitationCode, setInvitationCode] = useState('');
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [hasValidCode, setHasValidCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institute: '',
    country: '',
    password: '',
    confirmPassword: '',
  });

  const [passwordStrength, setPasswordStrength] = useState({
    isValid: false,
    errors: [] as string[],
  });

  const [countryQuery, setCountryQuery] = useState('');
  const [activationCodeData, setActivationCodeData] = useState<any>(null);
  const [lastSignupAttempt, setLastSignupAttempt] = useState(0);
  const SIGNUP_COOLDOWN = 36000;

  const filteredCountries = countryQuery === ''
    ? COUNTRIES
    : COUNTRIES.filter((country) =>
        country.toLowerCase().includes(countryQuery.toLowerCase())
      );

  const validatePassword = (password: string) => {
    const errors = [];
    
    if (password.length < PASSWORD_CRITERIA.minLength) {
      errors.push(`At least ${PASSWORD_CRITERIA.minLength} characters`);
    }
    if (!PASSWORD_CRITERIA.hasUpperCase.test(password)) {
      errors.push('One uppercase letter');
    }
    if (!PASSWORD_CRITERIA.hasLowerCase.test(password)) {
      errors.push('One lowercase letter');
    }
    if (!PASSWORD_CRITERIA.hasNumber.test(password)) {
      errors.push('One number');
    }
    if (!PASSWORD_CRITERIA.hasSpecialChar.test(password)) {
      errors.push('One special character');
    }

    setPasswordStrength({
      isValid: errors.length === 0,
      errors,
    });

    return errors.length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'password') {
      validatePassword(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyingCode(true);

    try {
      const { data: waitlistData, error: waitlistError } = await supabase
        .from('waitlist')
        .select('*')
        .eq('activation_code', invitationCode)
        .single();

      if (waitlistError) {
        if (waitlistError.code === 'PGRST116') {
          toast.error('Invalid activation code');
          setIsWaitlistModalOpen(true);
          return;
        }
        throw waitlistError;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('activation_code', invitationCode)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (profileData) {
        toast.error('This activation code has already been used');
        setIsWaitlistModalOpen(true);
        return;
      }

      if (waitlistData) {
        setActivationCodeData(waitlistData);
        setHasValidCode(true);
        setShowAuthForm(true);
        setIsSignUp(true);
        setFormData(prev => ({
          ...prev,
          name: waitlistData.Name || '',
          email: waitlistData['Email address'] || '',
          institute: waitlistData.Affiliation || '',
          country: waitlistData['State and Country']?.split(',').pop()?.trim() || '',
        }));
      } else {
        setIsWaitlistModalOpen(true);
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      toast.error('Error verifying activation code');
      setIsWaitlistModalOpen(true);
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: verificationEmail,
      });

      if (error) throw error;

      toast.success('Verification email resent! Please check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend verification email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignUp) {
      const now = Date.now();
      const timeSinceLastAttempt = now - lastSignupAttempt;
      
      if (timeSinceLastAttempt < SIGNUP_COOLDOWN) {
        const waitTime = Math.ceil((SIGNUP_COOLDOWN - timeSinceLastAttempt) / 1000);
        toast.error(`Please wait ${waitTime} seconds before trying again`);
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        if (!passwordStrength.isValid) {
          toast.error('Please ensure your password meets all requirements');
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          return;
        }

        setLastSignupAttempt(Date.now());

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
              institute: formData.institute,
              country: formData.country,
              activation_code: activationCodeData.activation_code
            }
          }
        });

        if (signUpError) throw signUpError;

        toast.success('Account created successfully! Please check your email to verify your account.');
        navigate('/dashboard');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          if (error.message.includes('email_not_confirmed')) {
            setVerificationEmail(formData.email);
            setShowVerificationModal(true);
            return;
          }
          throw error;
        }

        toast.success('Signed in successfully!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      if (error.message.includes('rate_limit')) {
        toast.error('Please wait a moment before trying again');
      } else {
        toast.error(error.message || 'An error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignInClick = () => {
    if (hasValidCode) {
      setIsSignUp(false);
    } else {
      setShowAuthForm(true);
      setIsSignUp(false);
    }
  };

  const handleSignUpClick = () => {
    setShowAuthForm(false);
    setIsSignUp(true);
  };

  const handleGoogleSignIn = () => {
    toast.success('Google Sign In coming soon!');
  };

  const handleJoinWaitlist = () => {
    navigate('/waitlist');
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingReset(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success('Password reset instructions sent to your email');
      setShowForgotPassword(false);
      setForgotPasswordEmail('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset instructions');
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className={`min-h-screen theme-transition ${
      isDarkMode ? 'theme-dark bg-black' : 'theme-light bg-white'
    } flex items-center justify-center p-4`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        {!showAuthForm ? (
          <>
            <div className="text-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <Fingerprint className={`mx-auto h-16 w-16 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              </motion.div>

              <h2 className={`mt-6 text-3xl font-bold font-display ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Activate your account
              </h2>
              <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Welcome to Vivum! We're currently in private beta.
                <br />
                To get started, please enter your invitation code.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label htmlFor="invitation-code" className="sr-only">
                  Invitation code
                </label>
                <div className="relative">
                  <input
                    id="invitation-code"
                    name="code"
                    type="text"
                    required
                    value={invitationCode}
                    onChange={(e) => setInvitationCode(e.target.value)}
                    className={`w-full px-4 py-3 ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700 placeholder-gray-500 text-white' 
                        : 'bg-white border-gray-200 placeholder-gray-400 text-gray-900'
                    } border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    placeholder="Enter your invitation code"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <motion.button
                  type="submit"
                  disabled={verifyingCode}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                    verifyingCode ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {verifyingCode ? 'Verifying...' : 'Verify Code'}
                </motion.button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className={`w-full border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className={`px-2 ${
                      isDarkMode ? 'bg-black text-gray-400' : 'bg-white text-gray-500'
                    }`}>
                      Or
                    </span>
                  </div>
                </div>

                <div className="flex flex-col space-y-3">
                  <motion.button
                    type="button"
                    onClick={handleSignInClick}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex justify-center py-3 px-4 rounded-xl ${
                      isDarkMode 
                        ? 'bg-gray-800 text-white hover:bg-gray-700' 
                        : 'bg-white text-gray-900 hover:bg-gray-50'
                    } border ${
                      isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    } font-medium`}
                  >
                    Already activated? Sign in
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={handleJoinWaitlist}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex justify-center items-center py-4 px-6 rounded-xl text-lg font-semibold ${
                      isDarkMode 
                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white hover:from-purple-500/30 hover:to-pink-500/30' 
                        : 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 hover:from-purple-200 hover:to-pink-200'
                    } border border-transparent shadow-lg hover:shadow-xl transition-all duration-200`}
                  >
                    <span className="mr-2">✨</span>
                    Join the Waitlist
                    <span className="ml-2">→</span>
                  </motion.button>
                </div>
              </div>
            </form>
          </>
        ) : (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className={`text-3xl font-bold font-display ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h2>
              <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {isSignUp 
                  ? 'Start your research journey with Vivum'
                  : 'Sign in to continue your research'}
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-6">
              {isSignUp && hasValidCode && (
                <>
                  <div>
                    <label htmlFor="name" className={`block text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Full Name
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className={`h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                            : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                        } border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="institute" className={`block text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Institute/Organization
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building2 className={`h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      </div>
                      <input
                        id="institute"
                        name="institute"
                        type="text"
                        required
                        value={formData.institute}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                            : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                        } border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                        placeholder="Enter your institute/organization"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="country" className={`block text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Country/Region
                    </label>
                    <div className="mt-1 relative">
                      <Combobox value={formData.country} onChange={(value) => setFormData(prev => ({ ...prev, country: value }))}>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Globe2 className={`h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                          </div>
                          <Combobox.Input
                            className={`w-full pl-10 pr-4 py-3 ${
                              isDarkMode 
                                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                            } border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                            displayValue={(country: string) => country}
                            onChange={(event) => setCountryQuery(event.target.value)}
                            placeholder="Search for your country..."
                          />
                        </div>
                        <Combobox.Options className={`absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-700' 
                            : 'bg-white border-gray-200'
                        }`}>
                          {filteredCountries.length === 0 && countryQuery !== '' ? (
                            <div className={`relative cursor-default select-none py-2 px-4 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-700'
                            }`}>
                              No countries found.
                            </div>
                          ) : (
                            filteredCountries.map((country) => (
                              <Combobox.Option
                                key={country}
                                value={country}
                                className={({ active }) =>
                                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                    active
                                      ? isDarkMode 
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-purple-100 text-purple-900'
                                      : isDarkMode
                                        ? 'text-gray-300'
                                        : 'text-gray-900'
                                  }`
                                }
                              >
                                {({ selected, active }) => (
                                  <>
                                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                      {country}
                                    </span>
                                    {selected ? (
                                      <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                        active 
                                          ? isDarkMode 
                                            ? 'text-white' 
                                            : 'text-purple-600'
                                          : 'text-purple-600'
                                      }`}>
                                        <Check className="h-5 w-5" aria-hidden="true" />
                                      </span>
                                    ) : null}
                                  </>
                                )}
                              </Combobox.Option>
                            ))
                          )}
                        </Combobox.Options>
                      </Combobox>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label htmlFor="email" className={`block text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className={`h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                    } border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className={`block text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                    } border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    placeholder="Enter your password"
                  />
                </div>
                {isSignUp && passwordStrength.errors.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Password must contain:
                    </p>
                    {passwordStrength.errors.map((error, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-500">{error}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {isSignUp && hasValidCode && (
                <div>
                  <label htmlFor="confirmPassword" className={`block text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Confirm Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className={`h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                      } border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                      placeholder="Confirm your password"
                    />
                  </div>
                
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                </div>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className={`text-sm font-medium ${
                      isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-500'
                    }`}
                  >
                    Forgot password?
                  </button>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Processing...' : (isSignUp ? 'Create account' : 'Sign in')}
              </motion.button>

              {isSignUp && hasValidCode && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className={`w-full border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className={`px-2 ${
                        isDarkMode ? 'bg-black text-gray-400' : 'bg-white text-gray-500'
                      }`}>
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <motion.button
                    type="button"
                    onClick={handleGoogleSignIn}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center justify-center py-3 px-4 rounded-xl ${
                      isDarkMode 
                        ? 'bg-gray-800 text-white hover:bg-gray-700' 
                        : 'bg-white text-gray-900 hover:bg-gray-50'
                    } border ${
                      isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    } font-medium`}
                  >
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-2" />
                    Sign up with Google
                  </motion.button>
                </>
              )}

              <p className="text-center">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                </span>
                {' '}
                <button
                  type="button"
                  onClick={() => {
                    if (isSignUp) {
                      setIsSignUp(false);
                    } else {
                      handleSignUpClick();
                    }
                  }}
                  className={`font-medium ${
                    isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-500'
                  }`}
                >
                  {isSignUp ? 'Sign in' : 'Sign up'}
                </button>
              </p>
            </form>
          </div>
        )}

        <AnimatePresence>
          {isWaitlistModalOpen && (
            <Dialog
              as={motion.div}
              static
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              open={isWaitlistModalOpen}
              onClose={() => setIsWaitlistModalOpen(false)}
              className="fixed inset-0 z-50 overflow-y-auto"
            >
              <div className="fixed inset-0">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
              </div>
              
              <div className="fixed inset-0 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`w-full max-w-md p-8 overflow-hidden rounded-2xl shadow-xl ${
                    isDarkMode ? 'bg-gray-900' : 'bg-white'
                  } relative`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <Dialog.Title as="h3" className={`text-2xl font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Join the Waitlist
                    </Dialog.Title>
                    <button
                      onClick={() => setIsWaitlistModalOpen(false)}
                      className={`rounded-full p-2 ${
                        isDarkMode 
                          ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-300' 
                          : 'hover:bg-gray-100 text-gray-500 hover:text-gray-600'
                      }`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mb-8">
                    <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                      The invitation code you entered is invalid. Join our waitlist to get early access when we launch!
                    </p>
                    <div className={`p-4 rounded-lg ${
                      isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                      <div className="flex items-center space-x-3 text-purple-500">
                        <CheckCircle2 className="w-5 h-5" />
                        <p className="font-medium">Be among the first to experience Vivum AI</p>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleJoinWaitlist}
                    className="w-full flex items-center justify-center py-4 px-6 rounded-xl text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <span className="mr-2">✨</span>
                    Join the Waitlist Now
                    <span className="ml-2">→</span>
                  </motion.button>
                </motion.div>
              </div>
            </Dialog>
          )}

          {showVerificationModal && (
            <Dialog
              as={motion.div}
              static
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              open={showVerificationModal}
              onClose={() => setShowVerificationModal(false)}
              className="fixed inset-0 z-50 overflow-y-auto"
            >
              <div className="fixed inset-0">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
              </div>
              
              <div className="fixed inset-0 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`w-full max-w-md p-8 overflow-hidden rounded-2xl shadow-xl ${
                    isDarkMode ? 'bg-gray-900' : 'bg-white'
                  } relative`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <Dialog.Title as="h3" className={`text-2xl font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Email Verification Required
                    </Dialog.Title>
                    <button
                      onClick={() => setShowVerificationModal(false)}
                      className={`rounded-full p-2 ${
                        isDarkMode 
                          ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-300' 
                          : 'hover:bg-gray-100 text-gray-500 hover:text-gray-600'
                      }`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mb-8">
                    <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                      Please verify your email address before signing in. Check your inbox for the verification link.
                    </p>
                    <div className={`p-4 rounded-lg ${
                      isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                      <div className="flex items-center space-x-3 text-purple-500">
                        <Mail className="w-5 h-5" />
                        <p className="font-medium">{verificationEmail}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleResendVerification}
                      disabled={isLoading}
                      className={`w-full flex justify-center items-center py-3 px-4 rounded-xl ${
                        isDarkMode 
                          ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      } font-medium transition-colors duration-200 ${
                        isLoading ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {isLoading ? 'Sending...' : 'Resend Verification Email'}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowVerificationModal(false)}
                      className={`w-full flex justify-center items-center py-3 px-4 rounded-xl ${
                        isDarkMode 
                          ? 'bg-gray-800 text-white hover:bg-gray-700' 
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      } font-medium transition-colors duration-200`}
                    >
                      Close
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </Dialog>
          )}

          {showForgotPassword && (
            <Dialog
              as={motion.div}
              static
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              open={showForgotPassword}
              onClose={() => setShowForgotPassword(false)}
              className="fixed inset-0 z-50 overflow-y-auto"
            >
              <div className="fixed inset-0">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
              </div>
              
              <div className="fixed inset-0 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`w-full max-w-md p-6 overflow-hidden rounded-2xl shadow-xl ${
                    isDarkMode ? 'bg-gray-900' : 'bg-white'
                  } relative`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <Dialog.Title as="h3" className={`text-xl font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Reset Password
                    </Dialog.Title>
                    <button
                      onClick={() => setShowForgotPassword(false)}
                      className={`rounded-full p-2 ${
                        isDarkMode 
                          ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-300' 
                          : 'hover:bg-gray-100 text-gray-500 hover:text-gray-600'
                      }`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Enter your email address and we'll send you instructions to reset your password.
                  </p>

                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <label htmlFor="reset-email" className={`block text-sm font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Email address
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className={`h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        </div>
                        <input
                          id="reset-email"
                          type="email"
                          required
                          value={forgotPasswordEmail}
                          onChange={(e) => setForgotPasswordEmail(e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 ${
                            isDarkMode 
                              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                          } border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <motion.button
                        type="submit"
                        disabled={isSendingReset}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                          isSendingReset ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        {isSendingReset ? 'Sending...' : 'Send Reset Instructions'}
                      </motion.button>

                      <motion.button
                        type="button"
                        onClick={() => setShowForgotPassword(false)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`px-4 py-3 rounded-xl ${
                          isDarkMode 
                            ? 'bg-gray-800 text-white hover:bg-gray-700' 
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              </div>
            </Dialog>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}