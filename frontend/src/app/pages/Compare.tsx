import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X, Plus, IndianRupee, Star, TrendingUp, MapPin, Search } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { motion, AnimatePresence } from 'motion/react';
import { collegeAPI, type College } from '../services/api';
import { getCollegeImageUrl } from "../../utils/collegeImages";

export function Compare() {
  const [searchParams] = useSearchParams();
  const { theme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const [selectedColleges, setSelectedColleges] = useState<string[]>([]);
  const [allColleges, setAllColleges] = useState<College[]>([]);
  const [showSelector, setShowSelector] = useState(false);
  const [selectorQuery, setSelectorQuery] = useState('');
  const [selectorResults, setSelectorResults] = useState<College[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const collegesParam = searchParams.get('colleges');
    if (collegesParam) {
      setSelectedColleges(collegesParam.split(',').slice(0, 3));
    }
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    const loadColleges = async () => {
      try {
        setIsLoading(true);
        const response = await collegeAPI.getAll(1, 100);

        if (!cancelled) {
          setAllColleges(response.data);
        }
      } catch (fetchError) {
        console.error('Failed to load colleges for comparison:', fetchError);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadColleges();

    return () => {
      cancelled = true;
    };
  }, []);

  const addCollege = (collegeId: string) => {
    if (selectedColleges.length < 3 && !selectedColleges.includes(collegeId)) {
      setSelectedColleges([...selectedColleges, collegeId]);
      setShowSelector(false);
    }
  };

  const removeCollege = (collegeId: string) => {
    setSelectedColleges(selectedColleges.filter((id) => id !== collegeId));
  };

  const selectedCollegeData = selectedColleges
    .map((id) => allColleges.find((college) => college.id === id))
    .filter(Boolean) as College[];
  const availableColleges = allColleges.filter((college) => !selectedColleges.includes(college.id));

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-4xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent ${theme === 'dark' ? 'from-cyan-300 to-purple-300' : 'from-cyan-600 to-purple-600'}`}>
                Compare Colleges
              </h1>
              <p className={theme === 'dark' ? 'text-white/70' : 'text-gray-800'}>Select up to 3 colleges to compare side-by-side</p>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[0, 1, 2].map((index) => {
            const selectedCollegeId = selectedColleges[index];
            const college = selectedCollegeData[index];

            return (
              <motion.div key={index} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                {selectedCollegeId && college ? (
                  <motion.div
                    className={`backdrop-blur-lg rounded-2xl border-2 border-cyan-500/50 p-4 ${theme === 'dark' ? 'bg-white/10' : 'bg-white shadow-lg'}`}
                    whileHover={{ scale: 1.02, rotateY: 5 }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className={`font-semibold mb-1 line-clamp-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{college.name}</h3>
                        <div className={`flex items-center text-sm ${theme === 'dark' ? 'text-white/70' : 'text-gray-800'}`}>
                          <MapPin className="w-4 h-4 mr-1" />
                          {college.location}
                        </div>
                      </div>
                      <motion.button
                        onClick={() => removeCollege(selectedCollegeId)}
                        className="p-1 hover:bg-red-500/20 rounded-full transition-colors"
                        whileHover={{ scale: 1.2, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="w-5 h-5 text-red-400" />
                      </motion.button>
                    </div>
                    <div className="w-full h-32 flex items-center justify-center bg-white rounded-lg p-2">
                        <img 
                          src={getCollegeImageUrl(college.name)} 
                          alt={college.name} 
                          className="max-w-full max-h-full object-contain"
                          style={{ objectFit: 'contain' }}
                          loading="lazy" 
                          decoding="async" 
                        />
                      </div>
                  </motion.div>
                ) : selectedCollegeId ? (
                  <div className={`w-full h-48 rounded-2xl border-2 border-dashed flex items-center justify-center ${theme === 'dark' ? 'border-white/30 text-white/60' : 'border-gray-300 text-gray-500'}`}>
                    Loading college...
                  </div>
                ) : (
                  <motion.button
                    onClick={() => setShowSelector(true)}
                    className={`w-full h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${theme === 'dark' ? 'border-white/30 hover:border-cyan-400 hover:bg-cyan-500/10' : 'border-gray-300 hover:border-cyan-400 hover:bg-cyan-50'}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className={!prefersReducedMotion ? 'spin-animation' : ''}>
                      <Plus className={`w-8 h-8 mb-2 ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`} />
                    </div>
                    <span className={theme === 'dark' ? 'text-white/70' : 'text-gray-800'}>Add College</span>
                  </motion.button>
                )}
              </motion.div>
            );
          })}
        </div>

        <AnimatePresence>
          {showSelector && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-white/20"
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
              >
                <div className="p-6 border-b border-white/20 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Select a College</h2>
                  <motion.button onClick={() => setShowSelector(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors" whileHover={{ rotate: 90 }}>
                    <X className="w-5 h-5 text-white" />
                  </motion.button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-2">Search Colleges</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                      <input
                        type="text"
                        value={selectorQuery}
                        onChange={(e) => setSelectorQuery(e.target.value)}
                        placeholder="Search by name or location..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 text-white placeholder-white/60"
                      />
                      <button
                        onClick={async () => {
                          if (!selectorQuery.trim()) {
                            setSelectorResults(null);
                            return;
                          }
                          try {
                            const results = await collegeAPI.search(selectorQuery.trim());
                            setSelectorResults(results);
                          } catch (err) {
                            console.error('Search failed:', err);
                            setSelectorResults([]);
                          }
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-cyan-500 text-white"
                      >
                        Search
                      </button>
                    </div>
                  </div>

                  {isLoading ? (
                    <p className="text-white/70">Loading colleges...</p>
                  ) : (
                    <div className="space-y-3">
                      {(selectorResults ?? availableColleges).map((college, index) => (
                        <motion.button
                          key={college.id}
                          onClick={() => addCollege(college.id)}
                          className="w-full flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl hover:border-cyan-400 hover:bg-cyan-500/20 transition-all text-left"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                        >
                          <img src={getCollegeImageUrl(college.name)} alt={college.name} className="w-16 h-16 object-cover rounded-lg" loading="lazy" decoding="async" />
                          <div className="flex-1">
                            <h3 className="font-medium text-white">{college.name}</h3>
                            <p className="text-sm text-white/70">{college.location}</p>
                          </div>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                            <span className="font-medium text-white">{college.rating}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {selectedCollegeData.length >= 2 && !isLoading && (
          <motion.div
            className={`backdrop-blur-lg rounded-2xl overflow-hidden ${theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-white border border-gray-200 shadow-lg'}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-4 text-left font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Parameter</th>
                    {selectedCollegeData.map((college, index) => (
                      <th key={college.id} className={`px-6 py-4 text-center font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <motion.span initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }}>
                          College {selectedColleges.indexOf(college.id) + 1}
                        </motion.span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={theme === 'dark' ? 'divide-y divide-white/10' : 'divide-y divide-gray-200'}>
                  {[
                    { label: 'Rating', render: (collegeItem: College) => <div className="flex items-center justify-center"><Star className="w-5 h-5 text-yellow-400 fill-current mr-1" /><span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{collegeItem.rating}</span></div> },
                    { label: 'Annual Fees', render: (collegeItem: College) => <div className={`flex items-center justify-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}><IndianRupee className="w-4 h-4 mr-1" /><span className="font-semibold">{(collegeItem.fees / 100000).toFixed(1)}L</span></div> },
                    { label: 'Location', render: (collegeItem: College) => <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{collegeItem.city}, {collegeItem.state}</span> },
                    { label: 'Placement Rate', render: (collegeItem: College) => <div className={`flex items-center justify-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}><TrendingUp className="w-4 h-4 mr-1" /><span className="font-semibold">{collegeItem.placementRate}%</span></div> },
                    { label: 'Average Package', render: (collegeItem: College) => <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>₹{(collegeItem.averagePackage / 100000).toFixed(1)}L</span> },
                    { label: 'Highest Package', render: (collegeItem: College) => <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>₹{(collegeItem.highestPackage / 100000).toFixed(1)}L</span> },
                  ].map((row, rowIndex) => (
                    <motion.tr
                      key={row.label}
                      className={theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50'}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: rowIndex * 0.05 }}
                    >
                      <td className={`px-6 py-4 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{row.label}</td>
                      {selectedCollegeData.map((collegeItem) => (
                        <td key={collegeItem.id} className="px-6 py-4 text-center">{row.render(collegeItem)}</td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}