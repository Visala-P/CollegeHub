import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, IndianRupee, Star, Bookmark, BookmarkCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'motion/react';
import { collegeAPI, type College } from '../services/api';
import { getCollegeImageUrl } from '../services/imageHelper';

const ITEMS_PER_PAGE = 6;

export function Colleges() {
  const { user, savedColleges, saveCollege, unsaveCollege } = useAuth();
  const { theme } = useTheme();

  const [colleges, setColleges] = useState<College[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [totalColleges, setTotalColleges] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [minFees, setMinFees] = useState('');
  const [maxFees, setMaxFees] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [debouncedFilters, setDebouncedFilters] = useState({
    locationFilter: '',
    courseFilter: '',
    minFees: '',
    maxFees: '',
    currentPage: 1,
  });

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedFilters({
        locationFilter,
        courseFilter,
        minFees,
        maxFees,
        currentPage,
      });
    }, 200);

    return () => window.clearTimeout(timeoutId);
  }, [locationFilter, courseFilter, minFees, maxFees, currentPage]);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const response = await collegeAPI.getFilters();
        setStates(response.states || []);
        setCourses(response.courses || []);
      } catch (fetchError) {
        console.error('Failed to load filters:', fetchError);
      }
    };

    void loadFilters();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadColleges = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await collegeAPI.getAll(currentPage, ITEMS_PER_PAGE, {
          search: debouncedSearchTerm,
          state: locationFilter,
          course: courseFilter,
          minFees,
          maxFees,
        });

        if (cancelled) {
          return;
        }

        setColleges(response.data);
        setTotalColleges(response.total);
      } catch (fetchError: any) {
        if (!cancelled) {
          setError(fetchError.message || 'Failed to load colleges');
          setColleges([]);
        }
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
  }, [debouncedSearchTerm, debouncedFilters]);

  const totalPages = Math.max(1, Math.ceil(totalColleges / ITEMS_PER_PAGE));

  const handleSaveToggle = (collegeId: string) => {
    if (!user) {
      alert('Please login to save colleges');
      return;
    }

    if (savedColleges.includes(collegeId)) {
      void unsaveCollege(collegeId);
    } else {
      void saveCollege(collegeId);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setCourseFilter('');
    setMinFees('');
    setMaxFees('');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className={`text-4xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent ${theme === 'dark' ? 'from-cyan-300 to-purple-300' : 'from-cyan-600 to-purple-600'}`}>
            Explore Colleges
          </h1>
          <p className={theme === 'dark' ? 'text-white/70' : 'text-gray-900'}>Find the perfect college for your future</p>
        </motion.div>

        <motion.div
          className={`backdrop-blur-lg rounded-2xl border p-6 mb-6 ${theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-white border-gray-200 shadow-lg'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div className="lg:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white/90' : 'text-gray-900'}`}>Search College</label>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-white/50' : 'text-gray-400'}`} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by name or location..."
                  className={`w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${theme === 'dark' ? 'bg-white/10 border-white/20 text-white placeholder-white/50' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white/90' : 'text-gray-900'}`}>Location</label>
              <select
                value={locationFilter}
                onChange={(event) => {
                  setLocationFilter(event.target.value);
                  setCurrentPage(1);
                }}
                className={`w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${theme === 'dark' ? 'bg-white/10 border-white/20 text-white dark:text-white [&>option]:text-black' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                <option value="">All States</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white/90' : 'text-gray-900'}`}>Course</label>
              <select
                value={courseFilter}
                onChange={(event) => {
                  setCourseFilter(event.target.value);
                  setCurrentPage(1);
                }}
                className={`w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${theme === 'dark' ? 'bg-white/10 border-white/20 text-white dark:text-white [&>option]:text-black' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                <option value="">All Courses</option>
                {courses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white/90' : 'text-gray-900'}`}>Fees Range</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={minFees}
                  onChange={(event) => {
                    setMinFees(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Min"
                  className={`w-1/2 px-2 py-2 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${theme === 'dark' ? 'bg-white/10 border-white/20 text-white placeholder-white/50' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                />
                <input
                  type="number"
                  value={maxFees}
                  onChange={(event) => {
                    setMaxFees(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Max"
                  className={`w-1/2 px-2 py-2 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${theme === 'dark' ? 'bg-white/10 border-white/20 text-white placeholder-white/50' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className={`text-sm ${theme === 'dark' ? 'text-white/70' : 'text-gray-800'}`}>
              Showing {totalColleges} college{totalColleges !== 1 ? 's' : ''}
            </p>
            {(searchTerm || locationFilter || courseFilter || minFees || maxFees) && (
              <button onClick={resetFilters} className={`text-sm font-medium ${theme === 'dark' ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-700'}`}>
                Reset Filters
              </button>
            )}
          </div>
        </motion.div>

        {isLoading ? (
          <div className={`backdrop-blur-lg rounded-2xl border p-12 text-center ${theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-white border-gray-200 shadow-lg'}`}>
            <p className={theme === 'dark' ? 'text-white/70' : 'text-gray-800'}>Loading colleges...</p>
          </div>
        ) : error ? (
          <div className={`backdrop-blur-lg rounded-2xl border p-12 text-center ${theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-white border-gray-200 shadow-lg'}`}>
            <p className={theme === 'dark' ? 'text-red-300' : 'text-red-600'}>{error}</p>
          </div>
        ) : colleges.length === 0 ? (
          <div className={`backdrop-blur-lg rounded-2xl border p-12 text-center ${theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-white border-gray-200 shadow-lg'}`}>
            <p className={theme === 'dark' ? 'text-white/70' : 'text-gray-800'}>No colleges found matching your criteria</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {colleges.map((college, index) => {
                const isSaved = savedColleges.includes(college.id);

                return (
                  <motion.div
                    key={college.id}
                    initial={{ opacity: 0, y: 50, rotateX: -20 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    whileHover={{ scale: 1.05, rotateY: 5, transition: { duration: 0.3 } }}
                    style={{ transformStyle: 'preserve-3d' }}
                    className="group"
                  >
                    <div className={`h-full backdrop-blur-lg rounded-2xl border overflow-hidden transition-all duration-300 ${theme === 'dark' ? 'bg-white/10 border-white/20 hover:border-cyan-500/50 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/20' : 'bg-white border-gray-200 hover:border-cyan-400 shadow-lg hover:shadow-xl'}`}>
                      <div className="relative overflow-hidden bg-white rounded-t-lg">
                        <div className="w-full h-48 flex items-center justify-center p-4 bg-white">
                          <img
                            src={getCollegeImageUrl(college.name)}
                            alt={college.name}
                            className="max-w-full max-h-full object-contain"
                            style={{ objectFit: 'contain' }}
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      </div>

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
                            onClick={() => handleSaveToggle(college.id)}
                            className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}`}
                            whileHover={{ scale: 1.1, rotate: 15 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {isSaved ? <BookmarkCheck className="w-5 h-5 text-cyan-400" /> : <Bookmark className={`w-5 h-5 ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`} />}
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

                        <div className="flex flex-wrap gap-2 mb-4">
                          {college.courses.slice(0, 3).map((course) => (
                            <span key={course} className={`px-2 py-1 rounded-full text-xs border ${theme === 'dark' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-cyan-50 text-cyan-700 border-cyan-200'}`}>
                              {course}
                            </span>
                          ))}
                        </div>

                        <div className="space-y-2">
                          <Link to={`/colleges/${college.id}`} className="block w-full text-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all font-medium">
                            View Details
                          </Link>
                          <Link to={`/compare?colleges=${college.id}`} className={`block w-full text-center px-4 py-2 rounded-lg transition-all ${theme === 'dark' ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20' : 'bg-white border border-gray-300 text-gray-900 hover:bg-gray-50'}`}>
                            Compare
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className={`flex items-center px-4 py-2 rounded-lg border transition-all ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''} ${theme === 'dark' ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'}`}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </button>
              <p className={theme === 'dark' ? 'text-white/70' : 'text-gray-800'}>Page {currentPage} of {totalPages}</p>
              <button
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className={`flex items-center px-4 py-2 rounded-lg border transition-all ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''} ${theme === 'dark' ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'}`}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}