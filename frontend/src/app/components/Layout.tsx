import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { GraduationCap, Search, Scale, Sparkles, MessageCircle, User, LogOut, Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';

export function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}>
      <motion.nav
        className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors duration-300 ${
          theme === 'dark'
            ? 'bg-black/20 border-white/10'
            : 'bg-white/70 border-gray-200'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2 group">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <GraduationCap className="w-8 h-8 text-cyan-400" />
                </motion.div>
                <span className={`font-bold text-xl bg-gradient-to-r bg-clip-text text-transparent ${theme === 'dark' ? 'from-cyan-300 to-purple-300' : 'from-cyan-600 to-purple-600'}`}>
                  CollegeHub
                </span>
              </Link>

              <div className="hidden md:flex space-x-1">
                {[
                  { to: '/colleges', icon: Search, label: 'Explore' },
                  { to: '/compare', icon: Scale, label: 'Compare' },
                  { to: '/predictor', icon: Sparkles, label: 'Predictor' },
                  { to: '/qa', icon: MessageCircle, label: 'Q&A' }
                ].map((item, index) => (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <Link
                      to={item.to}
                      className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-all duration-300 ${
                        isActive(item.to)
                          ? theme === 'dark'
                            ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-gradient-to-r from-cyan-100 to-purple-100 text-cyan-700 border border-cyan-300'
                          : theme === 'dark'
                            ? 'text-white/70 hover:text-white hover:bg-white/5'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <motion.button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all ${
                  theme === 'dark'
                    ? 'bg-white/10 hover:bg-white/20 text-yellow-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.button>

              {user ? (
                <motion.div
                  className="flex items-center space-x-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`flex items-center space-x-2 px-3 py-2 backdrop-blur-lg rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-white/10 border-white/20'
                        : 'bg-white border-gray-200 shadow-sm'
                    }`}>
                      <User className="w-4 h-4 text-cyan-500" />
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {user.name}
                      </span>
                    </div>
                    <motion.button
                      onClick={logout}
                      className={`p-2 rounded-lg transition-all ${
                        theme === 'dark'
                          ? 'text-white/70 hover:text-white hover:bg-white/5'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                      title="Logout"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <LogOut className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/login"
                    className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                  >
                    Login
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      <main className="min-h-[calc(100vh-64px)]">
        <Outlet />
      </main>

      <footer className={`backdrop-blur-xl border-t mt-16 transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-black/20 border-white/10'
          : 'bg-white/70 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className={`text-center text-sm ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>
            <p>&copy; 2026 CollegeHub. Your gateway to informed college decisions.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
