import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IndianRupee, MapPin, Sparkles, Star, TrendingUp, Wand2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTheme } from '../context/ThemeContext';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { predictorAPI, type PredictionCollege } from '../services/api';
import { getCollegeImageUrl } from "../../utils/collegeImages";

const EXAMS = [
  { id: 'jee-advanced', name: 'JEE Advanced' },
  { id: 'jee', name: 'JEE Main' },
  { id: 'neet', name: 'NEET' },
];

export function Predictor() {
  const { theme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const [selectedExam, setSelectedExam] = useState('jee-advanced');
  const [rank, setRank] = useState('');
  const [predictions, setPredictions] = useState<PredictionCollege[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handlePredict = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setIsLoading(true);
      setInfoMessage(null);

      const response = await predictorAPI.predict({
        exam: selectedExam,
        rank: Number(rank),
      });

      setPredictions(response.colleges);
      setInfoMessage(typeof response.message === 'string' ? response.message : null);
      setHasSearched(true);
    } catch (predictError) {
      console.error('Failed to predict colleges:', predictError);
      setPredictions([]);
      setInfoMessage(null);
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setRank('');
    setPredictions([]);
    setHasSearched(false);
    setInfoMessage(null);
    setSelectedExam('jee-advanced');
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className={`text-4xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent ${theme === 'dark' ? 'from-cyan-300 to-purple-300' : 'from-cyan-600 to-purple-600'}`}>
            College Predictor
          </h1>
          <p className={theme === 'dark' ? 'text-white/70' : 'text-gray-800'}>Find IIT and engineering colleges that match your rank</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div className="lg:col-span-1" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
            <div className={`backdrop-blur-lg rounded-2xl p-6 sticky top-24 ${theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-white border border-gray-200 shadow-lg'}`}>
              <div className="flex items-center space-x-3 mb-6">
                <div className={`w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg ${!prefersReducedMotion ? 'spin-animation' : ''}`}>
                  <Wand2 className="w-6 h-6 text-white" />
                </div>
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Predict Your College</h2>
              </div>

              <form onSubmit={handlePredict} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white/90' : 'text-gray-900'}`}>Select Exam</label>
                  <select
                    value={selectedExam}
                    onChange={(event) => setSelectedExam(event.target.value)}
                    className={`w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${theme === 'dark' ? 'bg-white/10 border border-white/20 text-white dark:text-white [&>option]:text-black' : 'bg-white border border-gray-300 text-gray-900'}`}
                  >
                    {EXAMS.map((exam) => (
                      <option key={exam.id} value={exam.id}>
                        {exam.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedExam === 'jee' && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                    IIT admission requires a JEE Advanced rank.
                  </div>
                )}

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white/90' : 'text-gray-900'}`}>Your Rank</label>
                  <input
                    type="number"
                    value={rank}
                    onChange={(event) => setRank(event.target.value)}
                    placeholder="Enter your rank"
                    className={`w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${theme === 'dark' ? 'bg-white/10 border border-white/20 text-white placeholder-white/50' : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'}`}
                    min="1"
                    required
                  />
                </div>

                <motion.button
                  type="submit"
                  className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Predicting...' : 'Predict Colleges'}
                </motion.button>

                {hasSearched && (
                  <motion.button
                    type="button"
                    onClick={resetForm}
                    className={`w-full px-4 py-2 rounded-lg transition-all ${theme === 'dark' ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20' : 'bg-white border border-gray-300 text-gray-900 hover:bg-gray-50'}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Reset
                  </motion.button>
                )}
              </form>

              <div className={`mt-6 pt-6 ${theme === 'dark' ? 'border-t border-white/20' : 'border-t border-gray-200'}`}>
                <h3 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>How it works</h3>
                <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-white/70' : 'text-gray-800'}`}>
                  {['Pick your exam', 'Enter your rank', 'See IITs and engineering colleges'].map((step, index) => (
                    <motion.li
                      key={step}
                      className="flex items-start"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0 ${theme === 'dark' ? 'bg-cyan-500/20' : 'bg-cyan-50'}`}>
                        <span className={`font-semibold text-xs ${theme === 'dark' ? 'text-cyan-300' : 'text-cyan-700'}`}>{index + 1}</span>
                      </span>
                      <span>{step}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {!hasSearched ? (
                <motion.div
                  key="placeholder"
                  className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl border border-cyan-500/30 p-12 text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <div className={!prefersReducedMotion ? 'spin-animation' : ''}>
                    <Wand2 className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Ready to find your perfect match?</h3>
                  <p className={theme === 'dark' ? 'text-white/70' : 'text-gray-800'}>Enter your exam details to get rank-based college recommendations</p>
                </motion.div>
              ) : predictions.length === 0 ? (
                <motion.div
                  key="no-results"
                  className={`backdrop-blur-lg rounded-2xl p-12 text-center ${theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-white border border-gray-200 shadow-lg'}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-100'}`}>
                    <Wand2 className={`w-8 h-8 ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`} />
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No colleges found</h3>
                  <p className={`mb-4 ${theme === 'dark' ? 'text-white/70' : 'text-gray-800'}`}>
                    We couldn't find colleges matching your rank. Try a different exam or rank.
                  </p>
                  <motion.button
                    onClick={resetForm}
                    className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Try Again
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <motion.div
                    className={`backdrop-blur-lg rounded-2xl p-6 mb-6 ${theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-white border border-gray-200 shadow-lg'}`}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className={`text-xl font-semibold mb-1 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          <Sparkles className="w-5 h-5 text-yellow-400 mr-2" />
                          Predicted Colleges
                        </h2>
                        <p className={theme === 'dark' ? 'text-white/70' : 'text-gray-800'}>
                          Found {predictions.length} college{predictions.length !== 1 ? 's' : ''} after ranking the full catalog
                        </p>
                      </div>
                      <div className={`px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-cyan-500/20 border-cyan-500/30' : 'bg-cyan-50 border-cyan-200'}`}>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-cyan-300' : 'text-cyan-700'}`}>Rank: {rank}</p>
                      </div>
                    </div>
                  </motion.div>

                  {infoMessage && (
                    <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${theme === 'dark' ? 'border-amber-500/30 bg-amber-500/10 text-amber-200' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
                      {infoMessage}
                    </div>
                  )}

                  <div className="space-y-4">
                    {predictions.map((college, index) => (
                      <motion.div
                        key={college.id}
                        className={`backdrop-blur-lg rounded-2xl p-6 hover:border-cyan-500/50 transition-all ${theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-white border border-gray-200 shadow-lg'}`}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, x: 10 }}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center bg-white rounded-xl shadow-lg border-2 border-cyan-500/30 p-1">
                            <img
                              src={getCollegeImageUrl(college.name)}
                              alt={college.name}
                              className="w-full h-full object-contain"
                              style={{ objectFit: 'contain' }}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{college.name}</h3>
                                <div className={`flex items-center text-sm mb-2 ${theme === 'dark' ? 'text-white/70' : 'text-gray-800'}`}>
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {college.location}, {college.state}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${college.match === 'Safe' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : college.match === 'Moderate' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' : 'bg-red-500/15 text-red-300 border-red-500/30'}`}>
                                  {college.match}
                                </span>
                                <div className="flex items-center">
                                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{college.rating}</span>
                                </div>
                              </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4 mb-4">
                              <div className={`backdrop-blur-lg rounded-lg p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                                <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-white/60' : 'text-gray-700'}`}>Fees</p>
                                <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  <IndianRupee className="inline w-4 h-4 mr-1" />
                                  {(college.fees / 100000).toFixed(1)}L/year
                                </p>
                              </div>
                              <div className={`backdrop-blur-lg rounded-lg p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                                <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-white/60' : 'text-gray-700'}`}>Placement Rate</p>
                                <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  <TrendingUp className="inline w-4 h-4 mr-1" />
                                  {college.placementRate}%
                                </p>
                              </div>
                              <div className={`backdrop-blur-lg rounded-lg p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                                <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-white/60' : 'text-gray-700'}`}>Chance</p>
                                <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {college.probability}%
                                </p>
                              </div>
                            </div>

                            <div className={`mb-4 text-sm ${theme === 'dark' ? 'text-white/70' : 'text-gray-800'}`}>
                              Closing rank: {college.closingRank.toLocaleString()} · Opening rank: {college.openingRank.toLocaleString()}
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                              {college.courses.slice(0, 4).map((course) => (
                                <span key={course} className={`px-2 py-1 rounded-full text-xs border ${theme === 'dark' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-cyan-50 text-cyan-700 border-cyan-200'}`}>
                                  {course}
                                </span>
                              ))}
                            </div>

                            <div className="flex items-center space-x-3">
                              <Link
                                to={`/colleges/${college.id}`}
                                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                              >
                                View Details
                              </Link>
                              <Link
                                to={`/compare?colleges=${college.id}`}
                                className={`px-4 py-2 rounded-lg transition-all ${theme === 'dark' ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20' : 'bg-white border border-gray-300 text-gray-900 hover:bg-gray-50'}`}
                              >
                                Compare
                              </Link>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
