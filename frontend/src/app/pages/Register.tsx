import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { GraduationCap, Mail, Lock, User, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export function Register() {
  const navigate = useNavigate();
  const { register, user } = useAuth();
  const { theme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const animationConfig = useMemo(() => ({
    orb1: prefersReducedMotion ? {} : {
      x: [0, 50, 0],
      y: [0, -50, 0],
      scale: [1, 1.2, 1],
    },
    orb2: prefersReducedMotion ? {} : {
      x: [0, -50, 0],
      y: [0, 50, 0],
      scale: [1, 1.3, 1],
    },
  }), [prefersReducedMotion]);

  if (user) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password, firstName, lastName);
      navigate('/');
    } catch (error) {
      alert('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center relative overflow-hidden py-16">
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 will-change-transform"
        animate={animationConfig.orb1}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ willChange: prefersReducedMotion ? 'auto' : 'transform' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 will-change-transform"
        animate={animationConfig.orb2}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        style={{ willChange: prefersReducedMotion ? 'auto' : 'transform' }}
      />

      <div className="max-w-md w-full mx-4 relative z-10">
        <motion.div
          className={`backdrop-blur-xl rounded-2xl p-8 shadow-2xl ${theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-white border border-gray-200'}`}
          initial={{ opacity: 0, y: 50, rotateX: -20 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.8 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="text-center mb-8">
            <motion.div
              className="flex justify-center mb-4"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            <motion.div
              className={`inline-flex items-center space-x-2 mb-4 px-4 py-2 backdrop-blur-lg rounded-full ${theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-gray-100 border border-gray-200'}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className={theme === 'dark' ? 'w-4 h-4 text-yellow-300' : 'w-4 h-4 text-yellow-500'} />
              <span className={`text-sm ${theme === 'dark' ? 'text-white/90' : 'text-gray-800'}`}>Create Account</span>
            </motion.div>

            <h1 className={`text-2xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent ${theme === 'dark' ? 'from-cyan-300 to-purple-300' : 'from-cyan-600 to-purple-600'}`}>
              Sign up for CollegeHub
            </h1>
            <p className={theme === 'dark' ? 'text-white/70' : 'text-gray-600'}>Create your account to start using the platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white/90' : 'text-gray-800'}`}>First Name</label>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-white/50' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    placeholder="First name"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${theme === 'dark' ? 'bg-white/10 border border-white/20 text-white placeholder-white/50' : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white/90' : 'text-gray-800'}`}>Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="Last name"
                  className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${theme === 'dark' ? 'bg-white/10 border border-white/20 text-white placeholder-white/50' : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'}`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white/90' : 'text-gray-800'}`}>Email Address</label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-white/50' : 'text-gray-400'}`} />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="student@example.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${theme === 'dark' ? 'bg-white/10 border border-white/20 text-white placeholder-white/50' : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'}`}
                  required
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white/90' : 'text-gray-800'}`}>Password</label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-white/50' : 'text-gray-400'}`} />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a password"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${theme === 'dark' ? 'bg-white/10 border border-white/20 text-white placeholder-white/50' : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'}`}
                  required
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white/90' : 'text-gray-800'}`}>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm password"
                className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${theme === 'dark' ? 'bg-white/10 border border-white/20 text-white placeholder-white/50' : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'}`}
                required
              />
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </motion.button>
          </form>

          <div className={`mt-6 text-center text-sm ${theme === 'dark' ? 'text-white/70' : 'text-gray-700'}`}>
            Already have an account? <Link to="/login" className={`font-medium ${theme === 'dark' ? 'text-cyan-300 hover:text-cyan-200' : 'text-cyan-700 hover:text-cyan-800'}`}>Login</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}