import { createHashRouter, Link } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Colleges } from './pages/Colleges';
import { CollegeDetail } from './pages/CollegeDetail';
import { Compare } from './pages/Compare';
import { Predictor } from './pages/Predictor';
import { QA } from './pages/QA';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Saved } from './pages/Saved';

export const router = createHashRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'colleges', Component: Colleges },
      { path: 'colleges/:id', Component: CollegeDetail },
      { path: 'compare', Component: Compare },
      { path: 'predictor', Component: Predictor },
      { path: 'qa', Component: QA },
      { path: 'login', Component: Login },
      { path: 'register', Component: Register },
      { path: 'saved', Component: Saved },
      {
        path: '*',
        Component: () => (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
            <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
            <Link to="/" className="text-blue-600 hover:text-blue-700">
              Go back home
            </Link>
          </div>
        )
      }
    ]
  }
]);
