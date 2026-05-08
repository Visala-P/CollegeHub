import { useEffect, useState } from 'react';
import { MessageCircle, ThumbsUp, Send, Plus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';
import { qaAPI, type Answer, type Question } from '../services/api';

export function QA() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showAskModal, setShowAskModal] = useState(false);
  const [showAnswerModal, setShowAnswerModal] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '', tags: '' });
  const [newAnswer, setNewAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      const response = await qaAPI.getQuestions(1, 20);
      setQuestions(response.data);
    } catch (fetchError) {
      console.error('Failed to load questions:', fetchError);
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadQuestions();
  }, []);

  const handleAskQuestion = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      alert('Please login to ask questions');
      return;
    }

    if (!newQuestion.title.trim() || !newQuestion.content.trim()) {
      alert('Please enter a title and content');
      return;
    }

    try {
      const tags = newQuestion.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      await qaAPI.createQuestion(newQuestion.title, newQuestion.content, tags);
      setNewQuestion({ title: '', content: '', tags: '' });
      setShowAskModal(false);
      await loadQuestions();
    } catch (createError) {
      console.error('Failed to create question:', createError);
    }
  };

  const handleSubmitAnswer = async (questionId: string) => {
    if (!user) {
      alert('Please login to answer questions');
      return;
    }

    if (!newAnswer.trim()) {
      alert('Please enter an answer');
      return;
    }

    try {
      await qaAPI.answerQuestion(Number(questionId), newAnswer);
      setNewAnswer('');
      setShowAnswerModal(null);
      await loadQuestions();
    } catch (answerError) {
      console.error('Failed to post answer:', answerError);
    }
  };

  const handleUpvote = async (answerId: string) => {
    if (!user) {
      alert('Please login to upvote');
      return;
    }

    try {
      await qaAPI.upvoteAnswer(Number(answerId));
      await loadQuestions();
    } catch (upvoteError) {
      console.error('Failed to upvote answer:', upvoteError);
    }
  };

  const authorName = user?.firstName || user?.lastName ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() : user?.email || 'Anonymous';

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-4xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent ${theme === 'dark' ? 'from-cyan-300 to-purple-300' : 'from-cyan-600 to-purple-600'}`}>
                Q&A Community
              </h1>
              <p className={theme === 'dark' ? 'text-white/70' : 'text-gray-800'}>Ask questions and help fellow students</p>
            </div>
            <motion.button
              onClick={() => setShowAskModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4" />
              <span>Ask Question</span>
            </motion.button>
          </div>
        </motion.div>

        <div className="space-y-6">
          {isLoading ? (
            <div className={`backdrop-blur-lg rounded-2xl p-6 text-center ${theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-white border border-gray-200 shadow-lg'}`}>
              <p className={theme === 'dark' ? 'text-white/70' : 'text-gray-800'}>Loading questions...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className={`backdrop-blur-lg rounded-2xl p-6 text-center ${theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-white border border-gray-200 shadow-lg'}`}>
              <p className={theme === 'dark' ? 'text-white/70' : 'text-gray-800'}>No questions yet. Be the first to ask one.</p>
            </div>
          ) : (
            questions.map((question, index) => (
              <motion.div
                key={question.id}
                className={`backdrop-blur-lg rounded-2xl p-6 hover:border-cyan-500/50 transition-all ${theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-white border border-gray-200 shadow-lg'}`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="mb-4">
                  <h2 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{question.title}</h2>
                  <p className={`mb-3 ${theme === 'dark' ? 'text-white/80' : 'text-gray-900'}`}>{question.content}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                      {question.tags.map((tag) => (
                        <motion.span
                          key={tag}
                          className={`px-3 py-1 text-xs rounded-full border ${theme === 'dark' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-cyan-50 text-cyan-700 border-cyan-200'}`}
                          whileHover={{ scale: 1.1 }}
                        >
                          {tag}
                        </motion.span>
                      ))}
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>
                      Asked by <span className={theme === 'dark' ? 'font-medium text-white/80' : 'font-medium text-gray-900'}>{question.author}</span> on {new Date(question.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {question.answers.length > 0 && (
                  <div className={`pt-4 mb-4 space-y-4 ${theme === 'dark' ? 'border-t border-white/20' : 'border-t border-gray-200'}`}>
                    {question.answers.map((answer, answerIndex) => (
                      <motion.div
                        key={answer.id}
                        className={`rounded-xl p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: answerIndex * 0.05 }}
                        whileHover={{ x: 5 }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className={`mb-2 ${theme === 'dark' ? 'text-white/80' : 'text-gray-900'}`}>{answer.content}</p>
                            <div className={`text-sm ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>
                              <span className={theme === 'dark' ? 'font-medium text-white/80' : 'font-medium text-gray-900'}>{answer.author}</span> • {new Date(answer.date).toLocaleDateString()}
                            </div>
                          </div>
                          <motion.button
                            onClick={() => handleUpvote(answer.id)}
                            className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all ml-4 ${theme === 'dark' ? 'bg-white/10 border border-white/20 hover:bg-white/20' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <ThumbsUp className="w-4 h-4 text-cyan-400" />
                            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{answer.upvotes}</span>
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <motion.button
                    onClick={() => setShowAnswerModal(question.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white border border-gray-300 text-gray-900 hover:bg-gray-50'}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{question.answers.length === 0 ? 'Be the first to answer' : `${question.answers.length} Answer${question.answers.length !== 1 ? 's' : ''}`}</span>
                  </motion.button>
                </div>

                <AnimatePresence>
                  {showAnswerModal === question.id && (
                    <motion.div
                      className={`mt-4 pt-4 ${theme === 'dark' ? 'border-t border-white/20' : 'border-t border-gray-200'}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <textarea
                        value={newAnswer}
                        onChange={(event) => setNewAnswer(event.target.value)}
                        placeholder="Write your answer..."
                        className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none ${theme === 'dark' ? 'bg-white/10 border border-white/20 text-white placeholder-white/50' : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'}`}
                        rows={4}
                      />
                      <div className="flex items-center space-x-2 mt-2">
                        <motion.button
                          onClick={() => void handleSubmitAnswer(question.id)}
                          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all font-medium"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Send className="w-4 h-4" />
                          <span>Submit Answer</span>
                        </motion.button>
                        <motion.button
                          onClick={() => {
                            setShowAnswerModal(null);
                            setNewAnswer('');
                          }}
                          className={`px-4 py-2 rounded-lg transition-all ${theme === 'dark' ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20' : 'bg-white border border-gray-300 text-gray-900 hover:bg-gray-50'}`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Cancel
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>

        <AnimatePresence>
          {showAskModal && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.form
                onSubmit={handleAskQuestion}
                className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-2xl max-w-2xl w-full border border-white/20"
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
              >
                <div className="p-6 border-b border-white/20 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Ask a Question</h2>
                  <motion.button
                    type="button"
                    onClick={() => setShowAskModal(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    whileHover={{ rotate: 90 }}
                  >
                    <X className="w-5 h-5 text-white" />
                  </motion.button>
                </div>
                <div className="p-6 space-y-4">
                  <input
                    type="text"
                    value={newQuestion.title}
                    onChange={(event) => setNewQuestion({ ...newQuestion, title: event.target.value })}
                    placeholder="Question title"
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                  />
                  <textarea
                    value={newQuestion.content}
                    onChange={(event) => setNewQuestion({ ...newQuestion, content: event.target.value })}
                    placeholder="Describe your question"
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 resize-none"
                  />
                  <input
                    type="text"
                    value={newQuestion.tags}
                    onChange={(event) => setNewQuestion({ ...newQuestion, tags: event.target.value })}
                    placeholder="Tags separated by commas"
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                  />
                  <div className="flex items-center space-x-2 pt-2">
                    <motion.button
                      type="submit"
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Send className="w-4 h-4" />
                      <span>Post Question</span>
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setShowAskModal(false)}
                      className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}