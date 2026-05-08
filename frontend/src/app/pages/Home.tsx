import { Link } from 'react-router-dom';
import { Search, Scale, Wand2, MessageCircle, TrendingUp, Award, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../context/ThemeContext';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useMemo } from 'react';

export function Home() {
  const { theme } = useTheme();
  const prefersReducedMotion = useReducedMotion();

  // Memoize animation variants for performance
  const animationConfig = useMemo(() => ({
    orb1: prefersReducedMotion ? {} : {
      x: [0, 100, 0],
      y: [0, 50, 0],
      scale: [1, 1.2, 1],
    },
    orb2: prefersReducedMotion ? {} : {
      x: [0, -100, 0],
      y: [0, -50, 0],
      scale: [1, 1.3, 1],
    },
    orb3: prefersReducedMotion ? {} : {
      x: [0, -50, 0],
      y: [0, 100, 0],
      scale: [1, 1.1, 1],
    },
  }), [prefersReducedMotion]);

  return (
    <div className="relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className={`absolute inset-0 transition-colors duration-500 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900'
            : 'bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100'
        }`} />
        <motion.div
          className={`absolute top-0 left-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl will-change-transform ${
            theme === 'dark' ? 'bg-purple-500 opacity-30' : 'bg-purple-300 opacity-40'
          }`}
          animate={animationConfig.orb1}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ willChange: prefersReducedMotion ? 'auto' : 'transform' }}
        />
        <motion.div
          className={`absolute top-1/2 right-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl will-change-transform ${
            theme === 'dark' ? 'bg-cyan-500 opacity-30' : 'bg-cyan-300 opacity-40'
          }`}
          animate={animationConfig.orb2}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ willChange: prefersReducedMotion ? 'auto' : 'transform' }}
        />
        <motion.div
          className={`absolute bottom-0 left-1/2 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl will-change-transform ${
            theme === 'dark' ? 'bg-pink-500 opacity-30' : 'bg-pink-300 opacity-40'
          }`}
          animate={animationConfig.orb3}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ willChange: prefersReducedMotion ? 'auto' : 'transform' }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className={`inline-flex items-center space-x-2 mb-6 px-4 py-2 backdrop-blur-lg rounded-full border ${
              theme === 'dark'
                ? 'bg-white/10 border-white/20'
                : 'bg-white/70 border-gray-200'
            }`}
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className={`w-5 h-5 ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-500'}`} />
            <span className={theme === 'dark' ? 'text-white/90' : 'text-gray-800'}>
              AI-Powered College Discovery
            </span>
          </motion.div>

          <motion.h1
            className={`text-6xl font-bold mb-4 bg-gradient-to-r bg-clip-text text-transparent ${theme === 'dark' ? 'from-cyan-300 to-purple-300' : 'from-cyan-600 to-purple-600'}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Find Your Perfect College
          </motion.h1>

          <motion.p
            className={`text-xl mb-8 max-w-2xl mx-auto ${
              theme === 'dark' ? 'text-white/80' : 'text-gray-800'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Discover, compare, and make informed decisions about your higher education with cutting-edge tools
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Link
              to="/colleges"
              className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
            >
              <Search className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              <span className="font-semibold">Explore Colleges</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            {
              to: '/colleges',
              icon: Search,
              title: 'Search & Filter',
              description: 'Find colleges by location, fees, courses, and ratings',
              gradient: 'from-cyan-500 to-blue-500',
              delay: 0.1
            },
            {
              to: '/compare',
              icon: Scale,
              title: 'Compare Colleges',
              description: 'Compare fees, placements, and ratings side-by-side',
              gradient: 'from-purple-500 to-pink-500',
              delay: 0.2
            },
            {
              to: '/predictor',
              icon: Wand2,
              title: 'College Predictor',
              description: 'Get college recommendations based on your exam rank',
              gradient: 'from-pink-500 to-rose-500',
              delay: 0.3
            },
            {
              to: '/qa',
              icon: MessageCircle,
              title: 'Q&A Community',
              description: 'Ask questions and get answers from students',
              gradient: 'from-orange-500 to-yellow-500',
              delay: 0.4
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, rotateX: -20 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: feature.delay, duration: 0.6 }}
              whileHover={{
                scale: 1.05,
                rotateY: 5,
                rotateX: 5,
                transition: { duration: 0.3 }
              }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <Link
                to={feature.to}
                className={`block h-full backdrop-blur-lg p-6 rounded-2xl border transition-all duration-300 group ${
                  theme === 'dark'
                    ? 'bg-white/10 border-white/20 hover:border-white/40'
                    : 'bg-white/80 border-gray-200 hover:border-cyan-300 shadow-lg'
                }`}
              >
                <motion.div
                  className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg`}
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </motion.div>
                <h3 className={`font-semibold mb-2 group-hover:text-cyan-600 transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {feature.title}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-white/70' : 'text-gray-800'}`}>
                  {feature.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Why Choose Section */}
        <motion.div
          className={`backdrop-blur-lg rounded-3xl border p-8 mb-16 ${
            theme === 'dark'
              ? 'bg-white/10 border-white/20'
              : 'bg-white/80 border-gray-200 shadow-xl'
          }`}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className={`text-3xl font-bold mb-8 text-center bg-gradient-to-r bg-clip-text text-transparent ${theme === 'dark' ? 'from-cyan-300 to-purple-300' : 'from-cyan-600 to-purple-600'}`}>
            Why Choose CollegeHub?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: 'Comprehensive Data',
                description: 'Access detailed information about fees, placements, courses, and reviews',
                gradient: 'from-cyan-400 to-cyan-600'
              },
              {
                icon: Scale,
                title: 'Smart Comparison',
                description: 'Make data-driven decisions by comparing colleges side-by-side',
                gradient: 'from-purple-400 to-purple-600'
              },
              {
                icon: Award,
                title: 'Verified Reviews',
                description: 'Read authentic reviews from current students and alumni',
                gradient: 'from-pink-400 to-pink-600'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                whileHover={{ y: -10 }}
              >
                <motion.div
                  className={`w-20 h-20 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl`}
                  whileHover={{ rotate: 180, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <item.icon className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {item.title}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-white/70' : 'text-gray-700'}`}>
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="relative bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl p-8 text-center overflow-hidden"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 bg-white/10" />

          <div className="relative z-10">
            <motion.h2
              className="text-4xl font-bold mb-4 text-white"
              whileHover={{ scale: 1.05 }}
            >
              Ready to Find Your Dream College?
            </motion.h2>
            <p className="text-lg mb-6 text-white/90">
              Join thousands of students making informed decisions
            </p>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/colleges"
                className="inline-flex items-center px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold hover:shadow-2xl transition-all duration-300"
              >
                Start Exploring Now
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
