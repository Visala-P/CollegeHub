import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, IndianRupee, Star, Users, GraduationCap, Calendar, Bookmark, BookmarkCheck, ArrowLeft, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'motion/react';
import { collegeAPI, type College } from '../services/api';

export function CollegeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, savedColleges, saveCollege, unsaveCollege } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'placements' | 'reviews'>('overview');
  const [college, setCollege] = useState<College | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadCollege = async () => {
      if (!id) {
        setError('College not found');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await collegeAPI.getById(id);

        if (!cancelled) {
          setCollege(response);
        }
      } catch (fetchError: any) {
        if (!cancelled) {
          setError(fetchError.message || 'College not found');
          setCollege(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadCollege();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className={theme === 'dark' ? 'text-white/70' : 'text-gray-800'}>Loading college...</p>
      </div>
    );
  }

  if (error || !college) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{error || 'College not found'}</h2>
          <Link to="/colleges" className="text-cyan-400 hover:text-cyan-300">
            Back to Colleges
          </Link>
        </div>
      </div>
    );
  }

  const isSaved = savedColleges.includes(college.id);

  const handleSaveToggle = () => {
    if (!user) {
      alert('Please login to save colleges');
      return;
    }

    if (isSaved) {
      void unsaveCollege(college.id);
    } else {
      void saveCollege(college.id);
    }
  };

  return (
    <div className="min-h-screen">
      <div className={`backdrop-blur-lg ${theme === 'dark' ? 'bg-white/10 border-b border-white/20' : 'bg-white border-b border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <motion.button
            onClick={() => navigate(-1)}
            className={`flex items-center mb-4 ${theme === 'dark' ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </motion.button>

          <div className="grid md:grid-cols-3 gap-6">
            <motion.div className="md:col-span-2" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
              <div className="w-full h-64 flex items-center justify-center p-4 bg-white rounded-lg mb-4">
                <img
                  src={getCollegeImageUrl(college.name)}
                  alt={college.name}
                  className="max-w-full max-h-full object-contain"
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className={`text-3xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent ${theme === 'dark' ? 'from-cyan-300 to-purple-300' : 'from-cyan-600 to-purple-600'}`}>
                    {college.name}
                  </h1>
                  <div className={`flex items-center mb-2 ${theme === 'dark' ? 'text-white/70' : 'text-gray-800'}`}>
                    <MapPin className="w-5 h-5 mr-2" />
                    {college.location}, {college.state}
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-400 fill-current mr-1" />
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{college.rating}/5</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm border ${theme === 'dark' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-cyan-50 text-cyan-700 border-cyan-200'}`}>
                      {college.type}
                    </span>
                  </div>
                </div>
                <motion.button
                  onClick={handleSaveToggle}
                  className={`p-3 rounded-lg transition-colors ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}`}
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isSaved ? <BookmarkCheck className="w-6 h-6 text-cyan-400" /> : <Bookmark className={`w-6 h-6 ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`} />}
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              className="bg-cyan-500/10 backdrop-blur-lg rounded-lg p-6 border border-cyan-500/30"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Quick Facts</h3>
              <div className="space-y-4">
                {[
                  { icon: IndianRupee, label: 'Annual Fees', value: `₹${(college.fees / 100000).toFixed(1)} Lakhs` },
                  { icon: TrendingUp, label: 'Placement Rate', value: `${college.placementRate}%` },
                  { icon: Users, label: 'Total Students', value: college.totalStudents.toLocaleString() },
                  { icon: Calendar, label: 'Established', value: college.established },
                  { icon: GraduationCap, label: 'Faculty', value: college.facultyCount },
                ].map((fact, index) => (
                  <motion.div key={index} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                    <div className={`flex items-center mb-1 ${theme === 'dark' ? 'text-white/70' : 'text-gray-800'}`}>
                      <fact.icon className="w-4 h-4 mr-2" />
                      {fact.label}
                    </div>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{fact.value}</p>
                  </motion.div>
                ))}
              </div>

              <Link
                to={`/compare?colleges=${college.id}`}
                className="block w-full mt-6 px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-center rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all font-medium"
              >
                Add to Compare
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`backdrop-blur-lg rounded-2xl ${theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-white border border-gray-200 shadow-lg'}`}>
          <div className={theme === 'dark' ? 'border-b border-white/20' : 'border-b border-gray-200'}>
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'courses', label: 'Courses' },
                { id: 'placements', label: 'Placements' },
                { id: 'reviews', label: 'Reviews' },
              ].map((tab, index) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-2 border-b-2 transition-colors ${activeTab === tab.id ? 'border-cyan-500 text-cyan-300' : `border-transparent ${theme === 'dark' ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                >
                  {tab.label}
                </motion.button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>About {college.name}</h2>
                <p className={`mb-6 ${theme === 'dark' ? 'text-white/80' : 'text-gray-900'}`}>{college.description}</p>

                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  {[
                    { label: 'Average Package', value: `₹${(college.averagePackage / 100000).toFixed(1)}L` },
                    { label: 'Highest Package', value: `₹${(college.highestPackage / 100000).toFixed(1)}L` },
                    { label: 'Campus Size', value: college.campusSize },
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      className={`backdrop-blur-lg rounded-lg p-4 ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-50'}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-white/70' : 'text-gray-800'}`}>{stat.label}</p>
                      <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                    </motion.div>
                  ))}
                </div>

                <div>
                  <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Admission Criteria</h3>
                  <div className="bg-cyan-500/10 backdrop-blur-lg rounded-lg p-4 border border-cyan-500/30">
                    <p className={theme === 'dark' ? 'text-white/80' : 'text-gray-900'}>
                      <span className="font-medium">JEE Rank Range:</span> {college.minRank} - {college.maxRank}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'courses' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Courses Offered</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {college.courses.map((course, index) => (
                    <motion.div
                      key={course}
                      className={`backdrop-blur-lg rounded-lg p-4 ${theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-gray-50 border border-gray-200'}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.05, borderColor: 'rgba(6, 182, 212, 0.5)' }}
                    >
                      <div className="flex items-center">
                        <GraduationCap className="w-5 h-5 text-cyan-400 mr-3" />
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{course}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'placements' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Placement Statistics</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={theme === 'dark' ? 'bg-white/10' : 'bg-gray-50'}>
                      <tr>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${theme === 'dark' ? 'text-white/70' : 'text-gray-800'}`}>Year</th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${theme === 'dark' ? 'text-white/70' : 'text-gray-800'}`}>Company</th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${theme === 'dark' ? 'text-white/70' : 'text-gray-800'}`}>Package (CTC)</th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${theme === 'dark' ? 'text-white/70' : 'text-gray-800'}`}>Students Placed</th>
                      </tr>
                    </thead>
                    <tbody className={theme === 'dark' ? 'divide-y divide-white/10' : 'divide-y divide-gray-200'}>
                      {college.placements.map((placement, index) => (
                        <motion.tr
                          key={index}
                          className={theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50'}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <td className={`px-6 py-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{placement.year}</td>
                          <td className={`px-6 py-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{placement.company}</td>
                          <td className={`px-6 py-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>₹{(placement.package / 100000).toFixed(1)}L</td>
                          <td className={`px-6 py-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{placement.studentsPlaced}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Student Reviews</h2>
                <div className="space-y-4">
                  {college.reviews.length > 0 ? (
                    college.reviews.map((review) => (
                      <div key={review.id} className={`backdrop-blur-lg rounded-lg p-4 ${theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-gray-50 border border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{review.author}</p>
                            <p className={theme === 'dark' ? 'text-white/60' : 'text-gray-700'}>{review.course}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{review.rating}</span>
                          </div>
                        </div>
                        <p className={`mb-2 ${theme === 'dark' ? 'text-white/80' : 'text-gray-900'}`}>{review.comment}</p>
                        <p className={theme === 'dark' ? 'text-white/50 text-sm' : 'text-gray-500 text-sm'}>{new Date(review.date).toLocaleDateString()}</p>
                      </div>
                    ))
                  ) : (
                    <p className={theme === 'dark' ? 'text-white/70' : 'text-gray-700'}>No reviews available yet.</p>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}