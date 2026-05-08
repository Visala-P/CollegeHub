import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { IndianRupee, MapPin, Sparkles, Star, TrendingUp, Wand2, Gauge, Building2, ShieldCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTheme } from '../context/ThemeContext';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { predictorAPI, type PredictionCollege } from '../services/api';
import { getCollegeImageUrl } from "../../utils/collegeImages";

const EXAMS = [
  { id: 'jee-main', name: 'JEE Main' },
  { id: 'jee-advanced', name: 'JEE Advanced' },
  { id: 'neet', name: 'NEET' },
];

const CATEGORIES = ['GENERAL', 'OBC', 'SC', 'ST', 'EWS'] as const;
const QUOTAS = ['AI', 'HS'] as const;
const GENDERS = [
  { id: 'gender-neutral', label: 'Gender Neutral' },
  { id: 'female', label: 'Female' },
];

const STATES = [
  'Any', 'Andhra Pradesh', 'Bihar', 'Chandigarh', 'Delhi', 'Gujarat', 'Haryana', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal',
];

const ENGINEERING_BRANCHES = ['Computer Science', 'AI & Data Science', 'Electronics', 'Electrical', 'Mechanical', 'Civil', 'Chemical'];
const MEDICAL_BRANCHES = ['MBBS', 'BDS', 'Pharmacy', 'Nursing'];

const MATCH_TABS = ['All', 'Dream', 'Reach', 'Moderate', 'Safe'] as const;
const TYPE_FILTERS = ['All', 'IIT', 'NIT', 'IIIT', 'GFTI', 'AIIMS', 'GOVT_MEDICAL', 'TOP_PRIVATE_UNIVERSITY', 'STATE_UNIVERSITY', 'ENGINEERING_COLLEGE', 'MEDICAL_COLLEGE', 'PRIVATE_MEDICAL'] as const;

const getMatchBadge = (match: PredictionCollege['match']) => {
  if (match === 'Safe') return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  if (match === 'Moderate') return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
  if (match === 'Reach') return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  return 'bg-red-500/15 text-red-300 border-red-500/30';
};

const confidenceTone = (confidence: number, theme: 'dark' | 'light') => {
  if (confidence >= 0.85) return theme === 'dark' ? 'text-emerald-300' : 'text-emerald-700';
  if (confidence >= 0.7) return theme === 'dark' ? 'text-cyan-300' : 'text-cyan-700';
  return theme === 'dark' ? 'text-amber-300' : 'text-amber-700';
};

export function Predictor() {
  const { theme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const [selectedExam, setSelectedExam] = useState('jee-main');
  const [rank, setRank] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('GENERAL');
  const [quota, setQuota] = useState<(typeof QUOTAS)[number]>('AI');
  const [gender, setGender] = useState<'gender-neutral' | 'female'>('gender-neutral');
  const [homeState, setHomeState] = useState('Any');
  const [preferredBranch, setPreferredBranch] = useState('Computer Science');
  const [maxResults, setMaxResults] = useState('30');
  const [activeMatchTab, setActiveMatchTab] = useState<(typeof MATCH_TABS)[number]>('All');
  const [activeTypeFilter, setActiveTypeFilter] = useState<(typeof TYPE_FILTERS)[number]>('All');
  const [predictions, setPredictions] = useState<PredictionCollege[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [predictedPercentile, setPredictedPercentile] = useState<number | null>(null);

  const branchOptions = selectedExam === 'neet' ? MEDICAL_BRANCHES : ENGINEERING_BRANCHES;

  const filteredPredictions = useMemo(() => {
    return predictions.filter((college) => {
      const matchAllowed = activeMatchTab === 'All' || college.match === activeMatchTab;
      const typeAllowed = activeTypeFilter === 'All' || (college.institutionType ?? '') === activeTypeFilter;
      return matchAllowed && typeAllowed;
    });
  }, [predictions, activeMatchTab, activeTypeFilter]);

  const handlePredict = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setIsLoading(true);
      setInfoMessage(null);

      const response = await predictorAPI.predict({
        exam: selectedExam,
        rank: Number(rank),
        category,
        quota,
        gender,
        homeState: homeState === 'Any' ? undefined : homeState,
        preferredBranch,
        maxResults: Number(maxResults),
      });

      setPredictions(response.colleges);
      setInfoMessage(typeof response.message === 'string' ? response.message : null);
      setPredictedPercentile(typeof response.percentile === 'number' ? response.percentile : null);
      setHasSearched(true);
      setActiveMatchTab('All');
      setActiveTypeFilter('All');
    } catch (predictError) {
      console.error('Failed to predict colleges:', predictError);
      setPredictions([]);
      setInfoMessage(null);
      setPredictedPercentile(null);
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
    setSelectedExam('jee-main');
    setCategory('GENERAL');
    setQuota('AI');
    setGender('gender-neutral');
    setHomeState('Any');
    setPreferredBranch('Computer Science');
    setMaxResults('30');
    setPredictedPercentile(null);
    setActiveMatchTab('All');
    setActiveTypeFilter('All');
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className={`text-4xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent ${theme === 'dark' ? 'from-cyan-300 to-purple-300' : 'from-cyan-600 to-purple-600'}`}>
            College Predictor
          </h1>
          <p className={theme === 'dark' ? 'text-white/70' : 'text-gray-800'}>Counseling-style rank prediction for IITs, NITs, IIITs, AIIMS, medical and top universities</p>
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white/90' : 'text-gray-900'}`}>Category</label>
                    <select
                      value={category}
                      onChange={(event) => setCategory(event.target.value as (typeof CATEGORIES)[number])}
                      className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${theme === 'dark' ? 'bg-white/10 border border-white/20 text-white dark:text-white [&>option]:text-black' : 'bg-white border border-gray-300 text-gray-900'}`}
                    >
                      {CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white/90' : 'text-gray-900'}`}>Quota</label>
                    <select
                      value={quota}
                      onChange={(event) => setQuota(event.target.value as (typeof QUOTAS)[number])}
                      className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${theme === 'dark' ? 'bg-white/10 border border-white/20 text-white dark:text-white [&>option]:text-black' : 'bg-white border border-gray-300 text-gray-900'}`}
                    >
                      <option value="AI">All India</option>
                      <option value="HS">Home State</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white/90' : 'text-gray-900'}`}>Gender</label>
                    <select
                      value={gender}
                      onChange={(event) => setGender(event.target.value as 'gender-neutral' | 'female')}
                      className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${theme === 'dark' ? 'bg-white/10 border border-white/20 text-white dark:text-white [&>option]:text-black' : 'bg-white border border-gray-300 text-gray-900'}`}
                    >
                      {GENDERS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white/90' : 'text-gray-900'}`}>Home State</label>
                    <select
                      value={homeState}
                      onChange={(event) => setHomeState(event.target.value)}
                      className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${theme === 'dark' ? 'bg-white/10 border border-white/20 text-white dark:text-white [&>option]:text-black' : 'bg-white border border-gray-300 text-gray-900'}`}
                    >
                      {STATES.map((state) => <option key={state} value={state}>{state}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white/90' : 'text-gray-900'}`}>Preferred Branch</label>
                    <select
                      value={preferredBranch}
                      onChange={(event) => setPreferredBranch(event.target.value)}
                      className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${theme === 'dark' ? 'bg-white/10 border border-white/20 text-white dark:text-white [&>option]:text-black' : 'bg-white border border-gray-300 text-gray-900'}`}
                    >
                      {branchOptions.map((branch) => <option key={branch} value={branch}>{branch}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white/90' : 'text-gray-900'}`}>Max Results</label>
                    <input
                      type="number"
                      min="10"
                      max="60"
                      value={maxResults}
                      onChange={(event) => setMaxResults(event.target.value)}
                      className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${theme === 'dark' ? 'bg-white/10 border border-white/20 text-white placeholder-white/50' : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'}`}
                    />
                  </div>
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
                  {['Provide exam + rank + category', 'Apply quota, gender and branch preferences', 'Get Dream/Reach/Moderate/Safe recommendations'].map((step, index) => (
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
                          Found {predictions.length} recommendation{predictions.length !== 1 ? 's' : ''} using counseling-style scoring
                        </p>
                      </div>
                      <div className={`px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-cyan-500/20 border-cyan-500/30' : 'bg-cyan-50 border-cyan-200'}`}>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-cyan-300' : 'text-cyan-700'}`}>Rank: {rank}</p>
                        {predictedPercentile != null && (
                          <p className={`text-xs ${theme === 'dark' ? 'text-cyan-200' : 'text-cyan-600'}`}>Percentile: {predictedPercentile.toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    {MATCH_TABS.map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveMatchTab(tab)}
                        className={`px-3 py-1.5 rounded-full border text-sm transition-all ${
                          activeMatchTab === tab
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                            : theme === 'dark'
                              ? 'border-white/20 text-white/70 hover:text-white'
                              : 'border-gray-300 text-gray-700 hover:text-gray-900'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="mb-6">
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white/90' : 'text-gray-900'}`}>Institution Filter</label>
                    <select
                      value={activeTypeFilter}
                      onChange={(event) => setActiveTypeFilter(event.target.value as (typeof TYPE_FILTERS)[number])}
                      className={`w-full md:w-80 px-3 py-2 rounded-lg ${theme === 'dark' ? 'bg-white/10 border border-white/20 text-white dark:text-white [&>option]:text-black' : 'bg-white border border-gray-300 text-gray-900'}`}
                    >
                      {TYPE_FILTERS.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </div>

                  {infoMessage && (
                    <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${theme === 'dark' ? 'border-amber-500/30 bg-amber-500/10 text-amber-200' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
                      {infoMessage}
                    </div>
                  )}

                  <div className="space-y-4">
                    {filteredPredictions.map((college, index) => (
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
                                <div className="flex flex-wrap gap-2">
                                  <span className={`px-2 py-1 rounded-full text-xs border ${theme === 'dark' ? 'bg-white/10 border-white/20 text-white/90' : 'bg-gray-50 border-gray-200 text-gray-800'}`}>
                                    {college.institutionType || 'College'}
                                  </span>
                                  {college.tier && (
                                    <span className={`px-2 py-1 rounded-full text-xs border ${theme === 'dark' ? 'bg-purple-500/15 border-purple-500/30 text-purple-200' : 'bg-purple-50 border-purple-200 text-purple-700'}`}>
                                      {college.tier}
                                    </span>
                                  )}
                                  {college.recommendedBranch && (
                                    <span className={`px-2 py-1 rounded-full text-xs border ${theme === 'dark' ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-200' : 'bg-cyan-50 border-cyan-200 text-cyan-700'}`}>
                                      {college.recommendedBranch}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getMatchBadge(college.match)}`}>
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

                            <div className={`mb-4 rounded-lg px-3 py-2 border ${theme === 'dark' ? 'border-white/15 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                              <div className="flex items-center justify-between text-sm">
                                <div className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white/80' : 'text-gray-800'}`}>
                                  <Gauge className="w-4 h-4" />
                                  Acceptance confidence
                                </div>
                                <span className={`font-semibold ${confidenceTone(college.confidence ?? 0.6, theme)}`}>
                                  {Math.round((college.confidence ?? 0) * 100)}%
                                </span>
                              </div>
                              <div className={`mt-2 h-2 rounded-full ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'}`}>
                                <div className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500" style={{ width: `${Math.round((college.confidence ?? 0) * 100)}%` }} />
                              </div>
                            </div>

                            <div className={`mb-4 text-sm ${theme === 'dark' ? 'text-white/70' : 'text-gray-800'}`}>
                              Closing rank: {college.closingRank.toLocaleString()} · Opening rank: {college.openingRank.toLocaleString()}
                            </div>

                            <div className={`mb-4 text-xs flex items-center gap-3 ${theme === 'dark' ? 'text-white/60' : 'text-gray-700'}`}>
                              <span className="inline-flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Data source: {college.cutoffSource || 'modeled-cutoff'}</span>
                              {college.predictedPercentile != null && <span>Percentile estimate: {college.predictedPercentile.toFixed(2)}</span>}
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
                              <span className={`inline-flex items-center gap-1 text-xs ${theme === 'dark' ? 'text-white/70' : 'text-gray-700'}`}>
                                <Building2 className="w-3.5 h-3.5" />
                                Priority engine ranked
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {filteredPredictions.length === 0 && hasSearched && predictions.length > 0 && (
                      <div className={`rounded-xl border p-4 text-sm ${theme === 'dark' ? 'border-white/20 bg-white/5 text-white/80' : 'border-gray-200 bg-gray-50 text-gray-800'}`}>
                        No predictions in this filter combination. Try changing match tab or institution filter.
                      </div>
                    )}
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
