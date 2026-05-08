import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { BookmarkCheck, MapPin, IndianRupee, Star, X, Scale, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { authAPI, compareAPI, type College, type SavedComparison } from '../services/api';

export function Saved() {
  const { user, unsaveCollege } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'colleges' | 'comparisons'>('colleges');
  const [savedCollegesData, setSavedCollegesData] = useState<College[]>([]);
  const [savedComparisonsData, setSavedComparisonsData] = useState<SavedComparison[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSavedItems = async () => {
    try {
      setIsLoading(true);
      const [collegesResponse, comparisonsResponse] = await Promise.all([
        authAPI.getSavedColleges(),
        compareAPI.getSavedComparisons(),
      ]);

      setSavedCollegesData(collegesResponse);
      setSavedComparisonsData(comparisonsResponse);
    } catch (fetchError) {
      console.error('Failed to load saved items:', fetchError);
      setSavedCollegesData([]);
      setSavedComparisonsData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      void loadSavedItems();
    } else {
      setSavedCollegesData([]);
      setSavedComparisonsData([]);
      setIsLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md text-center">
          <BookmarkCheck className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`} />
          <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Please login to view saved items</h2>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all font-medium"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  const handleRemoveCollege = async (collegeId: string) => {
    try {
      await unsaveCollege(collegeId);
      setSavedCollegesData(savedCollegesData.filter((college) => college.id !== collegeId));
    } catch (removeError) {
      console.error('Failed to remove saved college:', removeError);
    }
  };

  const handleRemoveComparison = async (comparisonId?: number) => {
    if (comparisonId == null) {
      return;
    }

    try {
      await compareAPI.deleteSavedComparison(comparisonId);
      setSavedComparisonsData(savedComparisonsData.filter((comparison) => comparison.id !== comparisonId));
    } catch (removeError) {
      console.error('Failed to remove saved comparison:', removeError);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className={`text-4xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent ${theme === 'dark' ? 'from-cyan-300 to-purple-300' : 'from-cyan-600 to-purple-600'}`}>
            Saved Items
          </h1>
          <p className={theme === 'dark' ? 'text-white/70' : 'text-gray-800'}>Your bookmarked colleges and comparisons</p>
        </motion.div>

        <div className={`backdrop-blur-lg rounded-2xl ${theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-white border border-gray-200 shadow-lg'}`}>
          <div className={theme === 'dark' ? 'border-b border-white/20' : 'border-b border-gray-200'}>
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'colleges', label: 'Saved Colleges', count: savedCollegesData.length },
                { id: 'comparisons', label: 'Saved Comparisons', count: savedComparisonsData.length },
              ].map((tab, index) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-2 border-b-2 transition-colors flex items-center space-x-2 ${activeTab === tab.id ? 'border-cyan-500 text-cyan-300' : `border-transparent ${theme === 'dark' ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                >
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${theme === 'dark' ? 'bg-white/10 text-white/70' : 'bg-gray-100 text-gray-800'}`}>
                    {tab.count}
                  </span>
                </motion.button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <p className={theme === 'dark' ? 'text-white/70' : 'text-gray-800'}>Loading saved items...</p>
              </div>
            ) : activeTab === 'colleges' ? (
              <div>
                {savedCollegesData.length === 0 ? (
                  <div className="text-center py-12">
                    <BookmarkCheck className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`} />
                    <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No saved colleges yet</h3>
                    <p className={`mb-4 ${theme === 'dark' ? 'text-white/70' : 'text-gray-800'}`}>Start exploring and save colleges you're interested in</p>
                    <Link to="/colleges" className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all font-medium">
                      Explore Colleges
                    </Link>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedCollegesData.map((college, index) => (
                      <motion.div
                        key={college.id}
                        className={`backdrop-blur-lg rounded-2xl overflow-hidden hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/20 transition-all ${theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-white border border-gray-200 shadow-lg'}`}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                      >
                        <motion.img src={college.image} alt={college.name} className="w-full h-48 object-cover" loading="lazy" decoding="async" whileHover={{ scale: 1.1 }} />
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className={`font-semibold mb-1 line-clamp-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{college.name}</h3>
                              <div className={`flex items-center text-sm mb-2 ${theme === 'dark' ? 'text-white/70' : 'text-gray-800'}`}>
                                <MapPin className="w-4 h-4 mr-1" />
                                {college.location}
                              </div>
                            </div>
                            <motion.button
                              onClick={() => void handleRemoveCollege(college.id)}
                              className="ml-2 p-2 hover:bg-red-500/20 rounded-full transition-colors"
                              title="Remove"
                              whileHover={{ scale: 1.2, rotate: 90 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <X className="w-5 h-5 text-red-400" />
                            </motion.button>
                          </div>

                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{college.rating}</span>
                            </div>
                            <div className={`flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              <IndianRupee className="w-4 h-4 mr-1" />
                              <span className="font-medium">{(college.fees / 100000).toFixed(1)}L/yr</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Link to={`/colleges/${college.id}`} className="block w-full text-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all font-medium">
                              View Details
                            </Link>
                            <Link to={`/compare?colleges=${college.id}`} className={`flex items-center justify-center space-x-2 w-full px-4 py-2 rounded-lg transition-all ${theme === 'dark' ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20' : 'bg-white border border-gray-300 text-gray-900 hover:bg-gray-50'}`}>
                              <Scale className="w-4 h-4" />
                              <span>Compare</span>
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {savedComparisonsData.length === 0 ? (
                  <div className="text-center py-12">
                    <Scale className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`} />
                    <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No saved comparisons yet</h3>
                    <p className={`mb-4 ${theme === 'dark' ? 'text-white/70' : 'text-gray-800'}`}>Compare colleges and save your comparisons for later</p>
                    <Link to="/compare" className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all font-medium">
                      Compare Colleges
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedComparisonsData.map((comparison, index) => (
                      <motion.div
                        key={comparison.id ?? index}
                        className={`backdrop-blur-lg rounded-2xl p-6 hover:border-cyan-500/50 transition-all ${theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-white border border-gray-200 shadow-lg'}`}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.01, x: 10 }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Comparison {index + 1}</h3>
                          <motion.button
                            onClick={() => void handleRemoveComparison(comparison.id)}
                            className="p-2 hover:bg-red-500/20 rounded-full transition-colors"
                            title="Delete comparison"
                            whileHover={{ scale: 1.2, rotate: 15 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 className="w-5 h-5 text-red-400" />
                          </motion.button>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          {comparison.colleges.map((college) => (
                            <div key={college.id} className={`backdrop-blur-lg rounded-xl p-4 ${theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-gray-50 border border-gray-200'}`}>
                              <img src={college.image} alt={college.name} className="w-full h-24 object-cover rounded-lg mb-3" loading="lazy" decoding="async" />
                              <h4 className={`font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{college.name}</h4>
                              <p className={`text-sm ${theme === 'dark' ? 'text-white/70' : 'text-gray-800'}`}>{college.location}</p>
                            </div>
                          ))}
                        </div>

                        <Link to={`/compare?colleges=${comparison.colleges.map((college) => college.id).join(',')}`} className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all font-medium">
                          <Scale className="w-4 h-4" />
                          <span>View Again</span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}